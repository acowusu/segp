export interface IElectronAPI {
  getTopics(): Promise<Topic[]>;
  setTopic(Topic): Promise<void>;
  openFile: () => Promise<string>,
  getScript(): Promise<ScriptData[]>;
  textToAudio(text: string): Promise<string>;
}

import { IAPI } from "./routes";


declare global {
  interface Window {
    electronAPI: IElectronAPI,
    api: IAPI,
  }
}