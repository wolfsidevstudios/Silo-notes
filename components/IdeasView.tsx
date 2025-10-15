import React from 'react';
import { GemIcon } from './icons';

interface GemsViewProps {
  gems: number;
}

const GemsView: React.FC<GemsViewProps> = ({ gems }) => {
  return (
    <div className="p-8 lg:p-12">
      <header className="mb-10">
        <div className="flex items-center mb-2">
           <div className="bg-blue-100 p-2 rounded-full">
              <GemIcon />
           </div>
           <h1 className="text-4xl font-bold text-gray-900 ml-4">Silo Gems</h1>
        </div>
        <p className="text-lg text-gray-500 mt-2">Earn and spend Gems to unlock powerful features across Silo Notes.</p>
      </header>

      <div className="max-w-4xl mx-auto space-y-12">
        
        <div className="bg-gradient-to-br from-blue-500 to-indigo-600 text-white p-8 rounded-2xl shadow-lg text-center">
            <h2 className="text-lg font-semibold opacity-80">Your Balance</h2>
            <div className="flex items-center justify-center gap-4 my-4">
                <GemIcon />
                <p className="text-6xl font-bold">{gems}</p>
            </div>
            <p className="opacity-80">You have a starting pack of 15 Gems!</p>
        </div>

        <section>
            <h3 className="text-2xl font-bold text-gray-800 mb-6">How to Earn Gems</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white p-6 rounded-lg border border-gray-200">
                    <h4 className="font-bold text-gray-800 mb-2">Create a New Note</h4>
                    <p className="text-gray-600 text-sm">Every time you create and save a new note, you'll be rewarded.</p>
                    <p className="mt-4 font-bold text-green-600">+1 Gem</p>
                </div>
                <div className="bg-white p-6 rounded-lg border border-gray-200 opacity-60">
                    <h4 className="font-bold text-gray-800 mb-2">Complete Daily Streaks</h4>
                    <p className="text-gray-600 text-sm">More ways to earn are coming soon!</p>
                     <p className="mt-4 font-bold text-gray-400">Coming Soon</p>
                </div>
            </div>
        </section>

         <section>
            <h3 className="text-2xl font-bold text-gray-800 mb-6">Spend Gems</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white p-6 rounded-lg border border-gray-200">
                    <h4 className="font-bold text-gray-800 mb-2">Speech-to-Text</h4>
                    <p className="text-gray-600 text-sm">Transcribe your voice into text in real-time.</p>
                    <p className="mt-4 font-bold text-blue-600">5 Gems per use</p>
                </div>
                 <div className="bg-white p-6 rounded-lg border border-gray-200">
                    <h4 className="font-bold text-gray-800 mb-2">Text-to-Speech</h4>
                    <p className="text-gray-600 text-sm">Generate high-quality audio from your notes.</p>
                    <p className="mt-4 font-bold text-blue-600">5 Gems per use</p>
                </div>
            </div>
        </section>

        <section>
            <h3 className="text-2xl font-bold text-gray-800 mb-6">Purchase Gems & Memberships</h3>
             <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 text-center">
                {/* Plus Tier */}
                <div className="bg-white p-8 rounded-2xl border border-gray-200 flex flex-col">
                    <h4 className="text-2xl font-bold text-gray-800">Plus</h4>
                    <p className="mt-4 text-4xl font-bold">+100 <span className="text-lg font-medium text-gray-500">Gems</span></p>
                    <p className="text-lg font-semibold text-gray-600 mt-2">$10 <span className="font-normal text-sm">/ month</span></p>
                    <div className="flex-grow"></div>
                    <a href="https://silolabs.gumroad.com/l/gpvdjm" target="_blank" rel="noopener noreferrer" className="mt-8 bg-black text-white font-semibold py-3 rounded-full w-full block hover:bg-gray-800 transition-colors">
                        Purchase
                    </a>
                </div>

                {/* Pro Tier - Most Popular */}
                <div className="bg-white p-8 rounded-2xl border-2 border-indigo-500 flex flex-col relative">
                    <div className="absolute top-0 -translate-y-1/2 left-1/2 -translate-x-1/2 bg-indigo-500 text-white text-xs font-bold uppercase px-3 py-1 rounded-full">Most Popular</div>
                    <h4 className="text-2xl font-bold text-gray-800">Pro</h4>
                    <p className="mt-4 text-4xl font-bold">+500 <span className="text-lg font-medium text-gray-500">Gems</span></p>
                    <p className="text-lg font-semibold text-gray-600 mt-2">$20 <span className="font-normal text-sm">/ month</span></p>
                    <div className="flex-grow"></div>
                    <a href="https://silolabs.gumroad.com/l/gpvdjm" target="_blank" rel="noopener noreferrer" className="mt-8 bg-indigo-500 text-white font-semibold py-3 rounded-full w-full block hover:bg-indigo-600 transition-colors">
                        Purchase
                    </a>
                </div>

                {/* Ultra Tier */}
                <div className="bg-white p-8 rounded-2xl border border-gray-200 flex flex-col">
                    <h4 className="text-2xl font-bold text-gray-800">Ultra</h4>
                    <p className="mt-4 text-4xl font-bold">&infin; <span className="text-lg font-medium text-gray-500">Gems</span></p>
                    <p className="text-lg font-semibold text-gray-600 mt-2">$40 <span className="font-normal text-sm">/ month</span></p>
                    <div className="flex-grow"></div>
                    <a href="https://silolabs.gumroad.com/l/gpvdjm" target="_blank" rel="noopener noreferrer" className="mt-8 bg-black text-white font-semibold py-3 rounded-full w-full block hover:bg-gray-800 transition-colors">
                        Purchase
                    </a>
                </div>
            </div>
        </section>

      </div>
    </div>
  );
};

export default GemsView;