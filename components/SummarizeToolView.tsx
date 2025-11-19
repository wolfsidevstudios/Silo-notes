import React, { useState, useEffect } from 'react';
import { BackIcon, CloseIcon } from './icons';
import { GoogleGenAI } from "@google/genai";
import { Note } from '../types';
import SelectNoteModal from './SelectNoteModal';

interface SummarizeToolViewProps {
  onBack: () => void;
  notes: Note[];
}

const SummarizeToolView: React.FC<SummarizeToolViewProps> = ({ onBack, notes }) => {
  const [inputText, setInputText] = useState('');
  const [outputText, setOutputText] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'error' | 'success'>('idle');
  const [error, setError] = useState('');
  const [geminiApiKey, setGeminiApiKey] = useState<string | null>(null);
  const [showSelectNoteModal, setShowSelectNoteModal] = useState(false);

  useEffect(() => {
    const key = localStorage.getItem('gemini-api-key');
    setGeminiApiKey(key);
  }, []);

  const handleSummarize = async () => {
    if (!geminiApiKey || !inputText.trim()) return;

    setStatus('loading');
    setError('');
    setOutputText('');
    try {
        const ai = new GoogleGenAI({ apiKey: geminiApiKey });
        const prompt = `Summarize the following text:\n\n${inputText}`;
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
        });
        setOutputText(response.text);
        setStatus('success');
    } catch (err) {
        console.error("Gemini API Error:", err);
        setError("Failed to generate summary. Please check your API key and try again.");
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
            <span>Back to Kyndra Labs</span>
        </button>
      </div>
    );
  }

  return (
    <div className="p-8 lg:p-12 h-full flex flex-col">
      {showSelectNoteModal && <SelectNoteModal notes={notes} onClose={() => setShowSelectNoteModal(false)} onSelect={(content) => setInputText(content)} />}
      <header className="mb-10 flex-shrink-0">
        <button onClick={onBack} className="flex items-center text-sm font-semibold text-gray-500 hover:text-gray-800 transition-colors mb-4">
          <BackIcon />
          <span>Back to Kyndra Labs</span>
        </button>
        <h1 className="text-4xl font-bold text-gray-900">Summarize Tool</h1>
      </header>

      <div className="flex-grow grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="flex flex-col">
            <div className="flex justify-between items-center mb-2">
                <h2 className="font-semibold">Your Text</h2>
                <button onClick={() => setShowSelectNoteModal(true)} className="text-sm font-semibold text-gray-600 hover:text-black">Select Note</button>
            </div>
          <textarea
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Paste your article, notes, or any text here..."
            className="flex-1 w-full p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-black resize-none"
          />
        </div>
        <div className="flex flex-col">
            <div className="flex justify-between items-center mb-2">
              <h2 className="font-semibold">AI Summary</h2>
              <div>
                {outputText && (
                  <>
                    <button onClick={handleCopy} className="text-sm font-semibold text-gray-600 hover:text-black mr-4">Copy</button>
                    <button onClick={() => setOutputText('')} className="text-gray-400 hover:text-gray-800"><CloseIcon /></button>
                  </>
                )}
              </div>
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
      
      <div className="flex-shrink-0 mt-8 flex justify-end">
         <button
            onClick={handleSummarize}
            disabled={status === 'loading' || !inputText.trim()}
            className="bg-black text-white font-semibold py-3 px-8 rounded-full hover:bg-gray-800 transition-colors disabled:bg-gray-400 flex items-center justify-center"
        >
            {status === 'loading' ? 'Generating...' : 'Summarize'}
        </button>
      </div>
    </div>
  );
};

export default SummarizeToolView;