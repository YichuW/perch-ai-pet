import { useState } from 'react';
import { useAppStore } from '../store/useAppStore';

export default function SettingsScreen() {
  const setScreen = useAppStore((s) => s.setScreen);
  const setApiKey = useAppStore((s) => s.setApiKey);
  const savedKey = useAppStore((s) => s.settings.apiKey);

  const [keyInput, setKeyInput] = useState(savedKey);
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setApiKey(keyInput.trim());
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="screen form-screen">
      <div className="form-card">
        <h2 className="form-title">Settings</h2>
        <p className="form-subtitle">Configure your Perch companion</p>

        <label className="input-label">Anthropic API Key</label>
        <input
          className="text-input"
          type="password"
          placeholder="sk-ant-..."
          value={keyInput}
          onChange={(e) => setKeyInput(e.target.value)}
        />

        <button
          className="primary-button"
          onClick={handleSave}
          style={{ marginBottom: 12 }}
        >
          {saved ? 'Saved!' : 'Save'}
        </button>

        <button
          className="secondary-button"
          onClick={() => setScreen('petHome')}
          style={{ width: '100%' }}
        >
          Back
        </button>
      </div>
    </div>
  );
}
