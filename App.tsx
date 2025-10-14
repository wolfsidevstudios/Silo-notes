import React, { useState, useEffect, useCallback, useRef } from 'react';
import Sidebar from './components/Sidebar';
import HomeView from './components/HomeView';
import ClassicNoteEditor from './components/NoteEditor';
import StickyNoteEditor from './components/StickyNoteEditor';
import JournalEditor from './components/JournalEditor';
import CalendarView from './components/CalendarView';
import IdeasView from './components/IdeasView';
import AgendaView from './components/AgendaView';
import SpaceView from './components/SpaceView';
import NoteBoardView from './components/NoteBoardView';
import DiagramView from './components/DiagramView';
import JamBoardView from './components/JamBoardView';
import SettingsView from './components/SettingsView';
import SiloLabsView from './components/SiloLabsView';
import SiloChatView from './components/SiloChatView';
import SummarizeToolView from './components/SummarizeToolView';
import RewriteToolView from './components/RewriteToolView';
import VoiceMemoToolView from './components/VoiceMemoToolView';
import SpeechToTextToolView from './components/SpeechToTextToolView';
import TextToSpeechToolView from './components/TextToSpeechToolView';
import MindMapView from './components/MindMapView';
import WorkflowView from './components/WorkflowView';
import LandingPage from './components/LandingPage';
import LoginPage from './components/LoginPage';
import PrivacyPolicy from './components/PrivacyPolicy';
import TermsOfService from './components/TermsOfService';
import { GoogleGenAI } from "@google/genai";
import { ArrowUpIcon, CloseIcon } from './components/icons';
import NewNoteTypeModal from './components/NewNoteTypeModal';


import { View, Note, Space, Board, BoardType, Task, Meeting, NoteType, TaskPriority, CalendarEvent } from './types';

// Timer Component
const TimerComponent = ({ initialSeconds, onClose }: { initialSeconds: number; onClose: () => void }) => {
    const [secondsLeft, setSecondsLeft] = useState(initialSeconds);
    const [isActive, setIsActive] = useState(true);
    const [isPill, setIsPill] = useState(false);
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
        <div
            onDoubleClick={() => setIsPill(p => !p)}
            className={`bg-black text-white shadow-2xl transition-all duration-300 ease-in-out cursor-pointer ${
                isPill
                ? 'w-40 h-12 rounded-full flex items-center justify-center'
                : 'w-80 rounded-3xl p-6 text-center'
            }`}
        >
            {isPill ? (
                <p className="text-xl font-mono">{formatTime()}</p>
            ) : (
                <>
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="font-semibold">Timer</h3>
                        <button onClick={(e) => { e.stopPropagation(); onClose(); }} className="text-white/50 hover:text-white">
                           <CloseIcon />
                        </button>
                    </div>
                    <p className="text-5xl font-mono mb-4">{formatTime()}</p>
                    <div className="flex justify-center gap-2">
                        <button onClick={(e) => { e.stopPropagation(); toggle(); }} className="bg-white/20 px-4 py-1 rounded-full">{isActive ? 'Pause' : 'Start'}</button>
                        <button onClick={(e) => { e.stopPropagation(); reset(); }} className="bg-white/20 px-4 py-1 rounded-full">Reset</button>
                    </div>
                </>
            )}
        </div>
    );
};

// Stopwatch Component
const StopwatchComponent = ({ onClose }: { onClose: () => void }) => {
    const [time, setTime] = useState(0);
    const [isActive, setIsActive] = useState(true);
    const [isPill, setIsPill] = useState(false);
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
        <div
            onDoubleClick={() => setIsPill(p => !p)}
            className={`bg-black text-white shadow-2xl transition-all duration-300 ease-in-out cursor-pointer ${
                isPill
                ? 'w-48 h-12 rounded-full flex items-center justify-center'
                : 'w-80 rounded-3xl p-6 text-center'
            }`}
        >
            {isPill ? (
                 <p className="text-xl font-mono">{formatTime()}</p>
            ) : (
                <>
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="font-semibold">Stopwatch</h3>
                         <button onClick={(e) => { e.stopPropagation(); onClose(); }} className="text-white/50 hover:text-white">
                            <CloseIcon />
                        </button>
                    </div>
                    <p className="text-5xl font-mono mb-4">{formatTime()}</p>
                    <div className="flex justify-center gap-2">
                        <button onClick={(e) => { e.stopPropagation(); toggle(); }} className="bg-white/20 px-4 py-1 rounded-full">{isActive ? 'Pause' : 'Start'}</button>
                        <button onClick={(e) => { e.stopPropagation(); reset(); }} className="bg-white/20 px-4 py-1 rounded-full">Reset</button>
                    </div>
                </>
            )}
        </div>
    );
};


// AI Chat Component
const AiChatComponent = ({ onClose, onSaveNote, geminiApiKey, onAddTask, onAddMeeting, onSetTimer, onSetStopwatch }: { 
    onClose: () => void; 
    onSaveNote: (note: Omit<Note, 'id' | 'createdAt'> & { id?: string; type: NoteType; }) => void;
    geminiApiKey: string | null; 
    onAddTask: (title: string, priority: TaskPriority) => void; 
    onAddMeeting: (title: string, dateTime: string) => void;
    onSetTimer: (props: { initialSeconds: number }) => void;
    onSetStopwatch: () => void;
}) => {
    const [inputValue, setInputValue] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        inputRef.current?.focus();
    }, []);
    
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
                    onSetTimer({ initialSeconds: seconds });
                    onClose();
                }
            } else if (resultText === 'STOPWATCH') {
                onSetStopwatch();
                onClose();
            } else if (resultText.startsWith('TASK::')) {
                const title = resultText.split('::')[1];
                if (title) onAddTask(title, TaskPriority.MEDIUM);
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
                onSaveNote({ title, content, audioNotes: [], privacy: 'public', type: NoteType.CLASSIC });
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

    const containerClasses = `fixed top-8 left-1/2 -translate-x-1/2 z-50 transition-all duration-500 ease-in-out flex items-center justify-center w-[500px] h-14 bg-white rounded-full shadow-lg border`;

    return (
        <div className={containerClasses}>
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
        </div>
    );
};

interface UserProfile {
    name: string;
    picture: string;
    email: string;
}

const App: React.FC = () => {
  // Authentication & Routing
  const [isAuthenticated, setIsAuthenticated] = useState(() => localStorage.getItem('silo-authenticated') === 'true');
  const [userProfile, setUserProfile] = useState<UserProfile | null>(() => {
    const savedProfile = localStorage.getItem('silo-user-profile');
    return savedProfile ? JSON.parse(savedProfile) : null;
  });
  const [route, setRoute] = useState(window.location.hash || '#/');

  useEffect(() => {
    const handleHashChange = () => {
        setRoute(window.location.hash || '#/');
    };
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const handleLoginSuccess = (profile: UserProfile) => {
    localStorage.setItem('silo-authenticated', 'true');
    localStorage.setItem('silo-user-profile', JSON.stringify(profile));
    setIsAuthenticated(true);
    setUserProfile(profile);
    window.location.hash = '#/home';
  };

  const handleLogout = () => {
    localStorage.removeItem('silo-authenticated');
    localStorage.removeItem('silo-user-profile');
    setIsAuthenticated(false);
    setUserProfile(null);
    window.location.hash = '#/';
  };

  // State management
  const [activeView, setActiveView] = useState<View>(View.HOME);
  const [notes, setNotes] = useState<Note[]>([]);
  const [spaces, setSpaces] = useState<Space[]>([]);
  const [boards, setBoards] = useState<Board[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [calendarEvents, setCalendarEvents] = useState<CalendarEvent[]>([]);

  const [currentNote, setCurrentNote] = useState<Note | null>(null);
  const [activeSpaceId, setActiveSpaceId] = useState<string | null>(null);
  const [activeBoard, setActiveBoard] = useState<Board | null>(null);
  const [isAiChatVisible, setIsAiChatVisible] = useState(false);
  const [isNewNoteModalVisible, setIsNewNoteModalVisible] = useState(false);
  const [geminiApiKey, setGeminiApiKey] = useState<string | null>(null);
  const [activeClock, setActiveClock] = useState<{ type: 'timer' | 'stopwatch'; props: any } | null>(null);

  useEffect(() => {
    if (route.startsWith('#/')) {
        const viewKey = route.substring(2).toUpperCase();
        if (Object.values(View).includes(viewKey as View)) {
            handleViewChange(viewKey as View);
        } else if (route === '#/home') {
            handleViewChange(View.HOME);
        }
    }
  }, [route]);

  // Load data from localStorage on mount
  useEffect(() => {
    try {
      const savedNotes = localStorage.getItem('silo-notes');
      const savedSpaces = localStorage.getItem('silo-spaces');
      const savedBoards = localStorage.getItem('silo-boards');
      const savedTasks = localStorage.getItem('silo-tasks');
      const savedMeetings = localStorage.getItem('silo-meetings');
      const savedCalendarEvents = localStorage.getItem('silo-calendar-events');
      const savedGeminiKey = localStorage.getItem('gemini-api-key');

      if (savedNotes) {
        const parsedNotes = JSON.parse(savedNotes).map((note: Note) => ({
            ...note,
            type: note.type || NoteType.CLASSIC,
        }));
        setNotes(parsedNotes);
      }
      if (savedSpaces) setSpaces(JSON.parse(savedSpaces));
      if (savedBoards) setBoards(JSON.parse(savedBoards));
      if (savedTasks) {
        const parsedTasks = JSON.parse(savedTasks);
        // Migration for tasks without priority
        const migratedTasks = parsedTasks.map((task: any) => ({
          ...task,
          priority: task.priority || TaskPriority.MEDIUM,
        }));
        setTasks(migratedTasks);
      }
      if (savedMeetings) setMeetings(JSON.parse(savedMeetings));
      if (savedCalendarEvents) setCalendarEvents(JSON.parse(savedCalendarEvents));
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
      localStorage.setItem('silo-calendar-events', JSON.stringify(calendarEvents));
    } catch (error) {
      console.error("Failed to save data to localStorage", error);
    }
  }, [notes, spaces, boards, tasks, meetings, calendarEvents]);

  const handleToggleAiChat = useCallback(() => setIsAiChatVisible(prev => !prev), []);
  const handleSetTimer = useCallback((props: { initialSeconds: number }) => setActiveClock({ type: 'timer', props }), []);
  const handleSetStopwatch = useCallback(() => setActiveClock({ type: 'stopwatch', props: {} }), []);
  const handleCloseClock = useCallback(() => setActiveClock(null), []);

  const handleViewChange = useCallback((view: View) => {
    setActiveView(view);
    setCurrentNote(null);
    setActiveSpaceId(null);
    setActiveBoard(null);
    window.location.hash = `/${view.toLowerCase()}`;
  }, []);

  const handleOpenNewNoteModal = () => setIsNewNoteModalVisible(true);
  const handleCloseNewNoteModal = () => setIsNewNoteModalVisible(false);

  const handleSelectNoteType = (type: NoteType) => {
    const newNote: Omit<Note, 'id'> = {
        title: '', content: '', createdAt: new Date().toISOString(), privacy: 'public', type: type, audioNotes: [],
    };
    setCurrentNote(newNote as Note);
    handleViewChange(View.CREATE);
    handleCloseNewNoteModal();
  };

  const handleEditNote = (note: Note) => {
    setCurrentNote(note);
    handleViewChange(View.CREATE);
  };

  const handleSaveNote = (noteData: Omit<Note, 'id' | 'createdAt'> & { id?: string; type: NoteType; }) => {
    if (noteData.id) {
      setNotes(notes.map(n => n.id === noteData.id ? { ...n, ...noteData, id: noteData.id } : n));
    } else {
      const newNote: Note = {
        id: new Date().toISOString(), createdAt: new Date().toISOString(), title: noteData.title, content: noteData.content,
        audioNotes: noteData.audioNotes || [], privacy: noteData.privacy, pin: noteData.pin, type: noteData.type, color: noteData.color,
      };
      setNotes([newNote, ...notes]);
    }
    handleViewChange(View.HOME);
  };
  
  const handleAddTask = (title: string, priority: TaskPriority) => { setTasks(prev => [{ id: new Date().toISOString(), title, completed: false, createdAt: new Date().toISOString(), priority }, ...prev]); };
  const handleAddMeeting = (title: string, dateTime: string) => { setMeetings(prev => [{ id: new Date().toISOString(), title, dateTime, createdAt: new Date().toISOString() }, ...prev]); };
  const handleToggleTask = (taskId: string) => { setTasks(tasks.map(task => task.id === taskId ? { ...task, completed: !task.completed } : task)); };
  const handleDeleteTask = (taskId: string) => { setTasks(tasks.filter(task => task.id !== taskId)); };
  const handleDeleteMeeting = (meetingId: string) => { setMeetings(meetings.filter(meeting => meeting.id !== meetingId)); };

  const handleAddCalendarEvents = (date: string, items: { id: string; type: 'note' | 'task' }[]) => {
    const newEvents: CalendarEvent[] = items.map(item => ({
        id: `${date}-${item.id}`,
        date,
        itemId: item.id,
        itemType: item.type,
    }));

    setCalendarEvents(prev => {
        const existingEventIds = new Set(prev.map(e => e.id));
        const uniqueNewEvents = newEvents.filter(e => !existingEventIds.has(e.id));
        return [...prev, ...uniqueNewEvents];
    });
  };

  const handleDeleteCalendarEvent = (eventId: string) => {
    setCalendarEvents(prev => prev.filter(e => e.id !== eventId));
  };

  const handleAddSpace = (name: string) => {
    if (name.trim() === '') return;
    setSpaces([...spaces, { id: new Date().toISOString(), name }]);
  };

  const handleSelectSpace = (spaceId: string) => {
    setActiveSpaceId(spaceId);
    setActiveView(View.SPACE);
    setActiveBoard(null);
    setCurrentNote(null);
  };
  
  const handleAddBoard = (name: string, spaceId: string, type: BoardType) => {
    if (name.trim() === '') return;
    setBoards([...boards, { id: new Date().toISOString(), name, spaceId, type }]);
  };

  const handleSelectBoard = (board: Board) => { setActiveBoard(board); setActiveView(View.BOARD); };
  const handleBackToSpace = () => { setActiveView(View.SPACE); setActiveBoard(null); };

  useEffect(() => {
    const activeSpace = spaces.find(s => s.id === activeSpaceId);
    if ((activeView === View.SPACE && !activeSpace) || (activeView === View.BOARD && (!activeBoard || !activeSpace))) {
      handleViewChange(View.HOME);
    }
  }, [activeView, activeBoard, activeSpaceId, spaces, handleViewChange]);

  const renderMainView = () => {
    const activeSpace = spaces.find(s => s.id === activeSpaceId);
    if (activeView === View.BOARD && activeBoard && activeSpace) {
        switch (activeBoard.type) {
            case BoardType.NOTE_BOARD: return <NoteBoardView board={activeBoard} space={activeSpace} onBack={handleBackToSpace} />;
            case BoardType.DIAGRAM: return <DiagramView board={activeBoard} space={activeSpace} onBack={handleBackToSpace} />;
            case BoardType.JAM_BOARD: return <JamBoardView board={activeBoard} space={activeSpace} onBack={handleBackToSpace} />;
            case BoardType.MIND_MAP: return <MindMapView board={activeBoard} space={activeSpace} onBack={handleBackToSpace} />;
            case BoardType.WORKFLOW: return <WorkflowView board={activeBoard} space={activeSpace} onBack={handleBackToSpace} />;
            default: return <HomeView notes={notes} onEditNote={handleEditNote} />;
        }
    }
    if (activeView === View.SPACE && activeSpace) return <SpaceView space={activeSpace} boards={boards.filter(b => b.spaceId === activeSpace.id)} addBoard={handleAddBoard} onSelectBoard={handleSelectBoard}/>;
    switch (activeView) {
      case View.HOME: return <HomeView notes={notes} onEditNote={handleEditNote} />;
      case View.CREATE:
        if (currentNote?.type === NoteType.JOURNAL) return <JournalEditor currentNote={currentNote} onSave={handleSaveNote} />;
        if (currentNote?.type === NoteType.STICKY) return <StickyNoteEditor currentNote={currentNote} onSave={handleSaveNote} />;
        return <ClassicNoteEditor currentNote={currentNote} onSave={handleSaveNote} />;
      case View.CALENDAR: return <CalendarView events={calendarEvents} notes={notes} tasks={tasks} onAddEvents={handleAddCalendarEvents} onDeleteEvent={handleDeleteCalendarEvent} onEditNote={handleEditNote} />;
      case View.IDEAS: return <IdeasView />;
      case View.AGENDA: return <AgendaView tasks={tasks} meetings={meetings} onAddTask={handleAddTask} onAddMeeting={handleAddMeeting} onToggleTask={handleToggleTask} onDeleteTask={handleDeleteTask} onDeleteMeeting={handleDeleteMeeting} />;
      case View.SETTINGS: return <SettingsView userProfile={userProfile} onKeyUpdate={setGeminiApiKey} onLogout={handleLogout} />;
      case View.SILO_LABS: return <SiloLabsView onViewChange={handleViewChange} />;
      case View.SILO_CHAT: return <SiloChatView geminiApiKey={geminiApiKey} onSaveNote={handleSaveNote} onAddTask={handleAddTask} onAddMeeting={handleAddMeeting} />;
      case View.SUMMARIZE_TOOL: return <SummarizeToolView onBack={() => handleViewChange(View.SILO_LABS)} />;
      case View.REWRITE_TOOL: return <RewriteToolView onBack={() => handleViewChange(View.SILO_LABS)} />;
      case View.VOICE_MEMO_TOOL: return <VoiceMemoToolView onBack={() => handleViewChange(View.SILO_LABS)} />;
      case View.SPEECH_TO_TEXT_TOOL: return <SpeechToTextToolView onBack={() => handleViewChange(View.SILO_LABS)} />;
      case View.TEXT_TO_SPEECH_TOOL: return <TextToSpeechToolView onBack={() => handleViewChange(View.SILO_LABS)} />;
      default: return <HomeView notes={notes} onEditNote={handleEditNote} />;
    }
  };
  
  if (!isAuthenticated) {
    switch (route) {
        case '#/login': return <LoginPage onLoginSuccess={handleLoginSuccess} />;
        case '#/privacy': return <PrivacyPolicy />;
        case '#/terms': return <TermsOfService />;
        default: return <LandingPage />;
    }
  }

  return (
    <div className="flex h-screen font-sans bg-white">
      <Sidebar
        activeView={activeView}
        onViewChange={handleViewChange}
        spaces={spaces}
        addSpace={handleAddSpace}
        onOpenNewNoteModal={handleOpenNewNoteModal}
        activeSpaceId={activeSpaceId}
        onSelectSpace={handleSelectSpace}
        onToggleAiChat={handleToggleAiChat}
      />
      <main className="flex-1 overflow-y-auto">
        {renderMainView()}
      </main>
      {isAiChatVisible && <AiChatComponent onClose={handleToggleAiChat} onSaveNote={handleSaveNote} geminiApiKey={geminiApiKey} onAddTask={handleAddTask} onAddMeeting={handleAddMeeting} onSetTimer={handleSetTimer} onSetStopwatch={handleSetStopwatch} />}
      {isNewNoteModalVisible && <NewNoteTypeModal onSelect={handleSelectNoteType} onClose={handleCloseNewNoteModal} />}
      {activeClock && (
        <div className="fixed bottom-8 right-8 z-50">
          {activeClock.type === 'timer' && <TimerComponent {...activeClock.props} onClose={handleCloseClock} />}
          {activeClock.type === 'stopwatch' && <StopwatchComponent onClose={handleCloseClock} />}
        </div>
      )}
    </div>
  );
};

export default App;
