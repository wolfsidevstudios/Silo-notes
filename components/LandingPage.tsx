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
    const [phase, setPhase] = useState(0); // 0: typing, 1: secure, 2: ai, 3: modern
    const [typedText, setTypedText] = useState('');
    const [showSave, setShowSave] = useState(false);
    const textToType = "Brainstorming session for the new marketing campaign...\n\n- Key message: 'Simplicity is the ultimate sophistication.'\n- Target audience: Creative professionals, students.\n- Channels: Social media, blog posts, partnerships.";
    const animatedTexts = ["Save and secure", "AI Powered", "Modern UI"];

    useEffect(() => {
        if (phase === 0) {
            const typingInterval = setInterval(() => {
                setTypedText(prev => {
                    if (prev.length < textToType.length) {
                        return textToType.substring(0, prev.length + 1);
                    }
                    clearInterval(typingInterval);
                    setTimeout(() => setShowSave(true), 500);
                    setTimeout(() => setPhase(1), 2500); // Wait after typing and saving
                    return prev;
                });
            }, 30);
            return () => clearInterval(typingInterval);
        }
        if (phase > 0 && phase <= animatedTexts.length) {
            const textTimeout = setTimeout(() => {
                setPhase(p => p + 1);
            }, 2500); // Each text shows for 2.5s
            return () => clearTimeout(textTimeout);
        }
    }, [phase]);

    return (
        <section className="py-20 sm:py-24 bg-white">
            <div className="mx-auto max-w-5xl px-6 lg:px-8">
                <div className="relative w-full h-96 bg-gray-100 rounded-2xl shadow-xl overflow-hidden flex items-center justify-center p-4">
                    {/* Notepad UI */}
                    <div className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${phase > 0 ? 'opacity-0' : 'opacity-100'}`}>
                        <div className="w-full h-full bg-white rounded-lg flex flex-col">
                            <div className="flex-shrink-0 h-14 bg-gray-50/80 border-b p-4 flex items-center justify-between">
                                <p className="font-bold text-lg text-gray-800">New Note</p>
                                <button className={`px-5 py-1.5 text-sm font-semibold rounded-full transition-colors ${showSave ? 'bg-green-600 text-white' : 'bg-black text-white'}`}>
                                    {showSave ? 'Saved!' : 'Save'}
                                </button>
                            </div>
                            <div className="flex-grow p-6 font-mono text-gray-700 text-sm overflow-y-auto">
                                <pre className="whitespace-pre-wrap">{typedText}<span className="blinking-cursor">|</span></pre>
                            </div>
                        </div>
                    </div>
                    {/* Animated Text */}
                    <div className={`absolute inset-0 flex items-center justify-center transition-opacity duration-1000 ease-in-out ${phase > 0 ? 'opacity-100' : 'opacity-0'}`}>
                       {animatedTexts.map((text, index) => (
                           <h2 key={index} className={`text-5xl lg:text-6xl font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-gray-900 to-gray-600 absolute transition-opacity duration-700 ${phase === index + 1 ? 'opacity-100' : 'opacity-0'}`}>
                               {text}
                           </h2>
                       ))}
                    </div>
                </div>
            </div>
             <style>{`.blinking-cursor { animation: blink 1s step-end infinite; } @keyframes blink { 50% { opacity: 0; } }`}</style>
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