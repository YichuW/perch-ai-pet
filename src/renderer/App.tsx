import { useAppStore } from './store/useAppStore';
import WelcomeScreen from './components/WelcomeScreen';
import UsernameScreen from './components/UsernameScreen';
import ActiveTimeScreen from './components/ActiveTimeScreen';
import PetScreen from './components/PetScreen';

export default function App() {
  const currentScreen = useAppStore((s) => s.currentScreen);

  if (currentScreen === 'welcome') {
    return <WelcomeScreen />;
  }

  if (currentScreen === 'username') {
    return <UsernameScreen />;
  }

  if (currentScreen === 'activeTime') {
    return <ActiveTimeScreen />;
  }

  return <PetScreen />;
}