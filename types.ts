export enum View {
  HOME = 'HOME',
  CREATE = 'CREATE',
  EXPLORE = 'EXPLORE',
  IDEAS = 'IDEAS',
  SPACE = 'SPACE',
  BOARD = 'BOARD',
  SETTINGS = 'SETTINGS',
  SILO_LABS = 'SILO_LABS',
  SUMMARIZE_TOOL = 'SUMMARIZE_TOOL',
  REWRITE_TOOL = 'REWRITE_TOOL',
  VOICE_MEMO_TOOL = 'VOICE_MEMO_TOOL',
  SPEECH_TO_TEXT_TOOL = 'SPEECH_TO_TEXT_TOOL',
}

export interface AudioNote {
  id: string;
  dataUrl: string; // base64 data URL
}

export interface Note {
  id: string;
  title: string;
  content: string; // Can contain HTML
  createdAt: string; // ISO string
  audioNotes?: AudioNote[];
  privacy: 'public' | 'private';
  pin?: string;
}

export interface Space {
  id: string;
  name: string;
}

export enum BoardType {
  NOTE_BOARD = 'Note Board',
  DIAGRAM = 'Diagram',
  JAM_BOARD = 'Jam Board',
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