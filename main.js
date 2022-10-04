const { app, BrowserWindow, Menu, ipcMain, shell } = require('electron');
const path = require('path');
const os = require('os');
const fs = require('fs');
const resizeImg = require('resize-img');
process.env.NODE_ENV = 'production';
const isMac = process.platform === 'darwin';
const isDev = process.env.NODE_ENV !== 'production';
let mainWindow;
//create main window
const createMainWindow = () => {
  mainWindow = new BrowserWindow({
    title: 'Simply Resize',
    width: isDev ? 1000 : 500,
    height: 600,
    icon: path.join(__dirname, './src/images/resize.png'),
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: true,
      preload: path.join(__dirname, 'preload.js'),
    },
  });

  if (isDev) {
    mainWindow.webContents.openDevTools();
  }

  mainWindow.loadFile(path.join(__dirname, './src/index.html'));
};

//create about window
const createAboutWindow = () => {
  const aboutWindow = new BrowserWindow({
    title: 'AboutSimply Resize',
    width: 300,
    height: 300,
  });

  aboutWindow.loadFile(path.join(__dirname, './src/about.html'));
};

app.whenReady().then(() => {
  createMainWindow();

  const mainMenu = Menu.buildFromTemplate(menu);
  Menu.setApplicationMenu(mainMenu);

  mainMenu.on('closed', () => (mainWindow = null));

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createMainWindow();
    }
  });
});

const menu = [
  // { role: 'appMenu' }
  ...(isMac
    ? [
        {
          label: app.name,
          submenu: [
            { role: 'about' },
            { type: 'separator' },
            { role: 'services' },
            { type: 'separator' },
            { role: 'hide' },
            { role: 'hideOthers' },
            { role: 'unhide' },
            { type: 'separator' },
            { role: 'quit' },
          ],
        },
      ]
    : []),
  // { role: 'fileMenu' }
  {
    label: 'File',
    submenu: [isMac ? { role: 'close' } : { role: 'quit' }],
  },
  // { role: 'editMenu' }
  {
    label: 'Edit',
    submenu: [
      { role: 'undo' },
      { role: 'redo' },
      { type: 'separator' },
      { role: 'cut' },
      { role: 'copy' },
      { role: 'paste' },
      ...(isMac
        ? [
            { role: 'pasteAndMatchStyle' },
            { role: 'delete' },
            { role: 'selectAll' },
            { type: 'separator' },
            {
              label: 'Speech',
              submenu: [{ role: 'startSpeaking' }, { role: 'stopSpeaking' }],
            },
          ]
        : [{ role: 'delete' }, { type: 'separator' }, { role: 'selectAll' }]),
    ],
  },
  // { role: 'viewMenu' }
  {
    label: 'View',
    submenu: [
      { role: 'reload' },
      { role: 'forceReload' },

      { type: 'separator' },
      { role: 'resetZoom' },
      { role: 'zoomIn' },
      { role: 'zoomOut' },
      { type: 'separator' },
      { role: 'togglefullscreen' },
    ],
  },
  // { role: 'windowMenu' }
  {
    label: 'Window',
    submenu: [
      { role: 'minimize' },
      { role: 'zoom' },
      ...(isMac
        ? [{ type: 'separator' }, { role: 'front' }, { type: 'separator' }, { role: 'window' }]
        : [{ role: 'close' }]),
    ],
  },
  {
    role: 'help',
    submenu: [
      {
        label: 'About',
        click: async () => {
          const { shell } = require('electron');
          await shell.openExternal('https://www.thembdev.com/projects');
        },
      },
    ],
  },
];

//respond to ipc

ipcMain.on('image:resize', (e, options) => {
  options.dest = path.join(os.homedir(), 'output');
  resizeImage(options);
});

const resizeImage = async ({ imgPath, width, height, dest }) => {
  try {
    const image = await resizeImg(fs.readFileSync(imgPath), {
      width: +width,
      height: +height,
    });
    const filename = path.basename(imgPath);
    const filetype = path.extname(imgPath);

    if (!fs.existsSync(dest)) {
      fs.mkdirSync(dest);
    }
    fs.writeFileSync(path.join(dest, `${filename}-${width}x${height}.${filetype}`), image);

    mainWindow.webContents.send('image:done');

    shell.openPath(dest);
  } catch (error) {
    console.log(error);
  }
};

app.on('window-all-closed', () => {
  if (!isMac) {
    app.quit();
  }
});

//npx electronmon .
//npm install --save-dev @electron-forge/cli
//npx electron-forge import
//npm run make
