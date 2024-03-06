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
  h: number,
  overrideOpts?: ImageOptions
): ImageOptions {
  return {
    startTime: start,
    duration: duration,
    source: src, // "local:///" + for local files
    x: overrideOpts?.x ?? 0, // default: 0
    y: overrideOpts?.y ?? 0, // default: 0
    sourceWidth: w,
    sourceHeight: h,
    opacity: overrideOpts?.opacity ?? 1, // default: 1
    ...mediaAnimationSelector(duration, w, h),
  };
}

export function makeAudioOpts(
  start: number,
  duration: number,
  src: string,
  overrideOpts?: AudioOptions
): AudioOptions {
  return {
    startTime: start,
    duration: duration,
    source: src,
    sourceStartTime: 0, // default: 0
    muted: overrideOpts?.muted ?? false, // default: false
    volume: overrideOpts?.volume ?? 1, // default: 1
    playbackRate: overrideOpts?.playbackRate ?? 1, //default:
  };
}

export function makeVideoOpts(
  start: number,
  duration: number,
  src: string,
  sourceWidth: number,
  sourceHeight: number,
  canvasWidth: number,
  canvasHeight: number,
  overrideOpts?: VideoOptions
): VideoOptions {
  return {
    startTime: start,
    duration: duration,
    source: src,
    destX: overrideOpts?.destX ?? 0, // default: 0
    destY: overrideOpts?.destY ?? 0, // default: 0
    destWidth: sourceWidth, // default: null (full width)
    destHeight: sourceHeight, // default: null (full height)
    // following places bottom right
    x: overrideOpts?.x ?? canvasWidth - sourceWidth, // default: 0
    y: overrideOpts?.y ?? canvasHeight - sourceHeight, // default: 0
    opacity: overrideOpts?.opacity ?? 1, // default: 1
    volume: overrideOpts?.volume ?? 0, // default: 1 //0  for avatar layer can change
    // muted: false, //default: false
  };
}

// TODO make TextOpts?

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
export async function dispatchSectionGeneration(
  section: ScriptData,
  start: number
): Promise<{ promisedOpts: PromisedLayerOpts; modifiedSection: ScriptData }> {
  console.log("Section in dispatch", section);

  // needs to run before everyting as this sets the script duration
  const modifiedScript = await generateAudio(section);

  return {
    promisedOpts: {
      p_mediaOpts: getMediaOpts(modifiedScript, start),
      p_audioOpts: getAudioOpts(modifiedScript, start),
      p_avatarOpts: getAvatarOpts(modifiedScript, start),
      //   p_subtitleOpts: ,
      //   p_backingOpts: ,
      //   p_soundfxOpts: ,
    },
    modifiedSection: modifiedScript,
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
  const newSection = await generateAvatar(section);
  // newSection should have the avatarURLs

  return new Promise((resolve, reject) => {
    if (!newSection.avatarVideoUrl) reject(new Error("No avatarURL found"));
    if (!newSection.scriptDuration) reject(new Error("No duration found"));

    // not sure about this async to be checked!
    window.api.getProjectAvatar().then(async (avatar) => {
      const opts = makeVideoOpts(
        start,
        newSection.scriptDuration!,
        await window.api.toDataURL(newSection.avatarVideoUrl!, "video/mp4"),
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

export async function generateAudio(section: ScriptData): Promise<ScriptData> {
  try {
    // what if the text is changed in the editor, does that clear the URL? (yes)
    if (section.scriptAudio) {
      console.log(
        `Audio for section (${section.sectionName}) already generated`
      );
      return section;
    }

    const modifiedScript = await window.api.textToAudio(section);
    window.api.updateProjectScriptSection(modifiedScript);
    return modifiedScript;
  } catch (error) {
    console.error(
      `Error generating audio for section ${section.sectionName}:`,
      error
    );
    return section;
  }
}

async function generateAvatar(section: ScriptData): Promise<ScriptData> {
  if (!window.api.getProjectHasAvatar()) {
    console.log("No Avatar Option Selected. Skipping Avatar Generation... ");
    return section; // undefined if the avatar is not selected for the project, return what is given
  }
  try {
    // similar issue with changing avatar is URL changed??
    if (section.avatarVideoUrl) {
      console.log(
        `Avatar for ${section.sectionName} already exists, no need to generate`
      );
      return section; //already has videoURL
    }
    const avatar = await window.api.getProjectAvatar();
    const modifiedScript = await window.api.generateAvatar(section, avatar);
    window.api.updateProjectScriptSection(modifiedScript);
    return modifiedScript;
  } catch (error) {
    console.error(`Error generating avatar for section ${section}:`, error);
    return section; // probably an error later on anyway
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
  // movie.layers.push(layer);
  movie.addLayer(layer);
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

export async function updateMetadataWithOpts(
  section: ScriptData,
  opts: LayerOpts
): Promise<void> {
  await window.api.setSectionOpts(section, JSON.stringify(opts));
}

export async function parseLayerOptions(
  start: number,
  section: ScriptData
): Promise<LayerOpts> {
  if (!section.assetLayerOptions) {
    throw new Error(
      "utils/paseLayerOptions: Options don't exist, cannot parse"
    );
  }
  const layerOpts: LayerOpts = {};
  const parsedOpts: LayerOpts = JSON.parse(section.assetLayerOptions);
  const {
    mediaOpts,
    audioOpts,
    avatarOpts,
    subtitleOpts,
    backingOpts,
    soundfxOpts,
  } = parsedOpts;
  // stuff needs to be fixed after parsing, for example media lerp and srcs
  // fix media
  const duration = section.scriptDuration!; // must exist

  mediaOpts &&
    (layerOpts.mediaOpts = makeImageOpts(
      start,
      duration,
      section.scriptMedia!,
      mediaOpts.w,
      mediaOpts.h,
      mediaOpts
    ));

  audioOpts &&
    (layerOpts.audioOpts = makeAudioOpts(
      start,
      duration,
      await window.api.toDataURL(section.scriptAudio!, "audio/wav"),
      audioOpts
    ));

  avatarOpts &&
    (layerOpts.avatarOpts = makeVideoOpts(
      start,
      duration,
      await window.api.toDataURL(section.avatarVideoUrl!, "video/mp4"),
      avatarOpts.sourceWidth,
      avatarOpts.sourceHeight,
      avatarOpts.canvasWidth,
      avatarOpts.canvasHeight,
      avatarOpts
    ));

  // TODO do the rest of the layers

  console.log("parsed options: ", parsedOpts);
  console.log("fixed options: ", layerOpts);
  return layerOpts;
}
