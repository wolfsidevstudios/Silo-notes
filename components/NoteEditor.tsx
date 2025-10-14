import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Note, AudioNote } from '../types';
import { VoiceTypingIcon, VoiceMemoIcon, TextToSpeechIcon, StopIcon, RewriteIcon, SummarizeIcon } from './icons';
import { GoogleGenAI } from "@google/genai";
import FloatingToolbar from './FloatingToolbar';
import PinModal from './PinModal';

const ELEVENLABS_API_KEY = 'sk_0c8a39a023d6903e44b64bfe6c751b7d888045d452eb6635';

// ... (TextToSpeechModal component remains the same)
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
    setSelectedVoiceId(voices[language][0].id);
    setAudioUrl(null); setAudioBlob(null); setError(null);
  }, [language]);

  const handleGenerateAudio = async () => {
    if (!text.trim()) { setError('Please enter some text.'); return; }
    setIsLoading(true); setError(null); setAudioUrl(null); setAudioBlob(null);
    try {
      const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${selectedVoiceId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'xi-api-key': ELEVENLABS_API_KEY },
        body: JSON.stringify({
          text: text, model_id: 'eleven_multilingual_v2',
          voice_settings: { stability: 0.5, similarity_boost: 0.75 },
        }),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail?.message || 'Failed to generate audio.');
      }
      const blob = await response.blob();
      setAudioBlob(blob); setAudioUrl(URL.createObjectURL(blob));
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'An unexpected error occurred.');
    } finally { setIsLoading(false); }
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
            <textarea value={text} onChange={(e) => setText(e.target.value)} placeholder="Type or paste your text here..." className="w-full h-32 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-black resize-none mb-6" rows={5} />
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
            <button onClick={handleGenerateAudio} disabled={isLoading} className="w-full bg-black text-white font-semibold py-3 px-6 rounded-full hover:bg-gray-800 transition-colors disabled:bg-gray-400 flex items-center justify-center">
                {isLoading ? (<> <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg> Generating... </>) : "Generate Audio"}
            </button>
            {error && <p className="text-red-500 text-sm mt-4 text-center">{error}</p>}
            {audioUrl && (
                <div className="mt-6">
                    <p className="text-sm font-medium text-gray-700 mb-2">Preview</p>
                    <audio controls src={audioUrl} className="w-full"></audio>
                    <button onClick={handleAddAudioToNote} className="w-full mt-4 bg-black text-white font-semibold py-3 px-6 rounded-full hover:bg-gray-800 transition-colors">Paste to Note</button>
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
  onSave: (note: Omit<Note, 'id' | 'createdAt'> & { id?: string }) => void;
}

const ASSEMBLYAI_API_KEY = '49e6f2264b204542b812c42bfb3fcdac';

const NoteEditor: React.FC<NoteEditorProps> = ({ currentNote, onSave }) => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [privacy, setPrivacy] = useState<'public' | 'private'>('public');
  const [pin, setPin] = useState<string | undefined>(undefined);
  const [isLocked, setIsLocked] = useState(false);
  const [showPinModal, setShowPinModal] = useState<'set' | 'enter' | null>(null);
  const [pinError, setPinError] = useState('');
  
  const [isRecording, setIsRecording] = useState(false);
  const [status, setStatus] = useState('Idle');
  const [partialTranscript, setPartialTranscript] = useState('');
  const socketRef = useRef<WebSocket | null>(null);
  const recorderRef = useRef<MediaRecorder | null>(null);
  
  const [audioNotes, setAudioNotes] = useState<AudioNote[]>([]);
  const [isVoiceMemoRecording, setIsVoiceMemoRecording] = useState(false);
  const memoRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  const [isTtsModalOpen, setIsTtsModalOpen] = useState(false);
  
  const [geminiApiKey, setGeminiApiKey] = useState<string | null>(null);
  const [isGeminiConfigured, setIsGeminiConfigured] = useState(false);
  const [writingToolStatus, setWritingToolStatus] = useState('Idle');
  const streamRef = useRef<MediaStream | null>(null);
  
  const contentEditableRef = useRef<HTMLDivElement>(null);
  const [toolbarState, setToolbarState] = useState<{ top: number; left: number; visible: boolean }>({ top: 0, left: 0, visible: false });

  const handleSelectionChange = useCallback(() => {
    const selection = window.getSelection();
    if (selection && !selection.isCollapsed && contentEditableRef.current?.contains(selection.anchorNode)) {
      const range = selection.getRangeAt(0);
      const rect = range.getBoundingClientRect();
      setToolbarState({
        top: rect.top + window.scrollY,
        left: rect.left + window.scrollX + rect.width / 2,
        visible: true,
      });
    } else {
      setToolbarState(prev => ({ ...prev, visible: false }));
    }
  }, []);

  useEffect(() => {
    document.addEventListener('selectionchange', handleSelectionChange);
    return () => document.removeEventListener('selectionchange', handleSelectionChange);
  }, [handleSelectionChange]);

  useEffect(() => {
    if (currentNote) {
      setTitle(currentNote.title);
      const newContent = currentNote.content || '';
      setContent(newContent);
      if (contentEditableRef.current) {
        contentEditableRef.current.innerHTML = newContent;
      }
      setAudioNotes(currentNote.audioNotes || []);
      setPrivacy(currentNote.privacy);
      setPin(currentNote.pin);
      if (currentNote.privacy === 'private') {
        setIsLocked(true);
        setShowPinModal('enter');
      } else {
        setIsLocked(false);
      }
    } else {
      setTitle('');
      setContent('');
      if (contentEditableRef.current) {
        contentEditableRef.current.innerHTML = '';
      }
      setAudioNotes([]);
      setPrivacy('public');
      setPin(undefined);
      setIsLocked(false);
    }
  }, [currentNote]);

  useEffect(() => {
    const key = localStorage.getItem('gemini-api-key');
    if (key) {
      setGeminiApiKey(key);
      setIsGeminiConfigured(true);
    }
  }, []);
  
  const handleCommand = (command: string, value?: string) => {
    document.execCommand(command, false, value);
    contentEditableRef.current?.focus();
    setContent(contentEditableRef.current?.innerHTML || '');
  };

  const handleSave = () => {
    onSave({ id: currentNote?.id, title, content, audioNotes, privacy, pin });
  };
  
  const handlePrivacyChange = (newPrivacy: 'public' | 'private') => {
    if (newPrivacy === 'private' && !pin) {
        setShowPinModal('set');
    } else {
        setPrivacy(newPrivacy);
    }
  };

  const handleSetPin = (newPin: string) => {
      setPin(newPin);
      setPrivacy('private');
      setShowPinModal(null);
  };
  
  const handleUnlockPin = (enteredPin: string) => {
      if (enteredPin === pin) {
          setIsLocked(false);
          setShowPinModal(null);
          setPinError('');
      } else {
          setPinError('Incorrect PIN. Please try again.');
      }
  };

  const handleAddTtsAudio = (dataUrl: string) => { setAudioNotes(prev => [...prev, { id: new Date().toISOString(), dataUrl }]); };

  const stopAiRecording = useCallback(() => {
    if (recorderRef.current?.state === 'recording') recorderRef.current.stop();
    streamRef.current?.getTracks().forEach(track => track.stop());
    streamRef.current = null;
    if (socketRef.current) {
        if (socketRef.current.readyState === WebSocket.OPEN) {
            socketRef.current.send(JSON.stringify({ terminate_session: true }));
        }
        socketRef.current.close();
        socketRef.current = null;
    }

    if (contentEditableRef.current && partialTranscript) {
        const selection = window.getSelection();
        const range = selection?.getRangeAt(0);
        if (range) {
            range.deleteContents();
            const textNode = document.createTextNode((contentEditableRef.current.innerHTML.trim().length > 0 ? ' ' : '') + partialTranscript);
            range.insertNode(textNode);
            range.setStartAfter(textNode);
            range.setEndAfter(textNode);
            selection?.removeAllRanges();
            selection?.addRange(range);
        }
        setContent(contentEditableRef.current.innerHTML);
    }

    setPartialTranscript('');
    setIsRecording(false);
    setStatus('Idle');
  }, [partialTranscript]);

  const startAiRecording = async () => {
    if (isRecording) return;
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      const recorder = new MediaRecorder(stream);
      recorderRef.current = recorder;
      const socket = new WebSocket(`wss://api.assemblyai.com/v2/realtime/ws?sample_rate=16000`);
      socketRef.current = socket;

      socket.onopen = () => {
        setStatus('Transcribing...');
        setIsRecording(true);
        socket.send(JSON.stringify({ authorization: ASSEMBLYAI_API_KEY }));
        recorder.start(1000);
      };
      
      socket.onmessage = (event) => {
        const msg = JSON.parse(event.data);
        if (msg.message_type === 'PartialTranscript') {
            setPartialTranscript(msg.text);
        } else if (msg.message_type === 'FinalTranscript' && msg.text) {
          if (contentEditableRef.current) {
            const selection = window.getSelection();
            const range = selection?.getRangeAt(0);
            if (range) {
                range.deleteContents();
                const textNode = document.createTextNode((contentEditableRef.current.innerHTML.trim().length > 0 ? ' ' : '') + msg.text);
                range.insertNode(textNode);
                range.setStartAfter(textNode);
                range.setEndAfter(textNode);
                selection?.removeAllRanges();
                selection?.addRange(range);
            }
            setContent(contentEditableRef.current.innerHTML);
          }
          setPartialTranscript('');
        }
      };
      
      socket.onerror = () => { setStatus('Error'); stopAiRecording(); };
      socket.onclose = () => { stopAiRecording(); };
      
      recorder.ondataavailable = (e) => {
        if (e.data.size > 0 && socket.readyState === WebSocket.OPEN) {
          const reader = new FileReader();
          reader.onload = () => socket.send(JSON.stringify({ audio_data: (reader.result as string).split(',')[1] }));
          reader.readAsDataURL(e.data);
        }
      };
      
      setStatus('Connecting...');
    } catch (error) {
      console.error('Mic error:', error);
      setStatus('Mic access denied');
    }
  };

  const handleToggleAiRecording = () => {
    isRecording ? stopAiRecording() : startAiRecording();
  };

  const stopVoiceMemoRecording = () => {
    if (memoRecorderRef.current && memoRecorderRef.current.state === 'recording') {
      memoRecorderRef.current.stop();
    }
  };

  const startVoiceMemoRecording = async () => {
    if (isVoiceMemoRecording) return;
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      const recorder = new MediaRecorder(stream);
      memoRecorderRef.current = recorder;
      audioChunksRef.current = [];

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) audioChunksRef.current.push(event.data);
      };

      recorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const reader = new FileReader();
        reader.readAsDataURL(audioBlob);
        reader.onloadend = () => {
          const newAudioNote: AudioNote = {
            id: new Date().toISOString(),
            dataUrl: reader.result as string,
          };
          setAudioNotes(prev => [...prev, newAudioNote]);
        };
        streamRef.current?.getTracks().forEach(track => track.stop());
        streamRef.current = null;
        setIsVoiceMemoRecording(false);
      };

      recorder.start();
      setIsVoiceMemoRecording(true);
    } catch (error) {
      console.error('Error accessing microphone:', error);
    }
  };

  const handleToggleVoiceMemoRecording = () => {
    isVoiceMemoRecording ? stopVoiceMemoRecording() : startVoiceMemoRecording();
  };

  const handleDeleteAudioNote = (id: string) => { setAudioNotes(prev => prev.filter(note => note.id !== id)); };
  
  const handleWritingTool = async (action: 'rewrite' | 'summarize', statusText: string) => {
    if (!geminiApiKey) return;

    const selection = window.getSelection();
    let textToProcess = '';
    let isSelection = false;

    if (selection && !selection.isCollapsed && contentEditableRef.current?.contains(selection.getRangeAt(0).commonAncestorContainer)) {
        textToProcess = selection.toString();
        isSelection = true;
    } else {
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = content;
        textToProcess = tempDiv.textContent || tempDiv.innerText || '';
    }

    if (!textToProcess.trim()) {
      setWritingToolStatus('No text to process');
      setTimeout(() => setWritingToolStatus('Idle'), 2000);
      return;
    }

    setWritingToolStatus(statusText);
    try {
      const ai = new GoogleGenAI({ apiKey: geminiApiKey });
      const prompt = action === 'rewrite'
        ? `Rewrite the following text:\n\n"${textToProcess}"`
        : `Summarize the following text concisely:\n\n"${textToProcess}"`;
      
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
      });
      const resultText = response.text;

      if (isSelection && selection) {
          const range = selection.getRangeAt(0);
          range.deleteContents();
          range.insertNode(document.createTextNode(resultText));
      } else {
          if (contentEditableRef.current) {
              contentEditableRef.current.innerHTML = resultText.replace(/\n/g, '<br>');
          }
      }
      setContent(contentEditableRef.current?.innerHTML || '');
      setWritingToolStatus('Done!');
    } catch (err) {
      console.error("Gemini API Error:", err);
      setWritingToolStatus('Error');
    } finally {
      setTimeout(() => setWritingToolStatus('Idle'), 2000);
    }
  };

  const isActionActive = isRecording || isVoiceMemoRecording || isTtsModalOpen || writingToolStatus !== 'Idle' || isLocked;

  const ToolButton: React.FC<{
    onClick: () => void;
    disabled: boolean;
    label: string;
    'aria-label': string;
    children: React.ReactNode;
    isActive?: boolean;
    }> = ({ onClick, disabled, label, children, isActive, ...props }) => (
    <button
        onClick={onClick}
        disabled={disabled}
        className={`flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-full transition-colors duration-200 shadow-sm
            ${isActive ? 'bg-black text-white' : 'bg-white hover:bg-gray-100'}
            ${disabled ? 'bg-gray-50 text-gray-400 cursor-not-allowed' : 'border border-gray-200'}
        `}
        aria-label={props['aria-label']}
    >
        {children}
        <span className="pr-1">{label}</span>
    </button>
  );

  return (
    <div className="p-8 lg:p-12 h-full flex flex-col relative">
       {isLocked && <div className="absolute inset-0 bg-white/50 backdrop-blur-sm z-20"></div>}
       {showPinModal && (
            <PinModal 
                mode={showPinModal}
                onSubmit={showPinModal === 'set' ? handleSetPin : handleUnlockPin}
                onClose={() => setShowPinModal(null)}
                error={pinError}
            />
        )}
      
      {toolbarState.visible && !isLocked && <FloatingToolbar {...toolbarState} onCommand={handleCommand} />}
      
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold text-gray-800">{currentNote ? 'Edit Note' : 'Create Note'}</h1>
        <div className="flex items-center gap-4">
            <div className="flex items-center bg-gray-200 rounded-full p-1">
                <button onClick={() => handlePrivacyChange('public')} className={`px-4 py-1 text-sm font-semibold rounded-full ${privacy === 'public' ? 'bg-white shadow' : 'text-gray-600'}`}>Public</button>
                <button onClick={() => handlePrivacyChange('private')} className={`px-4 py-1 text-sm font-semibold rounded-full ${privacy === 'private' ? 'bg-white shadow' : 'text-gray-600'}`}>Private</button>
            </div>
            <button onClick={handleSave} className="bg-black text-white font-semibold py-2 px-6 rounded-full hover:bg-gray-800 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black disabled:bg-gray-400" disabled={isActionActive}>
              Save Note
            </button>
        </div>
      </div>

      <div className="flex-grow flex flex-col">
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Note Title"
          className="text-4xl font-bold placeholder-gray-300 focus:outline-none mb-6 pb-2 border-b border-transparent focus:border-gray-200 bg-transparent"
          readOnly={isActionActive}
        />
        <div
          ref={contentEditableRef}
          contentEditable={!isActionActive}
          onInput={(e) => setContent(e.currentTarget.innerHTML)}
          data-placeholder="Start writing here, or use the AI tool below to dictate..."
          className="flex-1 w-full text-lg leading-relaxed text-gray-700 focus:outline-none resize-none [&:empty]:before:content-[attr(data-placeholder)] [&:empty]:before:text-gray-400"
        />

        {audioNotes.length > 0 && (
          <div className="mt-6 flex-shrink-0">
            <h3 className="text-sm font-semibold text-gray-600 mb-2">Voice Memos</h3>
            <div className="space-y-3">
              {audioNotes.map(audio => (
                <div key={audio.id} className="flex items-center gap-2 bg-gray-100 p-2 rounded-lg">
                  <audio controls src={audio.dataUrl} className="w-full h-10"></audio>
                  <button 
                    onClick={() => handleDeleteAudioNote(audio.id)} 
                    className="p-2 text-gray-400 hover:text-red-500 rounded-full hover:bg-red-100 transition-colors"
                    aria-label="Delete voice memo"
                    disabled={isActionActive}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="flex-shrink-0 mt-4 p-2 flex items-center justify-center gap-2 flex-wrap">
        <ToolButton onClick={handleToggleAiRecording} disabled={isVoiceMemoRecording || isLocked} label={isRecording ? 'Stop' : 'Voice Typing'} aria-label={isRecording ? 'Stop Voice Typing' : 'Start Voice Typing'} isActive={isRecording}>
          {isRecording ? <StopIcon /> : <VoiceTypingIcon />}
        </ToolButton>
        <ToolButton onClick={handleToggleVoiceMemoRecording} disabled={isRecording || isLocked} label={isVoiceMemoRecording ? 'Stop' : 'Voice Memo'} aria-label={isVoiceMemoRecording ? 'Stop Voice Memo' : 'Start Voice Memo'} isActive={isVoiceMemoRecording}>
          {isVoiceMemoRecording ? <StopIcon /> : <VoiceMemoIcon />}
        </ToolButton>
        <ToolButton onClick={() => setIsTtsModalOpen(true)} disabled={isActionActive} label="Text to Speech" aria-label="Text to Speech">
          <TextToSpeechIcon />
        </ToolButton>
        
        {isGeminiConfigured ? (
            <>
                <ToolButton onClick={() => handleWritingTool('rewrite', 'Rewriting...')} disabled={isActionActive || !content.trim()} label="Rewrite" aria-label="Rewrite Text">
                    <RewriteIcon />
                </ToolButton>
                <ToolButton onClick={() => handleWritingTool('summarize', 'Summarizing...')} disabled={isActionActive || !content.trim()} label="Summarize" aria-label="Summarize Text">
                    <SummarizeIcon />
                </ToolButton>
            </>
        ) : (
            <p className="text-xs text-gray-500 px-2">Add Gemini Key in Settings for more AI tools</p>
        )}
      </div>
      
      {isTtsModalOpen && <TextToSpeechModal onClose={() => setIsTtsModalOpen(false)} onAddAudio={handleAddTtsAudio} />}

    </div>
  );
};

export default NoteEditor;