import React, { useState, useEffect } from 'react';
import { View } from '../types';
import { SiloLabsIcon, SummarizeIcon, RewriteIcon, VoiceTypingIcon, VoiceMemoIcon, TextToSpeechIcon, SiloAiIcon, FlashcardIcon, QuizIcon, YouTubeIcon, ConceptExplainerIcon } from './icons';

interface SiloLabsViewProps {
  onViewChange: (view: View) => void;
}

const ToolCard: React.FC<{
  icon: React.ReactNode;
  title: string;
  description: string;
  onClick: () => void;
  isFeatured?: boolean;
}> = ({ icon, title, description, onClick, isFeatured }) => (
  <div
    onClick={onClick}
    className={`p-6 rounded-lg cursor-pointer hover:shadow-md hover:-translate-y-1 transition-all duration-200 border ${
        isFeatured ? 'bg-indigo-50 border-indigo-200 md:col-span-2' : 'bg-gray-50 border-gray-200'
    }`}
  >
    <div className={`flex items-center justify-center h-12 w-12 rounded-full mb-4 ${isFeatured ? 'bg-indigo-100' : 'bg-gray-200'}`}>
      {icon}
    </div>
    <h3 className="font-bold text-lg mb-2 text-gray-800">{title}</h3>
    <p className="text-gray-600 text-sm">{description}</p>
  </div>
);

const SiloLabsView: React.FC<SiloLabsViewProps> = ({ onViewChange }) => {
  const [isGeminiConfigured, setIsGeminiConfigured] = useState(false);

  useEffect(() => {
    const key = localStorage.getItem('gemini-api-key');
    setIsGeminiConfigured(!!key);
  }, []);

  return (
    <div className="p-8 lg:p-12">
      <header className="mb-10">
         <div className="flex items-center mb-2">
           <div className="bg-blue-100 p-2 rounded-full">
              <SiloLabsIcon />
           </div>
           <h1 className="text-4xl font-bold text-gray-900 ml-4">Silo Labs</h1>
        </div>
        <p className="text-lg text-gray-500 mt-2">
          An experimental playground for powerful, standalone AI tools.
        </p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
         <ToolCard
            icon={<SiloAiIcon />}
            title="Silo Chat"
            description="An intelligent agent to help you create notes, tasks, meetings, and more, just by talking."
            onClick={() => onViewChange(View.SILO_CHAT)}
            isFeatured={true}
          />
         <ToolCard
            icon={<VoiceTypingIcon />}
            title="Speech-to-Text"
            description="Record your voice and get a live, accurate transcription. Ideal for capturing meetings or lectures."
            onClick={() => onViewChange(View.SPEECH_TO_TEXT_TOOL)}
          />
          <ToolCard
            icon={<VoiceMemoIcon />}
            title="Voice Memo"
            description="Quickly record audio notes. Perfect for capturing thoughts and ideas on the go."
            onClick={() => onViewChange(View.VOICE_MEMO_TOOL)}
          />
          <ToolCard
            icon={<TextToSpeechIcon />}
            title="Text-to-Speech"
            description="Create high-quality audio from text using a variety of realistic AI voices."
            onClick={() => onViewChange(View.TEXT_TO_SPEECH_TOOL)}
          />
        {isGeminiConfigured ? (
          <>
            <ToolCard
              icon={<SummarizeIcon />}
              title="Summarize Tool"
              description="Condense long texts into concise summaries. Perfect for articles, reports, and more."
              onClick={() => onViewChange(View.SUMMARIZE_TOOL)}
            />
            <ToolCard
              icon={<RewriteIcon />}
              title="Rewrite Tool"
              description="Rephrase your text to change its tone, improve clarity, or simply find a new perspective."
              onClick={() => onViewChange(View.REWRITE_TOOL)}
            />
            <ToolCard
              icon={<FlashcardIcon />}
              title="Notes to Flashcards"
              description="Automatically generate flashcards from your notes to help you study and memorize key information."
              onClick={() => onViewChange(View.FLASHCARD_TOOL)}
            />
            <ToolCard
              icon={<QuizIcon />}
              title="Notes to Quiz"
              description="Turn your study materials into interactive quizzes to test your knowledge and prepare for exams."
              onClick={() => onViewChange(View.QUIZ_TOOL)}
            />
             <ToolCard
              icon={<YouTubeIcon />}
              title="YouTube to Notes"
              description="Paste a video transcript to instantly create well-structured, beautiful notes from educational content."
              onClick={() => onViewChange(View.YOUTUBE_TO_NOTES_TOOL)}
            />
            <ToolCard
              icon={<ConceptExplainerIcon />}
              title="Concept Explainer"
              description="Struggling with a complex topic? Paste it here and get a simple, easy-to-understand explanation."
              onClick={() => onViewChange(View.CONCEPT_EXPLAINER_TOOL)}
            />
          </>
        ) : (
           <div className="md:col-span-2 lg:col-span-3">
             <div className="text-center p-6 h-full flex flex-col items-center justify-center bg-gray-50 rounded-lg border-2 border-dashed">
                <h2 className="text-lg font-semibold text-gray-700">Unlock More AI Tools</h2>
                <p className="text-gray-500 text-sm mt-2 mb-4 max-w-md">
                    Add your Gemini API key in settings to access Summarize, Rewrite, and a suite of powerful new study tools.
                </p>
                <button
                    onClick={() => onViewChange(View.SETTINGS)}
                    className="bg-black text-white font-semibold py-2 px-4 rounded-full hover:bg-gray-800 transition-colors text-sm"
                >
                    Go to Settings
                </button>
            </div>
           </div>
        )}
      </div>
    </div>
  );
};

export default SiloLabsView;