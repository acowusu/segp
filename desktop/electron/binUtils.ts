import { app } from "electron";
import { platform } from "os";
import path from "path";
import isDev from "electron-is-dev";

export function getPlatform() {
  switch (platform()) {
    case 'aix':
    case 'freebsd':
    case 'linux':
    case 'openbsd':
    case 'android':
      return 'linux';
    case "darwin":
    case "sunos":
      return "mac"
    case "win32": // set to win32 even on 64 bit could use process.arch to check whether 64 bit?
      return "win64"
    default:
      return null;
  }
}

export function getBinsPath() {
  const IS_PROD = process.env.NODE_ENV === "production";
  // const {isPackaged } = app;
  
  const binsPath = IS_PROD && app?.isPackaged
    ? path.join(process.resourcesPath, "./bin")
    : path.join(app.getAppPath(), "build/resources", getPlatform()!);

    return binsPath
}

function getPath() {
  if (isDev) {
    return "./dist-native";
  }
  return "../../app.asar.unpacked/dist-native";
}

export const ffmpegPath = path.resolve(getPath(), "ffmpeg"); // seems to work with windows as well (without the .exe)