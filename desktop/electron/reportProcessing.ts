// import { Worker } from "worker_threads";
import { getProjectPath, getTextReportPath } from "./metadata";
import * as https from 'https';
import { app } from 'electron';
import audiences from "./mockData/audiences.json";
import {pool } from "./pool";
import {generateTopics, generateScript} from "./server"
import type {
  Audience,
  ScriptData,
  Topic,
  Visual,
  Voiceover,
  AudioInfo,
} from "./mockData/data";
// import topics from "./mockData/topics.json";
import visuals from "./mockData/visuals.json";
import voiceovers from "./mockData/voiceovers.json";
import * as projectData from "./projectData";
import {  readFile } from "node:fs/promises";
import watch from "node-watch"
import fs from "fs";
// Takes in an array of strings and returns an array of AudioInfo
export async function textToAudio(textArray: string[]): Promise<AudioInfo[]> {

    const audioInfoArray: AudioInfo[] = [];

    for (const text of textArray) {
      const postData = new FormData();
      postData.append('script', text);

      const response = await fetch('https://iguana.alexo.uk/tts/', {
          method: 'POST',
          body: postData,
      });

      if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
      }

      // Get audio link
      const responseData = await response.json();
      const audioLink: string = 'https://iguana.alexo.uk' + responseData.audio_link;

      // Get audio duration 
      const duration = responseData.duration;

      // Create audio file path
      const audioFilePath = app.getAppPath() + '/public/audio/' + extractFilenameFromURL(audioLink);
      
      try {
        await downloadMP3(audioLink, audioFilePath);
        console.log('MP3 file downloaded successfully.');

        const subtitlesFilePath = audioFilePath.replace('.mp3', '.srt');
        await saveSubtitles(responseData.subtitles, subtitlesFilePath);
        console.log('Subtitles saved successfully.');

        audioInfoArray.push({ audioPath: audioFilePath, duration, subtitlePath: subtitlesFilePath });
      } catch (error) {
        console.error('Error downloading MP3 file:', error);
      }
      
    }
    return audioInfoArray;
}

// Function to get audio file name
function extractFilenameFromURL(url: string): string {
  const parts = url.split('/');
  return parts[parts.length - 1];
}

// Function to download MP3 file from URL
function downloadMP3(url: string, destinationPath: string): Promise<void> {
  return new Promise<void>((resolve, reject) => {
      const file = fs.createWriteStream(destinationPath);
      https.get(url, (response) => {
          response.pipe(file);
          file.on('finish', () => {
              file.close();
              resolve();
          });
      }).on('error', (err) => {
          fs.unlink(destinationPath, () => reject(err));
      });
  });
}

// Function to save subtitles content as an .srt file
function saveSubtitles(subtitlesContent: string, subtitlesFilePath: string): Promise<void> {
  return new Promise<void>((resolve, reject) => {
      fs.writeFile(subtitlesFilePath, subtitlesContent, 'utf8', (err) => {
          if (err) {
              reject(err);
          } else {
              resolve();
          }
      });
  });
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
