import React, { useState, useEffect, useRef } from 'react';
import { Note, NoteType } from '../types';
import { ListIcon, NumberListIcon } from './icons';

interface StickyNoteEditorProps {
  currentNote: Note | null;
  onSave: (note: Omit<Note, 'id' | 'createdAt'> & { id?: string; type: NoteType; }) => void;
}

const STICKY_COLORS = ['#FFF9C4', '#FFCDD2', '#C8E6C9', '#BBDEFB', '#D1C4E9', '#FFD8B1'];

const StickyNoteEditor: React.FC<StickyNoteEditorProps> = ({ currentNote, onSave }) => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [color, setColor] = useState(STICKY_COLORS[0]);
  const [privacy, setPrivacy] = useState<'public' | 'private'>('public');
  
  const contentEditableRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (currentNote) {
      const draftKey = `silo-editor-draft:${currentNote.id || `new-${currentNote.type}`}`;
      const savedDraftJSON = localStorage.getItem(draftKey);

      let initialTitle = currentNote.title || '';
      let initialContent = currentNote.content || '';
      let initialColor = currentNote.color || STICKY_COLORS[0];

      if (savedDraftJSON) {
        try {
          const savedDraft = JSON.parse(savedDraftJSON);
          initialTitle = savedDraft.title;
          initialContent = savedDraft.content;
          initialColor = savedDraft.color;
        } catch (e) {
          console.error("Failed to parse editor draft", e);
        }
      }

      setTitle(initialTitle);
      setContent(initialContent);
      setColor(initialColor);
      setPrivacy(currentNote.privacy || 'public');
      if (contentEditableRef.current) {
        contentEditableRef.current.innerHTML = initialContent;
      }
    }
  }, [currentNote]);

  useEffect(() => {
    if(currentNote){
        const draftKey = `silo-editor-draft:${currentNote.id || `new-${currentNote.type}`}`;
        const draft = { title, content, color };
        localStorage.setItem(draftKey, JSON.stringify(draft));
    }
  }, [title, content, color, currentNote]);

  const handleSave = () => {
    if (currentNote) {
      const draftKey = `silo-editor-draft:${currentNote.id || `new-${currentNote.type}`}`;
      localStorage.removeItem(draftKey);
    }
    onSave({ id: currentNote?.id, title, content, privacy, type: NoteType.STICKY, color });
  };

  const handleCommand = (command: string) => {
    contentEditableRef.current?.focus();
    document.execCommand(command, false);
    setContent(contentEditableRef.current?.innerHTML || '');
  };

  return (
    <div className="h-full flex flex-col bg-gray-100" style={{ backgroundColor: `${color}20`}}>
      <div className="p-4 lg:px-12 flex-shrink-0 bg-white/80 backdrop-blur-sm border-b">
        <div className="flex items-center justify-between">
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Sticky Note Title"
            className="text-xl font-bold placeholder-gray-400 focus:outline-none bg-transparent w-full"
          />
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              {STICKY_COLORS.map(c => (
                <button 
                  key={c}
                  onClick={() => setColor(c)} 
                  className={`w-6 h-6 rounded-full transition-transform duration-200 ${color === c ? 'ring-2 ring-offset-2 ring-black' : 'hover:scale-110'}`}
                  style={{ backgroundColor: c }}
                  aria-label={`Set color to ${c}`}
                />
              ))}
            </div>
            <div className="flex items-center bg-gray-200 rounded-full p-1">
              <button onClick={() => setPrivacy('public')} className={`px-4 py-1 text-sm font-semibold rounded-full ${privacy === 'public' ? 'bg-white shadow' : 'text-gray-600'}`}>Public</button>
              <button onClick={() => setPrivacy('private')} className={`px-4 py-1 text-sm font-semibold rounded-full ${privacy === 'private' ? 'bg-white shadow' : 'text-gray-600'}`}>Private</button>
            </div>
            <button onClick={handleSave} className="bg-black text-white font-semibold py-2 px-6 rounded-full hover:bg-gray-800 transition-colors duration-200">
              Save Note
            </button>
          </div>
        </div>
      </div>

      <main className="flex-grow flex items-center justify-center p-8">
        <div 
          className="w-[400px] h-[400px] shadow-2xl rounded-lg p-6 flex flex-col transition-colors duration-300"
          style={{ backgroundColor: color }}
        >
          <div
            ref={contentEditableRef}
            contentEditable
            onInput={(e) => setContent(e.currentTarget.innerHTML)}
            data-placeholder="Start typing..."
            className="flex-1 w-full text-2xl leading-relaxed text-gray-800 focus:outline-none resize-none [&:empty]:before:content-[attr(data-placeholder)] [&:empty]:before:text-gray-400/50"
            style={{ fontFamily: "'Inter', sans-serif" }}
          />
        </div>
      </main>

       <footer className="flex-shrink-0 p-4 flex items-center justify-center">
        <div className="bg-white/80 backdrop-blur-sm border rounded-full shadow-sm p-2 flex items-center gap-2">
            <button onClick={() => handleCommand('insertUnorderedList')} className="p-2 hover:bg-gray-100 rounded-full text-gray-600"><ListIcon /></button>
            <button onClick={() => handleCommand('insertOrderedList')} className="p-2 hover:bg-gray-100 rounded-full text-gray-600"><NumberListIcon /></button>
        </div>
      </footer>
    </div>
  );
};

export default StickyNoteEditor;