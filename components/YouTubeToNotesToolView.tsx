import React, { useState, useEffect } from 'react';
import { BackIcon, YouTubeIcon, FullScreenIcon, CloseIcon } from './icons';
import { GoogleGenAI } from "@google/genai";
import { Note, NoteType } from '../types';

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

interface YouTubeToNotesToolViewProps {
  onBack: () => void;
  onSave: (noteData: Omit<Note, 'id' | 'createdAt'> & { id?: string }) => void;
}

const YouTubeToNotesToolView: React.FC<YouTubeToNotesToolViewProps> = ({ onBack, onSave }) => {
  const [youtubeUrl, setYoutubeUrl] = useState('');
  const [notes, setNotes] = useState('');
  const [noteTitle, setNoteTitle] = useState('Notes from YouTube');
  const [status, setStatus] = useState<'idle' | 'loading' | 'error' | 'success'>('idle');
  const [error, setError] = useState('');
  const [geminiApiKey, setGeminiApiKey] = useState<string | null>(null);
  const [isFullScreen, setIsFullScreen] = useState(false);

  useEffect(() => {
    const key = localStorage.getItem('gemini-api-key');
    setGeminiApiKey(key);
  }, []);

  const handleGenerate = async () => {
    if (!geminiApiKey || !youtubeUrl.trim()) return;

    setStatus('loading');
    setError('');
    setNotes('');
    setNoteTitle('Notes from YouTube');
    try {
        const ai = new GoogleGenAI({ apiKey: geminiApiKey });
        const prompt = `From the YouTube video at this URL: ${youtubeUrl}, please generate a detailed, well-structured set of notes. The very first line of your response should be a suitable title for these notes, starting with "Title: ". Then, organize the key points using headings, subheadings, and bullet points. Make important terms bold using markdown like **this**.`;
        
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                tools: [{googleSearch: {}}],
            },
        });
        
        let rawText = response.text;
        let title = "Notes from YouTube";
        if (rawText.startsWith("Title: ")) {
            const parts = rawText.split('\n');
            title = parts[0].replace("Title: ", "").trim();
            rawText = parts.slice(1).join('\n');
        }

        setNoteTitle(title);
        const formattedNotes = rawText.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>').replace(/\n/g, '<br />');
        setNotes(formattedNotes);
        setStatus('success');
    } catch (err) {
        console.error("Gemini API Error:", err);
        setError("Failed to generate notes. This can happen if the video has no transcript or is private. Please try another video.");
        setStatus('error');
    }
  };

  const handleSaveNote = () => {
    const title = prompt("Enter a title for your new note:", noteTitle);
    if (title && notes) {
        onSave({
            title,
            content: notes.replace(/<strong>/g, '<b>').replace(/<\/strong>/g, '</b>'),
            type: NoteType.CLASSIC,
            privacy: 'public',
        });
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
            <span>Back to Kyndra Labs</span>
        </button>
      </div>
    );
  }

  return (
    <div className={commonViewClasses}>
      {isFullScreen && <FullScreenReader title={noteTitle} content={notes} onClose={() => setIsFullScreen(false)} />}
      <header className="mb-10 flex-shrink-0">
        <button onClick={onBack} className="flex items-center text-sm font-semibold text-gray-500 hover:text-gray-800 transition-colors mb-4">
          <BackIcon />
          <span>Back to Kyndra Labs</span>
        </button>
        <h1 className="text-4xl font-bold text-gray-900">YouTube to Notes</h1>
        <p className="text-lg text-gray-500 mt-2">Transform YouTube videos into structured, easy-to-read notes.</p>
      </header>

      <div className="flex-grow grid grid-cols-1 md:grid-cols-2 gap-8 min-h-0">
        <div className="bg-white p-6 rounded-2xl shadow-sm border flex flex-col gap-4">
            <div>
                <label className="font-semibold mb-2 block text-gray-800">YouTube URL</label>
                <input
                    type="text"
                    value={youtubeUrl}
                    onChange={(e) => setYoutubeUrl(e.target.value)}
                    placeholder="https://www.youtube.com/watch?v=..."
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-black"
                />
                 <p className="text-xs text-gray-500 mt-2">This feature uses AI to find and process the video's content. It works best with videos that have captions or a clear transcript.</p>
            </div>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border flex flex-col">
            <div className="flex justify-between items-center mb-2">
                <h2 className="font-semibold text-gray-800">Generated Notes</h2>
                {status === 'success' && notes && <button onClick={() => setIsFullScreen(true)} className="p-2 hover:bg-gray-100 rounded-full"><FullScreenIcon /></button>}
            </div>
            <div className="flex-1 w-full p-4 border border-gray-200 rounded-lg bg-gray-50/50 relative overflow-y-auto">
              {status === 'loading' && (
                <div className="absolute inset-0 flex items-center justify-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
                </div>
              )}
              {status === 'error' && <p className="text-red-500 p-4">{error}</p>}
              {status === 'success' && notes && (
                <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: notes }}></div>
              )}
              {status !== 'loading' && !notes && <p className="text-gray-500 text-center pt-10">Your notes will appear here.</p>}
            </div>
        </div>
      </div>
      
      <div className="flex-shrink-0 mt-8 flex justify-end gap-4">
        {status === 'success' && notes && (
            <button
                onClick={handleSaveNote}
                className="bg-white text-black border border-black font-semibold py-3 px-8 rounded-full hover:bg-gray-100 transition-colors"
            >
                Save as Note
            </button>
        )}
         <button
            onClick={handleGenerate}
            disabled={status === 'loading' || !youtubeUrl.trim()}
            className="bg-black text-white font-semibold py-3 px-8 rounded-full hover:bg-gray-800 transition-colors disabled:bg-gray-400 flex items-center justify-center gap-2"
        >
            <YouTubeIcon />
            {status === 'loading' ? 'Generating...' : 'Create Notes'}
        </button>
      </div>
    </div>
  );
};

export default YouTubeToNotesToolView;