// import { Worker } from "worker_threads";
import { getProjectPath } from "./metadata";
import audiences from "./mockData/audiences.json";
import {pool } from "./pool";
import type {
  Audience,
  ScriptData,
  Topic,
  TopicScript,
  Visual,
  Voiceover,
} from "./mockData/data";
import script from "./mockData/script.json";
import topics from "./mockData/topics.json";
import visuals from "./mockData/visuals.json";
import voiceovers from "./mockData/voiceovers.json";
import { TopicScripts } from "../src/pages/script-editor";



export async function textToAudio() {
  // return [generationId, audioUrl];
}

export async function extractTextFromPDF(filePath: string): Promise<string> {
  const {text} = await (pool!.run({filePath, projectPath: getProjectPath()},  { name: 'extractTextFromPDF' }) as Promise<{ text: string; images: ImageData[]; }>)
  return text
}

export async function generateMoreScripts({section}: TopicScript): Promise<string> {
  console.log(section)
  return "TODO get the llm to create new scripts based on topic name and data in pdf";
}

export async function getScript(): Promise<ScriptData[]> {
  return script;
}
export async function getTopics(): Promise<Topic[]> {
  return topics;
}

export async function getScripts(): Promise<TopicScripts> {

  const BASE_URL = "http://tapir.alexo.uk/polar_bears_script1.json" // TODO set up in .env file 

  var scripts: TopicScripts = []

  try {
    const response = await await fetch(BASE_URL)
    if (response.status === 200) {
      scripts = await response.json() as TopicScripts
    }
  } catch (error) {
    console.error("Failed to fetch script data:", error);
  }
  return scripts;
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
