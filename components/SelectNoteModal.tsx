import React, { useState, useMemo } from 'react';
import { Note } from '../types';

const stripHtml = (html: string) => {
    const doc = new DOMParser().parseFromString(html, 'text/html');
    return doc.body.textContent || "";
};

interface SelectNoteModalProps {
  notes: Note[];
  onSelect: (noteContent: string) => void;
  onClose: () => void;
}

const SelectNoteModal: React.FC<SelectNoteModalProps> = ({ notes, onSelect, onClose }) => {
  const [searchTerm, setSearchTerm] = useState('');
  
  const filteredNotes = useMemo(() => {
    return notes.filter(note => 
        note.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        stripHtml(note.content).toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [notes, searchTerm]);

  const handleSelect = (note: Note) => {
    const content = note.title + "\n\n" + stripHtml(note.content);
    onSelect(content);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl m-4 flex flex-col max-h-[80vh]" onClick={e => e.stopPropagation()}>
        <div className="p-6 border-b sticky top-0 bg-white z-10">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Select a Note to Use</h2>
          <input
            type="text"
            placeholder="Search your notes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-2.5 border border-gray-300 rounded-full focus:ring-2 focus:ring-black"
            autoFocus
          />
        </div>
        <div className="p-6 flex-grow overflow-y-auto">
          <div className="space-y-2">
            {filteredNotes.length > 0 ? filteredNotes.map(note => (
              <button key={note.id} onClick={() => handleSelect(note)} className="w-full text-left p-3 rounded-lg hover:bg-gray-100 border transition-colors">
                <p className="font-semibold text-gray-800 truncate">{note.title || 'Untitled Note'}</p>
                <p className="text-sm text-gray-500 truncate mt-1">{stripHtml(note.content)}</p>
              </button>
            )) : <p className="text-center text-gray-500">No notes found.</p>}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SelectNoteModal;
