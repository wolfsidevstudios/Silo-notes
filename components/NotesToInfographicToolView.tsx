import React, { useState, useEffect } from 'react';
import { BackIcon, InfographicIcon, CloseIcon, FullScreenIcon, DownloadIcon } from './icons';
import { GoogleGenAI } from "@google/genai";
import { Note, NoteType } from '../types';
import SelectNoteModal from './SelectNoteModal';

const FullScreenImageViewer: React.FC<{ imageUrl: string; title: string; onClose: () => void }> = ({ imageUrl, title, onClose }) => {
    const handleDownload = () => {
        const link = document.createElement('a');
        link.href = imageUrl;
        link.download = `${title.replace(/\s+/g, '_')}_infographic.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div className="fixed inset-0 bg-gray-900/70 backdrop-blur-sm z-50 flex flex-col items-center justify-center p-4" onClick={onClose}>
            <div className="absolute top-6 right-6 flex items-center gap-4">
                 <button onClick={handleDownload} className="p-2 rounded-full text-white/70 hover:text-white bg-white/20 hover:bg-white/30"><DownloadIcon /></button>
                <button onClick={onClose} className="text-white/70 hover:text-white"><CloseIcon /></button>
            </div>
            <div className="w-full h-full flex items-center justify-center" onClick={e => e.stopPropagation()}>
                <img src={imageUrl} alt={title} className="max-w-full max-h-full object-contain rounded-lg shadow-2xl" />
            </div>
        </div>
    );
};


interface NotesToInfographicToolViewProps {
  onBack: () => void;
  currentNote: Note | null;
  onSave: (noteData: Omit<Note, 'id' | 'createdAt'> & { id?: string }) => void;
  notes: Note[];
}

const NotesToInfographicToolView: React.FC<NotesToInfographicToolViewProps> = ({ onBack, currentNote, onSave, notes }) => {
  const [inputText, setInputText] = useState('');
  const [imageUrl, setImageUrl] = useState<string | null>(null);
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
        setImageUrl(currentNote.content);
        setStatus('success');
    } else {
        setIsViewerMode(false);
        setInputText('');
        setImageUrl(null);
        setStatus('idle');
        setTitle('');
    }
  }, [currentNote]);

  const handleGenerate = async () => {
    if (!geminiApiKey || !inputText.trim()) return;

    setStatus('loading');
    setError('');
    setImageUrl(null);
    try {
        const ai = new GoogleGenAI({ apiKey: geminiApiKey });
        const prompt = `Create a visually appealing and informative infographic summarizing the following notes. The infographic should be clear, professional, and easy to read. Use icons, charts, and a clean layout. Notes: "${inputText}"`;
        
        const response = await ai.models.generateImages({
            model: 'imagen-4.0-generate-001',
            prompt: prompt,
            config: {
              numberOfImages: 1,
              outputMimeType: 'image/png',
              aspectRatio: '9:16', // Vertical aspect ratio is often good for infographics
            },
        });
        
        const base64ImageBytes: string = response.generatedImages[0].image.imageBytes;
        const newImageUrl = `data:image/png;base64,${base64ImageBytes}`;
        setImageUrl(newImageUrl);
        setStatus('success');
    } catch (err) {
        console.error("Gemini API Error:", err);
        setError("Failed to generate infographic. Please check your API key and try again.");
        setStatus('error');
    }
  };

  const handleSaveInfographic = () => {
    const noteTitle = prompt("Enter a title for this infographic:", "My New Infographic");
    if (noteTitle && imageUrl) {
        onSave({
            title: noteTitle,
            content: imageUrl,
            type: NoteType.INFOGRAPHIC,
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
      {isFullScreen && imageUrl && <FullScreenImageViewer imageUrl={imageUrl} title={title} onClose={() => setIsFullScreen(false)} />}
      {showSelectNoteModal && <SelectNoteModal notes={notes} onClose={() => setShowSelectNoteModal(false)} onSelect={(content) => setInputText(content)} />}
      <header className="mb-10 flex-shrink-0">
        <button onClick={onBack} className="flex items-center text-sm font-semibold text-gray-500 hover:text-gray-800 transition-colors mb-4">
          <BackIcon />
          <span>Back to {isViewerMode ? 'Home' : 'Silo Labs'}</span>
        </button>
        <h1 className="text-4xl font-bold text-gray-900">{isViewerMode ? title : 'Notes to Infographic'}</h1>
        {!isViewerMode && <p className="text-lg text-gray-500 mt-2">Visualize your key points by turning text into a compelling infographic.</p>}
      </header>

      {isViewerMode ? (
         <div className="flex-grow w-full bg-white p-6 rounded-2xl shadow-sm border relative overflow-y-auto flex items-center justify-center">
            {imageUrl ? (
              <>
                 <button onClick={() => setIsFullScreen(true)} className="absolute top-4 right-4 z-10 p-2 hover:bg-gray-100 rounded-full bg-white border"><FullScreenIcon /></button>
                 <img src={imageUrl} alt={title} className="max-w-full max-h-full object-contain rounded-md" />
              </>
            ) : <p>No image to display.</p>}
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
                    <h2 className="font-semibold mb-2 text-gray-800">Generated Infographic</h2>
                    <div className="flex-1 w-full p-4 border border-gray-200 rounded-lg bg-gray-50/50 relative overflow-y-auto flex items-center justify-center">
                    {status === 'loading' && (
                        <div className="text-center">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
                            <p className="mt-4 text-gray-600">Generating image... this may take a minute.</p>
                        </div>
                    )}
                    {status === 'error' && <p className="text-red-500 p-4">{error}</p>}
                    {status === 'success' && imageUrl && (
                        <img src={imageUrl} alt="Generated Infographic" className="max-w-full max-h-full object-contain rounded-md" />
                    )}
                    {status !== 'loading' && !imageUrl && <p className="text-gray-500 text-center">Your infographic will appear here.</p>}
                    </div>
                </div>
            </div>
            
            <div className="flex-shrink-0 mt-8 flex justify-end gap-4">
                 {status === 'success' && imageUrl && (
                    <button
                        onClick={handleSaveInfographic}
                        className="bg-white text-black border border-black font-semibold py-3 px-8 rounded-full hover:bg-gray-100 transition-colors"
                    >
                        Save Infographic
                    </button>
                )}
                <button
                    onClick={handleGenerate}
                    disabled={status === 'loading' || !inputText.trim()}
                    className="bg-black text-white font-semibold py-3 px-8 rounded-full hover:bg-gray-800 transition-colors disabled:bg-gray-400 flex items-center justify-center gap-2"
                >
                    <InfographicIcon />
                    {status === 'loading' ? 'Generating...' : 'Create Infographic'}
                </button>
            </div>
        </>
      )}
    </div>
  );
};

export default NotesToInfographicToolView;
