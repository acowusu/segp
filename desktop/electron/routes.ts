import { Promisified } from "./apiTypes";
import {
  getScript,
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
// Import your API methods here
import {
  getDirectory,
  getFile,
  createProject,
  openProject,
  loadReport,
} from "./setup";
import { getProjectName, getProjectPath } from "./metadata";

const api = {
  loadReport,
  getScript,
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
  // Add your API methods here
};
export default api;

export type IAPI = Promisified<typeof api>;
