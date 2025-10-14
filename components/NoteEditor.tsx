import React, { useState, useEffect, useRef } from 'react';
import { Note, AudioNote } from '../types';
import { AIAudioIcon, VoiceMemoIcon } from './icons';

interface NoteEditorProps {
  currentNote: Note | null;
  onSave: (note: Omit<Note, 'id' | 'createdAt'> & { id?: string; audioNotes?: AudioNote[] }) => void;
}

const ASSEMBLYAI_API_KEY = '49e6f2264b204542b812c42bfb3fcdac';

const NoteEditor: React.FC<NoteEditorProps> = ({ currentNote, onSave }) => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  
  // State for AI audio transcription
  const [isRecording, setIsRecording] = useState(false);
  const [status, setStatus] = useState('Idle');
  const [partialTranscript, setPartialTranscript] = useState('');
  const socketRef = useRef<WebSocket | null>(null);
  const recorderRef = useRef<MediaRecorder | null>(null);
  
  // State for Voice Memo
  const [audioNotes, setAudioNotes] = useState<AudioNote[]>([]);
  const [isVoiceMemoRecording, setIsVoiceMemoRecording] = useState(false);
  const [voiceMemoStatus, setVoiceMemoStatus] = useState('Idle');
  const memoRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  // Shared stream ref for cleanup
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    if (currentNote) {
      setTitle(currentNote.title);
      setContent(currentNote.content);
      setAudioNotes(currentNote.audioNotes || []);
    } else {
      setTitle('');
      setContent('');
      setAudioNotes([]);
    }
  }, [currentNote]);

  const handleSave = () => {
    if (isRecording || isVoiceMemoRecording) return; // Prevent saving while recording
    const finalContent = content + (partialTranscript ? (content.trim() ? ' ' : '') + partialTranscript : '');
    if (title.trim() === '' && finalContent.trim() === '' && audioNotes.length === 0) return;
    onSave({ id: currentNote?.id, title, content: finalContent, audioNotes });
  };

  const stopAiRecording = () => {
    if (recorderRef.current && recorderRef.current.state === 'recording') {
        recorderRef.current.stop();
    }
    if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
        streamRef.current = null;
    }
    if (socketRef.current) {
        if (socketRef.current.readyState === WebSocket.OPEN) {
            socketRef.current.send(JSON.stringify({ terminate_session: true }));
        }
        socketRef.current.close();
        socketRef.current = null;
    }
    
    setContent(prev => prev + (partialTranscript ? (prev.trim() ? ' ' : '') + partialTranscript : ''));
    setPartialTranscript('');
    
    setIsRecording(false);
    setStatus('Idle');
  };

  const startAiRecording = async () => {
    if (isRecording || isVoiceMemoRecording) return;
    
    try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        streamRef.current = stream;
        
        const recorder = new MediaRecorder(stream);
        recorderRef.current = recorder;

        const socket = new WebSocket(`wss://api.assemblyai.com/v2/realtime/ws?sample_rate=16000`);
        socketRef.current = socket;

        socket.onopen = () => {
            setStatus('Recording...');
            setIsRecording(true);
            socket.send(JSON.stringify({ authorization: ASSEMBLYAI_API_KEY }));
            recorder.start(1000);
        };

        socket.onmessage = (event) => {
            const message = JSON.parse(event.data);
            if (message.message_type === 'PartialTranscript') {
                setPartialTranscript(message.text);
            } else if (message.message_type === 'FinalTranscript' && message.text) {
                setContent(prevContent => (prevContent.trim() ? prevContent + ' ' : '') + message.text);
                setPartialTranscript('');
            }
        };

        socket.onerror = (error) => {
            console.error('WebSocket Error:', error);
            setStatus('Error. Please try again.');
            stopAiRecording();
        };

        recorder.ondataavailable = (event) => {
            if (event.data.size > 0 && socket.readyState === WebSocket.OPEN) {
                const reader = new FileReader();
                reader.onload = () => {
                    const base64data = (reader.result as string).split(',')[1];
                    socket.send(JSON.stringify({ audio_data: base64data }));
                };
                reader.readAsDataURL(event.data);
            }
        };
        setStatus('Connecting...');
    } catch (error) {
        console.error('Error accessing microphone:', error);
        setStatus('Microphone access denied.');
    }
  };
  
  const handleToggleAiRecording = () => {
      if (isRecording) {
          stopAiRecording();
      } else {
          startAiRecording();
      }
  };

  // --- Voice Memo Functions ---
  const stopVoiceMemoRecording = () => {
    if (memoRecorderRef.current && memoRecorderRef.current.state === 'recording') {
        memoRecorderRef.current.stop();
    }
  };

  const startVoiceMemoRecording = async () => {
      if (isRecording || isVoiceMemoRecording) return;
      try {
          const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
          streamRef.current = stream;
          
          const recorder = new MediaRecorder(stream);
          memoRecorderRef.current = recorder;
          audioChunksRef.current = [];

          recorder.ondataavailable = (event) => {
              if (event.data.size > 0) {
                  audioChunksRef.current.push(event.data);
              }
          };

          recorder.onstop = () => {
              const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
              const reader = new FileReader();
              reader.readAsDataURL(audioBlob);
              reader.onloadend = () => {
                  const base64data = reader.result as string;
                  const newAudioNote: AudioNote = {
                      id: new Date().toISOString(),
                      dataUrl: base64data,
                  };
                  setAudioNotes(prev => [...prev, newAudioNote]);
              };
              
              if (streamRef.current) {
                  streamRef.current.getTracks().forEach(track => track.stop());
                  streamRef.current = null;
              }
              
              setIsVoiceMemoRecording(false);
              setVoiceMemoStatus('Idle');
          };

          recorder.start();
          setIsVoiceMemoRecording(true);
          setVoiceMemoStatus('Recording...');

      } catch (error) {
          console.error('Error accessing microphone for voice memo:', error);
          setVoiceMemoStatus('Microphone access denied.');
      }
  };

  const handleToggleVoiceMemoRecording = () => {
      if (isVoiceMemoRecording) {
          stopVoiceMemoRecording();
      } else {
          startVoiceMemoRecording();
      }
  };

  const handleDeleteAudioNote = (id: string) => {
    setAudioNotes(prev => prev.filter(note => note.id !== id));
  };
  
  // Cleanup effect
  useEffect(() => {
    return () => {
      if (isRecording) stopAiRecording();
      if (isVoiceMemoRecording) stopVoiceMemoRecording();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  
  return (
    <div className="p-8 lg:p-12 h-full flex flex-col">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold text-gray-800">{currentNote ? 'Edit Note' : 'Create Note'}</h1>
        <button
          onClick={handleSave}
          className="bg-black text-white font-semibold py-2 px-6 rounded-full hover:bg-gray-800 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black disabled:bg-gray-400"
          disabled={isRecording || isVoiceMemoRecording}
        >
          Save Note
        </button>
      </div>

      <div className="flex-grow flex flex-col">
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Note Title"
          className="text-4xl font-bold placeholder-gray-300 focus:outline-none mb-6 pb-2 border-b border-transparent focus:border-gray-200"
          readOnly={isRecording || isVoiceMemoRecording}
        />
        <textarea
          value={content + (partialTranscript ? (content.trim() ? ' ' : '') + partialTranscript : '')}
          onChange={(e) => {
              if (!isRecording) {
                setContent(e.target.value);
              }
          }}
          readOnly={isRecording || isVoiceMemoRecording}
          placeholder="Start writing here, or use the AI tool below to dictate..."
          className="flex-1 w-full text-lg leading-relaxed text-gray-700 placeholder-gray-400 focus:outline-none resize-none"
        />

        {audioNotes.length > 0 && (
          <div className="mt-6 flex-shrink-0">
            <h3 className="text-sm font-semibold text-gray-600 mb-3">Voice Memos</h3>
            <div className="space-y-3 max-h-48 overflow-y-auto pr-2">
              {audioNotes.map(audio => (
                <div key={audio.id} className="flex items-center gap-2 bg-gray-100 p-2 rounded-lg">
                  <audio controls src={audio.dataUrl} className="w-full h-10"></audio>
                  <button 
                    onClick={() => handleDeleteAudioNote(audio.id)} 
                    className="p-2 text-gray-400 hover:text-red-500 rounded-full hover:bg-red-100 transition-colors" 
                    aria-label="Delete voice memo"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="flex-shrink-0 mt-4 p-2 bg-gray-100 rounded-full shadow-sm flex items-center justify-between">
         <div className="flex items-center divide-x divide-gray-200">
            <div className="flex items-center px-2">
                <button 
                    onClick={handleToggleAiRecording}
                    disabled={isVoiceMemoRecording}
                    className={`p-2 rounded-full transition-colors duration-200 ${
                        isRecording ? 'bg-red-500 text-white' : 'bg-gray-200 text-black hover:bg-gray-300 disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed'
                    }`}
                    aria-label={isRecording ? 'Stop AI transcription' : 'Start AI transcription'}
                >
                  <AIAudioIcon />
                </button>
                <p className="text-xs text-gray-500 ml-2 w-24 truncate">{status}</p>
            </div>
            <div className="flex items-center pl-3 pr-2">
                <button 
                    onClick={handleToggleVoiceMemoRecording}
                    disabled={isRecording}
                    className={`p-2 rounded-full transition-colors duration-200 ${
                        isVoiceMemoRecording ? 'bg-red-500 text-white' : 'bg-gray-200 text-black hover:bg-gray-300 disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed'
                    }`}
                    aria-label={isVoiceMemoRecording ? 'Stop recording memo' : 'Start recording memo'}
                >
                  <VoiceMemoIcon />
                </button>
                <p className="text-xs text-gray-500 ml-2 w-24 truncate">{voiceMemoStatus}</p>
            </div>
         </div>
         {(isRecording || isVoiceMemoRecording) && (
            <div className="flex items-center pr-3">
                <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                </span>
                <span className="ml-2 text-xs text-red-600 font-semibold">Live</span>
            </div>
         )}
      </div>

    </div>
  );
};

export default NoteEditor;