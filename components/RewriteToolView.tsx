import React, { useState, useEffect } from 'react';
import { BackIcon } from './icons';
import RewriteModal from './RewriteModal';
import { Note } from '../types';
import SelectNoteModal from './SelectNoteModal';

interface RewriteToolViewProps {
  onBack: () => void;
  notes: Note[];
}

const RewriteToolView: React.FC<RewriteToolViewProps> = ({ onBack, notes }) => {
  const [inputText, setInputText] = useState('');
  const [isRewriteModalOpen, setIsRewriteModalOpen] = useState(false);
  const [geminiApiKey, setGeminiApiKey] = useState<string | null>(null);
  const [showSelectNoteModal, setShowSelectNoteModal] = useState(false);

  useEffect(() => {
    const key = localStorage.getItem('gemini-api-key');
    setGeminiApiKey(key);
  }, []);

  const handleRewriteClick = () => {
    if (!inputText.trim()) return;
    setIsRewriteModalOpen(true);
  };
  
  const handleReplaceText = (newText: string) => {
    setInputText(newText);
    setIsRewriteModalOpen(false);
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

  return (
    <div className="p-8 lg:p-12 h-full flex flex-col">
       {isRewriteModalOpen && (
            <RewriteModal
                geminiApiKey={geminiApiKey}
                textToProcess={inputText}
                onClose={() => setIsRewriteModalOpen(false)}
                onReplace={handleReplaceText}
            />
        )}
        {showSelectNoteModal && <SelectNoteModal notes={notes} onClose={() => setShowSelectNoteModal(false)} onSelect={(content) => setInputText(content)} />}
      <header className="mb-10 flex-shrink-0">
        <button onClick={onBack} className="flex items-center text-sm font-semibold text-gray-500 hover:text-gray-800 transition-colors mb-4">
          <BackIcon />
          <span>Back to Silo Labs</span>
        </button>
        <h1 className="text-4xl font-bold text-gray-900">Rewrite Tool</h1>
      </header>

      <div className="flex-grow flex flex-col">
        <div className="flex justify-between items-center mb-2">
            <h2 className="font-semibold">Your Text</h2>
            <button onClick={() => setShowSelectNoteModal(true)} className="text-sm font-semibold text-gray-600 hover:text-black">Select Note</button>
        </div>
        <textarea
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Type or paste text you want to improve..."
            className="flex-1 w-full p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-black resize-none"
        />
      </div>
      
      <div className="flex-shrink-0 mt-8 flex justify-end">
        <button
          onClick={handleRewriteClick}
          disabled={!inputText.trim()}
          className="bg-black text-white font-semibold py-3 px-8 rounded-full hover:bg-gray-800 transition-colors disabled:bg-gray-400 flex items-center justify-center w-full sm:w-auto"
        >
          Rewrite
        </button>
      </div>
    </div>
  );
};

export default RewriteToolView;
