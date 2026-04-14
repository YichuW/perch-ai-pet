const { app, BrowserWindow, ipcMain } = require('electron')
const path = require('path')
const { init: initPersistence, loadProfile, saveProfile, loadSettings, saveSettings } = require('./persistence.js')
const { startMonitoring, stopMonitoring, setActiveTimeRange, setFocusMode } = require('./appMonitor.js')
const { setApiKey, generateReminder, generateReply } = require('./llmClient.js')

let mainWindow

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 320,
    height: 420,
    frame: false,
    transparent: true,
    alwaysOnTop: true,
    resizable: false,
    hasShadow: false,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      sandbox: false,
    },
  })

  const isDev = !app.isPackaged
  if (isDev) {
    mainWindow.loadURL('http://localhost:5173')
  } else {
    mainWindow.loadFile(path.join(__dirname, '..', 'dist', 'index.html'))
  }
}

function setupIPC() {
  ipcMain.on('app-ready', () => {
    const profile = loadProfile()
    const settings = loadSettings()

    mainWindow.webContents.send('profile-loaded', profile)
    mainWindow.webContents.send('settings-loaded', settings)

    setApiKey(settings.apiKey)

    if (profile?.name) {
      setActiveTimeRange(profile.activeTime)
      setFocusMode(settings.focusMode || false)
      startMonitoring(handleTrigger)
    }
  })

  ipcMain.handle('save-profile', (_event, data) => {
    saveProfile(data)
    if (data.activeTime) {
      setActiveTimeRange(data.activeTime)
    }
    startMonitoring(handleTrigger)
    return { ok: true }
  })

  ipcMain.handle('save-settings', (_event, data) => {
    saveSettings(data)
    setApiKey(data.apiKey || '')
    setFocusMode(data.focusMode || false)
    return { ok: true }
  })

  ipcMain.handle('pet-interaction', async (_event, data) => {
    if (data.type === 'userMessage' && data.message) {
      const profile = loadProfile()
      const reply = await generateReply(data.message, profile)
      mainWindow.webContents.send('pet-update', {
        visible: true,
        emotion: 'happy',
        speak: reply,
      })
    }
    return { ok: true }
  })
}

async function handleTrigger(trigger) {
  const profile = loadProfile()
  const message = await generateReminder(trigger, profile)
  mainWindow.webContents.send('pet-update', {
    visible: true,
    emotion: 'play',
    speak: message,
  })
}

// Demo: simulate a 60-min work reminder on demand
ipcMain.handle('demo-trigger', async () => {
  await handleTrigger({
    type: 'workDuration',
    consecutiveMinutes: 60,
    appName: 'Code',
  })
  return { ok: true }
})

app.whenReady().then(() => {
  initPersistence(app.getPath('userData'))
  createWindow()
  setupIPC()
})

app.on('window-all-closed', () => {
  stopMonitoring()
  app.quit()
})

app.on('before-quit', () => {
  stopMonitoring()
})
