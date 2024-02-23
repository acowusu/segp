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