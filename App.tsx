
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
import SettingsView from './components/SettingsView';
import SiloLabsView from './components/SiloLabsView';
import SummarizeToolView from './components/SummarizeToolView';
import RewriteToolView from './components/RewriteToolView';
import VoiceMemoToolView from './components/VoiceMemoToolView';
import SpeechToTextToolView from './components/SpeechToTextToolView';


import { View, Note, Space, Board, BoardType } from './types';

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
      const savedNotes = localStorage.getItem('silo-notes');
      const savedSpaces = localStorage.getItem('silo-spaces');
      const savedBoards = localStorage.getItem('silo-boards');
      if (savedNotes) setNotes(JSON.parse(savedNotes));
      if (savedSpaces) setSpaces(JSON.parse(savedSpaces));
      if (savedBoards) setBoards(JSON.parse(savedBoards));
    } catch (error) {
      console.error("Failed to load data from localStorage", error);
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem('silo-notes', JSON.stringify(notes));
      localStorage.setItem('silo-spaces', JSON.stringify(spaces));
      localStorage.setItem('silo-boards', JSON.stringify(boards));
    // Fix: Added braces to the catch block to fix syntax error. This was causing all subsequent errors.
    } catch (error) {
      console.error("Failed to save data to localStorage", error);
    }
  }, [notes, spaces, boards]);

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

  const handleSaveNote = (noteData: Omit<Note, 'id' | 'createdAt'> & { id?: string }) => {
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
        privacy: noteData.privacy,
        pin: noteData.pin,
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
      case View.SETTINGS:
        return <SettingsView />;
      case View.SILO_LABS:
        return <SiloLabsView onViewChange={handleViewChange} />;
      case View.SUMMARIZE_TOOL:
        return <SummarizeToolView onBack={() => handleViewChange(View.SILO_LABS)} />;
      case View.REWRITE_TOOL:
        return <RewriteToolView onBack={() => handleViewChange(View.SILO_LABS)} />;
      case View.VOICE_MEMO_TOOL:
        return <VoiceMemoToolView onBack={() => handleViewChange(View.SILO_LABS)} />;
      case View.SPEECH_TO_TEXT_TOOL:
        return <SpeechToTextToolView onBack={() => handleViewChange(View.SILO_LABS)} />;
      default:
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
