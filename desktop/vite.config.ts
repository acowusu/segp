import fs from 'node:fs'
import path from 'node:path'
import {
  type Plugin,
  defineConfig,
  normalizePath,
} from 'vite'
import electron from 'vite-plugin-electron/simple'
import react from '@vitejs/plugin-react'
import os from 'os'
// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    electron({
      main: {
        // Shortcut of `build.lib.entry`.
        entry: 'electron/main.ts',
        vite: {
          build: {
            minify: false,
            commonjsOptions: {
              ignoreDynamicRequires: true,
            },
            rollupOptions: {
              external: [
                'better-sqlite3',
                'sqlite3',
                'serialport',
                // other `C/C++` addons
              ],
            },
          },
        },
      },
      preload: {
        // Shortcut of `build.rollupOptions.input`.
        // Preload scripts may contain Web assets, so use the `build.rollupOptions.input` instead `build.lib.entry`.
        input: path.join(__dirname, 'electron/preload.ts'),
      },
      // Ployfill the Electron and Node.js built-in modules for Renderer process.
      // See 👉 https://github.com/electron-vite/vite-plugin-electron-renderer
      renderer: {},
    })

  ],
})

