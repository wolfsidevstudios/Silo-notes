import React, { useState, useEffect } from 'react';
import { BackIcon } from './icons';

const ELEVENLABS_API_KEY = 'sk_0c8a39a023d6903e44b64bfe6c751b7d888045d452eb6635';

const voices = {
  en: [
    { id: '21m00Tcm4TlvDq8ikWAM', name: 'Rachel' },
    { id: '29vD33N1CtxCmqQRPO9k', name: 'Drew' },
    { id: '2EiwWnXFnvU5JabPnv8n', name: 'Clyde' },
    { id: '5Q0t7uMcjvnagumLfvZi', name: 'Paul' },
    { id: 'CYw3kZ02Hs0563khs1Fj', name: 'Dave' },
  ],
  es: [
    { id: 'piTKgcLEGmPE4e6mEKli', name: 'Matilde' },
    { id: 'SOYHLrjzK2X1ezoPC6cr', name: 'Alonso' },
    { id: 'bVMeCyTHy58xNoL34h3p', name: 'Florencia' },
    { id: 'g5CIjZEefm0dSOlADwoD', name: 'Elio' },
    { id: 'LaT52xsmXzWb7k2cjgIR', name: 'Domi' },
  ],
};

interface TextToSpeechToolViewProps {
  onBack: () => void;
}

const TextToSpeechToolView: React.FC<TextToSpeechToolViewProps> = ({ onBack }) => {
  const [text, setText] = useState('');
  const [language, setLanguage] = useState<'en' | 'es'>('en');
  const [selectedVoiceId, setSelectedVoiceId] = useState(voices.en[0].id);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setSelectedVoiceId(voices[language][0].id);
    setAudioUrl(null);
    setError(null);
  }, [language]);

  const handleGenerateAudio = async () => {
    if (!text.trim()) {
      setError('Please enter some text to generate audio.');
      return;
    }
    setIsLoading(true);
    setError(null);
    setAudioUrl(null);
    try {
      const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${selectedVoiceId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'xi-api-key': ELEVENLABS_API_KEY,
        },
        body: JSON.stringify({
          text: text,
          model_id: 'eleven_multilingual_v2',
          voice_settings: { stability: 0.5, similarity_boost: 0.75 },
        }),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail?.message || 'Failed to generate audio.');
      }
      const blob = await response.blob();
      setAudioUrl(URL.createObjectURL(blob));
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'An unexpected error occurred.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-8 lg:p-12 h-full flex flex-col">
      <header className="mb-10 flex-shrink-0">
        <button onClick={onBack} className="flex items-center text-sm font-semibold text-gray-500 hover:text-gray-800 transition-colors mb-4">
          <BackIcon />
          <span>Back to Silo Labs</span>
        </button>
        <h1 className="text-4xl font-bold text-gray-900">Text-to-Speech Playground</h1>
        <p className="text-lg text-gray-500 mt-2">Bring your text to life. Experiment with different voices and languages.</p>
      </header>
      
      <div className="flex-grow max-w-4xl mx-auto w-full flex flex-col">
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Type or paste your text here..."
          className="w-full h-48 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-black resize-none mb-6 text-lg"
        />
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Language</label>
            <div className="flex bg-gray-100 rounded-lg p-1">
              <button onClick={() => setLanguage('en')} className={`flex-1 py-2 text-sm font-semibold rounded-md transition-colors ${language === 'en' ? 'bg-white shadow' : 'text-gray-600'}`}>English</button>
              <button onClick={() => setLanguage('es')} className={`flex-1 py-2 text-sm font-semibold rounded-md transition-colors ${language === 'es' ? 'bg-white shadow' : 'text-gray-600'}`}>Spanish</button>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Voice</label>
            <select
              value={selectedVoiceId}
              onChange={(e) => setSelectedVoiceId(e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-black bg-white"
            >
              {voices[language].map(voice => (
                <option key={voice.id} value={voice.id}>{voice.name}</option>
              ))}
            </select>
          </div>
        </div>
        
        <div className="mt-4">
          <button
            onClick={handleGenerateAudio}
            disabled={isLoading}
            className="w-full bg-black text-white font-semibold py-3 px-6 rounded-full hover:bg-gray-800 transition-colors disabled:bg-gray-400 flex items-center justify-center"
          >
            {isLoading ? (
              <>
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Generating...
              </>
            ) : "Generate Audio"}
          </button>
        </div>

        {error && <p className="text-red-500 text-sm mt-4 text-center">{error}</p>}
        
        {audioUrl && (
          <div className="mt-8 p-6 bg-gray-50 rounded-lg border">
            <p className="text-sm font-medium text-gray-700 mb-2">Result</p>
            <audio controls src={audioUrl} className="w-full"></audio>
            <a
              href={audioUrl}
              download={`silo-tts-${new Date().getTime()}.mp3`}
              className="mt-4 w-full bg-white text-black border border-gray-300 font-semibold py-3 px-6 rounded-full hover:bg-gray-100 transition-colors flex items-center justify-center"
            >
              Download Audio
            </a>
          </div>
        )}
      </div>
    </div>
  );
};

export default TextToSpeechToolView;
