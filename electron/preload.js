const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('electronAPI', {
  sendAppReady: () => ipcRenderer.send('app-ready'),
  saveProfile: (data) => ipcRenderer.invoke('save-profile', data),
  saveSettings: (data) => ipcRenderer.invoke('save-settings', data),
  sendPetInteraction: (data) => ipcRenderer.invoke('pet-interaction', data),

  onProfileLoaded: (cb) => ipcRenderer.on('profile-loaded', (_e, data) => cb(data)),
  onSettingsLoaded: (cb) => ipcRenderer.on('settings-loaded', (_e, data) => cb(data)),
  onPetUpdate: (cb) => ipcRenderer.on('pet-update', (_e, data) => cb(data)),

  // Demo: fire a simulated 60-min work reminder
  demoTrigger: () => ipcRenderer.invoke('demo-trigger'),
})
