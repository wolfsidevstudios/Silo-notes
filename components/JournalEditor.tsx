import React, { useState, useEffect, useRef } from 'react';
import { Note, NoteType } from '../types';

interface JournalEditorProps {
  currentNote: Note | null;
  onSave: (note: Omit<Note, 'id' | 'createdAt'> & { id?: string }) => void;
}

const JournalEditor: React.FC<JournalEditorProps> = ({ currentNote, onSave }) => {
  // Fix: Removed extra equals sign
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [privacy, setPrivacy] = useState<'public' | 'private'>('public');
  
  const contentEditableRef = useRef<HTMLDivElement>(null);
  const editorWrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (currentNote) {
      setTitle(currentNote.title || 'My Journal Entry');
      setContent(currentNote.content || '');
      setPrivacy(currentNote.privacy || 'public');
      if (contentEditableRef.current) {
        contentEditableRef.current.innerHTML = currentNote.content || '';
      }
    }
  }, [currentNote]);

  const handleSave = () => {
    onSave({ id: currentNote?.id, title, content, privacy, type: NoteType.JOURNAL });
  };
  
  const getFormattedDate = () => {
      const date = currentNote ? new Date(currentNote.createdAt) : new Date();
      return date.toLocaleDateString('en-US', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric'
      });
  }

  return (
    <div ref={editorWrapperRef} className="h-full flex flex-col items-center justify-center bg-gray-100 p-8">
       <div className="absolute top-0 left-0 w-full p-4 lg:px-12 flex items-center justify-between">
         <h1 className="text-xl font-bold text-gray-800">Journal</h1>
         <div className="flex items-center gap-4">
            <div className="flex items-center bg-gray-200 rounded-full p-1">
                <button onClick={() => setPrivacy('public')} className={`px-4 py-1 text-sm font-semibold rounded-full ${privacy === 'public' ? 'bg-white shadow' : 'text-gray-600'}`}>Public</button>
                <button onClick={() => setPrivacy('private')} className={`px-4 py-1 text-sm font-semibold rounded-full ${privacy === 'private' ? 'bg-white shadow' : 'text-gray-600'}`}>Private</button>
            </div>
            <button onClick={handleSave} className="bg-black text-white font-semibold py-2 px-6 rounded-full hover:bg-gray-800 transition-colors duration-200">
              Save Entry
            </button>
        </div>
       </div>

      <div className="w-full max-w-5xl h-[80vh] bg-white shadow-2xl rounded-lg flex book-container relative">
        {/* Spine */}
        <div className="w-8 bg-gray-200 h-full flex-shrink-0 absolute left-1/2 -translate-x-1/2 shadow-inner-lg" />
        
        {/* Left Page */}
        <div className="w-1/2 p-10 flex flex-col">
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Journal Title"
              className="text-3xl font-serif placeholder-gray-400 focus:outline-none mb-4 bg-transparent border-b-2 border-transparent focus:border-gray-200"
            />
            <p className="text-gray-500 font-medium text-sm">{getFormattedDate()}</p>
        </div>

        {/* Right Page */}
        <div className="w-1/2 p-10">
            <div
                ref={contentEditableRef}
                contentEditable
                onInput={(e) => setContent(e.currentTarget.innerHTML)}
                data-placeholder="Start writing your entry..."
                className="w-full h-full text-lg leading-10 text-gray-800 focus:outline-none resize-none font-serif ruled-paper [&:empty]:before:content-[attr(data-placeholder)] [&:empty]:before:text-gray-400"
            />
        </div>
      </div>

       <style>{`
          .book-container {
            box-shadow: -10px 0 20px rgba(0,0,0,0.1), 10px 0 20px rgba(0,0,0,0.1);
          }
          .ruled-paper {
            background-image: repeating-linear-gradient(to bottom, transparent, transparent 39px, #E5E7EB 40px);
            background-size: 100% 40px;
          }
       `}</style>
    </div>
  );
};

export default JournalEditor;