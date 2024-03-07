import etro from "etro";
import { AudioOptions, AudioSourceOptions, TextOptions } from "etro/dist/layer";
import { SubtitleText } from "../../src/lib/subtitle-layer";
import { layer } from "etro/dist/etro";

export interface Topic {
  topic: string;
  summary: string;
}
export interface ScriptData {
  id: string; // GUID 
  selectedScriptIndex: number; // index of the selected script
  scriptTexts: string[];  // array of script texts
  imagePrompts?: ImageData[]; // array of prompts and URLS for images
  sectionName: string; // Name of section
  scriptAudio?: string; // path to audio file
  scriptDuration?: number; // duration of audio file
  scriptMedia?: string; // path to media file
  scriptPrompt?: string; // path to prompt file
  sadTalkerPath?: string; // path to tmp file on server
  avatarVideoUrl?: string; // avatar video URL
  aiImages?: string[]; // list of ai generated images
  soundEffectPrompt?: string; // sound effect prompt
  soundEffect?: string; // path to generated sound effect
  assetLayerOptions?: string // options for every existing asset to create layers accordingly
}


export interface ImageData {
  prompt: string;
  imageURLS: string[];
}

export interface ScriptSelections {
  topic: string; 
  script: ScriptData[];
}

export interface Audience {
  name: string;
  description: string;
}
export interface Voiceover {
  name: string;
  description: string;
  thumbnail: string;
  audioSample: string;
  id: string;
}
export interface Visual {
  name: string;
  description: string;
  thumbnail: string;
  sample: string;
}
export interface RawReport {
  path: string;
  text: string;
}

export interface AudioInfo {
  audioPath: string;
  duration: number;
  subtitlePath: string;
}
declare module 'dataurl'

export interface Avatar {
  id: string;
  name: string;
  imagePath: string;
  sadtalkerPath: string;
  width: number;
  height: number;
}

export interface BackingTrack {
  audioSrc: string; // path to audio file
  audioDuration: number; // duration of audio file
}

/* Etro Related */
export interface LayerOpts { 
  mediaOpts?: ImageOptions; // Assumes the primary media is never a video
  audioOpts?: AudioOptions;
  avatarOpts?: VideoOptions;
  subtitleOpts?: TextOptions;
  backingOpts?: AudioOptions;
  soundfxOpts?: AudioOptions;  
}

export interface LocOps {
  x?: number;
  y?: number;
}

export interface PromisedLayerOpts { 
  p_mediaOpts?: Promise<ImageOptions>; // Assumes the primary media is never a video
  p_audioOpts?: Promise<AudioOptions>;
  p_avatarOpts?: Promise<VideoOptions>;
  p_subtitleOpts?: Promise<TextOptions>;
  p_backingOpts?: Promise<AudioOptions>;
  p_soundfxOpts?: Promise<AudioOptions>;  
}

export interface Layers {
  media?: etro.layer.Image;
  audio?: etro.layer.Audio;
  avatar?: etro.layer.Video;
  subtitle?: SubtitleText;
  backing?: etro.layer.Audio;
  soundfx?: etro.layer.Audio;
}

type SectionData = {
  start: number; //might not be needed
  script: ScriptData;
  promisedLayerOptions: PromisedLayerOpts;
  layers?: Layers;
  layerOptions: LayerOpts;
};

interface Status {
  url: string;
  name: string;
  status: string;
}

