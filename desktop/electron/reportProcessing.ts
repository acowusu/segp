// import { Worker } from "worker_threads";
import { getProjectPath, getTextReportPath } from "./metadata";
import audiences from "./mockData/audiences.json";
import {pool } from "./pool";
import {generateTopics} from "./server"
import type {
  Audience,
  ScriptData,
  Topic,
  Visual,
  Voiceover,
} from "./mockData/data";
import script from "./mockData/script.json";
// import topics from "./mockData/topics.json";
import visuals from "./mockData/visuals.json";
import voiceovers from "./mockData/voiceovers.json";
import {  readFile } from "node:fs/promises";
import watch from "node-watch"
import fs from "fs";



export async function textToAudio() {
  // return [generationId, audioUrl];
}

export async function extractTextFromPDF(filePath: string): Promise<string> {
  const {text} = await (pool!.run({filePath, projectPath: getProjectPath()},  { name: 'extractTextFromPDF' }) as Promise<{ text: string; images: ImageData[]; }>)
  return text
}

export async function getScript(): Promise<ScriptData[]> {
  return script;
}
export async function getTopics(): Promise<Topic[]> {
  const reportPath = getTextReportPath();
  
  if (fs.existsSync(reportPath)) {
    const report = await readFile(reportPath, "utf-8");
    return await generateTopics(report);
  } else {
    return await new Promise<Topic[]>((resolve) => {
      const watcher = watch(reportPath, { persistent: true }, async (event, filename) => {
        if (event === 'update' && filename === reportPath) {
          watcher.close();
          const report = await readFile(reportPath, "utf-8");
          resolve(generateTopics(report));
        }
      });
    });
  }
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
