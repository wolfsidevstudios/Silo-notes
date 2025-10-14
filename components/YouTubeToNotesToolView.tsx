import React, { useState, useEffect } from 'react';
import { BackIcon, YouTubeIcon } from './icons';
import { GoogleGenAI } from "@google/genai";

interface YouTubeToNotesToolViewProps {
  onBack: () => void;
}

const YouTubeToNotesToolView: React.FC<YouTubeToNotesToolViewProps> = ({ onBack }) => {
  const [transcript, setTranscript] = useState('');
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
    if (!geminiApiKey || !transcript.trim()) return;

    setStatus('loading');
    setError('');
    setNotes('');
    try {
        const ai = new GoogleGenAI({ apiKey: geminiApiKey });
        const prompt = `Please create a well-structured set of notes from the following YouTube video transcript. Organize the key points using headings, subheadings, and bullet points. Make important terms bold.
        ${youtubeUrl ? `\nVideo URL for context: ${youtubeUrl}\n` : ''}
        Transcript:\n\n${transcript}`;
        
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
        });
        
        const formattedNotes = response.text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>').replace(/\n/g, '<br />');
        setNotes(formattedNotes);
        setStatus('success');
    } catch (err) {
        console.error("Gemini API Error:", err);
        setError("Failed to generate notes. The AI couldn't process the request. Please check the transcript and try again.");
        setStatus('error');
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
        <p className="text-lg text-gray-500 mt-2">Transform video transcripts into structured, easy-to-read notes.</p>
      </header>

      <div className="flex-grow grid grid-cols-1 md:grid-cols-2 gap-8 min-h-0">
        <div className="flex flex-col gap-4">
            <div>
                <label className="font-semibold mb-2 block">YouTube URL (Optional)</label>
                <input
                    type="text"
                    value={youtubeUrl}
                    onChange={(e) => setYoutubeUrl(e.target.value)}
                    placeholder="https://www.youtube.com/watch?v=..."
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-black"
                />
            </div>
          <div className="flex flex-col flex-grow">
            <label className="font-semibold mb-2">Video Transcript</label>
            <textarea
                value={transcript}
                onChange={(e) => setTranscript(e.target.value)}
                placeholder="Paste the full video transcript here..."
                className="flex-1 w-full p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-black resize-none"
            />
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
      
      <div className="flex-shrink-0 mt-8 flex justify-end">
         <button
            onClick={handleGenerate}
            disabled={status === 'loading' || !transcript.trim()}
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
