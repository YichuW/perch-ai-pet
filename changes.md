# Backend MVP Changes — `feature/backend-mvp`

## Overview

This branch adds the full backend for the AI pet companion: IPC bridge, data persistence, frontmost app monitoring, Claude API integration, and minimal frontend changes to support chat, focus mode, dismiss, and settings.

---

## Backend (Electron main process)

### New files

#### `electron/persistence.js`
- Reads/writes `profile.json` and `settings.json` to `app.getPath('userData')` (i.e. `~/Library/Application Support/perch-ai-pet/`)
- Must call `init(path)` before use — called from `main.js` on app ready
- **Profile shape**: `{ name: string, activeTime: string }`
- **Settings shape**: `{ apiKey: string, focusMode: boolean }`

#### `electron/appMonitor.js`
- Polls the frontmost macOS app every 5 minutes using `osascript`
- Tracks consecutive work minutes across polls
- **Triggers**:
  - `workDuration` — fires when user has been in a work app for ≥60 continuous minutes
  - `afterHours` — fires when a work app is frontmost outside the user's declared active hours
- **Cooldown**: 30 minutes after any trigger fires
- **Focus mode**: when enabled, all triggers are suppressed (no popups)
- Work apps list: Code, Xcode, Word, Excel, PowerPoint, Terminal, iTerm2, IntelliJ, WebStorm, PyCharm, Android Studio, Sublime Text, Cursor, Figma, Notion
- Exported functions: `startMonitoring(onTrigger)`, `stopMonitoring()`, `setActiveTimeRange(str)`, `setFocusMode(bool)`, `resetWorkCounter()`

#### `electron/llmClient.js`
- Wraps `@anthropic-ai/sdk` (Claude API)
- Model: `claude-haiku-4-5-20251001`, max 80 tokens
- System prompt establishes Perch as a caring, warm, non-preachy cat companion
- `setApiKey(key)` — user-provided key takes priority, falls back to `process.env.ANTHROPIC_API_KEY`
- `generateReminder(trigger, profile)` — creates contextual break/after-hours reminder
- `generateReply(userMessage, profile)` — single-turn reply when user types to the cat
- Falls back to hardcoded messages if no API key is set or the API call fails

### Modified files

#### `electron/main.js` (rewritten)
- Now uses CJS `require()` (see Electron compatibility note below)
- IPC handlers:
  - `app-ready` (from renderer on mount) → loads profile + settings from disk, pushes to renderer via `profile-loaded` and `settings-loaded`, starts app monitor if profile exists
  - `save-profile` → persists to disk, updates monitor's active time range
  - `save-settings` → persists to disk, updates LLM API key + focus mode
  - `pet-interaction` → if `type === 'userMessage'`, calls `generateReply()`, pushes result to renderer via `pet-update`
- Trigger handler: when app monitor fires, calls `generateReminder()` and pushes `pet-update` to renderer with emotion `'play'`
- Added `window-all-closed` and `before-quit` handlers to stop monitoring

#### `electron/preload.js` (rewritten)
- Converted to CJS (`require('electron')`)
- Exposes 7 IPC channels via `contextBridge.exposeInMainWorld('electronAPI', {...})`:

| Channel | Direction | Method | Purpose |
|---------|-----------|--------|---------|
| `sendAppReady` | renderer → main | `send` | Signal renderer is ready |
| `saveProfile` | renderer → main | `invoke` | Save profile to disk |
| `saveSettings` | renderer → main | `invoke` | Save settings to disk |
| `sendPetInteraction` | renderer → main | `invoke` | Send user message to LLM |
| `onProfileLoaded` | main → renderer | `on` | Push saved profile on startup |
| `onSettingsLoaded` | main → renderer | `on` | Push saved settings on startup |
| `onPetUpdate` | main → renderer | `on` | Push pet state (emotion + message) |

---

## Frontend changes

### Modified: `src/renderer/store/useAppStore.ts`

**New state:**
```ts
settings: {
  apiKey: string;   // Anthropic API key
  focusMode: boolean; // suppress proactive reminders
}
```

**New actions:**
- `setSettings(settings)` — bulk-set settings (used when loaded from disk)
- `setApiKey(apiKey)` — updates store + calls `electronAPI.saveSettings()`
- `toggleFocusMode()` — flips focusMode + calls `electronAPI.saveSettings()`

**Extended type:**
- `Screen` now includes `'settings'`

### Modified: `src/renderer/App.tsx`

Added `useEffect` on mount that:
1. Calls `electronAPI.sendAppReady()` to trigger backend data loading
2. Registers `onProfileLoaded` → if profile has a name, populates store and jumps to `'petHome'` (skips onboarding for returning users)
3. Registers `onSettingsLoaded` → populates settings in store
4. Registers `onPetUpdate` → updates `pet.message` and `pet.emotion` from backend pushes

Added routing for `'settings'` screen.

### Modified: `src/renderer/components/PetScreen.tsx`

**New UI elements:**
- **Chat input** (`.chat-input-area`): text input + Send button below the chat bubble. On submit, calls `electronAPI.sendPetInteraction({ type: 'userMessage', message })`. Shows `'...'` as loading state while waiting for LLM response. Response arrives asynchronously via `onPetUpdate`.
- **Focus toggle**: button in action bar showing "Focus: ON" / "Focus: OFF", calls `toggleFocusMode()`
- **Settings button**: navigates to settings screen via `setScreen('settings')`
- **Dismiss**: passes `onDismiss` prop to ChatBubble to clear the message

**Button layout change:** "Stretch Reminder" label shortened to "Stretch" to fit the extra buttons.

### Modified: `src/renderer/components/ChatBubble.tsx`

- Added optional `onDismiss?: () => void` prop
- When provided, renders a `×` dismiss button (`.chat-dismiss`) in the top-right corner of the bubble

### New: `src/renderer/components/SettingsScreen.tsx`

- Simple form screen for entering the Anthropic API key
- Password-masked input field
- Save button calls `setApiKey()` (which persists via IPC)
- Back button returns to `'petHome'`
- Follows existing `form-screen` / `form-card` CSS patterns

### Modified: `src/renderer/components/ActiveTimeScreen.tsx`

Simplified the `saveProfile` call — removed `gender` and `reminders` fields to match the backend's `ProfileData` shape:
```ts
// Before:
{ name, gender: 'prefer_not_to_say', freeTime: selected, reminders: { ... } }

// After:
{ name, activeTime: selected }
```

### Modified: `src/renderer/types/ipc.ts`

Added interfaces:
```ts
interface ProfileData { name: string; activeTime: string }
interface SettingsData { apiKey: string; focusMode: boolean }
interface PetInteractionPayload { type: 'userMessage'; message: string }
```

### Modified: `src/renderer/styles/main.css`

New CSS classes added:
- `.chat-input-area` — flex row for input + send button
- `.chat-text-input` — styled text input matching existing form inputs
- `.send-button` — pink rounded send button (with disabled state)
- `.chat-dismiss` — absolute-positioned × button on chat bubble
- `.secondary-button.active` — pink background for focus mode ON state

---

## Configuration changes

### `package.json`
- Removed `"type": "module"` — Electron's main process requires CJS. Vite/ESLint configs renamed to `.mjs` to keep ESM.
- `"main"` still points to `electron/main.js`
- Added dependency: `@anthropic-ai/sdk`
- Dev script updated: `ELECTRON_RUN_AS_NODE=` prefix to unset the env variable that VS Code's terminal sets (which breaks Electron)
- Electron downgraded from 41 to 33 (41 had module resolution issues)

### `.gitignore`
- Added `.env`

### Config file renames
- `vite.config.js` → `vite.config.mjs` (contents unchanged)
- `eslint.config.js` → `eslint.config.mjs` (contents unchanged)

---

## How to run

```bash
# Set API key as env variable
export ANTHROPIC_API_KEY=your-key-here

# Or run inline
ANTHROPIC_API_KEY=your-key npm run dev
```

The API key can also be entered in the Settings screen within the app (persisted locally, never committed).

---

## Data flow diagram

```
User types message
  → PetScreen calls sendPetInteraction({ type: 'userMessage', message })
    → preload.js: ipcRenderer.invoke('pet-interaction', data)
      → main.js: ipcMain.handle('pet-interaction')
        → llmClient.generateReply(message, profile)
          → Claude Haiku API call
        → mainWindow.send('pet-update', { emotion, speak })
      → preload.js: ipcRenderer.on('pet-update')
    → App.tsx: onPetUpdate callback
  → Zustand store: setPetMessage + setPetEmotion
→ ChatBubble re-renders with AI response

Proactive reminder (background):
  appMonitor setInterval (5 min)
    → osascript: get frontmost app
    → check work duration / after-hours rules
    → if triggered: llmClient.generateReminder()
      → mainWindow.send('pet-update', { emotion: 'play', speak })
    → same renderer flow as above
```
