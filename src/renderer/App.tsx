import { useEffect } from 'react';
import { useAppStore } from './store/useAppStore';
import WelcomeScreen from './components/WelcomeScreen';
import UsernameScreen from './components/UsernameScreen';
import ActiveTimeScreen from './components/ActiveTimeScreen';
import PetScreen from './components/PetScreen';
import SettingsScreen from './components/SettingsScreen';

export default function App() {
  const currentScreen = useAppStore((s) => s.currentScreen);
  const setName = useAppStore((s) => s.setName);
  const setActiveTime = useAppStore((s) => s.setActiveTime);
  const setScreen = useAppStore((s) => s.setScreen);
  const setSettings = useAppStore((s) => s.setSettings);
  const setPetMessage = useAppStore((s) => s.setPetMessage);
  const setPetEmotion = useAppStore((s) => s.setPetEmotion);
  const setChatState = useAppStore((s) => s.setChatState);

  useEffect(() => {
    const api = window.electronAPI;
    if (!api) return;

    api.onProfileLoaded((profile) => {
      if (profile?.name) {
        setName(profile.name);
        setActiveTime(profile.activeTime || '');
        setScreen('petHome');
      }
    });

    api.onSettingsLoaded((settings) => {
      if (settings) {
        setSettings(settings);
      }
    });

    api.onPetUpdate((data) => {
      if (data.speak) setPetMessage(data.speak);
      if (data.emotion) setPetEmotion(data.emotion);

      const currentChatState = useAppStore.getState().chatState;
      if (currentChatState === 'userReplied') {
        setChatState('catResponded');
      } else if (currentChatState === 'idle') {
        setChatState('catInitiated');
      }
    });

    api.sendAppReady();
  }, []);

  if (currentScreen === 'welcome') {
    return <WelcomeScreen />;
  }

  if (currentScreen === 'username') {
    return <UsernameScreen />;
  }

  if (currentScreen === 'activeTime') {
    return <ActiveTimeScreen />;
  }

  if (currentScreen === 'settings') {
    return <SettingsScreen />;
  }

  return <PetScreen />;
}
