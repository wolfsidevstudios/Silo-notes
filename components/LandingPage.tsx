
import React, { useState, useEffect } from 'react';
import { AppLogoIcon, GoogleIcon, SlackIcon } from './icons';

const FeatureCard = ({ title, description, icon }: { title: string; description: string; icon: React.ReactNode }) => (
    <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group">
        <div className="w-12 h-12 bg-indigo-50 rounded-xl flex items-center justify-center mb-6 text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
            {icon}
        </div>
        <h3 className="text-xl font-bold text-gray-900 mb-3">{title}</h3>
        <p className="text-gray-600 leading-relaxed">{description}</p>
    </div>
);

const BentoCard = ({ title, children, className }: { title: string; children?: React.ReactNode; className?: string }) => (
    <div className={`rounded-3xl p-8 border overflow-hidden relative ${className}`}>
        <h3 className="text-lg font-bold mb-4 z-10 relative">{title}</h3>
        {children}
    </div>
);

const LandingPage: React.FC<{ onNavigate: (path: string) => void }> = ({ onNavigate }) => {
    return (
        <div className="bg-white text-gray-900 font-sans selection:bg-indigo-100 selection:text-indigo-900">
            {/* Navigation */}
            <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
                <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <AppLogoIcon className="w-12 h-12 object-contain" />
                        <span className="font-bold text-xl tracking-tight">Kyndra Notes</span>
                    </div>
                    <div className="hidden md:flex items-center gap-8 text-sm font-medium text-gray-600">
                        <a href="#features" className="hover:text-black transition-colors">Features</a>
                        <a href="#labs" className="hover:text-black transition-colors">Labs</a>
                        <a href="#integrations" className="hover:text-black transition-colors">Integrations</a>
                    </div>
                    <div className="flex items-center gap-4">
                        <a href="/login" onClick={(e) => { e.preventDefault(); onNavigate('/login'); }} className="hidden md:block text-sm font-semibold text-gray-900 hover:text-indigo-600 transition-colors">Log in</a>
                        <a href="/login" onClick={(e) => { e.preventDefault(); onNavigate('/login'); }} className="bg-black text-white text-sm font-semibold py-2.5 px-6 rounded-full hover:bg-gray-800 transition-all hover:scale-105 active:scale-95">
                            Get Started
                        </a>
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <section className="pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden relative">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full max-w-7xl pointer-events-none">
                    <div className="absolute top-20 left-10 w-72 h-72 bg-purple-100 rounded-full mix-blend-multiply filter blur-3xl opacity-40 animate-blob"></div>
                    <div className="absolute top-20 right-10 w-72 h-72 bg-yellow-100 rounded-full mix-blend-multiply filter blur-3xl opacity-40 animate-blob animation-delay-2000"></div>
                    <div className="absolute -bottom-32 left-1/3 w-72 h-72 bg-pink-100 rounded-full mix-blend-multiply filter blur-3xl opacity-40 animate-blob animation-delay-4000"></div>
                </div>
                
                <div className="max-w-7xl mx-auto px-6 text-center relative z-10">
                    <div className="inline-flex items-center gap-2 bg-white border border-gray-200 rounded-full px-4 py-1.5 mb-8 animate-fade-in-up shadow-sm">
                        <span className="w-2 h-2 rounded-full bg-indigo-500"></span>
                        <span className="text-xs font-semibold text-gray-600 uppercase tracking-wide">New: Kyndra Chat 2.0</span>
                    </div>
                    <h1 className="text-6xl md:text-8xl font-extrabold tracking-tight text-gray-900 mb-8 animate-fade-in-up" style={{animationDelay: '0.1s'}}>
                        Capture thoughts.<br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-violet-600">Unleash creativity.</span>
                    </h1>
                    <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-12 leading-relaxed animate-fade-in-up" style={{animationDelay: '0.2s'}}>
                        Kyndra Notes is more than just a notepad. It's an AI-powered workspace where your ideas evolve into plans, projects, and reality.
                    </p>
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-in-up" style={{animationDelay: '0.3s'}}>
                        <a href="/login" onClick={(e) => { e.preventDefault(); onNavigate('/login'); }} className="w-full sm:w-auto bg-black text-white text-lg font-bold py-4 px-8 rounded-full hover:bg-gray-900 transition-transform hover:scale-105 shadow-xl shadow-indigo-500/10">
                            Start Writing for Free
                        </a>
                        <a href="#features" className="w-full sm:w-auto bg-white text-gray-900 border border-gray-200 text-lg font-bold py-4 px-8 rounded-full hover:bg-gray-50 transition-colors">
                            Explore Features
                        </a>
                    </div>
                    
                    {/* Hero Image / UI Preview */}
                    <div className="mt-20 relative max-w-5xl mx-auto animate-fade-in-up" style={{animationDelay: '0.5s'}}>
                        <div className="absolute inset-0 bg-gradient-to-t from-white via-transparent to-transparent z-20"></div>
                        <img 
                            src="https://i.ibb.co/mJ9dF3G/Clean-Shot-2025-02-12-at-11-47-12.png" 
                            alt="App Interface" 
                            className="rounded-2xl shadow-2xl border border-gray-200 w-full h-auto"
                        />
                         <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 bg-white rounded-full shadow-lg py-3 px-8 flex items-center gap-8 border border-gray-100 z-30 whitespace-nowrap">
                            <p className="text-sm font-bold text-gray-500 uppercase tracking-wider">Trusted by creators at</p>
                            <div className="flex gap-6 opacity-60 grayscale">
                                <GoogleIcon className="h-5 w-5" />
                                <SlackIcon className="h-5 w-5" />
                                {/* Add more fake logos if needed */}
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Bento Grid Features */}
            <section id="features" className="py-24 bg-white">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl font-bold text-gray-900 mb-4">Everything you need to think clearly.</h2>
                        <p className="text-xl text-gray-500 max-w-2xl mx-auto">From simple notes to complex workflows, we've got you covered.</p>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-auto md:h-[600px]">
                        {/* Large Card - Now White Theme */}
                        <BentoCard title="Kyndra AI Assistant" className="md:col-span-2 md:row-span-2 bg-white border-gray-200 shadow-xl shadow-gray-100 flex flex-col">
                            <p className="text-gray-500 mb-8 max-w-md leading-relaxed">
                                Not just a chatbot. A co-creator. Ask Kyndra to draft emails, brainstorm ideas, create tasks, or even schedule meetings directly from your chat.
                            </p>
                            <div className="mt-auto bg-gray-50/80 rounded-2xl p-6 border border-gray-100 relative overflow-hidden">
                                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-400 to-purple-400"></div>
                                <div className="flex items-start gap-3 mb-6">
                                    <div className="w-8 h-8 rounded-full bg-gray-200 flex-shrink-0"></div>
                                    <div className="bg-white border border-gray-200 shadow-sm rounded-2xl rounded-tl-none p-4 text-sm text-gray-700">
                                        Create a marketing plan for the new launch.
                                    </div>
                                </div>
                                 <div className="flex items-start gap-3 justify-end">
                                    <div className="bg-indigo-600 text-white shadow-md shadow-indigo-200 rounded-2xl rounded-tr-none p-4 text-sm">
                                        Here's a draft marketing plan with key channels and a timeline...
                                    </div>
                                     <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center flex-shrink-0 text-indigo-600">
                                        <span className="material-symbols-rounded text-sm">smart_toy</span>
                                     </div>
                                </div>
                            </div>
                        </BentoCard>

                        {/* Tall Card */}
                        <BentoCard title="Spaces & Boards" className="md:row-span-2 bg-gray-50 border-gray-200">
                            <p className="text-gray-500 text-sm mb-4">Organize your life into distinct spaces. Use Kanban boards, mind maps, and more.</p>
                            <div className="grid grid-cols-2 gap-2 mt-8 opacity-100">
                                <div className="bg-white border border-gray-100 p-3 rounded-xl shadow-sm h-24 transform transition-transform hover:-translate-y-1"></div>
                                <div className="bg-yellow-50 border border-yellow-100 p-3 rounded-xl shadow-sm h-24 transform translate-y-4 transition-transform hover:-translate-y-1"></div>
                                <div className="bg-blue-50 border border-blue-100 p-3 rounded-xl shadow-sm h-24 transform -translate-y-2 transition-transform hover:-translate-y-1"></div>
                                <div className="bg-white border border-gray-100 p-3 rounded-xl shadow-sm h-24 transform transition-transform hover:-translate-y-1"></div>
                            </div>
                        </BentoCard>
                    </div>
                    
                     <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
                        <BentoCard title="Voice Memos" className="bg-orange-50 border-orange-100">
                            <p className="text-gray-600 text-sm">Capture fleeting thoughts instantly with high-fidelity audio recording.</p>
                             <div className="mt-6 h-12 bg-white rounded-full w-full flex items-center px-4 shadow-sm border border-orange-100">
                                <div className="w-full h-1 bg-orange-400/30 rounded-full overflow-hidden">
                                     <div className="h-full bg-orange-500 w-2/3 rounded-full"></div>
                                </div>
                             </div>
                        </BentoCard>
                        <BentoCard title="Infographic Mode" className="bg-blue-50 border-blue-100">
                            <p className="text-gray-600 text-sm">Turn boring text notes into beautiful, shareable visuals in seconds.</p>
                            <div className="mt-6 flex gap-2 justify-center">
                                <div className="w-8 h-12 bg-blue-200 rounded shadow-sm"></div>
                                <div className="w-8 h-12 bg-blue-300 rounded translate-y-2 shadow-sm"></div>
                                <div className="w-8 h-12 bg-blue-400 rounded -translate-y-1 shadow-sm"></div>
                            </div>
                        </BentoCard>
                         <BentoCard title="Privacy First" className="bg-green-50 border-green-100">
                            <p className="text-gray-600 text-sm">Your data stays on your device. Local-first architecture means we never see your notes.</p>
                             <div className="mt-6 flex items-center gap-2 text-green-700 font-bold bg-white px-4 py-2 rounded-full w-fit shadow-sm border border-green-100">
                                <span className="material-symbols-rounded">lock</span>
                                <span>End-to-End Local</span>
                             </div>
                        </BentoCard>
                     </div>
                </div>
            </section>
            
            {/* Labs Teaser - Now White/Light Theme */}
            <section id="labs" className="py-24 bg-gray-50 border-t border-gray-200 relative overflow-hidden">
                <div className="max-w-7xl mx-auto px-6 relative z-10 flex flex-col md:flex-row items-center gap-12">
                    <div className="flex-1">
                        <div className="inline-block bg-indigo-100 text-indigo-700 px-4 py-1 rounded-full text-sm font-bold mb-6">Kyndra Labs</div>
                        <h2 className="text-5xl font-bold mb-6 text-gray-900">Experimental tools for the curious mind.</h2>
                        <p className="text-gray-600 text-lg mb-8 leading-relaxed">
                            Access cutting-edge AI features like YouTube Summarization, Flashcard Generation, and Concept Explainers. Constantly evolving, always useful.
                        </p>
                        <a href="/login" onClick={(e) => { e.preventDefault(); onNavigate('/login'); }} className="inline-flex items-center gap-2 bg-black text-white px-6 py-3 rounded-full font-bold hover:bg-gray-800 transition-all hover:gap-4 shadow-lg shadow-gray-200">
                            Explore Labs <span className="material-symbols-rounded">arrow_forward</span>
                        </a>
                    </div>
                    <div className="flex-1 grid grid-cols-2 gap-4">
                        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm hover:shadow-md transition-all">
                            <div className="w-12 h-12 bg-pink-50 rounded-xl flex items-center justify-center mb-4 text-pink-500">
                                <span className="material-symbols-rounded text-2xl">smart_toy</span>
                            </div>
                            <h4 className="font-bold text-gray-900">Quiz Gen</h4>
                        </div>
                        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm hover:shadow-md transition-all translate-y-8">
                            <div className="w-12 h-12 bg-yellow-50 rounded-xl flex items-center justify-center mb-4 text-yellow-500">
                                <span className="material-symbols-rounded text-2xl">lightbulb</span>
                            </div>
                            <h4 className="font-bold text-gray-900">Concept Explainer</h4>
                        </div>
                         <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm hover:shadow-md transition-all">
                            <div className="w-12 h-12 bg-red-50 rounded-xl flex items-center justify-center mb-4 text-red-500">
                                <span className="material-symbols-rounded text-2xl">youtube_activity</span>
                            </div>
                            <h4 className="font-bold text-gray-900">Video Notes</h4>
                        </div>
                         <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm hover:shadow-md transition-all translate-y-8">
                            <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center mb-4 text-blue-500">
                                <span className="material-symbols-rounded text-2xl">school</span>
                            </div>
                            <h4 className="font-bold text-gray-900">Flashcards</h4>
                        </div>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="bg-white py-12 border-t border-gray-200">
                <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center">
                    <div className="flex items-center gap-3 mb-4 md:mb-0">
                        <AppLogoIcon className="w-8 h-8" />
                        <span className="font-bold text-lg text-gray-900">Kyndra Notes</span>
                    </div>
                    <div className="flex gap-8 text-sm text-gray-600">
                        <a href="/privacy" onClick={(e) => { e.preventDefault(); onNavigate('/privacy'); }} className="hover:text-black transition-colors">Privacy</a>
                        <a href="/terms" onClick={(e) => { e.preventDefault(); onNavigate('/terms'); }} className="hover:text-black transition-colors">Terms</a>
                        <a href="mailto:support@kyndranotes.app" className="hover:text-black transition-colors">Contact</a>
                    </div>
                    <div className="text-sm text-gray-400 mt-4 md:mt-0">
                        © {new Date().getFullYear()} Kyndra Labs.
                    </div>
                </div>
            </footer>
            
            <style>{`
                @keyframes blob {
                    0% { transform: translate(0px, 0px) scale(1); }
                    33% { transform: translate(30px, -50px) scale(1.1); }
                    66% { transform: translate(-20px, 20px) scale(0.9); }
                    100% { transform: translate(0px, 0px) scale(1); }
                }
                .animate-blob { animation: blob 7s infinite; }
                .animation-delay-2000 { animation-delay: 2s; }
                .animation-delay-4000 { animation-delay: 4s; }
                
                @keyframes fade-in-up {
                    from { opacity: 0; transform: translateY(20px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .animate-fade-in-up { animation: fade-in-up 0.6s ease-out forwards; opacity: 0; }
            `}</style>
        </div>
    );
};

export default LandingPage;
