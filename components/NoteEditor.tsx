
import React, { useState, useEffect } from 'react';
import { Note } from '../types';

interface NoteEditorProps {
  currentNote: Note | null;
  onSave: (note: Omit<Note, 'id' | 'createdAt'> & { id?: string }) => void;
}

const NoteEditor: React.FC<NoteEditorProps> = ({ currentNote, onSave }) => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');

  useEffect(() => {
    if (currentNote) {
      setTitle(currentNote.title);
      setContent(currentNote.content);
    } else {
      setTitle('');
      setContent('');
    }
  }, [currentNote]);

  const handleSave = () => {
    if (title.trim() === '' && content.trim() === '') return;
    onSave({ id: currentNote?.id, title, content });
  };
  
  return (
    <div className="p-8 lg:p-12 h-full flex flex-col">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold text-gray-800">{currentNote ? 'Edit Note' : 'Create Note'}</h1>
        <button
          onClick={handleSave}
          className="bg-black text-white font-semibold py-2 px-6 rounded-full hover:bg-gray-800 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black"
        >
          Save Note
        </button>
      </div>

      <div className="flex-grow flex flex-col">
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Note Title"
          className="text-4xl font-bold placeholder-gray-300 focus:outline-none mb-6 pb-2 border-b border-transparent focus:border-gray-200"
        />
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Start writing here..."
          className="flex-1 w-full text-lg leading-relaxed text-gray-700 placeholder-gray-400 focus:outline-none resize-none"
        />
      </div>
    </div>
  );
};

export default NoteEditor;
