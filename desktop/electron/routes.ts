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
} from "./reportProcessing";
import {
  generateAvatar,
  getAvatars,
  setAvatar,
} from "./avatarGeneration";
import { webmDataToMp4File } from "./videoProcessing";
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
import {generateTextFromLLM, generateTopics} from "./server"
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
  generateAvatar,
  getLastProject,
  ...projectData,
  generateTextFromLLM,
  generateTopics,
  // Add your API methods here
  webmDataToMp4File,
  getAvatars,
  setAvatar,
};
export default api;

export type IAPI = Promisified<typeof api>;
