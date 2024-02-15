export interface Topic {
  topic: string;
  summary: string;
}
export interface ScriptData {
  section: string;
  script1: string;
  script2: string;
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
  audioUrl: string;
  duration: number;
  text: string;
}