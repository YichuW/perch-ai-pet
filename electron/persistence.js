const fs = require('node:fs')
const path = require('node:path')

let userDataPath = ''

function init(appUserDataPath) {
  userDataPath = appUserDataPath
}

function getFilePath(filename) {
  return path.join(userDataPath, filename)
}

function loadProfile() {
  try {
    const data = fs.readFileSync(getFilePath('profile.json'), 'utf-8')
    return JSON.parse(data)
  } catch {
    return null
  }
}

function saveProfile(data) {
  fs.writeFileSync(getFilePath('profile.json'), JSON.stringify(data, null, 2))
}

function loadSettings() {
  try {
    const data = fs.readFileSync(getFilePath('settings.json'), 'utf-8')
    return JSON.parse(data)
  } catch {
    return { apiKey: '', focusMode: false }
  }
}

function saveSettings(data) {
  fs.writeFileSync(getFilePath('settings.json'), JSON.stringify(data, null, 2))
}

module.exports = { init, loadProfile, saveProfile, loadSettings, saveSettings }
