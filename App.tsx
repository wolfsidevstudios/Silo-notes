import React, { useState, useEffect, useCallback, useRef } from 'react';
import Sidebar from './components/Sidebar';
import HomeView from './components/HomeView';
import NoteEditor from './components/NoteEditor';
import ExploreView from './components/ExploreView';
import IdeasView from './components/IdeasView';
import AgendaView from './components/AgendaView';
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
import TextToSpeechToolView from './components/TextToSpeechToolView';
import MindMapView from './components/MindMapView';
import WorkflowView from './components/WorkflowView';
import { GoogleGenAI } from "@google/genai";
import { ArrowUpIcon, CloseIcon } from './components/icons';


import { View, Note, Space, Board, BoardType, Task, Meeting } from './types';

// Timer Component
const TimerComponent = ({ initialSeconds, onClose }: { initialSeconds: number; onClose: () => void }) => {
    const [secondsLeft, setSecondsLeft] = useState(initialSeconds);
    const [isActive, setIsActive] = useState(true);
    const intervalRef = useRef<number | null>(null);

    useEffect(() => {
        if (isActive && secondsLeft > 0) {
            intervalRef.current = window.setInterval(() => {
                setSecondsLeft(prev => prev - 1);
            }, 1000);
        } else if (secondsLeft === 0) {
            if (intervalRef.current) clearInterval(intervalRef.current);
            setIsActive(false);
        }
        return () => {
            if (intervalRef.current) clearInterval(intervalRef.current);
        };
    }, [isActive, secondsLeft]);

    const toggle = () => setIsActive(!isActive);
    const reset = () => { setSecondsLeft(initialSeconds); setIsActive(false); };

    const formatTime = () => {
        const minutes = Math.floor(secondsLeft / 60);
        const seconds = secondsLeft % 60;
        return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    };

    return (
        <div className="text-center text-white p-4">
            <h3 className="font-semibold mb-2">Timer</h3>
            <p className="text-5xl font-mono mb-4">{formatTime()}</p>
            <div className="flex justify-center gap-2">
                <button onClick={toggle} className="bg-white/20 px-4 py-1 rounded-full">{isActive ? 'Pause' : 'Start'}</button>
                <button onClick={reset} className="bg-white/20 px-4 py-1 rounded-full">Reset</button>
                <button onClick={onClose} className="bg-white/20 px-4 py-1 rounded-full">Close</button>
            </div>
        </div>
    );
};

// Stopwatch Component
const StopwatchComponent = ({ onClose }: { onClose: () => void }) => {
    const [time, setTime] = useState(0);
    const [isActive, setIsActive] = useState(true);
    const intervalRef = useRef<number | null>(null);

    useEffect(() => {
        if (isActive) {
            intervalRef.current = window.setInterval(() => {
                setTime(prev => prev + 10);
            }, 10);
        }
        return () => {
            if (intervalRef.current) clearInterval(intervalRef.current);
        };
    }, [isActive]);

    const toggle = () => setIsActive(!isActive);
    const reset = () => { setTime(0); setIsActive(false); };
    
    const formatTime = () => {
        const minutes = Math.floor((time / 60000) % 60).toString().padStart(2, '0');
        const seconds = Math.floor((time / 1000) % 60).toString().padStart(2, '0');
        const milliseconds = (time % 1000).toString().padStart(3, '0').slice(0, 2);
        return `${minutes}:${seconds}.${milliseconds}`;
    };

    return (
        <div className="text-center text-white p-4">
            <h3 className="font-semibold mb-2">Stopwatch</h3>
            <p className="text-5xl font-mono mb-4">{formatTime()}</p>
            <div className="flex justify-center gap-2">
                <button onClick={toggle} className="bg-white/20 px-4 py-1 rounded-full">{isActive ? 'Pause' : 'Start'}</button>
                <button onClick={reset} className="bg-white/20 px-4 py-1 rounded-full">Reset</button>
                <button onClick={onClose} className="bg-white/20 px-4 py-1 rounded-full">Close</button>
            </div>
        </div>
    );
};


// AI Chat Component
const AiChatComponent = ({ onClose, onSaveNote, geminiApiKey, onAddTask, onAddMeeting }: { onClose: () => void; onSaveNote: (note: Omit<Note, 'id' | 'createdAt'> & { id?: string }) => void; geminiApiKey: string | null; onAddTask: (title: string) => void; onAddMeeting: (title: string, dateTime: string) => void; }) => {
    const [inputValue, setInputValue] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [activeTool, setActiveTool] = useState<'none' | 'timer' | 'stopwatch'>('none');
    const [toolProps, setToolProps] = useState<any>({});
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        inputRef.current?.focus();
    }, []);

    const handleToolClose = () => {
        setActiveTool('none');
        setToolProps({});
    };
    
    const handleSend = async () => {
        if (!inputValue.trim() || isLoading || !geminiApiKey) return;
        setIsLoading(true);
        const prompt = inputValue;
        setInputValue('');

        try {
            const ai = new GoogleGenAI({ apiKey: geminiApiKey });
            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: prompt,
                config: {
                    systemInstruction: `You are a helpful assistant in a note-taking app. Your main tasks are creating notes, timers, stopwatches, tasks, and meetings.
- If the user asks for a timer, respond ONLY in this format: TIMER::[duration_in_seconds]. Example: "set a 5 minute timer" should respond "TIMER::300".
- If the user asks for a stopwatch, respond ONLY with this exact word: STOPWATCH.
- If the user asks to create or write a note, respond with the full content of the note. The first line will be the title.
- If the user asks to create a task, respond ONLY in this format: TASK::[task_title]. Example: "remind me to buy milk" should respond "TASK::Buy milk".
- If the user asks to create a meeting, respond ONLY in this format: MEETING::[meeting_title]::[date_and_time]. Example: "schedule a project sync for tomorrow at 3pm" should respond "MEETING::Project Sync::Tomorrow at 3pm".
- For any other request, provide a helpful but concise text response.`
                }
            });

            const resultText = response.text.trim();

            if (resultText.startsWith('TIMER::')) {
                const seconds = parseInt(resultText.split('::')[1], 10);
                if (!isNaN(seconds)) {
                    setToolProps({ initialSeconds: seconds });
                    setActiveTool('timer');
                }
            } else if (resultText === 'STOPWATCH') {
                setActiveTool('stopwatch');
            } else if (resultText.startsWith('TASK::')) {
                const title = resultText.split('::')[1];
                if (title) onAddTask(title);
                onClose();
            } else if (resultText.startsWith('MEETING::')) {
                const parts = resultText.split('::');
                const title = parts[1];
                const dateTime = parts[2];
                if (title && dateTime) onAddMeeting(title, dateTime);
                onClose();
            } else if (prompt.toLowerCase().includes('create a note') || prompt.toLowerCase().includes('write a note')) {
                const lines = resultText.split('\n');
                const title = lines[0] || 'AI Generated Note';
                const content = lines.slice(1).join('<br>');
                onSaveNote({ title, content, audioNotes: [], privacy: 'public' });
                onClose();
            } else {
                 onClose();
            }
        } catch (error) {
            console.error("AI Chat Error:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const containerClasses = `fixed top-8 left-1/2 -translate-x-1/2 z-50 transition-all duration-500 ease-in-out flex items-center justify-center ${
        activeTool !== 'none'
        ? 'w-96 h-48 bg-black rounded-3xl shadow-2xl'
        : 'w-[500px] h-14 bg-white rounded-full shadow-lg border'
    }`;

    return (
        <div className={containerClasses}>
            {activeTool === 'timer' && <TimerComponent {...toolProps} onClose={handleToolClose} />}
            {activeTool === 'stopwatch' && <StopwatchComponent onClose={handleToolClose} />}
            {activeTool === 'none' && (
                <div className="w-full flex items-center px-2 gap-2">
                    <button onClick={onClose} className="p-2 text-gray-500 hover:text-black rounded-full">
                        <CloseIcon />
                    </button>
                    <input
                        ref={inputRef}
                        type="text"
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                        placeholder={geminiApiKey ? "Ask Silo AI to create a note, timer, etc..." : "Please set Gemini API key in Settings"}
                        className="flex-1 bg-transparent focus:outline-none text-sm"
                        disabled={isLoading || !geminiApiKey}
                    />
                    <button 
                        onClick={handleSend}
                        className="w-10 h-10 bg-black text-white rounded-full flex items-center justify-center flex-shrink-0 disabled:bg-gray-400"
                        disabled={isLoading || !inputValue.trim() || !geminiApiKey}
                    >
                        {isLoading ? <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div> : <ArrowUpIcon />}
                    </button>
                </div>
            )}
        </div>
    );
};


const App: React.FC = () => {
  // State management
  const [activeView, setActiveView] = useState<View>(View.HOME);
  const [notes, setNotes] = useState<Note[]>([]);
  const [spaces, setSpaces] = useState<Space[]>([]);
  const [boards, setBoards] = useState<Board[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [meetings, setMeetings] = useState<Meeting[]>([]);

  const [currentNote, setCurrentNote] = useState<Note | null>(null);
  const [activeSpaceId, setActiveSpaceId] = useState<string | null>(null);
  const [activeBoard, setActiveBoard] = useState<Board | null>(null);
  const [isAiChatVisible, setIsAiChatVisible] = useState(false);
  const [geminiApiKey, setGeminiApiKey] = useState<string | null>(null);


  // Load data from localStorage on mount
  useEffect(() => {
    try {
      const savedNotes = localStorage.getItem('silo-notes');
      const savedSpaces = localStorage.getItem('silo-spaces');
      const savedBoards = localStorage.getItem('silo-boards');
      const savedTasks = localStorage.getItem('silo-tasks');
      const savedMeetings = localStorage.getItem('silo-meetings');
      const savedGeminiKey = localStorage.getItem('gemini-api-key');

      if (savedNotes) setNotes(JSON.parse(savedNotes));
      if (savedSpaces) setSpaces(JSON.parse(savedSpaces));
      if (savedBoards) setBoards(JSON.parse(savedBoards));
      if (savedTasks) setTasks(JSON.parse(savedTasks));
      if (savedMeetings) setMeetings(JSON.parse(savedMeetings));
      if (savedGeminiKey) setGeminiApiKey(savedGeminiKey);

    } catch (error) {
      console.error("Failed to load data from localStorage", error);
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem('silo-notes', JSON.stringify(notes));
      localStorage.setItem('silo-spaces', JSON.stringify(spaces));
      localStorage.setItem('silo-boards', JSON.stringify(boards));
      localStorage.setItem('silo-tasks', JSON.stringify(tasks));
      localStorage.setItem('silo-meetings', JSON.stringify(meetings));
    } catch (error) {
      console.error("Failed to save data to localStorage", error);
    }
  }, [notes, spaces, boards, tasks, meetings]);

  const handleToggleAiChat = useCallback(() => {
    setIsAiChatVisible(prev => !prev);
  }, []);

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
  
  // Task and Meeting Handlers
  const handleAddTask = (title: string) => {
    const newTask: Task = {
      id: new Date().toISOString(),
      title,
      completed: false,
      createdAt: new Date().toISOString(),
    };
    setTasks(prev => [newTask, ...prev]);
  };

  const handleAddMeeting = (title: string, dateTime: string) => {
    const newMeeting: Meeting = {
      id: new Date().toISOString(),
      title,
      dateTime,
      createdAt: new Date().toISOString(),
    };
    setMeetings(prev => [newMeeting, ...prev]);
  };

  const handleToggleTask = (taskId: string) => {
    setTasks(tasks.map(task => 
      task.id === taskId ? { ...task, completed: !task.completed } : task
    ));
  };

  const handleDeleteTask = (taskId: string) => {
    setTasks(tasks.filter(task => task.id !== taskId));
  };
  
  const handleDeleteMeeting = (meetingId: string) => {
    setMeetings(meetings.filter(meeting => meeting.id !== meetingId));
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
            case BoardType.MIND_MAP:
                return <MindMapView board={activeBoard} space={activeSpace} onBack={handleBackToSpace} />;
            case BoardType.WORKFLOW:
                 return <WorkflowView board={activeBoard} space={activeSpace} onBack={handleBackToSpace} />;
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
      case View.AGENDA:
        return <AgendaView 
            tasks={tasks} 
            meetings={meetings} 
            onAddTask={handleAddTask}
            onAddMeeting={handleAddMeeting}
            onToggleTask={handleToggleTask}
            onDeleteTask={handleDeleteTask}
            onDeleteMeeting={handleDeleteMeeting}
        />;
      case View.SETTINGS:
        return <SettingsView onKeyUpdate={setGeminiApiKey} />;
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
      case View.TEXT_TO_SPEECH_TOOL:
        return <TextToSpeechToolView onBack={() => handleViewChange(View.SILO_LABS)} />;
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
        onToggleAiChat={handleToggleAiChat}
      />
      <main className="flex-1 overflow-y-auto">
        {renderMainView()}
      </main>
      {isAiChatVisible && <AiChatComponent onClose={handleToggleAiChat} onSaveNote={handleSaveNote} geminiApiKey={geminiApiKey} onAddTask={handleAddTask} onAddMeeting={handleAddMeeting} />}
    </div>
  );
};

export default App;