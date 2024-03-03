export interface Topic {
  topic: string;
  summary: string;
}
export interface ScriptData {
  id: string; // GUID 
  selectedScriptIndex: number; // index of the selected script
  scriptTexts: string[];  // array of script texts
  sectionName: string; // Name of section
  scriptAudio?: string; // path to audio file
  scriptDuration?: number; // duration of audio file
  scriptMedia?: string; // path to media file
  scriptPrompt?: string; // path to prompt file
  sadTalkerPath?: string; // path to tmp file on server
  avatarVideoUrl?: string; // avatar video URL
  soundEffectPath?: string; // path to sound effect file
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
interface Status {
  url: string;
  name: string;
  status: string;
}