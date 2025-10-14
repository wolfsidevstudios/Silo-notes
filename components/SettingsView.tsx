import React, { useState, useEffect } from 'react';
import { SettingsIcon } from './icons';

interface SettingsViewProps {
  onKeyUpdate: (key: string) => void;
  onLogout: () => void;
}

const SettingsView: React.FC<SettingsViewProps> = ({ onKeyUpdate, onLogout }) => {
  const [apiKey, setApiKey] = useState('');
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');

  useEffect(() => {
    const savedKey = localStorage.getItem('gemini-api-key');
    if (savedKey) {
      setApiKey(savedKey);
    }
  }, []);

  const handleSave = () => {
    setSaveStatus('saving');
    localStorage.setItem('gemini-api-key', apiKey);
    onKeyUpdate(apiKey);
    setTimeout(() => {
      setSaveStatus('saved');
      setTimeout(() => setSaveStatus('idle'), 2000); 
    }, 500);
  };

  return (
    <div className="p-8 lg:p-12">
      <header className="mb-10">
        <h1 className="text-4xl font-bold text-gray-900">Settings</h1>
        <p className="text-lg text-gray-500 mt-2">Manage your application settings and API keys.</p>
      </header>

      <div className="max-w-2xl mx-auto bg-white p-8 rounded-lg border border-gray-200 shadow-sm">
        <h2 className="text-2xl font-semibold text-gray-800 mb-6">API Configuration</h2>
        
        <div className="mb-6">
          <label htmlFor="gemini-api-key" className="block text-sm font-medium text-gray-700 mb-2">
            Gemini API Key
          </label>
          <p className="text-xs text-gray-500 mb-3">
            Your API key is stored only in your browser's local storage. 
            Providing a key will unlock AI writing tools in the note editor.
          </p>
          <input
            id="gemini-api-key"
            type="password"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            placeholder="Enter your Gemini API key"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-black"
          />
        </div>

        <div className="flex justify-between items-center">
            <button
                onClick={onLogout}
                className="text-sm font-semibold text-red-600 hover:text-red-800 transition-colors"
            >
                Logout
            </button>
          <button
            onClick={handleSave}
            className={`bg-black text-white font-semibold py-2 px-6 rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black ${
              saveStatus === 'saved' ? 'bg-green-600' : 'hover:bg-gray-800'
            }`}
            disabled={saveStatus === 'saving'}
          >
            {saveStatus === 'idle' && 'Save Key'}
            {saveStatus === 'saving' && 'Saving...'}
            {saveStatus === 'saved' && 'Saved!'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default SettingsView;