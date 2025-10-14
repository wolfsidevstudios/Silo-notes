
import React from 'react';

const IdeasView: React.FC = () => {
  return (
    <div className="p-8 lg:p-12 h-full flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900">Ideas</h1>
        <p className="text-lg text-gray-500 mt-2">A dedicated space for your fleeting thoughts and brilliant ideas. Coming soon!</p>
        <img src="https://picsum.photos/800/400?random=2" alt="Ideas placeholder" className="mt-8 rounded-lg shadow-lg" />
      </div>
    </div>
  );
};

export default IdeasView;
