import { Promisified } from "./apiTypes";
import {
  extractTextFromPDF,
  getScript,
  getTopics,
  setTopic,
  setAudience,
  getAudiences,
  setVisual,
  getVisuals,
  setVoiceover,
  getVoiceovers,
  myWorkerFunction,
  textToAudio
} from "./reportProcessing";
// Import your API methods here

const api = {
  extractTextFromPDF,
  getScript,
  getTopics,
  setTopic,
  getAudiences,
  setAudience,
  setVisual,
  getVisuals,
  setVoiceover,
  getVoiceovers,
  myWorkerFunction,
  textToAudio
  // Add your API methods here
};
export default api;

export type IAPI = Promisified<typeof api>;
