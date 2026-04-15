import { useAppStore } from '../store/useAppStore';
import happyCat from '../../assets/pet/cat_idle.png';

export default function WelcomeScreen() {
  const setScreen = useAppStore((s) => s.setScreen);

  return (
    <div className="screen welcome-screen">
      <div className="welcome-pet">
        <img src={happyCat} alt="pet" className="welcome-pet-image" />
      </div>

      <h1 className="title">Hi! I&apos;m your new desktop companion.</h1>
      <p className="subtitle">
        I&apos;m here to keep you company and help you stay balanced throughout your day.
      </p>

      <button className="primary-button" onClick={() => setScreen('username')}>
        Let&apos;s get started
      </button>
    </div>
  );
}