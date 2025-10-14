
import React, { useState, useEffect, useCallback } from 'react';
import Sidebar from './components/Sidebar';
import HomeView from './components/HomeView';
import NoteEditor from './components/NoteEditor';
import ExploreView from './components/ExploreView';
import IdeasView from './components/IdeasView';
import SpaceView from './components/SpaceView';
import NoteBoardView from './components/NoteBoardView';
import DiagramView from './components/DiagramView';
import JamBoardView from './components/JamBoardView';

import { View, Note, Space, Board, BoardType, AudioNote } from './types';

const App: React.FC = () => {
  // State management
  const [activeView, setActiveView] = useState<View>(View.HOME);
  const [notes, setNotes] = useState<Note[]>([]);
  const [spaces, setSpaces] = useState<Space[]>([]);
  const [boards, setBoards] = useState<Board[]>([]);

  const [currentNote, setCurrentNote] = useState<Note | null>(null);
  const [activeSpaceId, setActiveSpaceId] = useState<string | null>(null);
  const [activeBoard, setActiveBoard] = useState<Board | null>(null);

  // Load data from localStorage on mount
  useEffect(() => {
    try {
      const savedNotes = localStorage.getItem('gemini-notes');
      const savedSpaces = localStorage.getItem('gemini-spaces');
      const savedBoards = localStorage.getItem('gemini-boards');
      if (savedNotes) setNotes(JSON.parse(savedNotes));
      if (savedSpaces) setSpaces(JSON.parse(savedSpaces));
      if (savedBoards) setBoards(JSON.parse(savedBoards));
    } catch (error) {
      console.error("Failed to load data from localStorage", error);
    }
  }, []);

  // Save data to localStorage whenever it changes
  useEffect(() => {
    try {
      localStorage.setItem('gemini-notes', JSON.stringify(notes));
    } catch (error) {
      console.error("Failed to save notes to localStorage", error);
    }
  }, [notes]);

  useEffect(() => {
    try {
        localStorage.setItem('gemini-spaces', JSON.stringify(spaces));
    } catch (error) {
      console.error("Failed to save spaces to localStorage", error);
    }
  }, [spaces]);
  
  useEffect(() => {
    try {
        localStorage.setItem('gemini-boards', JSON.stringify(boards));
    } catch (error) {
      console.error("Failed to save boards to localStorage", error);
    }
  }, [boards]);

  // Handlers
  // Fix: Wrap handleViewChange in useCallback to stabilize its identity for use in useEffect.
  const handleViewChange = useCallback((view: View) => {
    setActiveView(view);
    setCurrentNote(null);
    setActiveSpaceId(null);
    setActiveBoard(null);
  }, []);

  const handleCreateNewNote = () => {
    setCurrentNote(null);
    setActiveView(View.CREATE);
    setActiveSpaceId(null);
    setActiveBoard(null);
  };

  const handleEditNote = (note: Note) => {
    setCurrentNote(note);
    setActiveView(View.CREATE);
    setActiveSpaceId(null);
    setActiveBoard(null);
  };

  const handleSaveNote = (noteData: Omit<Note, 'id' | 'createdAt'> & { id?: string; audioNotes?: AudioNote[] }) => {
    if (noteData.id) {
      // Update existing note
      setNotes(notes.map(n => n.id === noteData.id ? { ...n, ...noteData, id: noteData.id } : n));
    } else {
      // Create new note
      const newNote: Note = {
        id: new Date().toISOString(),
        createdAt: new Date().toISOString(),
        title: noteData.title,
        content: noteData.content,
        audioNotes: noteData.audioNotes || [],
      };
      setNotes([newNote, ...notes]);
    }
    handleViewChange(View.HOME);
  };
  
  const handleAddSpace = (name: string) => {
    if (name.trim() === '') return;
    const newSpace: Space = {
      id: new Date().toISOString(),
      name,
    };
    setSpaces([...spaces, newSpace]);
  };

  const handleSelectSpace = (spaceId: string) => {
    setActiveSpaceId(spaceId);
    setActiveView(View.SPACE);
    setActiveBoard(null);
    setCurrentNote(null);
  };
  
  const handleAddBoard = (name: string, spaceId: string, type: BoardType) => {
    if (name.trim() === '') return;
    const newBoard: Board = {
      id: new Date().toISOString(),
      name,
      spaceId,
      type
    };
    setBoards([...boards, newBoard]);
  };

  const handleSelectBoard = (board: Board) => {
    setActiveBoard(board);
    setActiveView(View.BOARD);
  };

  const handleBackToSpace = () => {
    setActiveView(View.SPACE);
    setActiveBoard(null);
  };

  // Fix: Add a useEffect to handle invalid view states side-effects, preventing state updates during render.
  useEffect(() => {
    const activeSpace = spaces.find(s => s.id === activeSpaceId);
    const isInvalidSpaceView = activeView === View.SPACE && !activeSpace;
    const isInvalidBoardView = activeView === View.BOARD && (!activeBoard || !activeSpace);

    if (isInvalidSpaceView || isInvalidBoardView) {
      handleViewChange(View.HOME);
    }
  }, [activeView, activeBoard, activeSpaceId, spaces, handleViewChange]);

  const renderMainView = () => {
    const activeSpace = spaces.find(s => s.id === activeSpaceId);

    if (activeView === View.BOARD && activeBoard && activeSpace) {
        switch (activeBoard.type) {
            case BoardType.NOTE_BOARD:
                return <NoteBoardView board={activeBoard} space={activeSpace} onBack={handleBackToSpace} />;
            case BoardType.DIAGRAM:
                return <DiagramView board={activeBoard} space={activeSpace} onBack={handleBackToSpace} />;
            case BoardType.JAM_BOARD:
                return <JamBoardView board={activeBoard} space={activeSpace} onBack={handleBackToSpace} />;
            default:
                return <HomeView notes={notes} onEditNote={handleEditNote} />;
        }
    }

    if (activeView === View.SPACE && activeSpace) {
        return <SpaceView 
            space={activeSpace} 
            boards={boards.filter(b => b.spaceId === activeSpace.id)} 
            addBoard={handleAddBoard} 
            onSelectBoard={handleSelectBoard}
        />;
    }

    switch (activeView) {
      case View.HOME:
        return <HomeView notes={notes} onEditNote={handleEditNote} />;
      case View.CREATE:
        return <NoteEditor currentNote={currentNote} onSave={handleSaveNote} />;
      case View.EXPLORE:
        return <ExploreView />;
      case View.IDEAS:
        return <IdeasView />;
      default:
        // Fix: Fallback to home view. The useEffect above will correct the state if it's invalid.
        // This removes the line causing the TypeScript error and the state update during render.
        return <HomeView notes={notes} onEditNote={handleEditNote} />;
    }
  };

  return (
    <div className="flex h-screen font-sans bg-white">
      <Sidebar
        activeView={activeView}
        onViewChange={handleViewChange}
        spaces={spaces}
        addSpace={handleAddSpace}
        onCreateNewNote={handleCreateNewNote}
        activeSpaceId={activeSpaceId}
        onSelectSpace={handleSelectSpace}
      />
      <main className="flex-1 overflow-y-auto">
        {renderMainView()}
      </main>
    </div>
  );
};

export default App;