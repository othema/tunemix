import { app, BrowserWindow, dialog, ipcMain } from 'electron'
import path from 'node:path'
import { search } from '../src/lib/youtube';

process.env["FLUENTFFMPEG_COV"] = "";  // Bro sometimes this works sometimes it doesn't, but when I remove it it used to break but now it doesn't I HAVENT CHANGED ANYTHING

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
process.env.PUBLIC = app.isPackaged ? process.env.DIST : path.join(process.env.DIST, '../public')

let win: BrowserWindow | null
// 🚧 Use ['ENV_NAME'] avoid vite:define plugin - Vite@2.x
const VITE_DEV_SERVER_URL = process.env['VITE_DEV_SERVER_URL']

function createWindow() {
  win = new BrowserWindow({
    icon: path.join(process.env.PUBLIC, 'electron-vite.svg'),
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: true,
      contextIsolation: false,
    },
    width: 800,
    height: 600,
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

app.on('window-all-closed', () => {
  win = null
})

ipcMain.handle("dialog", async (event, method: string, params: any) => {
  const result = await dialog[method](params);
  event.sender.send("dialog-return", result);
});

ipcMain.handle("search", async (event, query: string) => {
  console.log("HI")
  const result = await search(query);
  return result;
})

app.whenReady().then(createWindow)
