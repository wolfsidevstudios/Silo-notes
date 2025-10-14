import React from 'react';
import { Board, Space } from '../types';
import { BackIcon, HashtagIcon } from './icons';

interface DiagramViewProps {
  board: Board;
  space: Space;
  onBack: () => void;
}

const DiagramView: React.FC<DiagramViewProps> = ({ board, space, onBack }) => {
  return (
    <div className="p-8 lg:p-12 h-full flex flex-col">
      <header className="mb-10">
        <button onClick={onBack} className="flex items-center text-sm font-semibold text-gray-500 hover:text-gray-800 transition-colors mb-4">
          <BackIcon />
          <HashtagIcon />
          <span className="ml-1">Back to {space.name}</span>
        </button>
        <h1 className="text-4xl font-bold text-gray-900">{board.name}</h1>
        <p className="text-lg text-gray-500 mt-2">Diagram Board - Content will go here.</p>
      </header>
      <div className="flex-grow flex items-center justify-center text-center bg-gray-50 rounded-lg border-2 border-dashed">
        <div>
          <h2 className="text-2xl font-bold text-gray-400">Under Construction</h2>
          <p className="text-gray-500 mt-2">This is where your diagramming tools will live.</p>
        </div>
      </div>
    </div>
  );
};

export default DiagramView;
