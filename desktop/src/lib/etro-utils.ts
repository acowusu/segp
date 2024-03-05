/**
 * @prettier
 */

import etro from "etro";
import { PromisedLayerOpts, ScriptData } from "../../electron/mockData/data";
import { LayerOpts } from "../../electron/mockData/data";
import { toast } from "sonner";
import { LucideGalleryVerticalEnd } from "lucide-react";
import { useAsyncError } from "react-router-dom";
import { AudioOptions, ImageOptions, VideoOptions } from "etro/dist/layer";
import { ChromaKey } from "etro/dist/effect";
import { effect } from "zod";
import { SubtitleText, TextOptions } from "./subtitle-layer";

const WIDTH = 1920;
const HEIGHT = 1080;

function lerp(a: number, b: number, t: number, p: number) {
  return a + (b - a) * (t / p);
}

/** Select the aimation type for media */
function mediaAnimationSelector(
  duration: number,
  w: number,
  h: number
): {
  destX?: etro.Dynamic<number>; // technically not optional all paths have this tho ill keep it
  destY?: etro.Dynamic<number>;
  destWidth?: etro.Dynamic<number>;
  destHeight?: etro.Dynamic<number>;
} {
  // const randNum = Math.floor(Math.random() * 3); // random number 0 - 2
  const randNum = 0; // currently differnet animations are disabled, they seem to be broken?
  switch (randNum) {
    case 0: {
      return {
        destX: (_element: etro.EtroObject, time: number) => {
          return lerp(0, -w / 10, time, duration);
        }, // default: 0
        destY: (_element: etro.EtroObject, time: number) => {
          return lerp(0, -h / 10, time, duration);
        }, // default: 0
        destWidth: (_element: etro.EtroObject, time: number) => {
          return lerp(w, w * 1.2, time, duration);
        }, // default: null (full width)
        destHeight: (_element: etro.EtroObject, time: number) => {
          return lerp(h, h * 1.2, time, duration);
        },
      };
    }
    case 1: {
      return {
        destX: (_element: etro.EtroObject, time: number) => {
          return lerp(-w / 10, 0, time, duration);
        }, // default: 0
        destY: (_element: etro.EtroObject, time: number) => {
          return lerp(-h / 10, 0, time, duration);
        }, // default: 0
        destWidth: (_element: etro.EtroObject, time: number) => {
          return lerp(w * 1.2, w, time, duration);
        }, // default: null (full width)
        destHeight: (_element: etro.EtroObject, time: number) => {
          return lerp(h * 1.2, h, time, duration);
        },
      };
    }
    default: {
      return {
        destX: (_element: etro.EtroObject, time: number) => {
          return lerp(0, -w / 5, time, duration);
        },
      };
    }
  }
}

/** Make Image Opts object from the given values */
export function makeImageOpts(
  start: number,
  duration: number,
  src: string,
  w: number,
  h: number
): ImageOptions {
  return {
    startTime: start,
    duration: duration,
    source: "local:///" + src,
    x: 0, // default: 0
    y: 0, // default: 0
    sourceWidth: w,
    sourceHeight: h,
    opacity: 1, // default: 1
    ...mediaAnimationSelector(duration, w, h),
  };
}

export function makeAudioOpts(
  start: number,
  duration: number,
  src: string
): AudioOptions {
  return {
    startTime: start,
    duration: duration,
    source: src,
    sourceStartTime: 0, // default: 0
    muted: false, // default: false
    volume: 1, // default: 1
    playbackRate: 1, //default:
  };
}

export function makeVideoOpts(
  start: number,
  duration: number,
  src: string,
  sourceWidth: number,
  sourceHeight: number,
  canvasWidth: number,
  canvasHeight: number
): VideoOptions {
  return {
    startTime: start,
    duration: duration,
    source: src,
    destX: 0, // default: 0
    destY: 0, // default: 0
    destWidth: sourceWidth, // default: null (full width)
    destHeight: sourceHeight, // default: null (full height)
    // following places bottom right
    x: canvasWidth - sourceWidth, // default: 0
    y: canvasHeight - sourceHeight, // default: 0
    opacity: 1, // default: 1
    volume: 0, // default: 1
    // muted: false, //default: false
  };
}

export function addSingleImageLayer(
  section: ScriptData,
  movie: etro.Movie,
  start: number
): number {
  if (!section.scriptMedia) throw new Error("No media found");
  if (!section.scriptDuration) throw new Error("No duration found");
  const layer = new etro.layer.Image({
    startTime: start,
    duration: section.scriptDuration,
    source: "local:///" + section.scriptMedia,
    destX: (_element: etro.EtroObject, time: number) => {
      return lerp(0, -WIDTH / 10, time, section.scriptDuration!);
    }, // default: 0
    destY: (_element: etro.EtroObject, time: number) => {
      return lerp(0, -HEIGHT / 10, time, section.scriptDuration!);
    }, // default: 0
    destWidth: (_element: etro.EtroObject, time: number) => {
      return lerp(WIDTH, WIDTH * 1.2, time, section.scriptDuration!);
    }, // default: null (full width)
    destHeight: (_element: etro.EtroObject, time: number) => {
      return lerp(HEIGHT, HEIGHT * 1.2, time, section.scriptDuration!);
    },
    x: 0, // default: 0
    y: 0, // default: 0
    sourceWidth: WIDTH,
    sourceHeight: HEIGHT,
    opacity: 1, // default: 1
  });
  console.log("adding layer", layer);
  movie.layers.push(layer);
  return start + section.scriptDuration;
}
const defaultLayerOpts: LayerOpts = {
  x: 0,
  y: 0,
};
export async function addSectionAvatar(
  section: ScriptData,
  movie: etro.Movie,
  start: number,
  opts?: LayerOpts
): Promise<number> {
  const effectiveOpts = { ...defaultLayerOpts, ...opts };

  if (!section.avatarVideoUrl) throw new Error("No avatarURL found");
  if (!section.scriptDuration) throw new Error("No duration found");
  const avatar = await window.api.getProjectAvatar();
  const layer = new etro.layer.Video({
    startTime: start,
    duration: section.scriptDuration,
    source: await window.api.toDataURL(section.avatarVideoUrl, "video/mp4"),
    destX: 0, // default: 0
    destY: 0, // default: 0
    destWidth: avatar.width, // default: null (full width)
    destHeight: avatar.height, // default: null (full height)
    x: effectiveOpts.x, // default: 0
    y: effectiveOpts.y, // default: 0
    opacity: 1, // default: 1
  });
  movie.layers.push(layer);
  console.log("adding layer", layer);

  return start + section.scriptDuration;
}

// Layer Promises //
export function dispatchSectionGeneration(
  section: ScriptData,
  start: number
): PromisedLayerOpts {
  console.log("Section in dispatch", section);
  const audioGen = generateAudio(section);

  //dependence on audio gen being done first
  const audioOpts = audioGen.then(() => {
    // return getAudioOpts(section, start);
    return;
  });

  const avatarOpts = audioGen.then(() => {
    return getAvatarOpts(section, start);
  });

  return {
    p_mediaOpts: getMediaOpts(section, start),
    // p_audioOpts: audioOpts,
    p_avatarOpts: avatarOpts,
    //   p_subtitleOpts: ,
    //   p_backingOpts: ,
    //   p_soundfxOpts: ,
  };
}

export async function getMediaOpts(
  section: ScriptData,
  start: number
  // opts?: LayerOpts
): Promise<ImageOptions> {
  // const effectiveOpts = { ...defaultLayerOpts, ...opts };

  return new Promise<ImageOptions>((resolve, reject) => {
    if (!section.scriptMedia) reject(new Error("No media found"));
    if (!section.scriptDuration) reject(new Error("No duration found"));

    const opts = makeImageOpts(
      start,
      section.scriptDuration!, // rejected above otherwise
      section.scriptMedia!,
      WIDTH,
      HEIGHT
    );
    console.log("created media layer options", opts);
    resolve(opts);
  });
}
async function getAudioOpts(
  section: ScriptData,
  start: number
): Promise<AudioOptions> {
  return new Promise((resolve, reject) => {
    if (!section.scriptAudio) reject(new Error("No audioURL found"));
    if (!section.scriptDuration) reject(new Error("No duration found"));

    // not sure about this async to be checked!
    window.api.toDataURL(section.scriptAudio!, "audio/wav").then((dataURL) => {
      const opts = makeAudioOpts(start, section.scriptDuration!, dataURL);

      console.log("created audio layer options", opts);
      resolve(opts);
    });
  });
}

/** Must be called strictly after audiogen  */
export async function getAvatarOpts(
  section: ScriptData,
  start: number
): Promise<VideoOptions | undefined> {
  // check if avatars are meant to be there
  if (!window.api.getProjectHasAvatar()) {
    console.log("No Avatar Option Selected. Skipping Avatar Generation... ");
    return;
  }
  // Generate the avatar for this section
  await generateAvatar(section);

  return new Promise((resolve, reject) => {
    if (!section.avatarVideoUrl) reject(new Error("No avatarURL found"));
    if (!section.scriptDuration) reject(new Error("No duration found"));

    // not sure about this async to be checked!
    window.api.getProjectAvatar().then(async (avatar) => {
      const opts = makeVideoOpts(
        start,
        section.scriptDuration!,
        await window.api.toDataURL(section.avatarVideoUrl!, "video/mp4"),
        avatar.width,
        avatar.height,
        WIDTH,
        HEIGHT
      );

      // TODO: migrate chroma keying to the addition function
      // const effect = new etro.effect.ChromaKey({
      //   target: new etro.Color(0, 0, 0, 0), // default: new etro.Color(1, 0, 0, 1)
      //   threshold: 10, // default: 0.5
      //   interpolate: false, // default: false
      // });

      console.log("created avatar options", opts);
      resolve(opts);
    });
  });
}

export async function generateAudio(section: ScriptData) {
  try {
    // what if the text is changed in the editor, does that clear the URL? (yes)
    if (section.scriptAudio) {
      console.log(
        `Audio for section (${section.sectionName}) already generated`
      );
      return;
    }

    const modifiedScript = await window.api.textToAudio(section);
    window.api.updateProjectScriptSection(modifiedScript);
  } catch (error) {
    console.error(
      `Error generating audio for section ${section.sectionName}:`,
      error
    );
  }
}

async function generateAvatar(section: ScriptData) {
  if (!window.api.getProjectHasAvatar()) {
    console.log("No Avatar Option Selected. Skipping Avatar Generation... ");
    return; // undefined if the avatar is not selected for the project
  }
  try {
    // similar issue with changing avatar is URL changed??
    if (section.avatarVideoUrl) {
      console.log(
        `Avatar for ${section.sectionName} already exists, no need to generate`
      );
      return;
    }
    const avatar = await window.api.getProjectAvatar();
    const modifiedScript = await window.api.generateAvatar(section, avatar);
    window.api.updateProjectScriptSection(modifiedScript);
  } catch (error) {
    console.error(`Error generating avatar for section ${section}:`, error);
  }
}

/**
 * ========================================================
 * ======================= Adding Layers ==================
 * ========================================================
 */

export function addImageLayer(
  movie: etro.Movie,
  opts: ImageOptions,
  overrideOpts?: ImageOptions
): [ImageOptions, etro.layer.Image] {
  console.log("Adding image layer");
  const effectiveOpts = { ...opts, ...(overrideOpts ?? {}) };
  const layer = new etro.layer.Image(effectiveOpts);
  movie.addLayer(layer);
  console.log("Added image layer");
  return [effectiveOpts, layer];
}

export function addAudioLayer(
  movie: etro.Movie,
  opts: AudioOptions,
  overrideOpts?: AudioOptions
): [AudioOptions, etro.layer.Audio] {
  console.log("Adding audio layer");
  const effectiveOpts = { ...opts, ...(overrideOpts ?? {}) };
  const layer = new etro.layer.Audio(effectiveOpts);
  movie.addLayer(layer);
  console.log("Added audio layer");

  return [effectiveOpts, layer];
}

// export function addVideoLayer(movie: etro.Movie, opts: VideoOptions) {
//   console.log("Adding video layer");
//   movie.addLayer(new etro.layer.Video(opts));
//   console.log("Added video layer");
// }

export function addAvatarLayer(
  movie: etro.Movie,
  opts: VideoOptions,
  overrideOpts?: VideoOptions
): [VideoOptions, etro.layer.Video] {
  console.log("Adding avatar layer");
  const effectiveOpts = { ...opts, ...(overrideOpts ?? {}) };
  const layer = new etro.layer.Video(effectiveOpts);
  const chromaKey = new etro.effect.ChromaKey({
    target: new etro.Color(0, 0, 0, 0), // default: new etro.Color(1, 0, 0, 1)
    threshold: 10, // default: 0.5
    interpolate: false, // default: false
  });
  console.log("adding chroma to avatar");
  layer.effects.push(chromaKey);
  console.log("added chroma to avatar");
  movie.layers.push(layer);
  console.log("Added avatar layer");
  return [effectiveOpts, layer];
}

export function addSubtitleLayer(
  movie: etro.Movie,
  opts: TextOptions,
  overrideOpts?: TextOptions
): [TextOptions, SubtitleText] {
  console.log("Adding subtitle layer");
  const effectiveOpts = { ...opts, ...(overrideOpts ?? {}) };
  const layer = new SubtitleText(effectiveOpts);
  movie.addLayer(layer);
  console.log("Added subtitle layer");
  return [effectiveOpts, layer];
}
