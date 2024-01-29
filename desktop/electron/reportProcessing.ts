import { readFile } from "node:fs/promises";
import path from "path";
import { extractText, getDocumentProxy } from "unpdf";
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

export async function extractTextFromPDFOld(filePath: string): Promise<string> {
  console.log("# Loading document from disk");
  const buffer = await readFile(filePath);
  const pdf = await getDocumentProxy(new Uint8Array(buffer));

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { totalPages, text } = await extractText(pdf, { mergePages: true });
  // const images = []
  // console.log("# Extracting images 1");
  // for (let i = 1; i < totalPages; i++) {
  //   const pageImages = await extractImages(pdf, i);
  //   images.push(...pageImages);
  // }
  // console.log("# Extracting images");
  // for (const image of images) {
  //   console.log(`# Image ${image.length} bytes`);
  //   const buffer = Buffer.from(image);
  //   // const filename = `C:\\Users\\alexa\\tmp\\${Date.now()}-image.png`; // Or any other appropriate extension (e.g., .jpg)
  //   await writeFile(filename, buffer);
  // }
  // console.log(`# PDF has ${totalPages} pages`);
  // console.log("# Text content:");
  console.log(text);
  return text as string;
}
export async function textToAudio() {
  // return [generationId, audioUrl];
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
