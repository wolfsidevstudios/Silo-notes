import React from 'react';
import { Note, NoteType } from '../types';
import { LockIcon, JournalIcon, AppLogoIcon, SiloAiIcon } from './icons';

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

  const contentPreview = stripHtml(note.content);

  switch (note.type) {
    case NoteType.STICKY:
      return (
        <div 
          onClick={() => onEditNote(note)}
          style={{ backgroundColor: note.color || '#FFF9C4' }}
          className="p-6 rounded-lg cursor-pointer shadow-md hover:shadow-xl hover:-translate-y-1 transition-all duration-200 flex flex-col justify-between aspect-square"
        >
          <div>
            <h3 className="font-bold text-lg mb-2 text-gray-800 pr-2">{note.title || 'Sticky Note'}</h3>
             <p className="text-gray-700 text-sm line-clamp-4 font-medium">
              {contentPreview}
            </p>
          </div>
           <div className="flex justify-between items-center">
             <p className="text-xs text-gray-600 mt-4">{formattedDate}</p>
             {note.privacy === 'private' && <div className="text-gray-600 flex-shrink-0"><LockIcon /></div>}
           </div>
        </div>
      );
    case NoteType.JOURNAL:
        return (
             <div 
              onClick={() => onEditNote(note)}
              className="bg-amber-50 p-6 rounded-lg cursor-pointer hover:shadow-md hover:-translate-y-1 transition-all duration-200 border border-amber-200 flex flex-col justify-between"
            >
              <div>
                <div className="flex justify-between items-start">
                    <div className="bg-amber-100 text-amber-700 p-2 rounded-full mb-3">
                        <JournalIcon />
                    </div>
                    {note.privacy === 'private' && <div className="text-gray-400 flex-shrink-0"><LockIcon /></div>}
                </div>
                <h3 className="font-bold text-lg mb-2 text-gray-800">{note.title || 'Journal Entry'}</h3>
                <p className="text-gray-600 text-sm line-clamp-3 italic">
                    "{contentPreview}"
                </p>
              </div>
              <p className="text-xs text-gray-500 mt-4">{formattedDate}</p>
            </div>
        );
    case NoteType.AI_NOTE:
        return (
             <div 
              onClick={() => onEditNote(note)}
              className="bg-gradient-to-br from-indigo-50 to-purple-50 p-6 rounded-lg cursor-pointer hover:shadow-md hover:-translate-y-1 transition-all duration-200 border border-indigo-200 flex flex-col justify-between"
            >
              <div>
                <div className="flex justify-between items-start">
                    <div className="bg-indigo-100 text-indigo-700 p-2 rounded-full mb-3">
                        <SiloAiIcon />
                    </div>
                    {note.privacy === 'private' && <div className="text-gray-400 flex-shrink-0"><LockIcon /></div>}
                </div>
                <h3 className="font-bold text-lg mb-2 text-gray-800">{note.title || 'AI Note'}</h3>
                <p className="text-gray-600 text-sm line-clamp-3">
                    {contentPreview}
                </p>
              </div>
              <p className="text-xs text-gray-500 mt-4">{formattedDate}</p>
            </div>
        );
    case NoteType.CLASSIC:
    default:
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
                  {contentPreview}
                </p>
              </div>
              <p className="text-xs text-gray-400 mt-4">{formattedDate}</p>
            </div>
          );
  }
};

const HomeView: React.FC<HomeViewProps> = ({ notes, onEditNote }) => {
  return (
    <div className="p-8 lg:p-12">
      <header className="mb-10">
        <div className="flex items-center gap-4">
          <AppLogoIcon className="w-10 h-10" />
          <div>
            <h1 className="text-4xl font-bold text-gray-900">Welcome Back</h1>
            <p className="text-lg text-gray-500 mt-1">Here are your recent notes.</p>
          </div>
        </div>
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