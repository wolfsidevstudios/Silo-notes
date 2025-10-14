import React, { useState, useRef, useEffect } from 'react';
import { BackIcon, VoiceMemoIcon, StopIcon } from './icons';
import { AudioNote } from '../types';

interface VoiceMemoToolViewProps {
  onBack: () => void;
}

const VoiceMemoToolView: React.FC<VoiceMemoToolViewProps> = ({ onBack }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [status, setStatus] = useState('Click the icon to start recording');
  const [audioNotes, setAudioNotes] = useState<AudioNote[]>([]);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);

  const stopRecording = () => {
    if (recorderRef.current && recorderRef.current.state === 'recording') {
      recorderRef.current.stop();
    }
  };

  const startRecording = async () => {
    if (isRecording) return;
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      const recorder = new MediaRecorder(stream);
      recorderRef.current = recorder;
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
          setAudioNotes(prev => [newAudioNote, ...prev]);
        };
        streamRef.current?.getTracks().forEach(track => track.stop());
        setIsRecording(false);
        setStatus('Click the icon to start recording');
      };

      recorder.start();
      setIsRecording(true);
      setStatus('Recording... Click to stop.');
    } catch (error) {
      console.error('Error accessing microphone:', error);
      setStatus('Microphone access denied.');
    }
  };

  const handleToggleRecording = () => {
    isRecording ? stopRecording() : startRecording();
  };
  
  const handleDeleteAudioNote = (id: string) => {
    setAudioNotes(prev => prev.filter(note => note.id !== id));
  };

  useEffect(() => {
    return () => {
      if (isRecording) stopRecording();
    };
  }, [isRecording]);

  return (
    <div className="p-8 lg:p-12 h-full flex flex-col">
      <header className="mb-10 flex-shrink-0">
        <button onClick={onBack} className="flex items-center text-sm font-semibold text-gray-500 hover:text-gray-800 transition-colors mb-4">
          <BackIcon />
          <span>Back to Silo Labs</span>
        </button>
        <h1 className="text-4xl font-bold text-gray-900">Voice Memo Tool</h1>
      </header>
      
      <div className="flex flex-col items-center justify-center flex-shrink-0 py-10">
        <button 
          onClick={handleToggleRecording}
          className={`h-24 w-24 rounded-full flex items-center justify-center transition-colors ${
            isRecording ? 'bg-red-500 text-white' : 'bg-black text-white hover:bg-gray-800'
          }`}
        >
          {isRecording ? <StopIcon /> : <VoiceMemoIcon />}
        </button>
        <p className="mt-4 text-gray-600">{status}</p>
      </div>

      <div className="flex-grow mt-8 overflow-y-auto">
        <h2 className="font-semibold mb-4">Your Recordings</h2>
        {audioNotes.length > 0 ? (
          <div className="space-y-3">
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
        ) : (
          <div className="text-center py-10 border-2 border-dashed rounded-lg">
            <p className="text-gray-500">No recordings yet.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default VoiceMemoToolView;
