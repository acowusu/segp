const { app, BrowserWindow } = require("electron");
const next = require("next");

const dev = process.env.NODE_ENV !== "production";
const nextApp = next({ dev });
const handle = nextApp.getRequestHandler();
let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1920,
    height: 1080,
    webPreferences: { nodeIntegration: true, enableRemoteModule: true },
  });

  const startURL = dev
    ? "http://localhost:3000"
    : `file://${__dirname}/build/index.html`;

  mainWindow.loadURL(startURL);
  mainWindow.webContents.openDevTools();

  mainWindow.on("closed", function () {
    mainWindow = null;
  });
}

app.on("ready", () => {
  nextApp.prepare().then(() => {
    createWindow();
  });
});

app.on("activate", function () {
  if (mainWindow === null) {
    createWindow();
  }
});

app.on("window-all-closed", function () {
  if (process.platform !== "darwin") app.quit();
});
