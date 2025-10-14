import React, { useState, useEffect } from 'react';
import { AppLogoIcon } from './icons';

// Icons for the feature section
const FeatureIcon1 = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
    </svg>
);
const FeatureIcon2 = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14" />
    </svg>
);
const FeatureIcon3 = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
);
const FeatureIcon4 = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
    </svg>
);


const FaqItem = ({ question, answer }: { question: string; answer: string }) => {
    const [isOpen, setIsOpen] = useState(false);
    return (
        <div className="border-b">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex justify-between items-center w-full py-5 text-left"
            >
                <span className="text-lg font-medium text-gray-800">{question}</span>
                <svg
                    className={`w-6 h-6 transform transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                </svg>
            </button>
            <div className={`overflow-hidden transition-all duration-300 ease-in-out ${isOpen ? 'max-h-96' : 'max-h-0'}`}>
                <p className="pb-5 pr-10 text-gray-600">{answer}</p>
            </div>
        </div>
    );
};

const AppPreviewAnimation = () => {
    const [phase, setPhase] = useState('intro');
    const [typedNote, setTypedNote] = useState('');
    const [typedChat, setTypedChat] = useState('');
    const [timer, setTimer] = useState(300);
    const [showTask, setShowTask] = useState(false);

    const fullNoteText = "Brainstorming session for the new marketing campaign...\n- Key message: 'Simplicity is the ultimate sophistication.'\n- Target audience: Creative professionals, students.";
    const rewrittenNoteText = "Marketing Campaign Brainstorm:\n\nWe're targeting creative pros and students with a core message of sophisticated simplicity. Let's explore this concept further.";
    const timerChatText = "start a 5 minute timer";
    const taskChatText = "add a task to buy groceries";

    useEffect(() => {
        let timeout: number;
        let interval: number;

        const typeText = (text: string, setter: React.Dispatch<React.SetStateAction<string>>, onComplete: () => void) => {
            let i = 0;
            setter('');
            interval = window.setInterval(() => {
                i++;
                setter(text.substring(0, i));
                if (i >= text.length) {
                    clearInterval(interval);
                    onComplete();
                }
            }, 30);
        };

        const sequence: Record<string, () => void> = {
            intro: () => timeout = window.setTimeout(() => setPhase('note-start'), 2500),
            'note-start': () => typeText(fullNoteText, setTypedNote, () => setPhase('note-tools')),
            'note-tools': () => timeout = window.setTimeout(() => setPhase('note-rewrite'), 1500),
            'note-rewrite': () => timeout = window.setTimeout(() => setPhase('note-save'), 1500),
            'note-save': () => timeout = window.setTimeout(() => setPhase('grid-view'), 2000),
            'grid-view': () => timeout = window.setTimeout(() => setPhase('ai-timer-start'), 3000),
            'ai-timer-start': () => typeText(timerChatText, setTypedChat, () => setPhase('ai-timer-show')),
            'ai-timer-show': () => {
                interval = window.setInterval(() => setTimer(s => Math.max(0, s - 1)), 10);
                timeout = window.setTimeout(() => { clearInterval(interval); setPhase('ai-task-start'); }, 2500);
            },
            'ai-task-start': () => typeText(taskChatText, setTypedChat, () => setPhase('ai-task-show')),
            'ai-task-show': () => {
                setShowTask(true);
                timeout = window.setTimeout(() => setPhase('outro'), 2500);
            },
            outro: () => timeout = window.setTimeout(() => {
                // Reset states for loop
                setTypedNote('');
                setTypedChat('');
                setTimer(300);
                setShowTask(false);
                setPhase('intro');
            }, 1000)
        };
        
        sequence[phase]?.();

        return () => {
            clearTimeout(timeout);
            clearInterval(interval);
        };
    }, [phase]);

    const isActive = (phases: string[]) => phases.includes(phase);

    return (
        <section className="py-20 sm:py-24 bg-white">
            <div className="mx-auto max-w-5xl px-6 lg:px-8">
                <div className="relative w-full h-[26rem] bg-gray-100 rounded-2xl shadow-xl overflow-hidden p-4">
                    <div className="absolute inset-0 bg-gradient-to-br from-indigo-100 via-purple-100 to-pink-100 animate-gradient-pan" style={{ backgroundSize: '200% 200%' }}></div>

                    {/* Intro Scene */}
                    <div className={`scene-container justify-center ${isActive(['intro']) ? 'active' : ''}`}>
                        <h2 className="text-4xl lg:text-5xl font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-gray-900 to-gray-600 animate-text-in">Introducing Silo Notes</h2>
                    </div>

                    {/* Note & Grid Scene */}
                    <div className={`scene-container transition-transform,opacity duration-1000 ease-in-out ${isActive(['note-start', 'note-tools', 'note-rewrite', 'note-save', 'grid-view']) ? 'active' : ''} ${isActive(['grid-view']) ? 'scale-30 -translate-x-2/3 -translate-y-2/3' : ''}`}>
                         <div className="w-full h-full bg-white/80 backdrop-blur-sm rounded-lg flex flex-col p-6 lg:p-8">
                            <div className="flex items-center justify-between mb-4 flex-shrink-0 animate-pop-in">
                                <h1 className="text-2xl font-bold text-gray-400">Classic Note</h1>
                                <button className={`font-semibold py-2 px-6 rounded-full transition-all duration-300 ${isActive(['note-save']) ? 'bg-green-600 text-white' : 'bg-black text-white'}`}>
                                    {isActive(['note-save']) ? 'Saved!' : 'Save Note'}
                                </button>
                            </div>
                            <div className="flex-grow flex flex-col overflow-hidden">
                                <div className="text-4xl font-bold text-gray-800 mb-4 pb-2 border-b border-gray-200 animate-pop-in" style={{ animationDelay: '0.2s' }}>Marketing Campaign</div>
                                <div className="flex-1 w-full text-lg leading-relaxed text-gray-700">
                                    <pre className="whitespace-pre-wrap font-sans transition-opacity duration-500 animate-pop-in" style={{ animationDelay: '0.3s' }}>
                                        {isActive(['note-rewrite', 'note-save', 'grid-view']) ? rewrittenNoteText : typedNote}
                                        {isActive(['note-start']) && <span className="blinking-cursor">|</span>}
                                    </pre>
                                </div>
                                <div className={`flex-shrink-0 mt-4 flex items-center justify-center gap-2 flex-wrap transition-all duration-500 ${isActive(['note-tools', 'note-rewrite']) ? 'opacity-100 scale-100' : 'opacity-0 scale-90'}`}>
                                    <button className="flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-full bg-white border border-gray-200 animate-pop-in" style={{ animationDelay: '0.4s' }}>Summarize</button>
                                    <button className={`flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-full bg-white border border-gray-200 transition-all animate-pop-in ${isActive(['note-rewrite']) ? 'bg-black text-white scale-95' : ''}`} style={{ animationDelay: '0.5s' }}>Rewrite</button>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    {/* Grid Items */}
                    <div className={`absolute inset-0 grid grid-cols-3 grid-rows-2 gap-4 p-4 ${isActive(['grid-view']) ? '' : 'pointer-events-none'}`}>
                        <div className={`bg-yellow-200 p-2 rounded-lg shadow-md grid-item ${isActive(['grid-view']) ? 'active' : ''}`} style={{ transitionDelay: '0.2s' }}><p className="font-bold text-xs">Quick Idea</p></div>
                        <div className={`bg-white p-2 rounded-lg shadow-md grid-item ${isActive(['grid-view']) ? 'active' : ''}`} style={{ transitionDelay: '0.3s' }}><p className="font-bold text-xs">Meeting Notes</p></div>
                        <div className={`bg-amber-100 p-2 rounded-lg shadow-md grid-item ${isActive(['grid-view']) ? 'active' : ''}`} style={{ transitionDelay: '0.25s' }}><p className="font-bold text-xs">Journal</p></div>
                        <div className={`bg-white p-2 rounded-lg shadow-md grid-item ${isActive(['grid-view']) ? 'active' : ''}`} style={{ transitionDelay: '0.35s' }}><p className="font-bold text-xs">Book List</p></div>
                        <div className={`bg-blue-200 p-2 rounded-lg shadow-md grid-item ${isActive(['grid-view']) ? 'active' : ''}`} style={{ transitionDelay: '0.4s' }}><p className="font-bold text-xs">Recipe</p></div>
                    </div>

                    {/* AI Scenes */}
                    <div className={`scene-container flex-col gap-8 justify-center ${isActive(['ai-timer-start', 'ai-timer-show', 'ai-task-start', 'ai-task-show']) ? 'active' : ''}`}>
                        <div className={`w-[500px] h-14 bg-white/80 backdrop-blur-sm rounded-full shadow-lg border flex items-center px-4 gap-2 transition-all duration-500 ${isActive(['ai-timer-start', 'ai-task-start']) ? 'opacity-100 scale-100' : 'opacity-0 scale-90'}`}>
                             <p className="flex-1 text-sm">{typedChat}{isActive(['ai-timer-start', 'ai-task-start']) && <span className="blinking-cursor">|</span>}</p>
                             <div className="w-10 h-10 bg-black text-white rounded-full"></div>
                        </div>
                        <div className={`bg-black text-white w-80 rounded-3xl p-6 text-center transition-all duration-500 ${isActive(['ai-timer-show']) ? 'opacity-100 scale-100' : 'opacity-0 scale-90'}`}>
                            <p className="text-5xl font-mono">{Math.floor(timer / 60).toString().padStart(2, '0')}:{(timer % 60).toString().padStart(2, '0')}</p>
                        </div>
                         <div className={`bg-white p-6 rounded-2xl shadow-sm border w-[500px] transition-all duration-500 ${isActive(['ai-task-show']) ? 'opacity-100 scale-100' : 'opacity-0 scale-90'}`}>
                            <h2 className="text-2xl font-semibold text-gray-800 mb-4">Tasks</h2>
                            <div className={`flex items-center gap-3 p-2 bg-gray-50 rounded-md transition-all duration-500 ${showTask ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2'}`}><input type="checkbox" className="h-5 w-5 rounded" /><span>Buy groceries</span></div>
                         </div>
                    </div>

                </div>
            </div>
            <style>{`
                .blinking-cursor { animation: blink 1s step-end infinite; } 
                @keyframes blink { 50% { opacity: 0; } }
                @keyframes gradient-pan { 0% { background-position: 0% 50%; } 50% { background-position: 100% 50%; } 100% { background-position: 0% 50%; } }
                .animate-gradient-pan { animation: gradient-pan 15s ease infinite; }
                
                .scene-container { position: absolute; inset: 0; display: flex; align-items: center; opacity: 0; transition: opacity 0.7s ease-in-out; pointer-events: none; }
                .scene-container.active { opacity: 1; pointer-events: auto; }
                
                @keyframes text-in { from { opacity: 0; transform: scale(0.9); } to { opacity: 1; transform: scale(1); } }
                .animate-text-in { animation: text-in 1s ease-out forwards; }
                
                @keyframes pop-in { from { opacity: 0; transform: scale(0.8); } to { opacity: 1; transform: scale(1); } }
                .animate-pop-in { animation: pop-in 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards; opacity: 0; }

                .grid-item { opacity: 0; transform: translateY(20px); transition: opacity 0.5s ease-out, transform 0.5s ease-out; }
                .grid-item.active { opacity: 1; transform: translateY(0); }
            `}</style>
        </section>
    );
};

const LandingPage: React.FC = () => {
    return (
        <div className="bg-white text-gray-800 font-sans">
            {/* Header */}
            <header className="fixed top-6 left-1/2 -translate-x-1/2 z-50">
                <nav className="flex items-center gap-4 bg-white/70 backdrop-blur-xl rounded-full shadow-lg px-6 py-3 border border-white/80">
                    <div className="flex items-center">
                        <AppLogoIcon className="w-6 h-6" />
                        <span className="ml-2 font-bold text-md">Silo Notes</span>
                    </div>
                    <a href="#/login" className="bg-black text-white font-semibold py-2 px-5 rounded-full text-sm hover:bg-gray-800 transition-colors">
                        Login
                    </a>
                </nav>
            </header>

            {/* Main Content */}
            <main>
                {/* Hero Section */}
                <section className="min-h-screen flex items-center justify-center text-center px-4 bg-gray-50">
                    <div className="max-w-3xl">
                        <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-gray-900">
                            Your Ideas, <span className="text-gray-500">Organized.</span>
                        </h1>
                        <p className="mt-6 text-lg md:text-xl text-gray-600 max-w-2xl mx-auto">
                            Silo Notes is a modern, minimalist note-taking app designed for creative individuals. Organize your thoughts, create detailed notes, and explore new ideas seamlessly with the power of AI.
                        </p>
                        <a href="#/login" className="mt-10 inline-block bg-black text-white font-semibold py-4 px-8 rounded-full text-lg hover:bg-gray-800 transition-colors">
                            Get Started for Free
                        </a>
                    </div>
                </section>
                
                <AppPreviewAnimation />
                
                {/* Features Section */}
                <section id="features" className="py-20 sm:py-32 bg-gray-50">
                    <div className="mx-auto max-w-7xl px-6 lg:px-8">
                        <div className="mx-auto max-w-2xl lg:text-center">
                            <h2 className="text-base font-semibold leading-7 text-indigo-600">Your Creative Hub</h2>
                            <p className="mt-2 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">All Your Ideas in One Place</p>
                            <p className="mt-6 text-lg leading-8 text-gray-600">
                                From quick thoughts to detailed projects, Silo Notes provides the tools you need to capture and develop your ideas effectively.
                            </p>
                        </div>
                        <div className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-4xl">
                            <dl className="grid max-w-xl grid-cols-1 gap-x-8 gap-y-10 lg:max-w-none lg:grid-cols-2 lg:gap-y-16">
                                <div className="relative pl-16">
                                    <dt className="text-base font-semibold leading-7 text-gray-900">
                                        <div className="absolute left-0 top-0 flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-100">
                                            <FeatureIcon1 />
                                        </div>
                                        AI-Powered Tools
                                    </dt>
                                    <dd className="mt-2 text-base leading-7 text-gray-600">Enhance your writing with built-in AI. Summarize long texts, rewrite sentences for clarity, and dictate notes with speech-to-text.</dd>
                                </div>
                                <div className="relative pl-16">
                                    <dt className="text-base font-semibold leading-7 text-gray-900">
                                        <div className="absolute left-0 top-0 flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-100">
                                            <FeatureIcon2 />
                                        </div>
                                        Organize with Spaces & Boards
                                    </dt>
                                    <dd className="mt-2 text-base leading-7 text-gray-600">Group your notes into dedicated 'Spaces' for different projects or areas of your life. Use Boards for mind maps, workflows, and more.</dd>
                                </div>
                                <div className="relative pl-16">
                                    <dt className="text-base font-semibold leading-7 text-gray-900">
                                        <div className="absolute left-0 top-0 flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-100">
                                            <FeatureIcon3 />
                                        </div>
                                        Multiple Note Types
                                    </dt>
                                    <dd className="mt-2 text-base leading-7 text-gray-600">Choose from Classic notes for long-form writing, Journals for daily entries, or colorful Sticky Notes for quick thoughts.</dd>
                                </div>
                                <div className="relative pl-16">
                                    <dt className="text-base font-semibold leading-7 text-gray-900">
                                        <div className="absolute left-0 top-0 flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-100">
                                             <FeatureIcon4 />
                                        </div>
                                        Private & Secure
                                    </dt>
                                    <dd className="mt-2 text-base leading-7 text-gray-600">All your data is stored directly in your browser's local storage. We never see or store your notes, ensuring your privacy is protected.</dd>
                                </div>
                            </dl>
                        </div>
                    </div>
                </section>

                {/* FAQ Section */}
                <section id="faq" className="bg-white py-20 sm:py-32">
                    <div className="mx-auto max-w-3xl px-6 lg:px-8">
                        <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl text-center">Frequently Asked Questions</h2>
                        <div className="mt-12">
                             <FaqItem
                                question="Is Silo Notes free to use?"
                                answer="Yes, Silo Notes is completely free to use. Advanced AI features require you to provide your own Gemini API key, which may have associated costs from Google, but the core note-taking functionality is free."
                            />
                             <FaqItem
                                question="Where is my data stored?"
                                answer="Your privacy is our priority. All your notes, tasks, and other data are stored exclusively in your browser's local storage on your device. We do not have a server, and we never have access to your content."
                            />
                             <FaqItem
                                question="Can I access my notes on other devices?"
                                answer="Currently, because all data is stored locally in your browser, your notes are tied to the specific browser on the device you used to create them. We are exploring sync options for the future."
                            />
                             <FaqItem
                                question="What AI features are available?"
                                answer="You can use powerful AI tools like summarizing, rewriting, speech-to-text transcription, and text-to-speech generation. Just add your own Gemini API key in the settings to unlock these features."
                            />
                        </div>
                    </div>
                </section>
                
                {/* CTA Section */}
                <section className="bg-gray-50 py-20 sm:py-24">
                    <div className="mx-auto max-w-7xl px-6 lg:px-8 text-center">
                        <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">Ready to get started?</h2>
                        <p className="mt-4 text-lg leading-8 text-gray-600">Start organizing your thoughts today. It's free.</p>
                        <a href="#/login" className="mt-10 inline-block bg-black text-white font-semibold py-4 px-8 rounded-full text-lg hover:bg-gray-800 transition-colors">
                            Create Your First Note
                        </a>
                    </div>
                </section>
            </main>

            {/* Footer */}
            <footer className="bg-white border-t py-8 px-4">
                <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center text-center md:text-left">
                    <p className="text-sm text-gray-500">&copy; {new Date().getFullYear()} Silo Notes. All rights reserved.</p>
                    <div className="flex gap-6 mt-4 md:mt-0">
                        <a href="#/privacy" className="text-sm text-gray-600 hover:text-black transition-colors">Privacy Policy</a>
                        <a href="#/terms" className="text-sm text-gray-600 hover:text-black transition-colors">Terms of Service</a>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default LandingPage;