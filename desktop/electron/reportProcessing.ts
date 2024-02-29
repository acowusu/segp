// import { Worker } from "worker_threads";
import { getProjectPath, getTextReportPath } from "./metadata";
import audiences from "./mockData/audiences.json";
import { pool } from "./pool";
import { generateTopics, generateScript, genNewScript } from "./server"
import type {
  Audience,
  BackingTrack,
  ScriptData,
  Topic,
  Visual,
  Voiceover,
} from "./mockData/data";
// import topics from "./mockData/topics.json";
import visuals from "./mockData/visuals.json";
import voiceovers from "./mockData/voiceovers.json";
import * as projectData from "./projectData";
import { readFile, mkdir, writeFile } from "node:fs/promises";
import watch from "node-watch"
import fs from "fs";

import path from "path";
import dataurl from "dataurl";
/**
 * Retrieves the text content of a report. 
 * If the report file does not exist, 
 * the function will wait for the file to be created.
 * 
 * @returns A promise that resolves to the report text.
 */
export async function getReportText(): Promise<string> {
  const reportPath = getTextReportPath();

  if (fs.existsSync(reportPath)) {
    const report = await readFile(reportPath, "utf-8");
    return report
  } else {
    return await new Promise<string>((resolve) => {
      const watcher = watch(getProjectPath(), { persistent: true }, async (event, filename) => {
        console.log("Event", event, filename, reportPath)
        if (event === 'update' && filename === reportPath && fs.existsSync(reportPath)) {
          watcher.close();
          const report = await readFile(reportPath, "utf-8");
          resolve(report);
        }
      });
    });
  }

}


export async function downloadFile(url: URL | RequestInfo, fileDirectory: string, fetchOptions?: RequestInit, fileName?: string) {
  const res = await fetch(url, fetchOptions);
  if (!res.ok) {
    throw new Error(`Failed to download file: HTTP Error ${res.status}`);
  }
  if (res === null || res.body === null) {
    throw new Error(`Failed to download file: Response is null`);
  }
  if (!fs.existsSync(fileDirectory)) await mkdir(fileDirectory);

  if (fileName == undefined) {
    // Guess the file extension from the content type
    fileName = performance.now().toString(16) + '.' + res.headers.get('content-type')!.split('/')[1]
  }
  const destination = path.resolve(fileDirectory, fileName);
  const buffer = Buffer.from(await res.arrayBuffer())
  await writeFile(destination, buffer)
  const headers = new Map(res.headers.entries())
  return { destination, headers }
}


// Takes in an array of prompts for images and returns an array of array of filepaths to the images
export async function fetchImages(prompts: Array<string>): Promise<Array<Array<string>>> {

  const imageFilePaths: Array<Array<string>> = [];
  const unsplashAccessKeys = ['rlmP_s20oV0tzBO_AJk8lpZXQJluujDLu_OSDAR-aDA', 'uojJeEAyDSw-BFUiVGM8H6Nh4xxfaOusbBUHnOLev5Y', 'F-J-6NjEm7kDdL5kCDyFIzfyFyK3RTS1CMI4qaSE_6k', 'oj1NBnBmcZkgrrXShFqxDK_C9NyvUZqvvEsJWPIsoVI'];
  
  for (const prompt of prompts) {
    const unsplashAccessKey = unsplashAccessKeys.shift()
    const unsplashEndpoint = `https://api.unsplash.com/search/photos?per_page=9&query=${prompt}&client_id=${unsplashAccessKey}&content_filter=high&orientation=landscape`;
    const unsplashResponse = await fetch(unsplashEndpoint);
    const unsplashData = await unsplashResponse.json();

    const unsplashPhotos = unsplashData.results.map((photo: { urls: { raw: string } }) => photo.urls.raw + "&w=1920&h=1080");

    imageFilePaths.push(unsplashPhotos);
    
    // const promptFilePaths: Array<string> = [];

    // for (let i = 0; i < unsplashPhotos.length; i++) {
    //   const imageUrl = unsplashPhotos[i];
    //   const filename = `${prompt}${i}.jpg`;
    //   const response = await downloadFile(imageUrl, getProjectPath(), { method: 'GET' }, filename);
    //   promptFilePaths.push(response.destination);
    // }
    // imageFilePaths.push(promptFilePaths);

    if (unsplashAccessKey !== undefined) {
      unsplashAccessKeys.push(unsplashAccessKey);
    }
  }
  console.log(imageFilePaths);
  return imageFilePaths;
}


// Takes in an array of strings and returns an array of AudioInfo
export async function textToAudio(script: ScriptData): Promise<ScriptData> {
  console.log("textToAudio", script.scriptTexts);
  console.log("textToAudio", script.selectedScriptIndex);

  const { destination, headers } = await downloadFile('https://iguana.alexo.uk/v0/generate_audio', getProjectPath(), {
    method: 'POST',
    body: JSON.stringify({ script: script.scriptTexts[script.selectedScriptIndex] }),
    headers: {
      'Content-Type': 'application/json'
    },
  })

  const duration = parseFloat(headers.get("audio-duration")!);
  // Used with sadtalker
  const location = headers.get("media-location")!; 
  script.sadTalkerPath = location;
  script.scriptAudio = destination;
  script.scriptDuration = duration;

  return script

}
export async function generateBackingTrack(prompt: string, duration: number): Promise<BackingTrack> {

  const { destination } = await downloadFile('https://iguana.alexo.uk/v6/generate_audio', getProjectPath(), {
    method: 'POST',
    body: JSON.stringify({ script: prompt,duration:duration }), 
    headers: {
      'Content-Type': 'application/json'
    },
  })
  return {audioSrc:destination, audioDuration:duration}

}

export const toDataURL = (filePath:string):Promise<string> => {
  const songPromise = new Promise((resolve, reject) => {
    fs.readFile(filePath, (err, data) => {
      if (err) { reject(err); }
      resolve(dataurl.convert({ data, mimetype: 'audio/wav' }));
    });
  });
  return songPromise as Promise<string>;
};

export async function extractTextFromPDF(filePath: string): Promise<string> {
  const { text } = await (pool!.run({ filePath, projectPath: getProjectPath() }, { name: 'extractTextFromPDF' }) as Promise<{ text: string; images: ImageData[]; }>)
  return text
}

export async function getScript(force?:boolean): Promise<ScriptData[]> {
  // TODO forward error if not initialized (for now we just return the notional script)
  let script = projectData.getProjectScript();
  if (script.length !== 0 && !force) {
    return script
  }


  const report = await getReportText();
  script = await generateScript(report, projectData.getProjectTopic())
  await setScript(script)
  return script
}

export async function generateNewScript(script: string): Promise<string> {
  return await genNewScript(script)
}
export async function setScript(script: ScriptData[]): Promise<void> {
  projectData.setProjectScript(script);
}

export async function getTopics(force?:boolean): Promise<Topic[]> {
  const proj_data = projectData.getProjectTopics()
  if (proj_data.length !== 0 && !force) {
    return proj_data
  }
  console.log("Getting topics ")
  const report = await getReportText();
  console.log("Got report")
  const topics = await generateTopics(report);
  console.log("Got topics")
  projectData.setProjectTopics(topics);
  return topics

}
export async function setTopic(topic: Topic): Promise<void> {
  projectData.setProjectTopic(topic);
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
  projectData.setProjectAudience(audience);
}
export async function setVoiceover(voiceover: Voiceover): Promise<void> {
  projectData.setProjectVoiceover(voiceover);
}
export async function setVisual(visuals: Visual): Promise<void> {
  projectData.setProjectVisual(visuals);
}
export async function setLength(length: number): Promise<void> {
  projectData.setProjectLength(length);
}
// Usage example:
