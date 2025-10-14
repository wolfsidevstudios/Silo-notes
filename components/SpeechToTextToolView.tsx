import React, { useState, useRef, useEffect } from 'react';
import { BackIcon, VoiceTypingIcon, StopIcon } from './icons';

const ASSEMBLYAI_API_KEY = '49e6f2264b204542b812c42bfb3fcdac';

interface SpeechToTextToolViewProps {
  onBack: () => void;
}

const SpeechToTextToolView: React.FC<SpeechToTextToolViewProps> = ({ onBack }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [status, setStatus] = useState('Click the icon to start transcribing');
  const [transcript, setTranscript] = useState('');
  const [partialTranscript, setPartialTranscript] = useState('');
  const socketRef = useRef<WebSocket | null>(null);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const stopRecording = () => {
    if (recorderRef.current?.state === 'recording') recorderRef.current.stop();
    streamRef.current?.getTracks().forEach(track => track.stop());
    if (socketRef.current) {
        if (socketRef.current.readyState === WebSocket.OPEN) {
            socketRef.current.send(JSON.stringify({ terminate_session: true }));
        }
        socketRef.current.close();
    }
    setTranscript(prev => prev + (partialTranscript ? (prev.trim() ? ' ' : '') + partialTranscript : ''));
    setPartialTranscript('');
    setIsRecording(false);
    setStatus('Click the icon to start transcribing');
  };

  const startRecording = async () => {
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
        if (msg.message_type === 'PartialTranscript') setPartialTranscript(msg.text);
        else if (msg.message_type === 'FinalTranscript' && msg.text) {
          setTranscript(prev => (prev.trim() ? prev + ' ' : '') + msg.text);
          setPartialTranscript('');
        }
      };
      socket.onerror = () => { setStatus('Error. Please try again.'); stopRecording(); };
      recorder.ondataavailable = (e) => {
        if (e.data.size > 0 && socket.readyState === WebSocket.OPEN) {
          const reader = new FileReader();
          reader.onload = () => socket.send(JSON.stringify({ audio_data: (reader.result as string).split(',')[1] }));
          reader.readAsDataURL(e.data);
        }
      };
      setStatus('Connecting...');
    } catch (error) {
      setStatus('Microphone access denied.');
    }
  };

  const handleToggleRecording = () => {
    isRecording ? stopRecording() : startRecording();
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(transcript + partialTranscript);
  };
  
  useEffect(() => {
    return () => { if (isRecording) stopRecording(); };
  }, [isRecording]);

  return (
    <div className="p-8 lg:p-12 h-full flex flex-col">
      <header className="mb-10 flex-shrink-0">
        <button onClick={onBack} className="flex items-center text-sm font-semibold text-gray-500 hover:text-gray-800 transition-colors mb-4">
          <BackIcon />
          <span>Back to Silo Labs</span>
        </button>
        <h1 className="text-4xl font-bold text-gray-900">Speech-to-Text Tool</h1>
      </header>

      <div className="flex-grow flex flex-col border border-gray-300 rounded-lg">
        <div className="p-4 flex-1 overflow-y-auto bg-gray-50 rounded-t-lg">
          <p className="whitespace-pre-wrap text-lg">
            {transcript}
            <span className="text-gray-500">{partialTranscript}</span>
          </p>
        </div>
        <div className="p-4 bg-white rounded-b-lg border-t flex items-center justify-between">
          <p className="text-gray-600">{status}</p>
          <div className="flex items-center gap-4">
            <button onClick={handleCopy} className="font-semibold text-sm hover:text-black">Copy</button>
            <button 
              onClick={handleToggleRecording}
              className={`h-12 w-12 rounded-full flex items-center justify-center transition-colors ${
                isRecording ? 'bg-red-500 text-white' : 'bg-black text-white hover:bg-gray-800'
              }`}
            >
              {isRecording ? <StopIcon /> : <VoiceTypingIcon />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SpeechToTextToolView;
