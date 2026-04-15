import { useAppStore } from '../store/useAppStore';

export default function SettingsScreen() {
  const setScreen = useAppStore((s) => s.setScreen);

  return (
    <div className="screen form-screen">
      <div className="form-card">
        <h2 className="form-title">About Perch</h2>
        <p className="form-subtitle">Your privacy matters to us</p>

        <div className="privacy-section">
          <h3 className="privacy-heading">What Perch knows</h3>
          <ul className="privacy-list">
            <li>Your current topmost app (e.g. "VS Code", "Word")</li>
            <li>How long you've been using it</li>
            <li>Your name and preferred active hours</li>
          </ul>
        </div>

        <div className="privacy-section">
          <h3 className="privacy-heading">What Perch does NOT know</h3>
          <ul className="privacy-list">
            <li>Your keystrokes or what you type</li>
            <li>The contents of any app or file</li>
            <li>Any other information on your laptop</li>
          </ul>
        </div>

        <button
          className="secondary-button"
          onClick={() => setScreen('petHome')}
          style={{ width: '100%', marginTop: 8 }}
        >
          Back
        </button>
      </div>
    </div>
  );
}
