import { extractText, getDocumentProxy , extractImages} from "unpdf";
import { readFile } from "node:fs/promises";
import script from "./mockData/script.json";
import topics from "./mockData/topics.json";
import audiences from "./mockData/audiences.json";
import visuals from "./mockData/visuals.json";
import voiceovers from "./mockData/voiceovers.json";
import type { Audience, ScriptData, Topic, Visual, Voiceover } from "./mockData/data";
import path from 'path';
import { Worker } from 'worker_threads';
import * as PlayHT from 'playht';


export async function extractTextFromPDF(filePath: string): Promise<string> {
  
  console.log("# Loading document from disk");
  const buffer = await readFile(filePath);
  const pdf = await getDocumentProxy(new Uint8Array(buffer));

  const { totalPages, text } = await extractText(pdf, { mergePages: true });
  const images = []
  console.log("# Extracting images 1");
  for (let i = 1; i < totalPages; i++) {
    const pageImages = await extractImages(pdf, i);
    images.push(...pageImages);
  }
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
  return filePath as string

}

export async function textToAudio() {
    PlayHT.init({
      apiKey: '75fc21e75dfc45f5aa8e1947018966e6',
      userId: 'aYxdHRiwjRdnqCoco5rZ6kJ6AvH3',
      defaultVoiceId: 's3://peregrine-voices/oliver_narrative2_parrot_saad/manifest.json',
      defaultVoiceEngine: 'PlayHT2.0',
    });
    
    // Generate audio from text
    // const generated = await PlayHT.generate('Computers can speak now!');
    
    // Grab the generated file URL
    // const { generationId, audioUrl } = generated;
    const generationId = "UzqG23PBNBfI4lS025"
    const playHtConfig = {
      userId: 'aYxdHRiwjRdnqCoco5rZ6kJ6AvH3',
      apiKey: '75fc21e75dfc45f5aa8e1947018966e6',
    };
    
    //console.log('The url for the audio file is', audioUrl);

    const transcriptionUrl = `https://api.play.ht/api/v2/transcriptions/${generationId}`;
const transcriptionOptions = {
  method: 'GET',
  headers: {
    accept: 'application/json',
    Authorization: `Bearer ${playHtConfig.apiKey}`,
    'X-USER-ID': playHtConfig.userId,
  },
};

  fetch(transcriptionUrl, transcriptionOptions)
  .then(res => res.json())
  .then(json => console.log(JSON.stringify(json)))
  .catch(err => console.error('Error:', err));

    // return [generationId, audioUrl];
}

export async function myWorkerFunction(filepath:string): Promise<number> {
  const worker = new Worker(path.resolve(__dirname, './worker.js'), {});

  worker.postMessage({ filepath});

  return new Promise((resolve, reject) => {
    worker.on('message', resolve);
    worker.on('error', reject);
    worker.on('exit', (code) => {
      if (code !== 0) reject(new Error(`Worker stopped with exit code ${code}`));
    });
  });
}

export async function getScript(): Promise<ScriptData[]> {
  return script;
}
export async function getTopics(): Promise<Topic[]> {
  return topics
}
export async function setTopic(topic: Topic): Promise<void> {
  console.log(topic)
}
export async function getAudiences(): Promise<Audience[]> {
  return audiences
}
export async function getVoiceovers(): Promise<Voiceover[]> {
  return voiceovers
}
export async function getVisuals(): Promise<Visual[]> {
  return visuals
}

export async function setAudience(audience: Audience): Promise<void> {
  console.log(audience) 
}
export async function setVoiceover(voiceover: Voiceover): Promise<void> {
  console.log(voiceover)
}
export async function setVisual(visuals: Visual): Promise<void> {
  console.log(visuals)
}
// Usage example:

