import { create } from 'zustand';

type PetEmotion = 'happy' | 'eat' | 'play';
type Gender = 'male' | 'female' | 'other' | 'prefer_not_to_say';

interface AppState {
  petVisible: boolean;
  petState: PetEmotion;
  message: string;

  profile: {
    name: string;
    gender: Gender;
    freeTime: string;
    reminders: {
      hydration: boolean;
      stretching: boolean;
      meetings: boolean;
    };
  };

  settings: {
    reminderEnabled: boolean;
    dataCollectionEnabled: boolean;
  };

  onboardingOpen: boolean;
  settingsOpen: boolean;

  setPetUpdate: (data: {
    visible: boolean;
    emotion: PetEmotion;
    speak?: string;
  }) => void;

  setProfile: (profile: AppState['profile']) => void;
  setSettings: (settings: AppState['settings']) => void;

  openOnboarding: () => void;
  closeOnboarding: () => void;
  openSettings: () => void;
  closeSettings: () => void;
}

export const useAppStore = create<AppState>((set) => ({
  petVisible: true,
  petState: 'happy',
  message: '你好呀～',

  profile: {
    name: '',
    gender: 'prefer_not_to_say',
    freeTime: '',
    reminders: {
      hydration: true,
      stretching: true,
      meetings: true,
    },
  },

  settings: {
    reminderEnabled: true,
    dataCollectionEnabled: true,
  },

  onboardingOpen: false,
  settingsOpen: false,

  setPetUpdate: (data) =>
    set({
      petVisible: data.visible,
      petState: data.emotion,
      message: data.speak ?? '',
    }),

  setProfile: (profile) => set({ profile }),
  setSettings: (settings) => set({ settings }),

  openOnboarding: () => set({ onboardingOpen: true }),
  closeOnboarding: () => set({ onboardingOpen: false }),
  openSettings: () => set({ settingsOpen: true }),
  closeSettings: () => set({ settingsOpen: false }),
}));