export interface IElectronAPI {
  openFile: () => Promise<string>,
}

declare global {
  interface Window {
    electronAPI: IElectronAPI
  }
}