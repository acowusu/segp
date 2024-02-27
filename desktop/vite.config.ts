import { resolve } from "path";
import fs from 'node:fs'
import path from "node:path";
import { defineConfig, Plugin, normalizePath } from "vite";
import { platform, EOL } from "os";
import electron from "vite-plugin-electron/simple";
import react from "@vitejs/plugin-react";
import pkg from './package.json'
import decompress from "decompress";

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
    // bindingSqlite3(),
    bindingFFmpeg(),
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


function bindingSqlite3(options: {
  output?: string;
  better_sqlite3_node?: string;
  command?: string;
} = {}): Plugin {
  const TAG = '[vite-plugin-binding-sqlite3]'
  options.output ??= 'dist-native'
  options.better_sqlite3_node ??= 'better_sqlite3.node'
  options.command ??= 'build'
  const isPosixEnvironment = process.platform === "linux" || process.platform === "darwin";
  const resolver = isPosixEnvironment? path.posix : path.win32
  return {
    name: 'vite-plugin-binding-sqlite3',
    config(config) {
      // https://github.com/vitejs/vite/blob/v4.4.9/packages/vite/src/node/config.ts#L496-L499
      const resolvedRoot = normalizePath(config.root ? path.resolve(config.root) : process.cwd())
      const output = resolver.resolve(resolvedRoot, options.output)
      const better_sqlite3 = require.resolve('better-sqlite3')
      const better_sqlite3_root = resolver.join(better_sqlite3.slice(0, better_sqlite3.lastIndexOf('node_modules')), 'node_modules/better-sqlite3')
      const better_sqlite3_node = resolver.join(better_sqlite3_root, 'build/Release', options.better_sqlite3_node)
      const better_sqlite3_copy = resolver.join(output, options.better_sqlite3_node)
      if (!fs.existsSync(better_sqlite3_node)) {
        throw new Error(`${TAG} Can not found "${better_sqlite3_node}".`)
      }
      if (!fs.existsSync(output)) {
        fs.mkdirSync(output, { recursive: true })
      }
      fs.copyFileSync(better_sqlite3_node, better_sqlite3_copy)
      /** `dist-native/better_sqlite3.node` */
      const BETTER_SQLITE3_BINDING = better_sqlite3_copy.replace(resolvedRoot + '/', '')
      fs.writeFileSync(path.join(resolvedRoot, '.env'), `VITE_BETTER_SQLITE3_BINDING=${BETTER_SQLITE3_BINDING}`)

      console.log(TAG, `binding to ${BETTER_SQLITE3_BINDING}`)
    },
  }
}

function getPlatform() {
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

function bindingFFmpeg(options: {
  output?: string;
  binName?: string;
  command?: string;
} = {}): Plugin {
  const TAG = '[vite-plugin-ffmpeg-binary]'
  options.output ??= "dist-native"
  const isPosixEnvironment = process.platform === "linux" || process.platform === "darwin";

  options.binName ??= isPosixEnvironment ? "ffmpeg" : "ffmpeg.exe"


  const resolver = isPosixEnvironment? path.posix : path.win32
  return {
    name: "vite-plugin-ffmpeg", 
    config(config) {
      const resolvedRoot = normalizePath(config.root ?path.resolve(config.root) : process.cwd())
      const output = resolver.resolve(resolvedRoot,options.output) // this is the dist-native dir that will be asarunpacked
      const osPath = getPlatform()
      let ffmpegPath = resolver.resolve("build", "resources", osPath) 
      if (isPosixEnvironment) {
        ffmpegPath = resolver.join(ffmpegPath, "ffmpeg")
      } else { // windows then it is a zip
        ffmpegPath = resolver.join(ffmpegPath, "ffmpeg-win-64.zip")
      }

      if (!fs.existsSync(ffmpegPath)) {
        throw new Error(`${TAG} Cannot find file "${ffmpegPath}".`)
      }
      // Make dist-native if it doesn't exist
      if (!fs.existsSync(output)) {
        fs.mkdirSync(output, { recursive: true })
      }

      if (isPosixEnvironment) {
        fs.copyFileSync(ffmpegPath, resolver.join(output, options.binName)) 
        // copy for posix
      } else { // unzip to location for windows
        decompress(ffmpegPath, output) // windows dev build works
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        .then((_) => {console.log(`${TAG} Done unzipping the Win executable`)})
        .catch((error) => {
          console.log(`${TAG} Error unzipping the windows zip: ${error}`)
        })
      }
      const ffmpegBin = path.join(output, options.binName)
      fs.writeFileSync(path.join(resolvedRoot, '.env'), `${EOL} ffmpegPath=${ffmpegBin}`, {flag: "a"})
      console.log(TAG, `binding to ${ffmpegBin}`)


    },
  }
}
