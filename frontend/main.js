const { app, BrowserWindow } = require('electron');
const next = require('next'); // Import the 'next' module

const dev = process.env.NODE_ENV !== 'production';
const nextApp = next({ dev });
const handle = nextApp.getRequestHandler();

function createWindow() {
  const win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: { nodeIntegration: true, enableRemoteModule: true },
  });
  win.loadURL(`http://localhost:3000`);
  win.webContents.openDevTools();
}

app.whenReady().then(() => {
  nextApp.prepare().then(() => {
    createWindow();
    app.on('activate', function () {
      if (BrowserWindow.getAllWindows().length === 0) createWindow();
    });
  });
});

app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit();
});
