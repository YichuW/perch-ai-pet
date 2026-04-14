import { create } from 'zustand';

export type Screen = 'welcome' | 'username' | 'activeTime' | 'petHome' | 'settings';
export type PetEmotion = 'happy' | 'eat' | 'play';
export type ChatState = 'idle' | 'catInitiated' | 'userReplied' | 'catResponded';

interface AppState {
  currentScreen: Screen;

  profile: {
    name: string;
    activeTime: string;
  };

  pet: {
    visible: boolean;
    emotion: PetEmotion;
    message: string;
  };

  settings: {
    apiKey: string;
    focusMode: boolean;
  };

  chatState: ChatState;

  setScreen: (screen: Screen) => void;
  setName: (name: string) => void;
  setActiveTime: (activeTime: string) => void;
  setPetMessage: (message: string) => void;
  setPetEmotion: (emotion: PetEmotion) => void;
  finishOnboarding: () => void;
  setChatState: (chatState: ChatState) => void;
  dismissChat: () => void;
  setSettings: (settings: { apiKey: string; focusMode: boolean }) => void;
  setApiKey: (apiKey: string) => void;
  toggleFocusMode: () => void;
}

export const useAppStore = create<AppState>((set, get) => ({
  currentScreen: 'welcome',

  profile: {
    name: '',
    activeTime: '',
  },

  pet: {
    visible: true,
    emotion: 'happy',
    message: 'Hi! I am Perch~',
  },

  settings: {
    apiKey: '',
    focusMode: false,
  },

  chatState: 'idle',

  setScreen: (screen) => set({ currentScreen: screen }),

  setName: (name) =>
    set((state) => ({
      profile: {
        ...state.profile,
        name,
      },
    })),

  setActiveTime: (activeTime) =>
    set((state) => ({
      profile: {
        ...state.profile,
        activeTime,
      },
    })),

  setPetMessage: (message) =>
    set((state) => ({
      pet: {
        ...state.pet,
        message,
      },
    })),

  setPetEmotion: (emotion) =>
    set((state) => ({
      pet: {
        ...state.pet,
        emotion,
      },
    })),

  finishOnboarding: () =>
    set((state) => ({
      currentScreen: 'petHome',
      pet: {
        ...state.pet,
        message: state.profile.name
          ? `Hi ${state.profile.name}! I'm ready to keep you company.`
          : 'Hi! I am ready to keep you company.',
      },
    })),

  setChatState: (chatState) => set({ chatState }),

  dismissChat: () =>
    set((state) => ({
      chatState: 'idle' as const,
      pet: { ...state.pet, message: '' },
    })),

  setSettings: (settings) => set({ settings }),

  setApiKey: (apiKey) => {
    const settings = { ...get().settings, apiKey };
    set({ settings });
    window.electronAPI?.saveSettings(settings);
  },

  toggleFocusMode: () => {
    const settings = { ...get().settings, focusMode: !get().settings.focusMode };
    set({ settings });
    window.electronAPI?.saveSettings(settings);
  },
}));
