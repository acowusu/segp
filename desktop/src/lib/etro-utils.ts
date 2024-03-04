/**
 * @prettier
 */

import etro from "etro";
import { ScriptData } from "../../electron/mockData/data";
import { LayerOpts } from "../../electron/mockData/data";
import { toast } from "sonner";
import { LucideGalleryVerticalEnd } from "lucide-react";
import { useAsyncError } from "react-router-dom";

const WIDTH = 1920;
const HEIGHT = 1080;

function lerp(a: number, b: number, t: number, p: number) {
  return a + (b - a) * (t / p);
}

export function fixLerpForMediaLayer(
  layer: etro.layer.Image | etro.layer.Video,
  newStart: number
): etro.layer.Image | etro.layer.Video {
  layer.startTime = newStart;

  layer.destX = (_element: etro.EtroObject, time: number) => {
    return lerp(0, -WIDTH / 10, time, layer.duration);
  };

  layer.destY = (_element: etro.EtroObject, time: number) => {
    return lerp(0, -HEIGHT / 10, time, layer.duration);
  };

  layer.destWidth = (_element: etro.EtroObject, time: number) => {
    return lerp(WIDTH, WIDTH * 1.2, time, layer.duration);
  };

  layer.destHeight = (_element: etro.EtroObject, time: number) => {
    return lerp(HEIGHT, HEIGHT * 1.2, time, layer.duration);
  };

  return layer;
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
export function dispatchSectionGeneration(section: ScriptData, start: number) {
  const audioGen = generateAudio(section);

  //dependence on audio gen being done first
  const audioLayer = audioGen.then(() => {
    // return getAudioLayer(section, start); // integrate later
    return;
  });

  const avatarLayer = audioGen.then(() => {
    return getAvatarLayer(section, start);
  });

  return [getMediaLayer(section, start), avatarLayer, audioLayer];
}

export async function getMediaLayer(
  section: ScriptData,
  start: number
  // opts?: LayerOpts
): Promise<etro.layer.Visual> {
  // const effectiveOpts = { ...defaultLayerOpts, ...opts };

  return new Promise<etro.layer.Visual>((resolve, reject) => {
    if (!section.scriptMedia) reject(new Error("No media found"));
    if (!section.scriptDuration) reject(new Error("No duration found"));

    const layer = new etro.layer.Image({
      startTime: start,
      duration: section.scriptDuration!,
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
    console.log("Created the media layer");
    resolve(layer);
  });
}

// TODO: I think the toasts should not be here as this would bombard the user

export async function generateAudio(section: ScriptData) {
  try {
    // what if the text is changed in the editor, does that clear the URL?
    if (section.scriptAudio) {
      console.log(
        `Audio for section (${section.sectionName}) already generated`
      );
      return;
    }

    const modified = window.api.textToAudio(section);

    // toast.promise(modified, {
    //   loading: `Generating audio for ${section.sectionName}...`,
    //   success: (newSection) => {
    //     return `Audio has been generated for ${section.sectionName}. ${newSection.scriptAudio} has been saved.`;
    //   },
    //   error: `Error generating audio for section: ${section.sectionName}`,
    // });
    const resolvedModified = await modified;
    window.api.updateProjectScriptSection(resolvedModified);
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
    // Similar to line 141 -> must be addressed
    if (section.avatarVideoUrl) {
      console.log(`Avatar for ${section.sectionName} alreay exists`);
      return;
    }
    const avatar = await window.api.getProjectAvatar();
    const modified = window.api.generateAvatar(section, avatar);
    // toast.promise(modified, {
    //   loading: `Generating avatar for ${section.sectionName}...`,
    //   success: () => {
    //     return `Avatar has been generated for ${section.sectionName}. `;
    //   },
    //   error: "Error generating avatar for section: " + section.sectionName,
    // });
    const resolvedModified = await modified;
    window.api.updateProjectScriptSection(resolvedModified);
  } catch (error) {
    console.error(`Error generating avatar for section ${section}:`, error);
  }
}

/**
 * (I think) this must be called strictly after audio generation
 * Generates the Avatar for the corresponding audio, returns the layer created by this
 * @param section ScriptData for this section
 * @param start Start time in seconds
 * @param opts optional layer options otherwise defaulted
 * @returns if the avatars are enabled for the project, returns that layer in a promise,
 *          otherwise returns undefined as in the avatar layer doens't exist
 */
export async function getAvatarLayer(
  section: ScriptData,
  start: number,
  opts?: LayerOpts
): Promise<etro.layer.Video | undefined> {
  const effectiveOpts = { ...defaultLayerOpts, ...opts };

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
      const layer = new etro.layer.Video({
        startTime: start,
        duration: section.scriptDuration,
        source: await window.api.toDataURL(
          section.avatarVideoUrl!,
          "video/mp4"
        ),
        destX: 0, // default: 0
        destY: 0, // default: 0
        destWidth: avatar.width, // default: null (full width)
        destHeight: avatar.height, // default: null (full height)
        x: effectiveOpts.x, // default: 0
        y: effectiveOpts.y, // default: 0
        opacity: 1, // default: 1
      });

      // TODO: chroma keying can be further tuned
      const effect = new etro.effect.ChromaKey({
        target: new etro.Color(0, 0, 0, 0), // default: new etro.Color(1, 0, 0, 1)
        threshold: 10, // default: 0.5
        interpolate: false, // default: false
      });

      layer.effects.push(effect);

      console.log("created avatar layer", layer);
      resolve(layer);
    });
  });
}

export async function getAudioLayer(
  section: ScriptData,
  start: number
): Promise<etro.layer.Audio> {
  return new Promise((resolve, reject) => {
    if (!section.scriptAudio) reject(new Error("No avatarURL found"));
    if (!section.scriptDuration) reject(new Error("No duration found"));

    // not sure about this async to be checked!
    window.api.toDataURL(section.scriptAudio!, "audio/wav").then((dataURL) => {
      const layer = new etro.layer.Audio({
        startTime: start,
        duration: section.scriptDuration,
        source: dataURL,
        sourceStartTime: 0, // default: 0
        muted: false, // default: false
        volume: 1, // default: 1
        playbackRate: 1, //default: 1
      });

      console.log("created audio layer", layer);
      resolve(layer);
    });
  });
}
