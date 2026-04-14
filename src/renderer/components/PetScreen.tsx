import { useState } from 'react';
import { useAppStore } from '../store/useAppStore';
import ChatBubble from './ChatBubble';

import happyCat from '../../assets/pet/cat_idle.png';
import eatCat from '../../assets/pet/cat_eat.png';
import playCat from '../../assets/pet/cat_play.png';

const petImages = {
  happy: happyCat,
  eat: eatCat,
  play: playCat,
};

export default function PetScreen() {
  const { name, activeTime } = useAppStore((s) => s.profile);
  const pet = useAppStore((s) => s.pet);
  const focusMode = useAppStore((s) => s.settings.focusMode);
  const setPetMessage = useAppStore((s) => s.setPetMessage);
  const setPetEmotion = useAppStore((s) => s.setPetEmotion);
  const toggleFocusMode = useAppStore((s) => s.toggleFocusMode);
  const setScreen = useAppStore((s) => s.setScreen);

  const [userInput, setUserInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const currentPetImage = petImages[pet.emotion] || happyCat;

  const handleStretch = () => {
    setPetEmotion('play');
    setPetMessage('Stretch a little?');
  };

  const handleFeed = () => {
    setPetEmotion('eat');
    setPetMessage('Yay, thank you for feeding me!');
  };

  const handleHello = () => {
    setPetEmotion('happy');
    setPetMessage(
      name
        ? `Hi ${name}! Your usual active time is ${activeTime || 'not set yet'}.`
        : 'Hi! Nice to see you again.'
    );
  };

  const handleSendMessage = async () => {
    const message = userInput.trim();
    if (!message || isLoading) return;

    setUserInput('');
    setIsLoading(true);
    setPetMessage('...');

    try {
      await window.electronAPI?.sendPetInteraction({
        type: 'userMessage',
        message,
      });
    } catch {
      setPetMessage("Hmm, I couldn't think of what to say.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDismiss = () => {
    setPetMessage('');
  };

  return (
    <div className="pet-screen">
      <div className="pet-top-area">
        <ChatBubble text={pet.message} onDismiss={pet.message ? handleDismiss : undefined} />
      </div>

      <div className="pet-center-area">
        <div className={`pet-avatar pet-${pet.emotion}`}>
          <img
            src={currentPetImage}
            alt={`pet-${pet.emotion}`}
            className="pet-image"
          />
        </div>
      </div>

      <div className="chat-input-area">
        <input
          className="chat-text-input"
          placeholder="Talk to Perch..."
          value={userInput}
          onChange={(e) => setUserInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
          disabled={isLoading}
        />
        <button
          className="send-button"
          onClick={handleSendMessage}
          disabled={!userInput.trim() || isLoading}
        >
          Send
        </button>
      </div>

      <div className="pet-action-bar">
        <button className="secondary-button" onClick={handleHello}>
          Say Hi
        </button>
        <button className="secondary-button" onClick={handleFeed}>
          Feed
        </button>
        <button className="secondary-button" onClick={handleStretch}>
          Stretch
        </button>
        <button
          className={`secondary-button ${focusMode ? 'active' : ''}`}
          onClick={toggleFocusMode}
        >
          {focusMode ? 'Focus: ON' : 'Focus: OFF'}
        </button>
        <button className="secondary-button" onClick={() => setScreen('settings')}>
          Settings
        </button>
      </div>
    </div>
  );
}
