import React, { useState, useEffect } from 'react';
import { BackIcon, InfographicIcon } from './icons';
import { GoogleGenAI } from "@google/genai";

interface NotesToInfographicToolViewProps {
  onBack: () => void;
}

const NotesToInfographicToolView: React.FC<NotesToInfographicToolViewProps> = ({ onBack }) => {
  const [inputText, setInputText] = useState('');
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [status, setStatus] = useState<'idle' | 'loading' | 'error' | 'success'>('idle');
  const [error, setError] = useState('');
  const [geminiApiKey, setGeminiApiKey] = useState<string | null>(null);

  useEffect(() => {
    const key = localStorage.getItem('gemini-api-key');
    setGeminiApiKey(key);
  }, []);

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
        <h1 className="text-4xl font-bold text-gray-900">Notes to Infographic</h1>
        <p className="text-lg text-gray-500 mt-2">Visualize your key points by turning text into a compelling infographic.</p>
      </header>

      <div className="flex-grow grid grid-cols-1 md:grid-cols-2 gap-8 min-h-0">
        <div className="flex flex-col">
          <h2 className="font-semibold mb-2">Your Notes</h2>
          <textarea
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Paste your notes here..."
            className="flex-1 w-full p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-black resize-none"
          />
        </div>
        <div className="flex flex-col">
            <h2 className="font-semibold mb-2">Generated Infographic</h2>
            <div className="flex-1 w-full p-4 border border-gray-300 rounded-lg bg-gray-50 relative overflow-y-auto flex items-center justify-center">
              {status === 'loading' && (
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Generating image... this may take a minute.</p>
                  </div>
              )}
              {status === 'error' && <p className="text-red-500">{error}</p>}
              {status === 'success' && imageUrl && (
                <img src={imageUrl} alt="Generated Infographic" className="max-w-full max-h-full object-contain rounded-md" />
              )}
              {status === 'idle' && !imageUrl && <p className="text-gray-500 text-center">Your infographic will appear here.</p>}
            </div>
        </div>
      </div>
      
      <div className="flex-shrink-0 mt-8 flex justify-end">
         <button
            onClick={handleGenerate}
            disabled={status === 'loading' || !inputText.trim()}
            className="bg-black text-white font-semibold py-3 px-8 rounded-full hover:bg-gray-800 transition-colors disabled:bg-gray-400 flex items-center justify-center gap-2"
        >
            <InfographicIcon />
            {status === 'loading' ? 'Generating...' : 'Create Infographic'}
        </button>
      </div>
    </div>
  );
};

export default NotesToInfographicToolView;
