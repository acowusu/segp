import { Promisified } from "./apiTypes";
import {
  getScript,
  setScript,
  getTopics,
  setTopic,
  setAudience,
  getAudiences,
  setVisual,
  getVisuals,
  setVoiceover,
  getVoiceovers,
  textToAudio,
  toDataURL,
} from "./reportProcessing";
import { convertWebmToMp4, writeBlob, webmBLobToMp4, prepareMp4Blob } from "./videoProcessing";
// Import your API methods here
import {
  getDirectory,
  getFile,
  createProject,
  openProject,
  loadReport,
} from "./setup";
import { getProjectName, getProjectPath, getIsDev, getLastProject} from "./metadata";
import * as projectData from "./projectData"
import {generateTextFromLLM, generateTopics, generateOpenJourneyPrompt, generateOpenJourneyImage} from "./server"
const api = {
  loadReport,
  getScript,
  setScript,
  getTopics,
  setTopic,
  getAudiences,
  setAudience,
  setVisual,
  getVisuals,
  setVoiceover,
  getVoiceovers,
  getDirectory,
  getFile,
  createProject,
  openProject,
  getProjectName,
  getProjectPath,
  textToAudio,
  getIsDev,
  getLastProject,
  ...projectData,
  toDataURL,
  generateTextFromLLM,
  generateOpenJourneyImage,
  generateOpenJourneyPrompt,
  generateTopics,
  // Add your API methods here
  convertWebmToMp4,
  writeBlob,
  webmBLobToMp4,
  prepareMp4Blob,
};
export default api;

export type IAPI = Promisified<typeof api>;
