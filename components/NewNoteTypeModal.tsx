import React from 'react';
import { NoteType } from '../types';
import { SiloAiIcon } from './icons';

const ClassicNoteIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 mb-2 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
);
const JournalIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 mb-2 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
    </svg>
);
const StickyNoteIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 mb-2 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
    </svg>
);


interface NewNoteTypeModalProps {
  onSelect: (type: NoteType) => void;
  onClose: () => void;
}

const OptionCard: React.FC<{ icon: React.ReactNode; title: React.ReactNode; description: string; onClick: () => void; }> = 
({ icon, title, description, onClick }) => (
    <button onClick={onClick} className="w-full text-left p-6 rounded-xl border border-gray-200 hover:bg-gray-50 hover:border-gray-300 focus:outline-none focus:ring-2 focus:ring-black transition-all duration-200">
        <div className="flex items-start">
            <div>{icon}</div>
            <div className="ml-4">
                <h3 className="font-semibold text-lg text-gray-800">{title}</h3>
                <p className="text-sm text-gray-500 mt-1">{description}</p>
            </div>
        </div>
    </button>
);


const NewNoteTypeModal: React.FC<NewNoteTypeModalProps> = ({ onSelect, onClose }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 transition-opacity duration-300" aria-modal="true" role="dialog">
      <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-lg m-4 transform transition-all duration-300 scale-100 relative">
        <h2 className="text-2xl font-bold mb-6 text-gray-800 text-center">What are you creating?</h2>
        
        <div className="space-y-4">
            <OptionCard 
                icon={<ClassicNoteIcon />} 
                title="Classic Note" 
                description="A versatile, blank canvas for your thoughts, lists, and long-form content." 
                onClick={() => onSelect(NoteType.CLASSIC)}
            />
             <OptionCard 
                icon={<JournalIcon />} 
                title="Journal" 
                description="A structured, book-style format perfect for daily entries and reflections." 
                onClick={() => onSelect(NoteType.JOURNAL)}
            />
             <OptionCard 
                icon={<StickyNoteIcon />} 
                title="Sticky Note" 
                description="A quick, colorful note for capturing fleeting ideas, reminders, and tasks." 
                onClick={() => onSelect(NoteType.STICKY)}
            />
             <OptionCard 
                icon={<SiloAiIcon />} 
                title={
                    <div className="flex items-center gap-2">
                        Silo AI Note
                        <span className="bg-gray-200 text-gray-600 text-xs font-semibold px-2 py-0.5 rounded-full">
                            Beta
                        </span>
                    </div>
                } 
                description="A powerful, collaborative space where you co-create notes with an AI assistant." 
                onClick={() => onSelect(NoteType.AI_NOTE)}
            />
        </div>
        
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-700">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
        </button>
      </div>
    </div>
  );
};

export default NewNoteTypeModal;