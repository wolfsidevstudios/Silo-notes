import React from 'react';
import { BackIcon } from './icons';
import { View } from '../types';

interface DocumentationViewProps {
  onBack: () => void;
}

const Section: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
  <section className="mb-12">
    <h2 className="text-3xl font-bold text-gray-900 mb-4 pb-2 border-b-2 border-gray-200">{title}</h2>
    <div className="prose prose-lg max-w-none text-gray-700">
      {children}
    </div>
  </section>
);

const IntegrationCard: React.FC<{ name: string; description: string }> = ({ name, description }) => (
    <div className="bg-gray-50 p-6 rounded-xl border border-gray-200 not-prose">
        <h4 className="font-bold text-xl text-gray-800 mb-2">{name}</h4>
        <p className="text-gray-600">{description}</p>
    </div>
)

const DocumentationView: React.FC<DocumentationViewProps> = ({ onBack }) => {
  return (
    <div className="p-8 lg:p-12 h-full flex flex-col">
      <header className="mb-10 flex-shrink-0">
        <button onClick={onBack} className="flex items-center text-sm font-semibold text-gray-500 hover:text-gray-800 transition-colors mb-4">
          <BackIcon />
          <span>Back to Settings</span>
        </button>
        <h1 className="text-5xl font-bold text-gray-900">Documentation</h1>
        <p className="text-xl text-gray-500 mt-2">Discover how Silo Notes brings your ideas to life.</p>
      </header>
      <div className="flex-grow overflow-y-auto pr-4 -mr-4">
        <div className="max-w-4xl mx-auto">
            <Section title="Welcome to Silo Labs">
                <p>
                    Silo Labs is our experimental playground where we develop and test powerful, standalone AI tools. These tools are designed to augment your creativity and productivity, from transforming your study habits to streamlining your professional tasks. Our goal is to push the boundaries of what a note-taking app can be.
                </p>
            </Section>

            <Section title="How Our Tools Work">
                <p>
                    We leverage cutting-edge third-party APIs to power the intelligent features in Silo Labs. Here’s a breakdown of the technology behind our tools:
                </p>
                <ul>
                    <li>
                        <strong>AI Writing & Study Tools:</strong> Tools like Summarize, Rewrite, Flashcard Generation, Quiz Generation, Concept Explainer, and YouTube to Notes are all powered by the <strong>Google Gemini API</strong>. When you provide your API key, your browser communicates directly with Google's powerful language models to process your text and generate insightful content. The YouTube tool specifically uses Google Search grounding to find and process video transcripts.
                    </li>
                     <li>
                        <strong>Infographic Generation:</strong> The "Notes to Infographic" tool uses Google's <strong>Imagen API</strong> to transform your text into a visual representation. This powerful text-to-image model creates a unique infographic based on the concepts in your notes.
                    </li>
                    <li>
                        <strong>Speech-to-Text:</strong> Live transcription in the Speech-to-Text tool and the main note editor is handled by the <strong>AssemblyAI API</strong>. It provides fast and accurate real-time transcription of your voice.
                    </li>
                    <li>
                        <strong>Text-to-Speech:</strong> High-quality, natural-sounding audio generation is powered by the <strong>ElevenLabs API</strong>. This allows you to convert any text into spoken word with a variety of voices.
                    </li>
                </ul>
            </Section>
            
             <Section title="Third-Party Integrations">
                <p>
                    Silo Notes integrates with best-in-class services to provide a rich user experience. Your privacy is paramount, so your API keys and data are handled securely on your own device.
                </p>
                <div className="grid md:grid-cols-2 gap-6 mt-6">
                    <IntegrationCard 
                        name="Google Gemini API"
                        description="The core of our AI features. Powers text generation, summarization, structured data extraction (for quizzes/flashcards), and more."
                    />
                     <IntegrationCard 
                        name="Google Imagen API"
                        description="A state-of-the-art text-to-image model from Google used to generate infographics from your notes."
                    />
                    <IntegrationCard 
                        name="AssemblyAI API"
                        description="Provides real-time, highly accurate speech-to-text transcription for voice typing and the standalone transcription tool."
                    />
                    <IntegrationCard 
                        name="ElevenLabs API"
                        description="Used for generating lifelike, high-quality audio from text, with support for multiple languages and voices."
                    />
                    <IntegrationCard 
                        name="Google Sign-In, Yahoo & Slack"
                        description="Handles secure authentication without requiring you to create a separate password for Silo Notes. We do not store your account information."
                    />
                     <IntegrationCard 
                        name="Slack"
                        description="Connect your Slack account to automatically sync your reminders and starred items as tasks, creating a unified view of your action items."
                    />
                </div>
            </Section>

             <Section title="Your Data & Privacy">
                <p>
                    We have a simple privacy philosophy: <strong>your data is yours</strong>.
                </p>
                <ul>
                    <li>All your notes, tasks, and other content are stored exclusively in your browser's local storage. We do not have a central server that stores your personal content.</li>
                    <li>Your third-party API keys (like your Gemini key) are also stored only in your browser's local storage. They are never sent to us.</li>
                    <li>When you use an AI tool, your browser sends the relevant data (e.g., the text to summarize) directly to the third-party service (e.g., Google). This data does not pass through our servers.</li>
                </ul>
                <p>
                    You are always in control of your data.
                </p>
            </Section>
        </div>
      </div>
    </div>
  );
};

export default DocumentationView;