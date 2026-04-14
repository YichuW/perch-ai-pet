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
  const [isHovered, setIsHovered] = useState(false);
  const [userInput, setUserInput] = useState('');

  const { name, activeTime } = useAppStore((s) => s.profile);
  const pet = useAppStore((s) => s.pet);
  const chatState = useAppStore((s) => s.chatState);
  const focusMode = useAppStore((s) => s.settings.focusMode);
  const setPetMessage = useAppStore((s) => s.setPetMessage);
  const setPetEmotion = useAppStore((s) => s.setPetEmotion);
  const setChatState = useAppStore((s) => s.setChatState);
  const dismissChat = useAppStore((s) => s.dismissChat);
  const toggleFocusMode = useAppStore((s) => s.toggleFocusMode);
  const setScreen = useAppStore((s) => s.setScreen);

  const currentPetImage = petImages[pet.emotion] || happyCat;
  const conversationActive = chatState !== 'idle';

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

  const handleSendReply = async () => {
    const message = userInput.trim();
    if (!message) return;

    setUserInput('');
    setChatState('userReplied');
    setPetMessage('...');

    try {
      await window.electronAPI?.sendPetInteraction({
        type: 'userMessage',
        message,
      });
    } catch {
      setPetMessage("Hmm, I couldn't think of what to say.");
      setChatState('catResponded');
    }
  };

  const handleDismiss = () => {
    dismissChat();
  };

  // Bubble visibility: show on hover (for quick actions) OR force-show during conversation
  const bubbleVisible = conversationActive || (isHovered && pet.message);
  // Input visibility: only during catInitiated
  const showInput = chatState === 'catInitiated';
  // Buttons visibility: hover only, hidden during active conversation
  const buttonsVisible = isHovered && !conversationActive;

  return (
    <div className="pet-screen">
      <div
        className="pet-hover-zone"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div className={`pet-top-area no-drag ${bubbleVisible ? 'visible' : 'hidden'}`}>
          <ChatBubble
            text={pet.message}
            onDismiss={conversationActive ? handleDismiss : undefined}
          />
        </div>

        <div className="pet-center-area">
          <div className="drag-region pet-drag-area">
            <div className={`pet-avatar pet-${pet.emotion}`}>
              <img
                src={currentPetImage}
                alt={`pet-${pet.emotion}`}
                className="pet-image"
                draggable={false}
              />
            </div>
          </div>
        </div>

        {showInput && (
          <div className="chat-input-area no-drag">
            <input
              className="chat-text-input"
              placeholder="Reply to Perch..."
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSendReply()}
              autoFocus
            />
            <button
              className="send-button"
              onClick={handleSendReply}
              disabled={!userInput.trim()}
            >
              Send
            </button>
          </div>
        )}

        <div className={`pet-action-bar no-drag ${buttonsVisible ? 'visible' : 'hidden'}`}>
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
          <button className="secondary-button" onClick={() => window.electronAPI?.demoTrigger()}>
            Demo
          </button>
        </div>
      </div>
    </div>
  );
}
