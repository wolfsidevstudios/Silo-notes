
import React, { useState, useEffect, useMemo } from 'react';
import { GoogleGenAI, Type } from "@google/genai";
import { ExploreIcon } from './icons';

interface ExploreContent {
  title: string;
  category: string;
  summary: string;
}

const ExploreView: React.FC = () => {
  const [content, setContent] = useState<ExploreContent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');

  useEffect(() => {
    const fetchExploreContent = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
        const response = await ai.models.generateContent({
          model: "gemini-2.5-flash",
          contents: "Generate a list of 12 engaging article ideas for a note-taking app's 'Explore' section. Topics should cover creativity, productivity, and learning techniques. For each, provide a title, a category ('Creativity', 'Productivity', or 'Learning'), and a one-sentence summary.",
          config: {
            responseMimeType: "application/json",
            responseSchema: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  title: { type: Type.STRING, description: 'The catchy title of the article idea.' },
                  category: { type: Type.STRING, description: 'The category: Creativity, Productivity, or Learning.' },
                  summary: { type: Type.STRING, description: 'A brief, one-sentence summary.' },
                },
                required: ["title", "category", "summary"],
              },
            },
          },
        });
        
        const jsonText = response.text.trim();
        const parsedContent = JSON.parse(jsonText);
        setContent(parsedContent);

      } catch (err) {
        console.error("Failed to fetch explore content:", err);
        setError("Sorry, we couldn't load new content right now. Please try again later.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchExploreContent();
  }, []);

  const categories = useMemo(() => ['All', ...new Set(content.map(item => item.category))], [content]);

  const filteredContent = useMemo(() => {
    return content.filter(item => {
      const matchesCategory = activeCategory === 'All' || item.category === activeCategory;
      const matchesSearch = item.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                            item.summary.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [content, searchTerm, activeCategory]);

  return (
    <div className="p-8 lg:p-12">
      <header className="mb-10">
        <h1 className="text-4xl font-bold text-gray-900">Explore New Ideas</h1>
        <p className="text-lg text-gray-500 mt-2">Discover concepts, techniques, and inspiration to fuel your work.</p>
      </header>

      <div className="mb-8 flex flex-col sm:flex-row gap-4">
        <div className="relative flex-grow">
          <input 
            type="text"
            placeholder="Search topics..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-full focus:ring-2 focus:ring-black focus:border-black"
          />
           <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
             <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
           </div>
        </div>
        <div className="flex items-center gap-2 overflow-x-auto pb-2">
          {categories.map(category => (
            <button
              key={category}
              onClick={() => setActiveCategory(category)}
              className={`px-4 py-2 text-sm font-semibold rounded-full transition-colors whitespace-nowrap ${
                activeCategory === category ? 'bg-black text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {category}
            </button>
          ))}
        </div>
      </div>

      {isLoading ? (
        <div className="text-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4 text-gray-600">Generating fresh ideas...</p>
        </div>
      ) : error ? (
        <div className="text-center py-20 bg-red-50 rounded-lg border border-red-200">
          <h2 className="text-xl font-semibold text-red-700">Something went wrong</h2>
          <p className="text-red-600 mt-2">{error}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredContent.length > 0 ? filteredContent.map(item => (
            <div key={item.title} className="bg-gray-50 p-6 rounded-lg border border-gray-200 flex flex-col">
              <span className="text-xs font-bold uppercase text-gray-500 mb-2">{item.category}</span>
              <h3 className="font-bold text-lg text-gray-800 mb-2">{item.title}</h3>
              <p className="text-gray-600 text-sm flex-grow">{item.summary}</p>
              <button className="text-sm font-semibold text-black mt-4 self-start hover:underline">
                Learn more &rarr;
              </button>
            </div>
          )) : (
             <div className="col-span-full text-center py-20 bg-gray-50 rounded-lg">
                <h2 className="text-xl font-semibold text-gray-700">No results found</h2>
                <p className="text-gray-500 mt-2">Try adjusting your search or filter.</p>
             </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ExploreView;
