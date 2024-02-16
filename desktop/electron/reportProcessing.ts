// import { Worker } from "worker_threads";
import { getProjectPath, getTextReportPath } from "./metadata";
import audiences from "./mockData/audiences.json";
import {pool } from "./pool";
import {generateTopics, generateScript} from "./server"
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
import * as projectData from "./projectData";
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
  // TODO forward error if not initialized (for now we just return the notional script)
  var script = projectData.getProjectScript();
  if (script.length !== 0) {
    return script
  }

  const reportPath = getTextReportPath();
  
  if (fs.existsSync(reportPath)) {
    const report = await readFile(reportPath, "utf-8");
    script = await generateScript(projectData.getProjectTopic().topic, report)
    await setScript(script)
    return script
  } else {
    // Alex what does your watch code do??
    throw Error("report does not exits")
  }

}

export async function setScript(script: ScriptData[]): Promise<void> {
  projectData.setProjectScript(script);
}

export async function getTopics(): Promise<Topic[]> {
  const proj_data = projectData.getProjectTopics()
  if (proj_data.length !== 0) {
    return proj_data
  }

  const reportPath = getTextReportPath();
  
  if (fs.existsSync(reportPath)) {
    const report = await readFile(reportPath, "utf-8");
    const topics = await generateTopics(report);
    projectData.setProjectTopics(topics);
    return topics
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
  console.log("setVoiceover", voiceover);
  projectData.setProjectVoiceover(voiceover);
}
export async function setVisual(visuals: Visual): Promise<void> {
  projectData.setProjectVisual(visuals);
}
// Usage example:
