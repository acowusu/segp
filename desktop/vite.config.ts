import { resolve } from "path";

import path from "node:path";
import { defineConfig } from "vite";
import electron from "vite-plugin-electron/simple";
import react from "@vitejs/plugin-react";
import pkg from './package.json'
const sourcemap = !!process.env.VSCODE_DEBUG

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    electron({
      main: {
        // Shortcut of `build.lib.entry`.
        entry: "electron/main.ts",
        onstart(args) {
          if (process.env.VSCODE_DEBUG) {
            console.log(/* For `.vscode/.debug.script.mjs` */'[startup] Electron App')
          } else {
            args.startup()
          }
        },
        vite: {
          build: {
            sourcemap,
            minify: false,
            commonjsOptions: {
              ignoreDynamicRequires: true,
            },
            rollupOptions: {
              
              external: [
                "better-sqlite3",
                "sqlite3",
                "serialport",
                // other `C/C++` addons
              ],
              input: {
                main: resolve(__dirname, "electron/main.ts"),
                worker: resolve(__dirname, "electron/workers/worker.ts"),
                tinypool: resolve(__dirname, "electron/workers/tinypool.ts"),
                'entry/worker':  resolve(__dirname, "node_modules/tinypool/dist/esm/entry/worker.js")
              },
            },
          },
        },
      },
      preload: {
        // Shortcut of `build.rollupOptions.input`.
        // Preload scripts may contain Web assets, so use the `build.rollupOptions.input` instead `build.lib.entry`.
        input: path.join(__dirname, "electron/preload.ts"),
      },
      // Ployfill the Electron and Node.js built-in modules for Renderer process.
      // See 👉 https://github.com/electron-vite/vite-plugin-electron-renderer
      renderer: {},
    }),
  ],
  server: process.env.VSCODE_DEBUG && (() => {
    const url = new URL(pkg.debug.env.VITE_DEV_SERVER_URL)
    return {
      host: url.hostname,
      port: +url.port,
    }
  })(),
  clearScreen: false,

});
