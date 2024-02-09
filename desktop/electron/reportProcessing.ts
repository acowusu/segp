// import { Worker } from "worker_threads";
import { getProjectPath } from "./metadata";
import audiences from "./mockData/audiences.json";
import {pool } from "./pool";
import type {
  Audience,
  ScriptData,
  Topic,
  Visual,
  Voiceover,
} from "./mockData/data";
import script from "./mockData/script.json";
import topics from "./mockData/topics.json";
import visuals from "./mockData/visuals.json";
import voiceovers from "./mockData/voiceovers.json";

interface AudioInfo {
  audioUrl: string;
  duration: number;
  text: string;
}

// Takes in an array of strings and returns an array of AudioInfo
export async function textToAudio(textArray: string[]): Promise<AudioInfo[]> {

    const audioInfoArray: AudioInfo[] = [];

    for (const text of textArray) {
      const postData = new FormData();
      postData.append('script', text);

      const response = await fetch('http://0.0.0.0:8888/tts/', {
          method: 'POST',
          body: postData,
      });

      if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
      }

      // Get audio link
      const responseData = await response.json();
      const audioLink: string = responseData.audio_link;
      const fullAudioLink: string = 'http://localhost:8888' + audioLink;

      // Get audio duration 
      const duration = responseData.duration;

      audioInfoArray.push({ audioUrl: fullAudioLink, duration, text});
    }

    // console.log(audioInfoArray);
    return audioInfoArray;
}

export async function extractTextFromPDF(filePath: string): Promise<string> {
  const {text} = await (pool!.run({filePath, projectPath: getProjectPath()},  { name: 'extractTextFromPDF' }) as Promise<{ text: string; images: ImageData[]; }>)
  return text
}

export async function getScript(): Promise<ScriptData[]> {
  return script;
}
export async function getTopics(): Promise<Topic[]> {
  return topics;
}
export async function setTopic(topic: Topic): Promise<void> {
  console.log(topic);
}
export async function getAudiences(): Promise<Audience[]> {
  return audiences;
}
export async function getVoiceovers(): Promise<Voiceover[]> {
  return voiceovers;
}
export async function getVisuals(): Promise<Visual[]> {
  return visuals;
}

export async function setAudience(audience: Audience): Promise<void> {
  console.log(audience);
}
export async function setVoiceover(voiceover: Voiceover): Promise<void> {
  console.log(voiceover);
}
export async function setVisual(visuals: Visual): Promise<void> {
  console.log(visuals);
}
// Usage example:
