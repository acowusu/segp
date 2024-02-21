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
  setLength,
  getVoiceovers,
  textToAudio,
} from "./reportProcessing";
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
  setLength,
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
  generateTextFromLLM,
  generateTopics,
  // Add your API methods here
};
export default api;

export type IAPI = Promisified<typeof api>;
