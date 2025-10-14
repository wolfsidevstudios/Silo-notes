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
            <h3 className="text-2xl font-bold text-gray-800 mb-6">Purchase Gems</h3>
             <div className="text-center p-10 h-full flex flex-col items-center justify-center bg-gray-100 rounded-lg border-2 border-dashed">
                <h2 className="text-lg font-semibold text-gray-700">Coming Soon</h2>
                <p className="text-gray-500 text-sm mt-2 max-w-md">
                    Need more Gems? Soon you'll be able to purchase packs to power up your productivity.
                </p>
            </div>
        </section>

      </div>
    </div>
  );
};

export default GemsView;
