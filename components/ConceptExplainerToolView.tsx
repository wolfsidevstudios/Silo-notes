import React, { useState, useEffect } from 'react';
import { BackIcon, ConceptExplainerIcon, FullScreenIcon, CloseIcon } from './icons';
import { GoogleGenAI } from "@google/genai";
import { Note } from '../types';
import SelectNoteModal from './SelectNoteModal';

const FullScreenReader: React.FC<{ title: string; content: string; onClose: () => void }> = ({ title, content, onClose }) => {
  return (
    <div className="fixed inset-0 bg-white z-50 flex flex-col" onClick={onClose}>
        <header className="p-6 border-b flex justify-between items-center flex-shrink-0">
            <h2 className="text-xl font-bold text-gray-800 truncate pr-4">{title}</h2>
            <button onClick={onClose} className="text-gray-500 hover:text-black"><CloseIcon /></button>
        </header>
        <div className="p-8 lg:p-12 flex-grow overflow-y-auto">
            <div className="prose max-w-3xl mx-auto" dangerouslySetInnerHTML={{ __html: content }}></div>
        </div>
    </div>
  );
};


interface ConceptExplainerToolViewProps {
  onBack: () => void;
  notes: Note[];
}

const ConceptExplainerToolView: React.FC<ConceptExplainerToolViewProps> = ({ onBack, notes }) => {
  const [concept, setConcept] = useState('');
  const [context, setContext] = useState('');
  const [explanation, setExplanation] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'error' | 'success'>('idle');
  const [error, setError] = useState('');
  const [geminiApiKey, setGeminiApiKey] = useState<string | null>(null);
  const [showSelectNoteModal, setShowSelectNoteModal] = useState(false);
  const [isFullScreen, setIsFullScreen] = useState(false);

  useEffect(() => {
    const key = localStorage.getItem('gemini-api-key');
    setGeminiApiKey(key);
  }, []);

  const handleGenerate = async () => {
    if (!geminiApiKey || !concept.trim()) return;

    setStatus('loading');
    setError('');
    setExplanation('');
    try {
        const ai = new GoogleGenAI({ apiKey: geminiApiKey });
        const prompt = `Explain the concept of "${concept}" in simple, easy-to-understand terms. Use analogies and simple examples.
        ${context.trim() ? `\nHere is some context from my notes to help you tailor the explanation:\n"""\n${context}\n"""` : ''}
        Keep the explanation clear and focused.`;
        
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
        });
        
        const formattedExplanation = response.text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>').replace(/\n/g, '<br />');
        setExplanation(formattedExplanation);
        setStatus('success');
    } catch (err) {
        console.error("Gemini API Error:", err);
        setError("Failed to generate explanation. Please try again.");
        setStatus('error');
    }
  };
  
  const commonViewClasses = "p-8 lg:p-12 h-full flex flex-col bg-gray-50/50";

  if (!geminiApiKey) {
    return (
      <div className={`${commonViewClasses} items-center justify-center text-center`}>
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
    <div className={commonViewClasses}>
      {isFullScreen && <FullScreenReader title={`Explanation of "${concept}"`} content={explanation} onClose={() => setIsFullScreen(false)} />}
      {showSelectNoteModal && <SelectNoteModal notes={notes} onClose={() => setShowSelectNoteModal(false)} onSelect={(content) => setContext(content)} />}
      <header className="mb-10 flex-shrink-0">
        <button onClick={onBack} className="flex items-center text-sm font-semibold text-gray-500 hover:text-gray-800 transition-colors mb-4">
          <BackIcon />
          <span>Back to Silo Labs</span>
        </button>
        <h1 className="text-4xl font-bold text-gray-900">Concept Explainer</h1>
        <p className="text-lg text-gray-500 mt-2">Break down complex topics into simple explanations.</p>
      </header>

      <div className="flex-grow grid grid-cols-1 md:grid-cols-2 gap-8 min-h-0">
        <div className="bg-white p-6 rounded-2xl shadow-sm border flex flex-col gap-4">
            <div>
                <label className="font-semibold mb-2 block text-gray-800">Concept to Explain</label>
                <input
                    type="text"
                    value={concept}
                    onChange={(e) => setConcept(e.target.value)}
                    placeholder="e.g., Photosynthesis, Quantum Computing..."
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-black"
                />
            </div>
          <div className="flex flex-col flex-grow">
             <div className="flex justify-between items-center mb-2">
                <label className="font-semibold text-gray-800">Context (Optional)</label>
                <button onClick={() => setShowSelectNoteModal(true)} className="text-sm font-semibold text-gray-600 hover:text-black">Select Note</button>
            </div>
            <textarea
                value={context}
                onChange={(e) => setContext(e.target.value)}
                placeholder="Paste related notes here to get a more tailored explanation..."
                className="flex-1 w-full p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-black resize-none bg-gray-50/50"
            />
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border flex flex-col">
            <div className="flex justify-between items-center mb-2">
                <h2 className="font-semibold text-gray-800">Simple Explanation</h2>
                {status === 'success' && explanation && <button onClick={() => setIsFullScreen(true)} className="p-2 hover:bg-gray-100 rounded-full"><FullScreenIcon /></button>}
            </div>
            <div className="flex-1 w-full p-4 border border-gray-200 rounded-lg bg-gray-50/50 relative overflow-y-auto">
              {status === 'loading' && (
                <div className="absolute inset-0 flex items-center justify-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
                </div>
              )}
              {status === 'error' && <p className="text-red-500 p-4">{error}</p>}
              {status === 'success' && explanation && (
                <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: explanation }}></div>
              )}
              {status !== 'loading' && !explanation && <p className="text-gray-500 text-center pt-10">Your explanation will appear here.</p>}
            </div>
        </div>
      </div>
      
      <div className="flex-shrink-0 mt-8 flex justify-end">
         <button
            onClick={handleGenerate}
            disabled={status === 'loading' || !concept.trim()}
            className="bg-black text-white font-semibold py-3 px-8 rounded-full hover:bg-gray-800 transition-colors disabled:bg-gray-400 flex items-center justify-center gap-2"
        >
            <ConceptExplainerIcon />
            {status === 'loading' ? 'Explaining...' : 'Explain Concept'}
        </button>
      </div>
    </div>
  );
};

export default ConceptExplainerToolView;
