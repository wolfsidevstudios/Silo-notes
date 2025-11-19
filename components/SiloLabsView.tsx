
import React, { useState, useEffect } from 'react';
import { View } from '../types';
import { SiloLabsIcon, SummarizeIcon, RewriteIcon, VoiceTypingIcon, VoiceMemoIcon, TextToSpeechIcon, SiloAiIcon, FlashcardIcon, QuizIcon, YouTubeIcon, ConceptExplainerIcon, InfographicIcon, ArrowUpIcon } from './icons';

interface SiloLabsViewProps {
  onViewChange: (view: View) => void;
}

const ToolCard: React.FC<{
  icon: React.ReactNode;
  title: string;
  description: string;
  onClick: () => void;
  isFeatured?: boolean;
  tags?: string[];
}> = ({ icon, title, description, onClick, isFeatured, tags }) => (
  <div
    onClick={onClick}
    className={`group relative p-6 rounded-2xl cursor-pointer transition-all duration-300 border hover:-translate-y-1 ${
        isFeatured 
        ? 'bg-gradient-to-br from-indigo-600 to-violet-600 text-white border-transparent shadow-xl md:col-span-2' 
        : 'bg-white border-gray-100 shadow-sm hover:shadow-lg hover:border-gray-200'
    }`}
  >
    <div className="flex justify-between items-start mb-4">
        <div className={`flex items-center justify-center h-12 w-12 rounded-xl ${isFeatured ? 'bg-white/20 text-white' : 'bg-gray-50 text-gray-900 group-hover:bg-gray-100'}`}>
            {icon}
        </div>
        {isFeatured && (
             <span className="bg-white/20 text-white text-xs font-bold px-3 py-1 rounded-full backdrop-blur-sm">Featured</span>
        )}
         {!isFeatured && (
             <div className="opacity-0 group-hover:opacity-100 transition-opacity text-gray-400">
                <ArrowUpIcon />
             </div>
        )}
    </div>
    
    <h3 className={`font-bold text-xl mb-2 ${isFeatured ? 'text-white' : 'text-gray-900'}`}>{title}</h3>
    <p className={`text-sm leading-relaxed ${isFeatured ? 'text-indigo-100' : 'text-gray-500'}`}>{description}</p>
    
    {tags && (
        <div className="mt-4 flex gap-2 flex-wrap">
            {tags.map(tag => (
                <span key={tag} className={`text-[10px] font-semibold px-2 py-1 rounded-md uppercase tracking-wider ${isFeatured ? 'bg-white/10 text-white' : 'bg-gray-100 text-gray-500'}`}>
                    {tag}
                </span>
            ))}
        </div>
    )}
  </div>
);

const CategoryHeader: React.FC<{ title: string }> = ({ title }) => (
    <h2 className="text-lg font-bold text-gray-900 uppercase tracking-wide mb-6 mt-10 first:mt-0 flex items-center gap-2">
        <span className="w-2 h-2 rounded-full bg-indigo-500"></span>
        {title}
    </h2>
);

const SiloLabsView: React.FC<SiloLabsViewProps> = ({ onViewChange }) => {
  const [isGeminiConfigured, setIsGeminiConfigured] = useState(false);

  useEffect(() => {
    const key = localStorage.getItem('gemini-api-key');
    setIsGeminiConfigured(!!key);
  }, []);

  return (
    <div className="h-full flex flex-col bg-gray-50/50">
      <header className="bg-white border-b border-gray-200 p-8 lg:p-12">
         <div className="max-w-7xl mx-auto">
            <div className="flex items-center mb-4">
                <div className="bg-indigo-50 p-3 rounded-2xl">
                    <SiloLabsIcon />
                </div>
                <h1 className="text-4xl font-extrabold text-gray-900 ml-4 tracking-tight">Kyndra Labs</h1>
            </div>
            <p className="text-xl text-gray-500 max-w-2xl leading-relaxed">
            Explore our suite of experimental AI tools designed to supercharge your productivity, learning, and creativity.
            </p>
         </div>
      </header>

      <div className="flex-grow overflow-y-auto p-8 lg:p-12">
        <div className="max-w-7xl mx-auto">
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
                <ToolCard
                    icon={<SiloAiIcon />}
                    title="Kyndra Chat"
                    description="Your intelligent creative partner. Create notes, set tasks, schedule meetings, and brainstorm ideas through a natural conversation."
                    onClick={() => onViewChange(View.SILO_CHAT)}
                    isFeatured={true}
                    tags={['Assistant', 'Productivity']}
                />
                 <ToolCard
                    icon={<VoiceTypingIcon />}
                    title="Speech-to-Text"
                    description="Accurate real-time transcription for meetings, lectures, and quick thoughts."
                    onClick={() => onViewChange(View.SPEECH_TO_TEXT_TOOL)}
                    tags={['Audio', 'Utility']}
                />
                 <ToolCard
                    icon={<TextToSpeechIcon />}
                    title="Text-to-Speech"
                    description="Convert written content into lifelike spoken audio. Perfect for accessibility and content creation."
                    onClick={() => onViewChange(View.TEXT_TO_SPEECH_TOOL)}
                     tags={['Audio', 'Utility']}
                />
            </div>

            <CategoryHeader title="Study & Research" />
            {isGeminiConfigured ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <ToolCard
                    icon={<SummarizeIcon />}
                    title="Summarizer"
                    description="Distill complex articles and documents into concise, easy-to-read summaries."
                    onClick={() => onViewChange(View.SUMMARIZE_TOOL)}
                    />
                    <ToolCard
                    icon={<ConceptExplainerIcon />}
                    title="Concept Explainer"
                    description="Understand difficult topics with simple, AI-generated analogies and explanations."
                    onClick={() => onViewChange(View.CONCEPT_EXPLAINER_TOOL)}
                    />
                    <ToolCard
                    icon={<FlashcardIcon />}
                    title="Flashcard Gen"
                    description="Automatically turn your notes into study-ready flashcard decks."
                    onClick={() => onViewChange(View.FLASHCARD_TOOL)}
                    />
                    <ToolCard
                    icon={<QuizIcon />}
                    title="Quiz Creator"
                    description="Generate practice quizzes from any text to test your knowledge."
                    onClick={() => onViewChange(View.QUIZ_TOOL)}
                    />
                    <ToolCard
                    icon={<YouTubeIcon />}
                    title="YouTube to Notes"
                    description="Extract key insights and structured notes from educational videos."
                    onClick={() => onViewChange(View.YOUTUBE_TO_NOTES_TOOL)}
                    />
                </div>
            ) : (
                <div className="bg-white border border-dashed border-gray-300 rounded-2xl p-8 text-center">
                    <div className="inline-flex items-center justify-center w-12 h-12 bg-gray-100 rounded-full mb-4 text-gray-400">
                        <SettingsIcon />
                    </div>
                    <h3 className="text-lg font-bold text-gray-900">Unlock Premium AI Tools</h3>
                    <p className="text-gray-500 mt-2 mb-6 max-w-md mx-auto">
                        Add your Gemini API key in Settings to access powerful study tools like Summarizer, Quiz Creator, and more.
                    </p>
                    <button
                        onClick={() => onViewChange(View.SETTINGS)}
                        className="bg-black text-white font-semibold py-2.5 px-6 rounded-full hover:bg-gray-800 transition-colors"
                    >
                        Configure Settings
                    </button>
                </div>
            )}

            <CategoryHeader title="Creative & Utilities" />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                 <ToolCard
                    icon={<RewriteIcon />}
                    title="Rewrite Tool"
                    description="Refine your writing style, tone, and clarity instantly."
                    onClick={() => isGeminiConfigured ? onViewChange(View.REWRITE_TOOL) : onViewChange(View.SETTINGS)}
                />
                <ToolCard
                    icon={<InfographicIcon />}
                    title="Infographic Maker"
                    description="Turn your text notes into visual infographics."
                    onClick={() => isGeminiConfigured ? onViewChange(View.NOTES_TO_INFOGRAPHIC_TOOL) : onViewChange(View.SETTINGS)}
                />
                <ToolCard
                    icon={<VoiceMemoIcon />}
                    title="Voice Memo"
                    description="Simple, reliable audio recording for quick captures."
                    onClick={() => onViewChange(View.VOICE_MEMO_TOOL)}
                />
                 <div className="p-6 rounded-2xl bg-gray-50 border border-gray-200 flex flex-col justify-center items-center text-center">
                    <span className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Coming Soon</span>
                    <h3 className="font-bold text-gray-600">Business Suite</h3>
                    <p className="text-xs text-gray-400 mt-1">Proposal generators & more</p>
                 </div>
            </div>

        </div>
      </div>
    </div>
  );
};

// Missing icon import fix
import { SettingsIcon } from './icons';

export default SiloLabsView;
