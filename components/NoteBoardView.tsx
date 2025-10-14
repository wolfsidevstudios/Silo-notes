import React, { useState } from 'react';
import { Board, Space, StickyNoteData } from '../types';
import { BackIcon, HashtagIcon, PlusIcon } from './icons';
import StickyNote from './StickyNote';

interface NoteBoardViewProps {
  board: Board;
  space: Space;
  onBack: () => void;
}

const NOTE_COLORS = ['#FFF9C4', '#FFCDD2', '#C8E6C9', '#BBDEFB', '#D1C4E9'];

const NoteBoardView: React.FC<NoteBoardViewProps> = ({ board, space, onBack }) => {
  const [notes, setNotes] = useState<StickyNoteData[]>([]);

  const addNote = () => {
    const newNote: StickyNoteData = {
      id: new Date().toISOString(),
      content: '',
      position: { 
        x: Math.floor(Math.random() * 200) + 20, 
        y: Math.floor(Math.random() * 200) + 20 
      },
      color: NOTE_COLORS[Math.floor(Math.random() * NOTE_COLORS.length)],
    };
    setNotes([...notes, newNote]);
  };

  const updateNoteContent = (id: string, content: string) => {
    setNotes(notes.map(note => note.id === id ? { ...note, content } : note));
  };

  const deleteNote = (id: string) => {
    setNotes(notes.filter(note => note.id !== id));
  };
  
  return (
    <div className="p-8 lg:p-12 h-full flex flex-col">
      <header className="mb-10 flex items-center justify-between flex-shrink-0">
        <div>
            <button onClick={onBack} className="flex items-center text-sm font-semibold text-gray-500 hover:text-gray-800 transition-colors mb-4">
              <BackIcon />
              <HashtagIcon />
              <span className="ml-1">Back to {space.name}</span>
            </button>
            <h1 className="text-4xl font-bold text-gray-900">{board.name}</h1>
        </div>
        <button
            onClick={addNote}
            className="bg-black text-white font-semibold py-2 px-6 rounded-full hover:bg-gray-800 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black flex items-center"
        >
            <PlusIcon />
            <span className="ml-2">Add Note</span>
        </button>
      </header>
      <div className="flex-grow bg-gray-100 rounded-lg relative overflow-auto border border-gray-200">
        {notes.map(note => (
          <StickyNote key={note.id} note={note} onUpdateContent={updateNoteContent} onDelete={deleteNote} />
        ))}
        {notes.length === 0 && (
           <div className="absolute inset-0 flex items-center justify-center text-center pointer-events-none">
             <div>
                <h2 className="text-xl font-semibold text-gray-700">Empty board!</h2>
                <p className="text-gray-500 mt-2">Click "Add Note" to get started.</p>
             </div>
           </div>
        )}
      </div>
    </div>
  );
};

export default NoteBoardView;
