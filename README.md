# Perch AI Pet

A desktop AI cat companion that monitors your work patterns and provides emotional support. Perch lives on your screen as a small transparent widget, notices when you've been working too long or outside your usual hours, and reaches out with caring, AI-generated messages.

## Features

- **Proactive reminders** — detects the frontmost macOS app every 5 minutes. After 60 continuous minutes of work, Perch pops up with a gentle reminder to take a break.
- **After-hours detection** — if you're using work apps outside your chosen active hours, Perch notices and suggests wrapping up.
- **Single-turn chat** — when Perch reaches out, you can reply once. The cat responds, then the conversation ends. Designed to support without distracting.
- **Hover UI** — the chat bubble and action buttons are hidden by default. Hover over the cat to reveal them.
- **Drag to move** — grab the cat to reposition it anywhere on screen.
- **Focus mode** — toggle to suppress all proactive reminders.
- **Powered by Claude** — uses Claude Haiku for generating contextual, caring messages via a metaprompted system prompt.

## Prerequisites

- **macOS** (uses `osascript` for frontmost app detection)
- **Node.js** >= 18
- **An Anthropic API key** — get one at [console.anthropic.com](https://console.anthropic.com)

## Setup

1. **Clone the repository**

   ```bash
   git clone https://github.com/YichuW/perch-ai-pet.git
   cd perch-ai-pet
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Set your API key**

   Option A — environment variable (recommended):
   ```bash
   export ANTHROPIC_API_KEY=your-key-here
   ```

   Option B — create a `.env` file in the project root:
   ```
   ANTHROPIC_API_KEY=your-key-here
   ```

   Option C — enter it in the app's Settings screen after launch.

4. **Start the app**

   ```bash
   npm run dev
   ```

   This starts the Vite dev server and launches the Electron window. On first run you'll go through a short onboarding (name + preferred active hours), then the cat appears.

   > **Note:** If launching from a VS Code terminal, the dev script automatically handles the `ELECTRON_RUN_AS_NODE` environment variable that VS Code sets. No manual workaround needed.

## Usage

| Action | How |
|--------|-----|
| Reveal buttons | Hover over the cat |
| Say Hi / Feed / Stretch | Click the buttons (hover to reveal) |
| Reply to Perch | When Perch reaches out, a text input appears — type your reply and press Enter |
| Dismiss a message | Click the x on the chat bubble |
| Toggle focus mode | Hover → click "Focus: ON/OFF" |
| Change API key | Hover → click "Settings" |
| Move the cat | Drag the cat image |
| Demo a reminder | Hover → click "Demo" (simulates a 60-min work trigger) |

## Project Structure

```
perch-ai-pet/
├── electron/
│   ├── main.js          — Electron main process, IPC handlers, orchestration
│   ├── preload.js       — Context bridge (7 IPC channels)
│   ├── persistence.js   — JSON file storage (profile + settings)
│   ├── appMonitor.js    — Frontmost app polling, work-time tracking, triggers
│   └── llmClient.js     — Claude API client, metaprompt, message generation
├── src/
│   ├── renderer/
│   │   ├── App.tsx             — Root component, IPC listener wiring
│   │   ├── components/
│   │   │   ├── WelcomeScreen.tsx
│   │   │   ├── UsernameScreen.tsx
│   │   │   ├── ActiveTimeScreen.tsx
│   │   │   ├── PetScreen.tsx      — Main pet UI (hover, chat, actions)
│   │   │   ├── ChatBubble.tsx
│   │   │   └── SettingsScreen.tsx
│   │   ├── store/
│   │   │   └── useAppStore.ts     — Zustand state (profile, pet, settings, chatState)
│   │   ├── services/
│   │   │   └── electronAPI.ts     — IPC type declarations
│   │   ├── types/
│   │   │   └── ipc.ts
│   │   └── styles/
│   │       └── main.css
│   └── assets/pet/               — Cat sprite images
├── package.json
├── vite.config.mjs
└── eslint.config.mjs
```

## Tech Stack

- **Electron 33** — desktop shell (frameless, transparent, always-on-top)
- **React 19** + **Vite 8** — frontend
- **Zustand** — state management
- **Anthropic SDK** — Claude Haiku API for AI-generated messages
- **osascript** — macOS frontmost app detection (no accessibility permissions needed)

## Data Storage

User data is stored locally in `~/Library/Application Support/perch-ai-pet/`:
- `profile.json` — name, active time preference
- `settings.json` — API key, focus mode toggle

No data is sent anywhere except the Anthropic API for message generation.
