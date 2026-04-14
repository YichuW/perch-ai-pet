export type PetEmotion = 'happy' | 'eat' | 'play';

export interface PetUpdatePayload {
  visible: boolean;
  emotion: PetEmotion;
  speak?: string;
}

export interface ProfileData {
  name: string;
  activeTime: string;
}

export interface SettingsData {
  apiKey: string;
  focusMode: boolean;
}

export interface PetInteractionPayload {
  type: 'userMessage';
  message: string;
}
