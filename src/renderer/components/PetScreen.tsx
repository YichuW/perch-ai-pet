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
  const setPetMessage = useAppStore((s) => s.setPetMessage);
  const setPetEmotion = useAppStore((s) => s.setPetEmotion);

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

  return (
    <div className="pet-screen">
      <div className="pet-top-area no-drag">
        <ChatBubble text={pet.message} />
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

      <div className="pet-action-bar no-drag">
        <button className="secondary-button" onClick={handleHello}>
          Say Hi
        </button>
        <button className="secondary-button" onClick={handleFeed}>
          Feed
        </button>
        <button className="secondary-button" onClick={handleStretch}>
          Stretch Reminder
        </button>
      </div>
    </div>
  );
}