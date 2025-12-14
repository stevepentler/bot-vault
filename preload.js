// preload.js
// Exposes safe APIs to the renderer process using contextBridge
const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  // Example: send a message to main
  send: (channel, data) => {
    ipcRenderer.send(channel, data);
  },
  // Example: receive a message from main
  receive: (channel, func) => {
    ipcRenderer.on(channel, (event, ...args) => func(...args));
  },
  copyToClipboard: (text) => ipcRenderer.send('copy-to-clipboard', text)
});
