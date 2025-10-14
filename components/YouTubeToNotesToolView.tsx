import React, { useState, useEffect } from 'react';
import { BackIcon, YouTubeIcon } from './icons';
import { GoogleGenAI } from "@google/genai";
import { Note, NoteType } from '../types';

interface YouTubeToNotesToolViewProps {
  onBack: () => void;
  onSave: (noteData: Omit<Note, 'id' | 'createdAt'> & { id?: string }) => void;
}

const YouTubeToNotesToolView: React.FC<YouTubeToNotesToolViewProps> = ({ onBack, onSave }) => {
  const [youtubeUrl, setYoutubeUrl] = useState('');
  const [notes, setNotes] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'error' | 'success'>('idle');
  const [error, setError] = useState('');
  const [geminiApiKey, setGeminiApiKey] = useState<string | null>(null);

  useEffect(() => {
    const key = localStorage.getItem('gemini-api-key');
    setGeminiApiKey(key);
  }, []);

  const handleGenerate = async () => {
    if (!geminiApiKey || !youtubeUrl.trim()) return;

    setStatus('loading');
    setError('');
    setNotes('');
    try {
        const ai = new GoogleGenAI({ apiKey: geminiApiKey });
        const prompt = `From the YouTube video at this URL: ${youtubeUrl}, please generate a detailed, well-structured set of notes. Organize the key points using headings, subheadings, and bullet points. Make important terms bold using markdown like **this**.`;
        
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                tools: [{googleSearch: {}}],
            },
        });
        
        const formattedNotes = response.text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>').replace(/\n/g, '<br />');
        setNotes(formattedNotes);
        setStatus('success');
    } catch (err) {
        console.error("Gemini API Error:", err);
        setError("Failed to generate notes. This can happen if the video has no transcript or is private. Please try another video.");
        setStatus('error');
    }
  };

  const handleSaveNote = () => {
    const title = prompt("Enter a title for your new note:", `Notes from YouTube`);
    if (title && notes) {
        onSave({
            title,
            content: notes.replace(/<strong>/g, '<b>').replace(/<\/strong>/g, '</b>'),
            type: NoteType.CLASSIC,
            privacy: 'public',
        });
    }
  };
  
  const commonViewClasses = "p-8 lg:p-12 h-full flex flex-col";

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
      <header className="mb-10 flex-shrink-0">
        <button onClick={onBack} className="flex items-center text-sm font-semibold text-gray-500 hover:text-gray-800 transition-colors mb-4">
          <BackIcon />
          <span>Back to Silo Labs</span>
        </button>
        <h1 className="text-4xl font-bold text-gray-900">YouTube to Notes</h1>
        <p className="text-lg text-gray-500 mt-2">Transform YouTube videos into structured, easy-to-read notes.</p>
      </header>

      <div className="flex-grow grid grid-cols-1 md:grid-cols-2 gap-8 min-h-0">
        <div className="flex flex-col gap-4">
            <div>
                <label className="font-semibold mb-2 block">YouTube URL</label>
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
        <div className="flex flex-col">
            <h2 className="font-semibold mb-2">Generated Notes</h2>
            <div className="flex-1 w-full p-4 border border-gray-300 rounded-lg bg-gray-50 relative overflow-y-auto">
              {status === 'loading' && (
                <div className="absolute inset-0 flex items-center justify-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
                </div>
              )}
              {status === 'error' && <p className="text-red-500">{error}</p>}
              {status === 'success' && notes && (
                <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: notes }}></div>
              )}
              {status === 'idle' && <p className="text-gray-500 text-center pt-10">Your notes will appear here.</p>}
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
