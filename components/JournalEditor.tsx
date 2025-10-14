import React, { useState, useEffect, useRef } from 'react';
import { Note, NoteType } from '../types';
import { ChevronLeftIcon, ChevronRightIcon } from './icons';

interface JournalEditorProps {
  currentNote: Note | null;
  onSave: (note: Omit<Note, 'id' | 'createdAt'> & { id?: string; type: NoteType; }) => void;
}

const JournalEditor: React.FC<JournalEditorProps> = ({ currentNote, onSave }) => {
  const [title, setTitle] = useState('');
  const [pages, setPages] = useState<string[]>(['']);
  const [currentPageIndex, setCurrentPageIndex] = useState(0);
  const [privacy, setPrivacy] = useState<'public' | 'private'>('public');
  
  const contentEditableRef = useRef<HTMLDivElement>(null);
  const editorWrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const originalTitle = document.title;
    document.title = 'Journal | Silo Notes';

    return () => {
      document.title = originalTitle;
    };
  }, []);

  useEffect(() => {
    if (currentNote) {
      const draftKey = `silo-editor-draft:${currentNote.id || `new-${currentNote.type}`}`;
      const savedDraftJSON = localStorage.getItem(draftKey);

      let initialTitle = currentNote.title || 'My Journal Entry';
      let initialPages = currentNote.content ? currentNote.content.split('<!--PAGE_BREAK-->') : [''];

      if (savedDraftJSON) {
        try {
          const savedDraft = JSON.parse(savedDraftJSON);
          initialTitle = savedDraft.title;
          initialPages = savedDraft.pages;
        } catch (e) {
          console.error("Failed to parse editor draft", e);
        }
      }
      
      setTitle(initialTitle);
      setPages(initialPages.length > 0 ? initialPages : ['']);
      setPrivacy(currentNote.privacy || 'public');
      setCurrentPageIndex(0);
    }
  }, [currentNote]);

  useEffect(() => {
    if (currentNote) {
      const draftKey = `silo-editor-draft:${currentNote.id || `new-${currentNote.type}`}`;
      const draft = { title, pages };
      localStorage.setItem(draftKey, JSON.stringify(draft));
    }
  }, [title, pages, currentNote]);

  const handleSave = () => {
    if (currentNote) {
      const draftKey = `silo-editor-draft:${currentNote.id || `new-${currentNote.type}`}`;
      localStorage.removeItem(draftKey);
    }
    const contentToSave = pages.join('<!--PAGE_BREAK-->');
    onSave({ id: currentNote?.id, title, content: contentToSave, privacy, type: NoteType.JOURNAL });
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

  const handlePrevPage = () => {
    if (currentPageIndex > 0) {
      setCurrentPageIndex(currentPageIndex - 1);
    }
  };

  const handleNextPage = () => {
    if (currentPageIndex < pages.length - 1) {
      setCurrentPageIndex(prev => prev + 1);
    } else {
      setPages(prev => [...prev, '']);
      setCurrentPageIndex(pages.length);
    }
  };


  return (
    <div ref={editorWrapperRef} className="h-full flex flex-col items-center justify-center bg-gray-100 p-8 relative">
       <div className="absolute top-0 left-0 w-full p-4 lg:px-12 flex items-center justify-between z-20">
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
        <button 
            onClick={handlePrevPage} 
            disabled={currentPageIndex === 0}
            className="absolute left-0 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10 p-2 bg-white rounded-full shadow-md hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-opacity"
            aria-label="Previous Page"
        >
            <ChevronLeftIcon />
        </button>

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
                key={currentPageIndex}
                ref={contentEditableRef}
                contentEditable
                onInput={(e) => {
                    const newPages = [...pages];
                    newPages[currentPageIndex] = e.currentTarget.innerHTML;
                    setPages(newPages);
                }}
                dangerouslySetInnerHTML={{ __html: pages[currentPageIndex] || '' }}
                data-placeholder="Start writing your entry..."
                className="w-full h-full text-lg leading-10 text-gray-800 focus:outline-none resize-none font-serif ruled-paper [&:empty]:before:content-[attr(data-placeholder)] [&:empty]:before:text-gray-400"
            />
        </div>

        <button 
            onClick={handleNextPage}
            className="absolute right-0 top-1/2 translate-x-1/2 -translate-y-1/2 z-10 p-2 bg-white rounded-full shadow-md hover:bg-gray-100"
            aria-label="Next Page or New Page"
        >
            <ChevronRightIcon />
        </button>
      </div>
      
      <p className="mt-4 text-sm text-gray-500 font-medium">Page {currentPageIndex + 1} of {pages.length}</p>

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