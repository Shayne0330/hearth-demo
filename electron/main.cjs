const { app, BrowserWindow, ipcMain, screen } = require('electron');
const path = require('node:path');

const isDev = !app.isPackaged;
let mainWindow;

function getCollapsedBounds() {
  const display = screen.getPrimaryDisplay();
  const { workArea } = display;
  const width = 420;
  const height = 300;
  return {
    width,
    height,
    x: Math.round(workArea.x + workArea.width / 2 - width / 2),
    y: Math.round(workArea.y + 34),
  };
}

function getExpandedBounds() {
  const display = screen.getPrimaryDisplay();
  const { workArea } = display;
  const width = Math.min(980, Math.round(workArea.width * 0.72));
  const height = Math.min(680, Math.round(workArea.height * 0.78));
  return {
    x: Math.round(workArea.x + workArea.width / 2 - width / 2),
    y: Math.round(workArea.y + workArea.height / 2 - height / 2),
    width,
    height,
  };
}

function setWindowMode(expanded) {
  if (!mainWindow) return;
  const bounds = expanded ? getExpandedBounds() : getCollapsedBounds();
  mainWindow.setIgnoreMouseEvents(false);
  mainWindow.setAlwaysOnTop(true, 'floating');
  mainWindow.setVisibleOnAllWorkspaces(true, { visibleOnFullScreen: true });
  mainWindow.setResizable(Boolean(expanded));
  mainWindow.setMovable(true);
  mainWindow.setBounds(bounds, true);
}

async function createWindow() {
  mainWindow = new BrowserWindow({
    ...getCollapsedBounds(),
    frame: false,
    transparent: true,
    backgroundColor: '#00000000',
    hasShadow: false,
    resizable: false,
    movable: true,
    alwaysOnTop: true,
    skipTaskbar: true,
    title: 'Hearth',
    trafficLightPosition: { x: 12, y: 12 },
    webPreferences: {
      preload: path.join(__dirname, 'preload.cjs'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false,
    },
  });

  mainWindow.setAlwaysOnTop(true, 'floating');
  mainWindow.setVisibleOnAllWorkspaces(true, { visibleOnFullScreen: true });

  if (isDev) {
    await mainWindow.loadURL('http://127.0.0.1:5173');
  } else {
    await mainWindow.loadFile(path.join(__dirname, '..', 'dist', 'index.html'));
  }
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
});

ipcMain.handle('hearth:set-expanded', (_event, expanded) => {
  setWindowMode(Boolean(expanded));
});

ipcMain.handle('hearth:move-by', (_event, dx, dy) => {
  if (!mainWindow) return;
  const bounds = mainWindow.getBounds();
  mainWindow.setPosition(
    Math.round(bounds.x + Number(dx)),
    Math.round(bounds.y + Number(dy)),
    false,
  );
});

ipcMain.handle('hearth:close', () => {
  mainWindow?.close();
});
