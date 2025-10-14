import React from 'react';

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
                            Get Started
                        </a>
                    </div>
                </section>
                {/* Add other sections like features if needed */}
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
