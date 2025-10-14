import React, { useState, useEffect, useRef } from 'react';
import { Note, AudioNote } from '../types';
import { VoiceTypingIcon, VoiceMemoIcon, TextToSpeechIcon, StopIcon, RewriteIcon, SummarizeIcon } from './icons';
import { GoogleGenAI } from "@google/genai";

const ELEVENLABS_API_KEY = 'sk_0c8a39a023d6903e44b64bfe6c751b7d888045d452eb6635';

interface TextToSpeechModalProps {
  onClose: () => void;
  onAddAudio: (dataUrl: string) => void;
}

const voices = {
  en: [
    { id: '21m00Tcm4TlvDq8ikWAM', name: 'Rachel' },
    { id: '29vD33N1CtxCmqQRPO9k', name: 'Drew' },
    { id: '2EiwWnXFnvU5JabPnv8n', name: 'Clyde' },
    { id: '5Q0t7uMcjvnagumLfvZi', name: 'Paul' },
    { id: 'CYw3kZ02Hs0563khs1Fj', name: 'Dave' },
  ],
  es: [
    { id: 'piTKgcLEGmPE4e6mEKli', name: 'Matilde' },
    { id: 'SOYHLrjzK2X1ezoPC6cr', name: 'Alonso' },
    { id: 'bVMeCyTHy58xNoL34h3p', name: 'Florencia' },
    { id: 'g5CIjZEefm0dSOlADwoD', name: 'Elio' },
    { id: 'LaT52xsmXzWb7k2cjgIR', name: 'Domi' },
  ],
};

const TextToSpeechModal: React.FC<TextToSpeechModalProps> = ({ onClose, onAddAudio }) => {
  const [text, setText] = useState('');
  const [language, setLanguage] = useState<'en' | 'es'>('en');
  const [selectedVoiceId, setSelectedVoiceId] = useState(voices.en[0].id);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Reset voice selection when language changes
    setSelectedVoiceId(voices[language][0].id);
    setAudioUrl(null);
    setAudioBlob(null);
    setError(null);
  }, [language]);

  const handleGenerateAudio = async () => {
    if (!text.trim()) {
      setError('Please enter some text to generate audio.');
      return;
    }
    setIsLoading(true);
    setError(null);
    setAudioUrl(null);
    setAudioBlob(null);

    try {
      const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${selectedVoiceId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'xi-api-key': ELEVENLABS_API_KEY,
        },
        body: JSON.stringify({
          text: text,
          model_id: 'eleven_multilingual_v2',
          voice_settings: {
            stability: 0.5,
            similarity_boost: 0.75,
          },
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail?.message || 'Failed to generate audio.');
      }

      const blob = await response.blob();
      setAudioBlob(blob);
      setAudioUrl(URL.createObjectURL(blob));

    } catch (err: any) {
      console.error(err);
      setError(err.message || 'An unexpected error occurred.');
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleAddAudioToNote = () => {
    if (!audioBlob) return;
    const reader = new FileReader();
    reader.readAsDataURL(audioBlob);
    reader.onloadend = () => {
      onAddAudio(reader.result as string);
      onClose();
    };
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 transition-opacity duration-300" aria-modal="true" role="dialog">
      <div className="bg-white rounded-xl shadow-2xl p-8 w-full max-w-lg m-4 transform transition-all duration-300 scale-100 flex flex-col max-h-[90vh]">
        <h2 className="text-2xl font-bold mb-6 text-gray-800">Generate Audio from Text</h2>
        
        <div className="flex-grow overflow-y-auto pr-2">
            <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Type or paste your text here..."
                className="w-full h-32 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-black resize-none mb-6"
                rows={5}
            />

            <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">Language</label>
                <div className="flex bg-gray-100 rounded-lg p-1">
                    <button onClick={() => setLanguage('en')} className={`flex-1 py-2 text-sm font-semibold rounded-md transition-colors ${language === 'en' ? 'bg-white shadow' : 'text-gray-600'}`}>English</button>
                    <button onClick={() => setLanguage('es')} className={`flex-1 py-2 text-sm font-semibold rounded-md transition-colors ${language === 'es' ? 'bg-white shadow' : 'text-gray-600'}`}>Spanish</button>
                </div>
            </div>

            <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">Voice</label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {voices[language].map(voice => (
                        <button key={voice.id} onClick={() => setSelectedVoiceId(voice.id)} className={`text-left p-3 rounded-lg border-2 transition-colors ${selectedVoiceId === voice.id ? 'border-black bg-gray-50' : 'border-gray-200 hover:border-gray-400'}`}>
                            <span className="font-semibold text-gray-800">{voice.name}</span>
                        </button>
                    ))}
                </div>
            </div>
        </div>

        <div className="flex-shrink-0 mt-4">
            <button
                onClick={handleGenerateAudio}
                disabled={isLoading}
                className="w-full bg-black text-white font-semibold py-3 px-6 rounded-full hover:bg-gray-800 transition-colors disabled:bg-gray-400 flex items-center justify-center"
            >
                {isLoading ? (
                    <>
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                        Generating...
                    </>
                ) : "Generate Audio"}
            </button>
            
            {error && <p className="text-red-500 text-sm mt-4 text-center">{error}</p>}

            {audioUrl && (
                <div className="mt-6">
                    <p className="text-sm font-medium text-gray-700 mb-2">Preview</p>
                    <audio controls src={audioUrl} className="w-full"></audio>
                    <button
                        onClick={handleAddAudioToNote}
                        className="w-full mt-4 bg-black text-white font-semibold py-3 px-6 rounded-full hover:bg-gray-800 transition-colors"
                    >
                       Paste to Note
                    </button>
                </div>
            )}
        </div>

        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-700">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
        </button>
      </div>
    </div>
  );
};

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

  // State for Text-to-Speech Modal
  const [isTtsModalOpen, setIsTtsModalOpen] = useState(false);
  
  // State for Gemini Writing Tools
  const [geminiApiKey, setGeminiApiKey] = useState<string | null>(null);
  const [isGeminiConfigured, setIsGeminiConfigured] = useState(false);
  const [writingToolStatus, setWritingToolStatus] = useState('Idle');


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

  useEffect(() => {
    const key = localStorage.getItem('gemini-api-key');
    if (key) {
      setGeminiApiKey(key);
      setIsGeminiConfigured(true);
    }
  }, []);

  const handleSave = () => {
    if (isRecording || isVoiceMemoRecording || isTtsModalOpen) return;
    const finalContent = content + (partialTranscript ? (content.trim() ? ' ' : '') + partialTranscript : '');
    if (title.trim() === '' && finalContent.trim() === '' && audioNotes.length === 0) return;
    onSave({ id: currentNote?.id, title, content: finalContent, audioNotes });
  };
  
  const handleAddTtsAudio = (dataUrl: string) => {
    const newAudioNote: AudioNote = {
        id: new Date().toISOString(),
        dataUrl,
    };
    setAudioNotes(prev => [...prev, newAudioNote]);
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
    if (isRecording || isVoiceMemoRecording || isTtsModalOpen) return;
    
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
      if (isRecording || isVoiceMemoRecording || isTtsModalOpen) return;
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
  
  const handleWritingTool = async (prompt: string, status: string) => {
    if (!geminiApiKey || !content.trim()) return;

    setWritingToolStatus(status);
    try {
        const ai = new GoogleGenAI({ apiKey: geminiApiKey });
        const fullPrompt = `${prompt}:\n\n${content}`;
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: fullPrompt,
        });
        setContent(response.text);
    } catch (error) {
        console.error("Gemini API Error:", error);
        setWritingToolStatus("Error");
        // Optionally, show a more user-friendly error message
    } finally {
        setWritingToolStatus('Idle');
    }
  };

  // Cleanup effect
  useEffect(() => {
    return () => {
      if (isRecording) stopAiRecording();
      if (isVoiceMemoRecording) stopVoiceMemoRecording();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  
  const isActionActive = isRecording || isVoiceMemoRecording || isTtsModalOpen || writingToolStatus !== 'Idle';
  
  return (
    <div className="p-8 lg:p-12 h-full flex flex-col">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold text-gray-800">{currentNote ? 'Edit Note' : 'Create Note'}</h1>
        <button
          onClick={handleSave}
          className="bg-black text-white font-semibold py-2 px-6 rounded-full hover:bg-gray-800 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black disabled:bg-gray-400"
          disabled={isActionActive}
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
          readOnly={isActionActive}
        />
        <textarea
          value={content + (partialTranscript ? (content.trim() ? ' ' : '') + partialTranscript : '')}
          onChange={(e) => {
              if (!isRecording) {
                setContent(e.target.value);
              }
          }}
          readOnly={isActionActive}
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
                    disabled={isVoiceMemoRecording || isTtsModalOpen || writingToolStatus !== 'Idle'}
                    className={`p-2 rounded-full transition-colors duration-200 ${
                        isRecording ? 'bg-red-500 text-white' : 'bg-gray-200 text-black hover:bg-gray-300 disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed'
                    }`}
                    aria-label={isRecording ? 'Stop AI transcription' : 'Start AI transcription'}
                >
                  {isRecording ? <StopIcon /> : <VoiceTypingIcon />}
                </button>
                <p className="text-xs text-gray-500 ml-2 w-24 truncate">
                    {status === 'Idle' && !isRecording ? 'Speech-to-Text' : status}
                </p>
            </div>
            <div className="flex items-center pl-3">
                <button 
                    onClick={handleToggleVoiceMemoRecording}
                    disabled={isRecording || isTtsModalOpen || writingToolStatus !== 'Idle'}
                    className={`p-2 rounded-full transition-colors duration-200 ${
                        isVoiceMemoRecording ? 'bg-red-500 text-white' : 'bg-gray-200 text-black hover:bg-gray-300 disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed'
                    }`}
                    aria-label={isVoiceMemoRecording ? 'Stop recording memo' : 'Start recording memo'}
                >
                  {isVoiceMemoRecording ? <StopIcon /> : <VoiceMemoIcon />}
                </button>
                <p className="text-xs text-gray-500 ml-2 w-24 truncate">
                    {voiceMemoStatus === 'Idle' && !isVoiceMemoRecording ? 'Voice Memo' : voiceMemoStatus}
                </p>
            </div>
            <div className="flex items-center pl-3 pr-2">
                <button 
                    onClick={() => setIsTtsModalOpen(true)}
                    disabled={isActionActive}
                    className="p-2 rounded-full transition-colors duration-200 bg-gray-200 text-black hover:bg-gray-300 disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed"
                    aria-label="Generate audio from text"
                >
                  <TextToSpeechIcon />
                </button>
                <p className="text-xs text-gray-500 ml-2 w-24 truncate">
                    Text-to-Speech
                </p>
            </div>
             {isGeminiConfigured && (
                <div className="flex items-center pl-3 pr-2 divide-x divide-gray-200">
                    <div className="flex items-center pr-3">
                        <button
                            onClick={() => handleWritingTool('Rewrite the following text', 'Rewriting...')}
                            disabled={isActionActive || !content.trim()}
                            className="p-2 rounded-full transition-colors duration-200 bg-gray-200 text-black hover:bg-gray-300 disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed"
                            aria-label="Rewrite text"
                        >
                            <RewriteIcon />
                        </button>
                        <p className="text-xs text-gray-500 ml-2 w-20 truncate">{writingToolStatus === 'Rewriting...' ? 'Rewriting...' : 'Rewrite'}</p>
                    </div>
                    <div className="flex items-center pl-3">
                        <button
                            onClick={() => handleWritingTool('Summarize the following text', 'Summarizing...')}
                            disabled={isActionActive || !content.trim()}
                            className="p-2 rounded-full transition-colors duration-200 bg-gray-200 text-black hover:bg-gray-300 disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed"
                            aria-label="Summarize text"
                        >
                            <SummarizeIcon />
                        </button>
                        <p className="text-xs text-gray-500 ml-2 w-20 truncate">{writingToolStatus === 'Summarizing...' ? 'Summarizing...' : 'Summarize'}</p>
                    </div>
                </div>
            )}
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
      
      {isTtsModalOpen && (
        <TextToSpeechModal 
            onClose={() => setIsTtsModalOpen(false)}
            onAddAudio={handleAddTtsAudio}
        />
      )}

    </div>
  );
};

export default NoteEditor;