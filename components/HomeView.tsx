import React from 'react';
import { Note } from '../types';
import { LockIcon } from './icons';

interface HomeViewProps {
  notes: Note[];
  onEditNote: (note: Note) => void;
}

const stripHtml = (html: string) => {
  const doc = new DOMParser().parseFromString(html, 'text/html');
  return doc.body.textContent || "";
};

const NoteCard: React.FC<{ note: Note, onEditNote: (note: Note) => void }> = ({ note, onEditNote }) => {
  const formattedDate = new Date(note.createdAt).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });

  return (
    <div 
      onClick={() => onEditNote(note)}
      className="bg-gray-50 p-6 rounded-lg cursor-pointer hover:shadow-md hover:-translate-y-1 transition-all duration-200 border border-gray-200 flex flex-col justify-between"
    >
      <div>
        <div className="flex justify-between items-start">
            <h3 className="font-bold text-lg mb-2 text-gray-800 pr-2">{note.title || 'Untitled Note'}</h3>
            {note.privacy === 'private' && (
                <div className="text-gray-400 flex-shrink-0">
                    <LockIcon />
                </div>
            )}
        </div>
        <p className="text-gray-600 text-sm line-clamp-3">
          {stripHtml(note.content)}
        </p>
      </div>
      <p className="text-xs text-gray-400 mt-4">{formattedDate}</p>
    </div>
  );
};

const HomeView: React.FC<HomeViewProps> = ({ notes, onEditNote }) => {
  return (
    <div className="p-8 lg:p-12">
      <header className="mb-10">
        <h1 className="text-4xl font-bold text-gray-900">Welcome Back</h1>
        <p className="text-lg text-gray-500 mt-2">Here are your recent notes.</p>
      </header>

      {notes.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {notes.map(note => (
            <NoteCard key={note.id} note={note} onEditNote={onEditNote} />
          ))}
        </div>
      ) : (
        <div className="text-center py-20 bg-gray-50 rounded-lg">
          <h2 className="text-xl font-semibold text-gray-700">No notes yet!</h2>
          <p className="text-gray-500 mt-2">Click "New Note" to get started.</p>
        </div>
      )}
    </div>
  );
};

export default HomeView;