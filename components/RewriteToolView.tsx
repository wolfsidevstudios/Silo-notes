import React, { useState, useEffect } from 'react';
import { BackIcon } from './icons';
import { GoogleGenAI } from "@google/genai";

interface RewriteToolViewProps {
  onBack: () => void;
}

type RewriteTone = 'Neutral' | 'Formal' | 'Casual' | 'Confident' | 'Simplify';

const RewriteToolView: React.FC<RewriteToolViewProps> = ({ onBack }) => {
  const [inputText, setInputText] = useState('');
  const [outputText, setOutputText] = useState('');
  const [tone, setTone] = useState<RewriteTone>('Neutral');
  const [status, setStatus] = useState<'idle' | 'loading' | 'error' | 'success'>('idle');
  const [error, setError] = useState('');
  const [geminiApiKey, setGeminiApiKey] = useState<string | null>(null);

  useEffect(() => {
    const key = localStorage.getItem('gemini-api-key');
    setGeminiApiKey(key);
  }, []);

  const handleRewrite = async () => {
    if (!geminiApiKey || !inputText.trim()) return;

    setStatus('loading');
    setError('');
    setOutputText('');
    try {
      const ai = new GoogleGenAI({ apiKey: geminiApiKey });
      const toneInstruction = {
          'Neutral': 'Rewrite the following text.',
          'Formal': 'Rewrite the following text in a more formal and professional tone.',
          'Casual': 'Rewrite the following text in a more casual and friendly tone.',
          'Confident': 'Rewrite the following text in a more confident and assertive tone.',
          'Simplify': 'Rewrite the following text to make it simpler and easier to understand.',
      }[tone];

      const prompt = `${toneInstruction}\n\nOriginal Text:\n"${inputText}"`;
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
      });
      setOutputText(response.text);
      setStatus('success');
    } catch (err) {
      console.error("Gemini API Error:", err);
      setError("Failed to rewrite text. Please check your API key and try again.");
      setStatus('error');
    }
  };
  
  const handleCopy = () => {
    navigator.clipboard.writeText(outputText);
  };

  if (!geminiApiKey) {
    return (
      <div className="p-8 lg:p-12 h-full flex flex-col items-center justify-center text-center">
        <h2 className="text-xl font-semibold text-gray-700">API Key Required</h2>
        <p className="text-gray-500 mt-2">Please set your Gemini API key in the Settings to use this tool.</p>
         <button onClick={onBack} className="mt-6 flex items-center text-sm font-semibold text-gray-500 hover:text-gray-800 transition-colors">
            <BackIcon />
            <span>Back to Silo Labs</span>
        </button>
      </div>
    );
  }

  const ToneButton: React.FC<{ value: RewriteTone }> = ({ value }) => (
    <button
      onClick={() => setTone(value)}
      className={`px-4 py-2 text-sm font-semibold rounded-full transition-colors whitespace-nowrap ${
        tone === value ? 'bg-black text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
      }`}
    >
      {value}
    </button>
  );

  return (
    <div className="p-8 lg:p-12 h-full flex flex-col">
      <header className="mb-10 flex-shrink-0">
        <button onClick={onBack} className="flex items-center text-sm font-semibold text-gray-500 hover:text-gray-800 transition-colors mb-4">
          <BackIcon />
          <span>Back to Silo Labs</span>
        </button>
        <h1 className="text-4xl font-bold text-gray-900">Rewrite Tool</h1>
      </header>

      <div className="flex-grow grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="flex flex-col">
          <h2 className="font-semibold mb-2">Your Text</h2>
          <textarea
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Type or paste text you want to improve..."
            className="flex-1 w-full p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-black resize-none"
          />
        </div>
        <div className="flex flex-col">
          <div className="flex justify-between items-center mb-2">
            <h2 className="font-semibold">Rewritten Text</h2>
            {status === 'success' && (
              <button onClick={handleCopy} className="text-sm font-semibold text-gray-600 hover:text-black">Copy</button>
            )}
          </div>
          <div className="flex-1 w-full p-4 border border-gray-300 rounded-lg bg-gray-50 relative">
             {status === 'loading' && (
                <div className="absolute inset-0 flex items-center justify-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
                </div>
              )}
              {status === 'error' && <p className="text-red-500">{error}</p>}
              <p className="whitespace-pre-wrap">{outputText}</p>
          </div>
        </div>
      </div>
      
      <div className="flex-shrink-0 mt-8 flex flex-col sm:flex-row justify-between items-center gap-4">
        <div className="flex items-center gap-2 overflow-x-auto pb-2">
            <ToneButton value="Neutral" />
            <ToneButton value="Formal" />
            <ToneButton value="Casual" />
            <ToneButton value="Confident" />
            <ToneButton value="Simplify" />
        </div>
        <button
          onClick={handleRewrite}
          disabled={status === 'loading' || !inputText.trim()}
          className="bg-black text-white font-semibold py-3 px-8 rounded-full hover:bg-gray-800 transition-colors disabled:bg-gray-400 flex items-center justify-center w-full sm:w-auto"
        >
          {status === 'loading' ? 'Generating...' : 'Rewrite'}
        </button>
      </div>
    </div>
  );
};

export default RewriteToolView;
