import etro from "etro";
import { toast } from "sonner";
import { ScriptData } from "../../electron/mockData/data";
import bgAudio from "../../electron/mockData/music.json";
import { SubtitleText } from "./subtitle-layer";

export const WIDTH = 1920;
export const HEIGHT = 1080;
/**
 * Linearly interpolates between two values.
 * @param a - The starting value.
 * @param b - The ending value.
 * @param t - The interpolation factor.
 * @param p - The total duration of the interpolation.
 * @returns The interpolated value.
 */
export function lerp(a: number, b: number, t: number, p: number) {
  return a + (b - a) * (t / p);
}

/**
 * Creates a zoom layer for a given section of a script.
 * @param section - The script data for the section.
 * @param start - The start time of the zoom layer.
 * @returns A new etro.layer.Image instance representing the zoom layer.
 */
const createZoomLayer = async (section: ScriptData, start: number) => {
  return new etro.layer.Image({
    startTime: start,
    duration: section.scriptDuration!,
    source: await resizeImage(section.scriptMedia!.url, WIDTH, HEIGHT),
    destX: (_element: etro.EtroObject, time: number) => {
      return lerp(0, -WIDTH / 10, time, section.scriptDuration!);
    },
    destY: (_element: etro.EtroObject, time: number) => {
      return lerp(0, -HEIGHT / 10, time, section.scriptDuration!);
    },
    destWidth: (_element: etro.EtroObject, time: number) => {
      return lerp(WIDTH, WIDTH * 1.2, time, section.scriptDuration!);
    },
    destHeight: (_element: etro.EtroObject, time: number) => {
      return lerp(HEIGHT, HEIGHT * 1.2, time, section.scriptDuration!);
    },
    x: 0, // default: 0
    y: 0, // default: 0
    sourceWidth: WIDTH,
    sourceHeight: HEIGHT,
    opacity: 1, // default: 1
  });
}

/**
 * Creates a zoom-out layer for a given section of a script.
 * @param section - The script data for the section.
 * @param start - The start time of the layer.
 * @returns A new zoom-out layer.
 */
const createZoomOutLayer = async (section: ScriptData, start: number) => {
  return new etro.layer.Image({
    startTime: start,
    duration: section.scriptDuration!,
    source: await resizeImage(section.scriptMedia!.url, WIDTH, HEIGHT),
    destX: (_element: etro.EtroObject, time: number) => {
      return lerp(-WIDTH / 10, 0, time, section.scriptDuration!);
    },
    destY: (_element: etro.EtroObject, time: number) => {
      return lerp(-HEIGHT / 10, 0, time, section.scriptDuration!);
    },
    destWidth: (_element: etro.EtroObject, time: number) => {
      return lerp(WIDTH * 1.2, WIDTH, time, section.scriptDuration!);
    },
    destHeight: (_element: etro.EtroObject, time: number) => {
      return lerp(HEIGHT * 1.2, HEIGHT, time, section.scriptDuration!);
    },
    x: 0, // default: 0
    y: 0, // default: 0
    sourceWidth: WIDTH,
    sourceHeight: HEIGHT,
    opacity: 1, // default: 1
  });
}

/**
 * Creates a slide layer for a given section of a script.
 * @param section - The script data for the section.
 * @param start - The start time of the layer.
 * @returns A new slide layer.
 */
const createSlideLayer = async (section: ScriptData, start: number) => {
  return new etro.layer.Image({
    startTime: start,
    duration: section.scriptDuration!,
    source: await resizeImage(section.scriptMedia!.url, WIDTH, HEIGHT),
    destX: (_element: etro.EtroObject, time: number) => {
      return lerp(0, -WIDTH / 5, time, section.scriptDuration!);
    },
    destY: 0,
    destWidth: WIDTH * 1.2,
    destHeight: HEIGHT * 1.2,
    x: 0, // default: 0
    y: 0, // default: 0
    sourceWidth: WIDTH,
    sourceHeight: HEIGHT,
    opacity: 1, // default: 1
  });
}

/**
 * Adds Media layers to a movie based on the provided sections and script data.
 * @param sections - An array of script data representing different sections.
 * @param movie - The movie object to which the media layers will be added.
 * @throws {Error} - If no media or duration is found in a section.
 */
export async function addMediaLayers(sections: ScriptData[], movie: etro.Movie) {
    let start = 0;
    for (const section of sections) {
      if (!section.scriptMedia) throw new Error("No media found");
      if (!section.scriptDuration) throw new Error("No duration found");
      var layer = null;
      if (section.scriptMediaIsVideo) {
        const videoPath = section.scriptMedia.url.replace("local:///", "")
        console.log(section)
        console.log(videoPath)
        layer = new etro.layer.Video({
          startTime: start,
          duration: section.scriptDuration,
          source: await window.api.toDataURL(videoPath, "video/mp4"),
          destX: 0, // default: 0
          destY: 0, // default: 0
          destWidth: undefined, // default: null (full width)
          destHeight: undefined, // default: null (full height)
          x: 0,  // default: 0
          y: 0, // default: 0
          opacity: 1, // default: 1
          volume: 0, // default: 1
        })
      } else {
        const randNum = Math.floor(Math.random() * 3); // random number 0 - 2
        switch (randNum) {
          case (0): {
            layer = await createZoomLayer(section, start);
            break;
          }
          case (1): {
            layer = await createZoomOutLayer(section, start);
            break;
          }
          default: {
            layer = await createSlideLayer(section, start);
          }
        }
      }
      console.log("adding layer", layer);
      start += section.scriptDuration;
      movie.layers.push(layer);
  };
}

/**
 * Adds subtitle layers to a movie based on the provided sections and script data.
 * @param sections - An array of ScriptData objects representing different sections of the movie.
 * @param movie - The movie object to which the subtitle layers will be added.
 * @throws {Error} - If no media or duration is found in a section.
 */
export async function addSubtitleLayers(sections: ScriptData[], movie: etro.Movie) {
  if (!(await window.api.getProjectHasSubtitles())) {
    return
  }
  let start = 0;
  sections.forEach((section: ScriptData) => {
      if (!section.scriptMedia) throw new Error("No media found");
      if (!section.scriptDuration) throw new Error("No duration found");
      const layer = new SubtitleText({
          startTime: start,
          duration: section.scriptDuration,
          text: section.scriptTexts[section.selectedScriptIndex],
          x: 0, // default: 0
          y: 0, // default: 0
          opacity: 1, // default: 1
          color: etro.parseColor("white"), // default: new etro.Color(0, 0, 0, 1)
          font: "50px sans-serif", // default: '10px sans-serif'
          textX: (3 * WIDTH / 4) / 2, // default: 0
          textY: HEIGHT, // default: 0
          textAlign: "center", // default: 'left'
          textBaseline: "alphabetic", // default: 'alphabetic'
          textDirection: "ltr", // default: 'ltr'
          background: new etro.Color(0, 0, 0, 0.0), // default: null (transparent)
          maxWidth: 3 * WIDTH / 4, // default: null (no maximum width)
      });
      movie.layers.push(layer);
      console.log("adding layer", layer);

      start += section.scriptDuration;
  });
    
}

/**
 * Adds audio layers to a movie based on the provided sections.
 * @param sections - An array of script data representing different sections of the movie.
 * @param movie - The movie object to which the audio layers will be added.
 * @throws {Error} - If no media or duration is found in a section.
 */

export async function addAudioLayers(sections: ScriptData[], movie: etro.Movie) {
  let start = 0;
  console.log("adding audio layers", sections);
  for (const section of sections) {
    if (!section.scriptAudio) throw new Error("No media found");
    if (!section.scriptDuration) throw new Error("No duration found");
    const layer = new etro.layer.Audio({
      startTime: start,
      duration: section.scriptDuration,
      source: await window.api.toDataURL(section.scriptAudio, "audio/wav"),
      sourceStartTime: 0,
      muted: false, // default: false
      volume: 1, // default: 1
      playbackRate: 1, 
    });
    movie.layers.push(layer);

    if (await window.api.getProjectHasSoundEffect() && section.soundEffect && section.soundEffectPrompt !== "No effect") {
      const effectLayer = new etro.layer.Audio({
        startTime: start,
        duration: Math.min(4, section.scriptDuration),
        source: await window.api.toDataURL(section.soundEffect, "audio/wav"),
        sourceStartTime: 0,
        muted: false, // default: false
        volume: 1, // default: 1
        playbackRate: 1, 
      });
      movie.layers.push(effectLayer);
      console.log("adding sound effect layer", effectLayer);
    }
    start += section.scriptDuration;


  }

  if (await window.api.getProjectHasBackgroundAudio()) {
    const effectLayer = new etro.layer.Audio({
      startTime: 0,
      duration: start,
      source: bgAudio[0].path,
      sourceStartTime: 0,
      muted: false, // default: false
      volume: 0.3, 
      playbackRate: 1, 
    });
    movie.layers.push(effectLayer);
    console.log("adding bg music layer", effectLayer);
  }

}


/**
 * Updates a section in the script data.
 * If an index is provided, the section at that index will be updated.
 * If no index is provided, the section with matching id will be updated.
 * @param section - The section to update.
 * @param index - The index of the section to update (optional).
 * @returns The updated section.
 */
export const updateSection = async (section: ScriptData, index?: number) => {
  const existing = await window.api.getScript();
  if (!index) {
    index = existing.findIndex((s) => s.id === section.id);
  }
  if (index === -1) {
    throw new Error("Section not found");
  }
  existing[index] = section;
  await window.api.setScript(existing);
  return section;
}




/**
 * Generates audio for each section in the script and saves the audio to the section.
 * @returns {Promise<void>} A promise that resolves when the audio generation is complete.
 * @throws {Error} If there is an error generating the audio.
 */
export const generateAudio = async () => {
  try {
    const initial = await window.api.getScript();
    for (let section of initial) {
      console.log("section", section.scriptAudio, section.soundEffect);
      if (!section.scriptAudio) {
        const modified = window.api.textToAudio(section);
        toast.promise(modified, {
          loading: `Generating audio for ${section.sectionName}...`,
          success: (newSection) => {
            return `Audio has been generated for ${section.sectionName}. ${newSection.scriptAudio} has been saved.`;
          },
          error: "Error generating audio for section: " + section.sectionName,
        });
        section = await updateSection(await modified)
      }

      if (await window.api.getProjectHasSoundEffect() && !section.soundEffect) {
        for (let i = 0; i < 3; i++) {
          try {
            const modified = window.api.generateSoundEffect(section);
            toast.promise(modified, {
              loading: `Generating sound effects for ${section.sectionName}...`,
              success: (newSection) => {
                return `Sound effect has been generated for ${section.sectionName}. ${newSection.soundEffect} has been saved.`;
              },
              error: "Error generating sound effect for section: " + section.sectionName,
            });
            await updateSection(await modified)
            break
          } catch (error) {
            toast.error("Error generating sound effect for section: " + section.sectionName + " retrying... Attempt " + i + 1);
          }
        }
      }

    }
    // const length = result.reduce((acc, val) => {
    //   return acc + val.scriptDuration!;
    // }, 0);
    // const track =  window.api.generateBackingTrack("inspiring emotionally charged uplidting corportate music vocals tones",length/2 )
    // toast.promise(track, {
    //   loading: `Generating backing track...`,
    //   success: (newSection) => {
    //     return `Backing track has been generated. ${newSection.audioSrc} has been saved.`;
    //   },
    //   error: (error)=>`Error generating backing track <em>${error}</em>` ,
    // });
    // await window.api.setProjectBackingTrack(await track);
  } catch (error) {
    console.error("Error generating audio:", error);
  }
};

/**
 * Adds avatar layers to the movie based on the provided sections.
 * @param sections - An array of ScriptData objects representing the sections of the movie.
 * @param movie - The etro.Movie object to which the avatar layers will be added.
 * @returns A Promise that resolves when the avatar layers have been added.
 * @throws An error if the avatar video URL or duration is missing for any section.
 */
export const addAvatarLayers = async (sections: ScriptData[], movie: etro.Movie) => {
  sections = await window.api.getScript()
    if (!(await window.api.getProjectHasAvatar())) {
      console.log("No Avatar Option Selected. Skipping Avatar Layering... ");
      return;
  }
  let start = 0;
  for (const section of sections) {
    if (!section.avatarVideoUrl) {
      toast.error("No Avatar Video URL found for section: " + section.sectionName);
      throw new Error("No avatarURL found")
    }
    if (!section.scriptDuration) {
      toast.error("No duration found for section: " + section.sectionName);
      throw new Error("No duration found")
    }
    const avatar = await window.api.getProjectAvatar();
    const layer = new etro.layer.Video({
      startTime: start,
      duration: section.scriptDuration,
      source: await window.api.toDataURL(section.avatarVideoUrl, 'video/mp4'),
      destX: 0,
      destY: 0,
      destWidth: avatar.width / 3,
      destHeight: avatar.height / 3, // default: null (full height)
      x: WIDTH - avatar.width / 3,
      y: HEIGHT - avatar.height / 3,
      opacity: 1, 
      volume: 0, 
    });
    const effect = new etro.effect.ChromaKey({
      target: new etro.Color(0, 0, 0, 0), // default: new etro.Color(1, 0, 0, 1)
      threshold: 10,
      interpolate: false, // default: false
    })
    layer.effects.push(
      effect
    );
    movie.layers.push(layer);
    start += section.scriptDuration;
  }
}

/**
 * Generates avatar sections for a project.
 * If the project has no avatar option selected, the function will skip avatar generation.
 * For each section in the project, it checks if an avatar video URL is already present.
 * If an avatar video URL does not exist, it generates an avatar for the section using the project avatar.
 * Finally, it sets the modified script with the generated avatar sections and logs a success message.
 * If there is an error generating the avatar, it logs an error message.
 *  
 * @returns {Promise<void>} A promise that resolves when the generation is complete.
 */
export const generateAvatarSections = async () => {
  if (! await window.api.getProjectHasAvatar()) {
    console.log("No Avatar Option Selected. Skipping Avatar Generation... ");
    return;
  }
  try {
    const initial = await window.api.getScript();
    const avatar = await window.api.getProjectAvatar();
    for (const section of initial) {
      if (section.avatarVideoUrl) {
        toast.success(`Avatar has already been generated for ${section.sectionName}.`);
        continue;
      }
      for (let i = 0; i < 3; i++) {
        try {
          const modified = window.api.generateAvatar(section, avatar);
          toast.promise(modified, {
            loading: `Generating avatar for ${section.sectionName}...`,
            success: () => {
              return `Avatar has been generated for ${section.sectionName}. `;
            },
            error: "Error generating avatar for section: " + section.sectionName,
          });
          await updateSection(await modified)
          break
        } catch (error) {
          toast.error("Error generating avatar effect for section: " + section.sectionName + " retrying... Attempt " + i + 1);
        }
      }

    }
    console.log("Avatar Sections Generated");
  } catch (error) {
    console.error("Error generating avatar:", error);
  }
}

async function resizeImage(url: string, targetWidth: number, targetHeight: number): Promise<string> {
  return new Promise<string>((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = "Anonymous"; // To allow fetching images from other origins
      img.onload = () => {
          const canvas = document.createElement('canvas');
          canvas.width = targetWidth;
          canvas.height = targetHeight;
          const ctx = canvas.getContext('2d');
          if (!ctx) {
              reject(new Error('Unable to get canvas context'));
              return;
          }
          ctx.drawImage(img, 0, 0, targetWidth, targetHeight);
          const dataURL = canvas.toDataURL(); // Convert canvas to data URL
          resolve(dataURL);
      };
      img.onerror = (error) => {
          reject(new Error(`Failed to load image: ${error}`));
      };
      img.src = url;
  });
}