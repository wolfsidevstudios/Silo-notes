import React, { useState, useEffect } from 'react';

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
    const [phase, setPhase] = useState(0); // 0: intro, 1: carousel, 2: typing, 3: rewrite, 4: grid, 5: ai-timer, 6: ai-task, 7: loop
    const [subPhase, setSubPhase] = useState('start');
    const [typedText, setTypedText] = useState('');
    const [aiChatText, setAiChatText] = useState('');
    const [timerSeconds, setTimerSeconds] = useState(300);
    const [tasks, setTasks] = useState<{id: number, text: string}[]>([]);

    const noteText = "Brainstorming session for the new marketing campaign...\n- Key message: 'Simplicity is the ultimate sophistication.'\n- Target audience: Creative professionals, students.";
    const rewrittenNoteText = "Marketing Campaign Brainstorm:\n\nWe're targeting creative pros and students with a core message of sophisticated simplicity. Let's explore this concept further.";

    useEffect(() => {
        let timeout: number;
        let interval: number;

        const runAnimation = () => {
            switch (phase) {
                case 0: // Intro text
                    timeout = window.setTimeout(() => setPhase(1), 2500);
                    break;
                case 1: // Carousel
                    timeout = window.setTimeout(() => setPhase(2), 3000);
                    break;
                case 2: // Typing
                    if (subPhase === 'start') {
                        setSubPhase('typing');
                        interval = window.setInterval(() => {
                            setTypedText(prev => {
                                if (prev.length < noteText.length) {
                                    return noteText.substring(0, prev.length + 2);
                                }
                                clearInterval(interval);
                                setSubPhase('show-tools');
                                return prev;
                            });
                        }, 25);
                    }
                    if (subPhase === 'show-tools') {
                        timeout = window.setTimeout(() => setSubPhase('click-rewrite'), 1500);
                    }
                    if (subPhase === 'click-rewrite') {
                        timeout = window.setTimeout(() => setPhase(3), 500);
                    }
                    break;
                case 3: // Rewrite
                     if (subPhase !== 'done') {
                        setTypedText(rewrittenNoteText);
                        setSubPhase('click-save');
                        timeout = window.setTimeout(() => setSubPhase('done'), 1500);
                     }
                     if (subPhase === 'done') {
                         timeout = window.setTimeout(() => setPhase(4), 500);
                     }
                    break;
                case 4: // Grid
                    timeout = window.setTimeout(() => setPhase(5), 3000);
                    break;
                case 5: // AI Timer
                    if (subPhase === 'done') {
                        setSubPhase('typing-timer');
                        const timerText = "start a 5 minute timer";
                        interval = window.setInterval(() => {
                            setAiChatText(prev => {
                                if(prev.length < timerText.length) {
                                    return timerText.substring(0, prev.length + 1);
                                }
                                clearInterval(interval);
                                setSubPhase('show-timer');
                                return prev;
                            });
                        }, 50);
                    }
                     if (subPhase === 'show-timer') {
                        interval = window.setInterval(() => setTimerSeconds(s => s > 0 ? s - 1 : 0), 10);
                        timeout = window.setTimeout(() => {
                           clearInterval(interval);
                           setPhase(6);
                        }, 2500);
                    }
                    break;
                case 6: // AI Task
                    if (phase === 6 && subPhase !== 'start') {
                       setSubPhase('typing-task');
                       setAiChatText('');
                       const taskText = "add a task to buy groceries";
                       interval = window.setInterval(() => {
                           setAiChatText(prev => {
                               if (prev.length < taskText.length) return taskText.substring(0, prev.length + 1);
                               clearInterval(interval);
                               setSubPhase('show-task');
                               return prev;
                           });
                       }, 50);
                    }
                    if (subPhase === 'show-task') {
                        setTasks([{id: 1, text: 'Buy groceries'}]);
                        timeout = window.setTimeout(() => setPhase(7), 2500);
                    }
                    break;
                case 7: // Loop
                     // Reset all states for looping
                    setTypedText('');
                    setAiChatText('');
                    setTimerSeconds(300);
                    setTasks([]);
                    setSubPhase('start');
                    setPhase(0); // Go back to start
                    break;
            }
        };

        runAnimation();

        return () => {
            clearTimeout(timeout);
            clearInterval(interval);
        };
    }, [phase, subPhase]);


    return (
        <section className="py-20 sm:py-24 bg-white">
            <div className="mx-auto max-w-5xl px-6 lg:px-8">
                <div className="relative w-full h-96 bg-gray-100 rounded-2xl shadow-xl overflow-hidden flex items-center justify-center p-4">
                    
                    {/* Phase 0: Intro */}
                    <div className={`absolute inset-0 flex items-center justify-center transition-opacity duration-500 ${phase === 0 ? 'opacity-100' : 'opacity-0'}`}>
                        <h2 className="text-4xl lg:text-5xl font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-gray-900 to-gray-600">Introducing Silo Notes</h2>
                    </div>

                    {/* Phase 1: Carousel */}
                    <div className={`absolute inset-0 flex items-center justify-center transition-opacity duration-500 ${phase === 1 ? 'opacity-100' : 'opacity-0'}`}>
                         <div className="absolute w-[900px] flex gap-4 animate-carousel">
                            <div className="w-60 h-60 bg-yellow-200 rounded-lg p-4 shadow-lg"><h3 className="font-bold">Quick Idea</h3><p className="text-sm">A sticky note for thoughts.</p></div>
                            <div className="w-60 h-60 bg-gray-50 rounded-lg p-4 shadow-lg border"><h3 className="font-bold">Project Plan</h3><p className="text-sm">A classic note for details.</p></div>
                            <div className="w-60 h-60 bg-amber-50 rounded-lg p-4 shadow-lg border"><h3 className="font-bold">Daily Reflection</h3><p className="text-sm">A journal entry.</p></div>
                            <div className="w-60 h-60 bg-blue-200 rounded-lg p-4 shadow-lg"><h3 className="font-bold">To-Do List</h3><p className="text-sm">- Item 1</p></div>
                         </div>
                    </div>

                    {/* Phase 2 & 3: Notepad UI */}
                    <div className={`absolute inset-0 transition-opacity duration-500 ${phase === 2 || phase === 3 ? 'opacity-100' : 'opacity-0'}`}>
                        <div className="w-full h-full bg-white rounded-lg flex flex-col p-6 lg:p-8">
                            <div className="flex items-center justify-between mb-4 flex-shrink-0">
                                <h1 className="text-2xl font-bold text-gray-400">Classic Note</h1>
                                <button className={`font-semibold py-2 px-6 rounded-full transition-all duration-300 ${subPhase === 'click-save' ? 'bg-green-600 text-white' : 'bg-black text-white'}`}>
                                    {subPhase === 'click-save' ? 'Saved!' : 'Save Note'}
                                </button>
                            </div>
                            <div className="flex-grow flex flex-col overflow-hidden">
                                <div className="text-4xl font-bold text-gray-800 mb-4 pb-2 border-b border-gray-200">
                                    Marketing Campaign
                                </div>
                                <div className="flex-1 w-full text-lg leading-relaxed text-gray-700">
                                    <pre className="whitespace-pre-wrap font-sans transition-opacity duration-500">{typedText}{phase === 2 && subPhase === 'typing' && <span className="blinking-cursor">|</span>}</pre>
                                </div>
                                <div className={`flex-shrink-0 mt-4 flex items-center justify-center gap-2 flex-wrap transition-opacity duration-500 ${subPhase.startsWith('show-tools') || subPhase.startsWith('click-rewrite') ? 'opacity-100' : 'opacity-0'}`}>
                                    <button className="flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-full bg-white border border-gray-200">Summarize</button>
                                    <button className={`flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-full bg-white border border-gray-200 transition-all ${subPhase === 'click-rewrite' ? 'bg-black text-white scale-95' : ''}`}>Rewrite</button>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                     {/* Phase 4: Grid View */}
                    <div className={`absolute inset-0 grid grid-cols-3 gap-4 p-4 transition-opacity duration-500 ${phase === 4 ? 'opacity-100' : 'opacity-0'}`}>
                        <div className="bg-white p-2 rounded-lg shadow-md animate-fade-in-up" style={{animationDelay: '0s'}}><p className="font-bold text-xs">Campaign</p><p className="text-xs">Rewritten marketing...</p></div>
                        <div className="bg-yellow-200 p-2 rounded-lg shadow-md animate-fade-in-up" style={{animationDelay: '0.1s'}}><p className="font-bold text-xs">Quick Idea</p></div>
                        <div className="bg-white p-2 rounded-lg shadow-md animate-fade-in-up" style={{animationDelay: '0.2s'}}><p className="font-bold text-xs">Meeting Notes</p></div>
                        <div className="bg-amber-100 p-2 rounded-lg shadow-md animate-fade-in-up" style={{animationDelay: '0.15s'}}><p className="font-bold text-xs">Journal</p></div>
                        <div className="bg-white p-2 rounded-lg shadow-md animate-fade-in-up" style={{animationDelay: '0.25s'}}><p className="font-bold text-xs">Book List</p></div>
                        <div className="bg-blue-200 p-2 rounded-lg shadow-md animate-fade-in-up" style={{animationDelay: '0.3s'}}><p className="font-bold text-xs">Recipe</p></div>
                    </div>

                    {/* Phase 5 & 6: AI Chat */}
                     <div className={`absolute inset-0 flex flex-col items-center justify-center gap-8 transition-opacity duration-500 ${phase === 5 || phase === 6 ? 'opacity-100' : 'opacity-0'}`}>
                        {/* AI Bar */}
                        <div className="w-[500px] h-14 bg-white rounded-full shadow-lg border flex items-center px-4 gap-2">
                             <p className="flex-1 text-sm">{aiChatText}<span className="blinking-cursor">|</span></p>
                             <div className="w-10 h-10 bg-black text-white rounded-full"></div>
                        </div>
                        {/* Timer UI */}
                        <div className={`bg-black text-white w-80 rounded-3xl p-6 text-center transition-opacity duration-500 ${subPhase === 'show-timer' ? 'opacity-100' : 'opacity-0'}`}>
                            <p className="text-5xl font-mono">{Math.floor(timerSeconds / 60).toString().padStart(2, '0')}:{(timerSeconds % 60).toString().padStart(2, '0')}</p>
                        </div>
                        {/* Task UI */}
                         <div className={`bg-white p-6 rounded-2xl shadow-sm border w-[500px] transition-opacity duration-500 ${subPhase === 'show-task' ? 'opacity-100' : 'opacity-0'}`}>
                            <h2 className="text-2xl font-semibold text-gray-800 mb-4">Tasks</h2>
                            {tasks.map(task => <div key={task.id} className="flex items-center gap-3 p-2 bg-gray-50 rounded-md"><input type="checkbox" className="h-5 w-5 rounded" /><span>{task.text}</span></div>)}
                         </div>
                    </div>

                </div>
            </div>
            <style>{`
                .blinking-cursor { animation: blink 1s step-end infinite; } 
                @keyframes blink { 50% { opacity: 0; } }
                @keyframes carousel {
                    0% { transform: translateX(0); }
                    100% { transform: translateX(-300px); }
                }
                .animate-carousel { animation: carousel 3s linear infinite; }
                @keyframes fade-in-up {
                    from { opacity: 0; transform: translateY(20px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .animate-fade-in-up { animation: fade-in-up 0.5s ease-out forwards; }
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
                        <img src="https://i.ibb.co/7J7XQxy/IMG-3995.png" alt="Silo Notes Logo" className="w-6 h-6" />
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