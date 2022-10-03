const os = require('os');
const path = require('path');
const { contextBridge } = require('electron');

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
