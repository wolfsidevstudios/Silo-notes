import React from 'react';
import { Note, NoteType } from '../types';
import { LockIcon, JournalIcon, AppLogoIcon, SiloAiIcon, FlashcardIcon, QuizIcon, InfographicIcon } from './icons';

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
          className="break-inside-avoid p-6 rounded-lg cursor-pointer shadow-md hover:shadow-xl hover:-translate-y-1 transition-all duration-200 flex flex-col justify-between"
        >
          <div>
            <h3 className="font-bold text-lg mb-2 text-gray-800 pr-2">{note.title || 'Sticky Note'}</h3>
             <p className="text-gray-700 text-sm line-clamp-6 font-medium">
              {contentPreview}
            </p>
          </div>
           <div className="flex justify-between items-center pt-4">
             <p className="text-xs text-gray-600 mt-4">{formattedDate}</p>
             {note.privacy === 'private' && <div className="text-gray-600 flex-shrink-0"><LockIcon /></div>}
           </div>
        </div>
      );
    case NoteType.JOURNAL:
        return (
             <div 
              onClick={() => onEditNote(note)}
              className="break-inside-avoid bg-amber-50 p-6 rounded-lg cursor-pointer hover:shadow-md hover:-translate-y-1 transition-all duration-200 border border-amber-200 flex flex-col justify-between"
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
              className="break-inside-avoid bg-gradient-to-br from-indigo-50 to-purple-50 p-6 rounded-lg cursor-pointer hover:shadow-md hover:-translate-y-1 transition-all duration-200 border border-indigo-200 flex flex-col justify-between"
            >
              <div>
                <div className="flex justify-between items-start">
                    <div className="bg-indigo-100 text-indigo-700 p-2 rounded-full mb-3">
                        <SiloAiIcon />
                    </div>
                    {note.privacy === 'private' && <div className="text-gray-400 flex-shrink-0"><LockIcon /></div>}
                </div>
                <h3 className="font-bold text-lg mb-2 text-gray-800">{note.title || 'Kyndra AI Note'}</h3>
                <p className="text-gray-600 text-sm line-clamp-3">
                    {contentPreview}
                </p>
              </div>
              <p className="text-xs text-gray-500 mt-4">{formattedDate}</p>
            </div>
        );
    case NoteType.FLASHCARDS:
        const cards = note.content ? JSON.parse(note.content) : [];
        return (
            <div 
            onClick={() => onEditNote(note)}
            className="break-inside-avoid bg-blue-50 p-6 rounded-lg cursor-pointer hover:shadow-md hover:-translate-y-1 transition-all duration-200 border border-blue-200 flex flex-col justify-between"
            >
            <div>
                <div className="flex justify-between items-start">
                <div className="bg-blue-100 text-blue-700 p-2 rounded-full mb-3"><FlashcardIcon /></div>
                {note.privacy === 'private' && <div className="text-gray-400 flex-shrink-0"><LockIcon /></div>}
                </div>
                <h3 className="font-bold text-lg mb-2 text-gray-800">{note.title || 'Flashcard Set'}</h3>
                <p className="text-gray-600 text-sm">{cards.length} cards</p>
            </div>
            <p className="text-xs text-gray-500 mt-4">{formattedDate}</p>
            </div>
        );
    case NoteType.QUIZ:
        const questions = note.content ? JSON.parse(note.content) : [];
        return (
            <div 
            onClick={() => onEditNote(note)}
            className="break-inside-avoid bg-purple-50 p-6 rounded-lg cursor-pointer hover:shadow-md hover:-translate-y-1 transition-all duration-200 border border-purple-200 flex flex-col justify-between"
            >
            <div>
                <div className="flex justify-between items-start">
                <div className="bg-purple-100 text-purple-700 p-2 rounded-full mb-3"><QuizIcon /></div>
                {note.privacy === 'private' && <div className="text-gray-400 flex-shrink-0"><LockIcon /></div>}
                </div>
                <h3 className="font-bold text-lg mb-2 text-gray-800">{note.title || 'Quiz'}</h3>
                <p className="text-gray-600 text-sm">{questions.length} questions</p>
            </div>
            <p className="text-xs text-gray-500 mt-4">{formattedDate}</p>
            </div>
        );
    case NoteType.INFOGRAPHIC:
        return (
            <div 
            onClick={() => onEditNote(note)}
            className="break-inside-avoid bg-teal-50 p-6 rounded-lg cursor-pointer hover:shadow-md hover:-translate-y-1 transition-all duration-200 border border-teal-200 flex flex-col justify-between"
            >
            <div>
                <div className="flex justify-between items-start">
                    <div className="bg-teal-100 text-teal-700 p-2 rounded-full mb-3"><InfographicIcon /></div>
                    {note.privacy === 'private' && <div className="text-gray-400 flex-shrink-0"><LockIcon /></div>}
                </div>
                <h3 className="font-bold text-lg mb-2 text-gray-800">{note.title || 'Infographic'}</h3>
                <div className="mt-2 h-24 bg-white rounded-md flex items-center justify-center overflow-hidden">
                    <img src={note.content} alt="Infographic preview" className="object-cover w-full h-full" />
                </div>
            </div>
            <p className="text-xs text-gray-500 mt-4">{formattedDate}</p>
            </div>
        );
    case NoteType.CLASSIC:
    default:
        return (
            <div 
              onClick={() => onEditNote(note)}
              className="break-inside-avoid bg-gray-50 p-6 rounded-lg cursor-pointer hover:shadow-md hover:-translate-y-1 transition-all duration-200 border border-gray-200 flex flex-col justify-between"
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
        <div className="columns-1 md:columns-2 lg:columns-3 xl:columns-4 gap-6 space-y-6">
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
      <style>{`
        .break-inside-avoid {
          break-inside: avoid;
        }
      `}</style>
    </div>
  );
};

export default HomeView;