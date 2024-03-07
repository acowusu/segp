/**
 * @prettier
 */

import etro from "etro";
import {
  Layers,
  PromisedLayerOpts,
  ScriptData,
  SectionData,
} from "../../electron/mockData/data";
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

export function makeTextOpts(
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

// Layer Promises //
export async function dispatchSectionGeneration(
  section: ScriptData,
  start: number
): Promise<{ promisedOpts: PromisedLayerOpts; modifiedSection: ScriptData }> {
  console.log("Section in dispatch", section);

  // needs to run before everyting as this sets the script duration
  const modifiedScript = await generateAudio(section);
  const promisedOpts: PromisedLayerOpts = {};

  promisedOpts.p_mediaOpts = getMediaOpts(modifiedScript, start);
  promisedOpts.p_audioOpts = getAudioOpts(modifiedScript, start);

  if (await window.api.getProjectHasAvatar()) {
    promisedOpts.p_avatarOpts = getAvatarOpts(modifiedScript, start); // undefined if the avatar is not selected for the project, return what is given
  } else {
    console.log("No Avatar Option Selected. Skipping Avatar Generation... ");
  }

  // promisedOpts.p_subtitleOpts = getTextOpts(modifiedScript, start)
  //   promisedOpts.p_backingOpts = getBackingOpts(modifiedScript, start)
  //   promisedOpts.p_soundfxOpts = getSoundfxOpts(modifiedScript, start)

  return {
    promisedOpts: promisedOpts,
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
    await window.api.updateProjectScriptSection(modifiedScript);
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
  // avatar option is know to be selected at this point
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
    await window.api.updateProjectScriptSection(modifiedScript);
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
  console.log("!!!! MEDIA OPTS:", effectiveOpts);
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
  console.log("!!!! AUDIO OPTS:", effectiveOpts);
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
  console.log("!!!! AVATAR OPTS:", effectiveOpts);
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
  const parsedOpts: LayerOpts = JSON.parse(
    section.assetLayerOptions
  ) as LayerOpts;

  const {
    mediaOpts, // no idea why this type is not being inferred (there was an issue of me accessing the wrong item in obj)
    audioOpts,
    avatarOpts,
    subtitleOpts,
    backingOpts,
    soundfxOpts,
  }: LayerOpts = parsedOpts;

  // stuff needs to be fixed after parsing, for example media lerp and srcs
  // fix media
  const duration = section.scriptDuration!; // must exist

  if (mediaOpts) {
    layerOpts.mediaOpts = makeImageOpts(
      start,
      duration,
      section.scriptMedia!,
      mediaOpts.sourceWidth!,
      mediaOpts.sourceHeight!,
      mediaOpts
    );
  }

  if (audioOpts) {
    layerOpts.audioOpts = makeAudioOpts(
      start,
      duration,
      await window.api.toDataURL(section.scriptAudio!, "audio/wav"),
      audioOpts
    );
  }

  if ((await window.api.getProjectHasAvatar()) && avatarOpts) {
    layerOpts.avatarOpts = makeVideoOpts(
      start,
      duration,
      await window.api.toDataURL(section.avatarVideoUrl!, "video/mp4"),
      avatarOpts.sourceWidth,
      avatarOpts.sourceHeight,
      avatarOpts.canvasWidth,
      avatarOpts.canvasHeight,
      avatarOpts
    );
  }

  // TODO do the rest of the layers

  console.log("parsed options: ", parsedOpts);
  console.log("fixed options: ", layerOpts);
  return layerOpts;
}

export async function loadAssets(
  movie: etro.Movie,
  promisedOpts: PromisedLayerOpts,
  savedOpts: LayerOpts,
  overrideOpts?: LayerOpts
): Promise<[LayerOpts, Layers]> {
  const {
    mediaOpts,
    audioOpts,
    avatarOpts,
    subtitleOpts,
    backingOpts,
    soundfxOpts,
  } = savedOpts;

  const {
    p_mediaOpts,
    p_audioOpts,
    p_avatarOpts,
    p_subtitleOpts,
    p_backingOpts,
    p_soundfxOpts,
  } = promisedOpts;
  console.log("saved opts: ", savedOpts);
  console.log("promised opts: ", promisedOpts);

  // possible overrides to the layer we want to introduce
  const {
    mediaOpts: overrideMediaOpts,
    audioOpts: overrideAudioOpts,
    avatarOpts: overrideAvatarOpts,
    subtitleOpts: overrideSubtitleOpts,
    backingOpts: overrideBackingOpts,
    soundfxOpts: overrideSoundfxOpts,
  }: LayerOpts = overrideOpts ?? {};

  // returning values
  const finalOpts: LayerOpts = {};
  const finalLayers: Layers = {};

  // waiters for the promised layers
  let waitMedia: Promise<void> | undefined,
    waitAudio: Promise<void> | undefined,
    waitAvatar: Promise<void> | undefined,
    waitSubtitle: Promise<void> | undefined,
    waitBacking: Promise<void> | undefined,
    waitSoundfx: Promise<void> | undefined;

  // go through all assets and create the given layers

  if (mediaOpts) {
    const [opts, mediaLayer] = addImageLayer(
      movie,
      mediaOpts,
      overrideMediaOpts
    );
    finalOpts.mediaOpts = opts;
    finalLayers.media = mediaLayer;
    console.log("added media from saved opts");
  } else {
    if (!p_mediaOpts) {
      throw new Error("utils/loadAssets: Promise of the media should exist!");
    }
    waitMedia = p_mediaOpts?.then((opts) => {
      const [effOpts, layer] = addImageLayer(movie, opts, overrideMediaOpts);
      finalOpts.mediaOpts = effOpts;
      finalLayers.media = layer;
      console.log("got promised media");
    });
  }

  if (audioOpts) {
    const [opts, audioLayer] = addAudioLayer(
      movie,
      audioOpts,
      overrideAudioOpts
    );
    finalOpts.audioOpts = opts;
    finalLayers.audio = audioLayer;
    console.log("added audio from saved opts");
  } else {
    if (!p_audioOpts) {
      throw new Error("utils/loadAssets: Promise of the audio should exist!");
    }

    waitAudio = p_audioOpts?.then((opts) => {
      const [effOpts, layer] = addAudioLayer(movie, opts, overrideAudioOpts);
      finalOpts.audioOpts = effOpts;
      finalLayers.audio = layer;
      console.log("got promised audio");
    });
  }

  if ((await window.api.getProjectHasAvatar()) && avatarOpts) {
    const [opts, avatarLayer] = addAvatarLayer(
      movie,
      avatarOpts,
      overrideAvatarOpts
    );
    finalOpts.avatarOpts = opts;
    finalLayers.avatar = avatarLayer;
    console.log("added avatar from saved opts");
  } else if (p_avatarOpts) {
    waitAvatar = p_avatarOpts?.then((opts) => {
      const [effOpts, layer] = addAvatarLayer(movie, opts, overrideAvatarOpts);
      finalOpts.avatarOpts = effOpts;
      finalLayers.avatar = layer;
      console.log("got promsied avatar");
    });
  }

  if (subtitleOpts) {
    const [opts, subtitleLayer] = addSubtitleLayer(
      movie,
      subtitleOpts,
      overrideSubtitleOpts
    );
    finalOpts.subtitleOpts = opts;
    finalLayers.subtitle = subtitleLayer;
    console.log("added subtitle from saved opts");
  } else if (p_subtitleOpts) {
    waitSubtitle = p_subtitleOpts?.then((opts) => {
      // subtitles must be displayed above avatar if avatar exists
      // TODO check if this works in teh 4 diferent scenarios
      waitAvatar?.then(() => {
        const [effOpts, layer] = addSubtitleLayer(
          movie,
          opts,
          overrideSubtitleOpts
        );
        finalOpts.subtitleOpts = effOpts;
        finalLayers.subtitle = layer;
      });
      console.log("got promised subtitle");
    });
  }

  if (backingOpts) {
    const [opts, backingLayer] = addAudioLayer(
      movie,
      backingOpts,
      overrideBackingOpts
    );
    finalOpts.backingOpts = opts;
    finalLayers.backing = backingLayer;
    console.log("added backing from saved opts");
  } else if (p_backingOpts) {
    waitBacking = p_backingOpts?.then((opts) => {
      const [effOpts, layer] = addAudioLayer(movie, opts, overrideBackingOpts);
      finalOpts.backingOpts = effOpts;
      finalLayers.backing = layer;
      console.log("got promised backing");
    });
  }

  if (soundfxOpts) {
    const [opts, soundfxLayer] = addAudioLayer(
      movie,
      soundfxOpts,
      overrideSoundfxOpts
    );
    finalOpts.soundfxOpts = opts;
    finalLayers.soundfx = soundfxLayer;
    console.log("added soundfx from saved opts");
  } else if (p_soundfxOpts) {
    waitSoundfx = p_soundfxOpts?.then((opts) => {
      const [effOpts, layer] = addAudioLayer(movie, opts, overrideSoundfxOpts);
      finalOpts.soundfxOpts = effOpts;
      finalLayers.soundfx = layer;
      console.log("passed soundfx");
    });
  }
  // TODO: add toast notifs to the waiters!
  await Promise.all([
    waitMedia,
    waitAudio,
    waitAvatar,
    waitSubtitle,
    waitBacking,
    waitSoundfx,
  ]);

  return [finalOpts, finalLayers];
}

/** Selectively set the layer options and fill the missing ones with promsied opts */
export async function setSectionOpts(
  fakeStart: number, // the start value we want to give the asset for now
  actualStart: number, // one to document to know where the asset really starts for final videogen
  script: ScriptData
): Promise<SectionData> {
  const data: SectionData = {
    start: actualStart,
    script: script,
    promisedLayerOptions: {},
    layerOptions: {},
  };

  if (script.assetLayerOptions) {
    const parsedSavedOpts = await parseLayerOptions(fakeStart, script);
    if (!script.scriptDuration) {
      // would probably also mean the audio is not yet generated
      script = await generateAudio(script);
      data.script = script; // make sure to update
    }
    const {
      mediaOpts,
      audioOpts,
      avatarOpts,
      subtitleOpts,
      backingOpts,
      soundfxOpts,
    } = parsedSavedOpts;

    if (mediaOpts) {
      data.layerOptions.mediaOpts = mediaOpts;
    } else {
      data.promisedLayerOptions.p_mediaOpts = getMediaOpts(script, fakeStart);
    }

    if (audioOpts) {
      data.layerOptions.audioOpts = audioOpts;
    } else {
      data.promisedLayerOptions.p_audioOpts = getAudioOpts(script, fakeStart);
    }

    if ((await window.api.getProjectHasAvatar()) && avatarOpts) {
      data.layerOptions.avatarOpts = avatarOpts;
    } else {
      data.promisedLayerOptions.p_avatarOpts = getMediaOpts(script, fakeStart);
    }

    // if (subtitleOpts) {
    //   data.layerOptions.subtitleOpts = subtitleOpts;
    // } else {
    //   data.promisedLayerOptions.p_subtitleOpts = getTextOpts(script, fakeStart);
    // }

    // if (backingOpts) {
    //   data.layerOptions.backingOpts = backingOpts;
    // } else {
    //   data.promisedLayerOptions.p_backingOpts = getBackingOpts(script, fakeStart);
    // }

    // if (mediaOpts) {
    //   data.layerOptions.mediaOpts = mediaOpts;
    // } else {
    //   data.promisedLayerOptions.p_mediaOpts = getSoundfxOpts(script, fakeStart);
    // }
  } else {
    // dispatch all as none exist
    const { promisedOpts, modifiedSection: newScript } =
      await dispatchSectionGeneration(script, fakeStart);
    data.script = newScript;
    data.promisedLayerOptions = promisedOpts;
  }

  return data;
}
