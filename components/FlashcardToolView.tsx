import React, { useState, useEffect } from 'react';
import { BackIcon, FlashcardIcon, FullScreenIcon, ChevronLeftIcon, ChevronRightIcon, CloseIcon } from './icons';
import { GoogleGenAI, Type } from "@google/genai";
import { Note, NoteType } from '../types';
import SelectNoteModal from './SelectNoteModal';

interface Flashcard {
  front: string;
  back: string;
}

const FlashcardComponent: React.FC<{ card: Flashcard, isFlippable?: boolean }> = ({ card, isFlippable = true }) => {
  const [isFlipped, setIsFlipped] = useState(false);
  
  const handleFlip = () => {
    if (isFlippable) {
        setIsFlipped(!isFlipped);
    }
  };

  return (
    <div className="perspective-1000 w-full h-48 md:h-56" onClick={handleFlip}>
      <div className={`relative w-full h-full transition-transform duration-700 transform-style-preserve-3d ${isFlipped ? 'rotate-y-180' : ''}`}>
        <div className="absolute w-full h-full backface-hidden bg-white border-2 border-gray-200 rounded-xl p-4 flex items-center justify-center text-center shadow-sm hover:shadow-md transition-shadow">
          <p className="font-semibold text-lg text-gray-800">{card.front}</p>
        </div>
        <div className="absolute w-full h-full backface-hidden bg-gray-50 border-2 border-gray-200 rounded-xl p-4 flex items-center justify-center text-center rotate-y-180 shadow-sm hover:shadow-md transition-shadow">
          <p className="text-gray-700">{card.back}</p>
        </div>
      </div>
    </div>
  );
};

const FullScreenViewer: React.FC<{ cards: Flashcard[]; onClose: () => void }> = ({ cards, onClose }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const goToNext = () => setCurrentIndex(i => (i + 1) % cards.length);
  const goToPrev = () => setCurrentIndex(i => (i - 1 + cards.length) % cards.length);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'ArrowRight') goToNext();
        if (e.key === 'ArrowLeft') goToPrev();
        if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [cards.length]);

  if (!cards || cards.length === 0) return null;

  return (
    <div className="fixed inset-0 bg-gray-900/70 backdrop-blur-sm z-50 flex flex-col items-center justify-center p-4" onClick={onClose}>
        <button onClick={onClose} className="absolute top-6 right-6 text-white/70 hover:text-white"><CloseIcon/></button>
        <div className="w-full max-w-2xl h-96" onClick={e => e.stopPropagation()}>
            <FlashcardComponent card={cards[currentIndex]} />
        </div>
        <div className="flex items-center gap-8 mt-8" onClick={e => e.stopPropagation()}>
            <button onClick={goToPrev} className="p-3 bg-white/20 rounded-full text-white hover:bg-white/30"><ChevronLeftIcon /></button>
            <p className="text-white font-mono text-lg">{currentIndex + 1} / {cards.length}</p>
            <button onClick={goToNext} className="p-3 bg-white/20 rounded-full text-white hover:bg-white/30"><ChevronRightIcon /></button>
        </div>
    </div>
  )
}

interface FlashcardToolViewProps {
  onBack: () => void;
  currentNote: Note | null;
  onSave: (noteData: Omit<Note, 'id' | 'createdAt'> & { id?: string }) => void;
  notes: Note[];
}

const FlashcardToolView: React.FC<FlashcardToolViewProps> = ({ onBack, currentNote, onSave, notes }) => {
  const [inputText, setInputText] = useState('');
  const [flashcards, setFlashcards] = useState<Flashcard[]>([]);
  const [status, setStatus] = useState<'idle' | 'loading' | 'error' | 'success'>('idle');
  const [error, setError] = useState('');
  const [geminiApiKey, setGeminiApiKey] = useState<string | null>(null);

  const [isViewerMode, setIsViewerMode] = useState(false);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [title, setTitle] = useState('');
  const [showSelectNoteModal, setShowSelectNoteModal] = useState(false);

  useEffect(() => {
    const key = localStorage.getItem('gemini-api-key');
    setGeminiApiKey(key);
  }, []);

  useEffect(() => {
    if (currentNote) {
        setIsViewerMode(true);
        setTitle(currentNote.title);
        try {
            const parsedCards = JSON.parse(currentNote.content);
            setFlashcards(parsedCards);
            setStatus('success');
        } catch (e) {
            setError('Could not load flashcards.');
            setStatus('error');
        }
    } else {
        setIsViewerMode(false);
        setInputText('');
        setFlashcards([]);
        setStatus('idle');
        setTitle('');
    }
  }, [currentNote]);

  const handleGenerate = async () => {
    if (!geminiApiKey || !inputText.trim()) return;

    setStatus('loading');
    setError('');
    setFlashcards([]);
    try {
        const ai = new GoogleGenAI({ apiKey: geminiApiKey });
        const prompt = `Based on the following text, generate a set of flashcards. Each flashcard should have a "front" (a term or question) and a "back" (a definition or answer). Text:\n\n${inputText}`;
        
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        flashcards: {
                            type: Type.ARRAY,
                            items: {
                                type: Type.OBJECT,
                                properties: {
                                    front: { type: Type.STRING },
                                    back: { type: Type.STRING }
                                },
                                required: ["front", "back"]
                            }
                        }
                    },
                    required: ["flashcards"]
                }
            }
        });
        
        const jsonText = response.text.trim();
        const parsedResponse = JSON.parse(jsonText);
        setFlashcards(parsedResponse.flashcards || []);
        setStatus('success');
    } catch (err) {
        console.error("Gemini API Error:", err);
        setError("Failed to generate flashcards. The AI couldn't process the request. Try rephrasing or simplifying your text.");
        setStatus('error');
    }
  };

  const handleSaveFlashcards = () => {
    const noteTitle = prompt("Enter a title for this flashcard set:", "My New Flashcards");
    if (noteTitle && flashcards.length > 0) {
        onSave({
            title: noteTitle,
            content: JSON.stringify(flashcards),
            type: NoteType.FLASHCARDS,
            privacy: 'public'
        });
    }
  };
  
  const commonViewClasses = "p-8 lg:p-12 h-full flex flex-col bg-gray-50/50";

  if (!geminiApiKey && !isViewerMode) {
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
      {isFullScreen && <FullScreenViewer cards={flashcards} onClose={() => setIsFullScreen(false)} />}
      {showSelectNoteModal && <SelectNoteModal notes={notes} onClose={() => setShowSelectNoteModal(false)} onSelect={(content) => setInputText(content)} />}
      <header className="mb-10 flex-shrink-0">
        <button onClick={onBack} className="flex items-center text-sm font-semibold text-gray-500 hover:text-gray-800 transition-colors mb-4">
          <BackIcon />
          <span>Back to {isViewerMode ? 'Home' : 'Silo Labs'}</span>
        </button>
        <h1 className="text-4xl font-bold text-gray-900">{isViewerMode ? title : 'Notes to Flashcards'}</h1>
        {!isViewerMode && <p className="text-lg text-gray-500 mt-2">Paste your notes below to automatically create study cards.</p>}
      </header>

      {isViewerMode ? (
         <div className="flex-grow w-full bg-white p-6 rounded-2xl shadow-sm border relative overflow-y-auto">
             {status === 'success' && flashcards.length > 0 ? (
                <>
                    <button onClick={() => setIsFullScreen(true)} className="absolute top-4 right-4 z-10 flex items-center gap-2 text-sm font-medium bg-white hover:bg-gray-100 border rounded-full px-3 py-2">
                        <FullScreenIcon />
                        <span>Study Mode</span>
                    </button>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {flashcards.map((card, i) => <FlashcardComponent key={i} card={card} />)}
                    </div>
                </>
              ) : <p className="text-gray-500 text-center pt-10">No flashcards to display.</p>}
         </div>
      ) : (
        <>
            <div className="flex-grow grid grid-cols-1 md:grid-cols-2 gap-8 min-h-0">
                <div className="bg-white p-6 rounded-2xl shadow-sm border flex flex-col">
                    <div className="flex justify-between items-center mb-2">
                        <h2 className="font-semibold text-gray-800">Your Notes</h2>
                        <button onClick={() => setShowSelectNoteModal(true)} className="text-sm font-semibold text-gray-600 hover:text-black">Select Note</button>
                    </div>
                    <textarea
                        value={inputText}
                        onChange={(e) => setInputText(e.target.value)}
                        placeholder="Paste your notes here..."
                        className="flex-1 w-full p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-black resize-none bg-gray-50/50"
                    />
                </div>
                <div className="bg-white p-6 rounded-2xl shadow-sm border flex flex-col">
                    <h2 className="font-semibold mb-2 text-gray-800">Generated Flashcards <span className="text-gray-500 font-normal text-sm">(Click to flip)</span></h2>
                    <div className="flex-1 w-full p-4 border border-gray-200 rounded-lg bg-gray-50/50 relative overflow-y-auto">
                    {status === 'loading' && (
                        <div className="absolute inset-0 flex items-center justify-center">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
                        </div>
                    )}
                    {status === 'error' && <p className="text-red-500 p-4">{error}</p>}
                    {status === 'success' && flashcards.length > 0 && (
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                            {flashcards.map((card, i) => <FlashcardComponent key={i} card={card} />)}
                        </div>
                    )}
                    {status !== 'loading' && flashcards.length === 0 && <p className="text-gray-500 text-center pt-10">Your flashcards will appear here.</p>}
                    </div>
                </div>
            </div>
      
            <div className="flex-shrink-0 mt-8 flex justify-end gap-4">
                {status === 'success' && flashcards.length > 0 && (
                    <button
                        onClick={handleSaveFlashcards}
                        className="bg-white text-black border border-black font-semibold py-3 px-8 rounded-full hover:bg-gray-100 transition-colors"
                    >
                        Save Flashcards
                    </button>
                )}
                <button
                    onClick={handleGenerate}
                    disabled={status === 'loading' || !inputText.trim()}
                    className="bg-black text-white font-semibold py-3 px-8 rounded-full hover:bg-gray-800 transition-colors disabled:bg-gray-400 flex items-center justify-center gap-2"
                >
                    <FlashcardIcon />
                    {status === 'loading' ? 'Generating...' : 'Create Flashcards'}
                </button>
            </div>
        </>
      )}
       <style>{`
        .perspective-1000 { perspective: 1000px; }
        .transform-style-preserve-3d { transform-style: preserve-3d; }
        .rotate-y-180 { transform: rotateY(180deg); }
        .backface-hidden { backface-visibility: hidden; -webkit-backface-visibility: hidden; }
      `}</style>
    </div>
  );
};

export default FlashcardToolView;
