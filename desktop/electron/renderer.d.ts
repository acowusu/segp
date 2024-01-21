export interface IElectronAPI {
  getTopics(): Promise<Topic[]>;
  setTopic(Topic): Promise<void>;
  openFile: () => Promise<string>,
  getScript(): Promise<ScriptData[]>;
}

import { IAPI } from "./routes";


declare global {
  interface Window {
    electronAPI: IElectronAPI,
    api: IAPI,
  }
}