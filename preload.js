const os = require('os');
const path = require('path');
const { contextBridge, ipcRenderer } = require('electron');

const toastify = require('toastify-js');

contextBridge.exposeInMainWorld('os', {
  homedir: () => os.homedir(),
});
contextBridge.exposeInMainWorld('path', {
  join: (...args) => path.join(...args),
});

contextBridge.exposeInMainWorld('toastify', {
  show: (options) => toastify(options).showToast(),
});

contextBridge.exposeInMainWorld('ipcRenderer', {
  send: (channel, data) => ipcRenderer.send(channel, data),
  on: (channel, fn) => ipcRenderer.on(channel, (e, ...args) => fn(...args)),
});
