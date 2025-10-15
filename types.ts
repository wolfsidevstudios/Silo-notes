export enum View {
  HOME = 'HOME',
  CREATE = 'CREATE',
  CALENDAR = 'CALENDAR',
  GEMS = 'GEMS',
  AGENDA = 'AGENDA',
  SPACE = 'SPACE',
  BOARD = 'BOARD',
  SETTINGS = 'SETTINGS',
  SILO_LABS = 'SILO_LABS',
  SILO_CHAT = 'SILO_CHAT',
  SUMMARIZE_TOOL = 'SUMMARIZE_TOOL',
  REWRITE_TOOL = 'REWRITE_TOOL',
  VOICE_MEMO_TOOL = 'VOICE_MEMO_TOOL',
  SPEECH_TO_TEXT_TOOL = 'SPEECH_TO_TEXT_TOOL',
  TEXT_TO_SPEECH_TOOL = 'TEXT_TO_SPEECH_TOOL',
  AI_NOTE_EDITOR = 'AI_NOTE_EDITOR',
  FLASHCARD_TOOL = 'FLASHCARD_TOOL',
  QUIZ_TOOL = 'QUIZ_TOOL',
  YOUTUBE_TO_NOTES_TOOL = 'YOUTUBE_TO_NOTES_TOOL',
  CONCEPT_EXPLAINER_TOOL = 'CONCEPT_EXPLAINER_TOOL',
  NOTES_TO_INFOGRAPHIC_TOOL = 'NOTES_TO_INFOGRAPHIC_TOOL',
  DOCUMENTATION = 'DOCUMENTATION',
}

export enum NoteType {
  CLASSIC = 'CLASSIC',
  STICKY = 'STICKY',
  JOURNAL = 'JOURNAL',
  AI_NOTE = 'AI_NOTE',
  FLASHCARDS = 'FLASHCARDS',
  QUIZ = 'QUIZ',
  INFOGRAPHIC = 'INFOGRAPHIC',
}

export interface AudioNote {
  id: string;
  dataUrl: string; // base64 data URL
}

export interface Note {
  id: string;
  title: string;
  content: string; // Can contain HTML, JSON string, or data URL
  createdAt: string; // ISO string
  audioNotes?: AudioNote[];
  privacy: 'public' | 'private';
  pin?: string;
  type: NoteType;
  color?: string; // For sticky notes
}

export enum TaskPriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
}

export interface Task {
  id: string;
  title: string;
  completed: boolean;
  createdAt: string; // ISO string
  priority: TaskPriority;
}

export interface Meeting {
  id:string;
  title: string;
  dateTime: string;
  createdAt: string; // ISO string
  source?: 'silo' | 'google';
  joinUrl?: string;
  htmlLink?: string;
}

export interface CalendarEvent {
  id: string;
  date: string; // YYYY-MM-DD
  itemId: string;
  itemType: 'note' | 'task' | 'meeting';
}

export interface Space {
  id: string;
  name: string;
}

export enum BoardType {
  NOTE_BOARD = 'Note Board',
  DIAGRAM = 'Diagram',
  JAM_BOARD = 'Jam Board',
  MIND_MAP = 'Mind Map',
  WORKFLOW = 'Workflow',
}

export interface Board {
  id: string;
  name: string;
  spaceId: string;
  type: BoardType;
}

export interface StickyNoteData {
  id: string;
  content: string;
  position: { x: number; y: number };
  color: string;
}