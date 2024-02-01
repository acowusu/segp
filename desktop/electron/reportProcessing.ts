import path from "path";
import { Worker } from "worker_threads";
import { getProjectPath } from "./metadata";
import audiences from "./mockData/audiences.json";
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


export async function textToAudio(text: string): Promise<string> {
  // TODO: actual logic
  return text + ".mp3";
}

export function extractTextFromPDF(filePath: string): Promise<string> {
  const worker = new Worker(path.resolve(__dirname, "./worker.js"), {});
  worker.postMessage({ rpc: "setup", data: { path: getProjectPath() } });
  worker.postMessage({ rpc: "extractTextFromPDF", data: { filePath } });

  return new Promise((resolve, reject) => {
    worker.on("message", ({ rpc, result }) => {
      if (rpc === "extractTextFromPDF") {
        resolve(result);
      }
    });
    worker.on("error", reject);
    worker.on("exit", (code) => {
      if (code !== 0)
        reject(new Error(`Worker stopped with exit code ${code}`));
    });
  });
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
