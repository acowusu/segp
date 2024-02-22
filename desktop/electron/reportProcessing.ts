// import { Worker } from "worker_threads";
import { getProjectPath, getTextReportPath } from "./metadata";
import audiences from "./mockData/audiences.json";
import { pool } from "./pool";
import { generateTopics, generateScript } from "./server"
import type {
  Audience,
  ScriptData,
  Topic,
  Visual,
  Voiceover,
  AudioInfo,
  Avatar,
} from "./mockData/data";
// import topics from "./mockData/topics.json";
import visuals from "./mockData/visuals.json";
import voiceovers from "./mockData/voiceovers.json";
import avatars from "./mockData/avatars.json";
import * as projectData from "./projectData";
import { readFile, mkdir, writeFile } from "node:fs/promises";
import watch from "node-watch"
import fs from "fs";
import path from "path";

/**
 * Retrieves the text content of a report. 
 * If the report file does not exist, 
 * the function will wait for the file to be created.
 * 
 * @returns A promise that resolves to the report text.
 */
export async function getReportText(): Promise<string> {
  const reportPath = getTextReportPath();
  console.log("Getting report text", reportPath);
  if (fs.existsSync(reportPath)) {
    console.log("Report Exists", reportPath);
    const report = await readFile(reportPath, "utf-8");
    return report
  } else {
    console.log("Report does not exist, waiting for it to be created", reportPath);
    return await new Promise<string>((resolve) => {
      const watcher = watch(getProjectPath(), { persistent: true }, async (event, filename) => {
        console.log("Event", event, filename, reportPath)
        if (event === 'update' && filename === reportPath && fs.existsSync(reportPath)) {
          watcher.close();
          console.log("Report Exists now",fs.existsSync(reportPath) , reportPath);
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
  if (!fs.existsSync(fileDirectory)) await mkdir(fileDirectory); //Optional if you already have downloads directory

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


// Takes in an array of strings and returns an array of AudioInfo
export async function textToAudio(textArray: string[]): Promise<AudioInfo[]> {

  const audioInfoArray: AudioInfo[] = [];

  for (const text of textArray) {
    const postData = new FormData();
    postData.append('script', text);

    const { destination, headers } = await downloadFile('https://iguana.alexo.uk/v0/generate_audio', getProjectPath(), {
      method: 'POST',
      body: postData,
    })

    const duration = parseFloat(headers.get("audio-duration")!);
    audioInfoArray.push({ audioPath: destination, duration, subtitlePath: text });

  }
  return audioInfoArray;
}


export async function extractTextFromPDF(filePath: string): Promise<string> {
  const { text } = await (pool!.run({ filePath, projectPath: getProjectPath() }, { name: 'extractTextFromPDF' }) as Promise<{ text: string; images: ImageData[]; }>)
  return text
}

export async function getScript(): Promise<ScriptData[]> {
  // TODO forward error if not initialized (for now we just return the notional script)
  let script = projectData.getProjectScript();
  if (script.length !== 0) {
    return script
  }


  const report = await getReportText();
  script = await generateScript(projectData.getProjectTopic().topic, report)
  await setScript(script)
  return script


}

export async function setScript(script: ScriptData[]): Promise<void> {
  projectData.setProjectScript(script);
}

export async function getTopics(): Promise<Topic[]> {
  const proj_data = projectData.getProjectTopics()
  if (proj_data.length !== 0) {
    return proj_data
  }

  const report = await getReportText();
  const topics = await generateTopics(report);
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

export async function getAvatars(): Promise<Avatar[]> {
  return avatars;
}

export async function setAvatar(avatar: Avatar): Promise<void> {
  console.log("setAvatar", avatar);
  projectData.setProjectAvatar(avatar);
}

export async function setAudience(audience: Audience): Promise<void> {
  projectData.setProjectAudience(audience);
}
export async function setVoiceover(voiceover: Voiceover): Promise<void> {
  console.log("setVoiceover", voiceover);
  projectData.setProjectVoiceover(voiceover);
}
export async function setVisual(visuals: Visual): Promise<void> {
  projectData.setProjectVisual(visuals);
}
// Usage example:
