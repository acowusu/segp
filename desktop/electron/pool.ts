const require = createRequire(import.meta.url);
import { createRequire } from "node:module";
import { resolve } from "path";
import isDev from "electron-is-dev";

import Tinypool from "tinypool";
export let pool: Tinypool | undefined;

const possiblePaths: string[] = [
  "./tinypool.js",
  "../dist-electron/tinypool.js",
];

if (isDev) {
  for (const path of possiblePaths) {
    try {
      pool = new Tinypool({
        filename: require.resolve(path),
      });
      break; // Exit the loop if a valid path is found
    } catch {
      console.log(`Failed to resolve path: ${path}`);
    }
  }
} else {
  pool = new Tinypool({
    filename: resolve(
      __dirname,
      "../../app.asar.unpacked/dist-electron/tinypool.js"
    ),
  });
}
