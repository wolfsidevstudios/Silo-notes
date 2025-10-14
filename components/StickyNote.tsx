import React from 'react';
import { StickyNoteData } from '../types';

interface StickyNoteProps {
  note: StickyNoteData;
  onUpdateContent: (id: string, content: string) => void;
  onDelete: (id: string) => void;
}

const StickyNote: React.FC<StickyNoteProps> = ({ note, onUpdateContent, onDelete }) => {
  const noteStyle: React.CSSProperties = {
    transform: `translate(${note.position.x}px, ${note.position.y}px)`,
    backgroundColor: note.color,
    position: 'absolute',
    width: '256px',
    height: '256px',
  };

  return (
    <div
      className="p-4 rounded-lg shadow-lg flex flex-col cursor-grab"
      style={noteStyle}
    >
      <textarea
        className="flex-grow bg-transparent resize-none focus:outline-none text-gray-800 text-lg"
        value={note.content}
        onChange={(e) => onUpdateContent(note.id, e.target.value)}
        placeholder="Type something..."
      />
      <button 
        onClick={() => onDelete(note.id)} 
        className="absolute top-2 right-2 text-gray-500 hover:text-gray-800 opacity-50 hover:opacity-100 transition-opacity"
        aria-label="Delete note"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  );
};

export default StickyNote;
