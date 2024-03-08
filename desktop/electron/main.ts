import { app, BrowserWindow, ipcMain, dialog , screen, protocol, net } from 'electron'
import path from 'node:path'
// import { getDatabase } from './database'
import api, { IAPI } from './routes'

import { extractTextFromPDF} from './reportProcessing'
// The built directory structure
//
// ├─┬─┬ dist
// │ │ └── index.html
// │ │
// │ ├─┬ dist-electron
// │ │ ├── main.js
// │ │ └── preload.js
// │
process.env.DIST = path.join(__dirname, '../dist')
process.env.VITE_PUBLIC = app?.isPackaged ? process.env.DIST : path.join(process.env.DIST, '../public')


let win: BrowserWindow | null
// 🚧 Use ['ENV_NAME'] avoid vite:define plugin - Vite@2.x
const VITE_DEV_SERVER_URL = process.env['VITE_DEV_SERVER_URL']

async function handleFileOpen () {
  const { canceled, filePaths } = await dialog.showOpenDialog(win as BrowserWindow)
  let path = ""
  if (!canceled) {
    path = filePaths[0]
  }
  path = await extractTextFromPDF(path)
  console.log("GOT PATH", path)
  return path
}



function createWindow() {
  // console.log("CREATING WINDOW")
  // console.log(JSON.stringify(screen.getAllDisplays(), null, 2))
  const monitor = ( screen.getAllDisplays().find(monitor => monitor.label === "HP 27f")) || screen.getPrimaryDisplay()
  const { x, y } = monitor.bounds
  win = new BrowserWindow({
    icon: path.join(process.env.VITE_PUBLIC, 'electron-vite.svg'),
    x: x + 50, // Arbitrary offsets to ensure it's on the right display/monitor
    y: y + 50,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      webSecurity: false
    },
  })

  // Test active push message to Renderer-process.
  win.webContents.on('did-finish-load', () => {
    win?.webContents.send('main-process-message', (new Date).toLocaleString())
  })

  if (VITE_DEV_SERVER_URL) {
    win.loadURL(VITE_DEV_SERVER_URL)
  } else {
    // win.loadFile('dist/index.html')
    win.loadFile(path.join(process.env.DIST, 'index.html'))
  }
}

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app && app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
    win = null
  }
})

app && app.on('activate', () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow()
  }
})

protocol.registerSchemesAsPrivileged([
  {
    scheme: 'local',
    privileges: {
        bypassCSP: true,
        stream: true,
    }
  }
])

app && app.whenReady().then(() => {
  protocol.handle('local', (request) =>{
    console.log( request.url.slice('local:///'.length))
    return net.fetch("file:///" + request.url.slice('local:///'.length))
  })
  ipcMain.handle('dialog:openFile', handleFileOpen)
  ipcMain.handle('api:generic', (_, { property, args }) => {
    console.log(property);
    const methodName = property as keyof IAPI
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const method = api[methodName] as (...items: any[]) => void;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const methodArgs = args as any[]//(Parameters < IAPI[typeof methodName] > )
    if (typeof method === 'function') {
      return method(...(methodArgs)) as unknown as Promise<ReturnType<IAPI[typeof methodName]>>
    }
    else {
      return {
          error: `api.${property} is not a function`,
          hint: `have you defined ${property} in ./electron/routes.ts?`
       }
    }
  })



  createWindow()

})
export { win }
