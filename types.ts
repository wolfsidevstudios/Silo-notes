export enum View {
  HOME = 'HOME',
  CREATE = 'CREATE',
  EXPLORE = 'EXPLORE',
  IDEAS = 'IDEAS',
  SPACE = 'SPACE',
  BOARD = 'BOARD',
}

export interface AudioNote {
  id: string;
  dataUrl: string; // base64 data URL
}

export interface Note {
  id: string;
  title: string;
  content: string;
  createdAt: string; // ISO string
  audioNotes?: AudioNote[];
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