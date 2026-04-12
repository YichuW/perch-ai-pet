import { useEffect } from 'react';
import { useAppStore } from './store/useAppStore';
import { electronAPI } from './services/electronAPI';
import Pet from './components/Pet';
import ChatBubble from './components/ChatBubble';
import OnboardingModal from './components/OnboardingModal';
import SettingsPanel from './components/SettingsPanel';

export default function App() {
  const {
    petVisible,
    petState,
    message,
    onboardingOpen,
    settingsOpen,
    setPetUpdate,
    setProfile,
    setSettings,
    openOnboarding,
  } = useAppStore();

  useEffect(() => {
    // 如果没有后端（开发阶段），直接 mock
    if (!electronAPI) {
      console.log('⚠️ no electronAPI, using mock');

      setInterval(() => {
        setPetUpdate({
          visible: true,
          emotion: Math.random() > 0.5 ? 'play' : 'happy',
          speak: '来玩吧！',
        });
      }, 5000);

      return;
    }

    electronAPI.onProfileLoaded((profile) => {
      setProfile(profile);
      if (!profile.name) openOnboarding();
    });

    electronAPI.onSettingsLoaded(setSettings);
    electronAPI.onPetUpdate(setPetUpdate);

    electronAPI.sendAppReady();
  }, []);

  return (
    
    <div className="app">
      <h1>HELLO PERCH</h1>
      <Pet visible={petVisible} state={petState} />
      <ChatBubble visible={!!message && petVisible} text={message} />

      {onboardingOpen && <OnboardingModal />}
      {settingsOpen && <SettingsPanel />}
    </div>
  );
}