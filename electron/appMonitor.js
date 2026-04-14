const { execFile } = require('node:child_process')

const WORK_APPS = new Set([
  'Code',
  'Xcode',
  'Microsoft Word',
  'Microsoft Excel',
  'Microsoft PowerPoint',
  'Terminal',
  'iTerm2',
  'IntelliJ IDEA',
  'WebStorm',
  'PyCharm',
  'Android Studio',
  'Sublime Text',
  'Cursor',
  'Figma',
  'Notion',
])

const POLL_INTERVAL = 5 * 60 * 1000  // 5 minutes
const WORK_THRESHOLD = 60            // minutes
const COOLDOWN = 30 * 60 * 1000      // 30 minutes

let consecutiveWorkMinutes = 0
let lastReminderTime = 0
let pollingTimer = null
let focusMode = false
let activeHoursStart = 9
let activeHoursEnd = 18

function getFrontmostApp() {
  return new Promise((resolve, reject) => {
    execFile('osascript', [
      '-e',
      'tell application "System Events" to get name of first application process whose frontmost is true',
    ], (err, stdout) => {
      if (err) return reject(err)
      resolve(stdout.trim())
    })
  })
}

function isOutsideActiveHours() {
  const hour = new Date().getHours()
  return hour < activeHoursStart || hour >= activeHoursEnd
}

function setActiveTimeRange(activeTimeStr) {
  if (!activeTimeStr) return
  if (activeTimeStr.startsWith('Morning')) {
    activeHoursStart = 6
    activeHoursEnd = 12
  } else if (activeTimeStr.startsWith('Afternoon')) {
    activeHoursStart = 12
    activeHoursEnd = 18
  } else if (activeTimeStr.startsWith('Evening')) {
    activeHoursStart = 18
    activeHoursEnd = 24
  } else {
    activeHoursStart = 9
    activeHoursEnd = 23
  }
}

function setFocusMode(enabled) {
  focusMode = enabled
}

function startMonitoring(onTrigger) {
  stopMonitoring()

  pollingTimer = setInterval(async () => {
    try {
      const appName = await getFrontmostApp()
      const isWorkApp = WORK_APPS.has(appName)

      if (isWorkApp) {
        consecutiveWorkMinutes += 5
      } else {
        consecutiveWorkMinutes = 0
      }

      if (focusMode) return

      const now = Date.now()
      const cooledDown = now - lastReminderTime >= COOLDOWN

      if (!cooledDown) return

      if (isWorkApp && consecutiveWorkMinutes >= WORK_THRESHOLD) {
        lastReminderTime = now
        const minutes = consecutiveWorkMinutes
        consecutiveWorkMinutes = 0
        onTrigger({
          type: 'workDuration',
          consecutiveMinutes: minutes,
          appName,
        })
        return
      }

      if (isWorkApp && isOutsideActiveHours()) {
        lastReminderTime = now
        onTrigger({
          type: 'afterHours',
          consecutiveMinutes: consecutiveWorkMinutes,
          appName,
        })
      }
    } catch {
      // osascript may fail — silently skip
    }
  }, POLL_INTERVAL)
}

function stopMonitoring() {
  if (pollingTimer) {
    clearInterval(pollingTimer)
    pollingTimer = null
  }
}

function resetWorkCounter() {
  consecutiveWorkMinutes = 0
}

module.exports = { setActiveTimeRange, setFocusMode, startMonitoring, stopMonitoring, resetWorkCounter }
