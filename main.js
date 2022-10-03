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
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: true,
      preload: path.join(__dirname, 'preload.js'),
    },
  });

  if (isDev) {
    mainWindow.webContents.openDevTools();
  }

  mainWindow.loadFile(path.join(__dirname, './renderer/index.html'));
};

//create about window
const createAboutWindow = () => {
  const aboutWindow = new BrowserWindow({
    title: 'AboutSimply Resize',
    width: 300,
    height: 300,
  });

  aboutWindow.loadFile(path.join(__dirname, './renderer/about.html'));
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
  ...(isMac
    ? [
        {
          label: app.name,
          submenu: [
            {
              label: 'About',
              click: createAboutWindow,
            },
          ],
        },
      ]
    : []),
  {
    role: 'fileMenu',
  },
  {
    label: 'File',
    submenu: [
      {
        label: 'Quit',
        click: () => app.quit(),
        accelerator: 'CmdOrCtrl+W',
      },
    ],
  },
  ...(!isMac
    ? [
        {
          label: 'Help',
          submenu: [
            {
              label: 'About',
              click: createAboutWindow,
            },
          ],
        },
      ]
    : []),
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
