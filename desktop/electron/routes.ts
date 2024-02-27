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
  toDataURL,
  fetchImages,
  generateBackingTrack,
} from "./reportProcessing";
import {
  generateAvatar,
  getAvatars,
  setAvatar,
} from "./avatarGeneration";
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
import {getServiceStatus, launchService, shutdownService} from "./status"
const api = {
  loadReport,
  getScript,
  setScript,
  getTopics,
  setTopic,
  getAudiences,
  setAudience,
  getServiceStatus,
  launchService,
  shutdownService,
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
  generateBackingTrack,
  getProjectPath,
  textToAudio,
  getIsDev,
  generateAvatar,
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
  getAvatars,
  setAvatar,
  fetchImages,
};
export default api;

export type IAPI = Promisified<typeof api>;
