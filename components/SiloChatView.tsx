import React, { useState, useEffect, useRef } from 'react';
import { GoogleGenAI, Type } from "@google/genai";
import { Note, Task, Meeting, NoteType, TaskPriority } from '../types';
import { ArrowUpIcon, SettingsIcon } from './icons';

interface SiloChatViewProps {
  geminiApiKey: string | null;
  onSaveNote: (note: Omit<Note, 'id' | 'createdAt' | 'audioNotes' | 'pin'> & { id?: string }) => void;
  onAddTask: (title: string, priority: TaskPriority) => void;
  onAddMeeting: (title: string, dateTime: string) => void;
}

type Message = {
  id: string;
  role: 'user' | 'model';
  text: string;
};

type ActionPayload = Note | Task | Meeting;
type ActionType = 'CREATE_NOTE' | 'CREATE_TASK' | 'CREATE_MEETING';

type ActionPreview = {
  type: ActionType;
  payload: any;
};

const SiloChatView: React.FC<SiloChatViewProps> = ({ geminiApiKey, onSaveNote, onAddTask, onAddMeeting }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [actionPreview, setActionPreview] = useState<ActionPreview | null>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading, actionPreview]);
  
  const formatText = (text: string) => {
    // A simple markdown-like parser for **bold** text
    const bolded = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    return { __html: bolded };
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading || !geminiApiKey) return;

    const newUserMessage: Message = { id: Date.now().toString(), role: 'user', text: input };
    setMessages(prev => [...prev, newUserMessage]);
    setInput('');
    setIsLoading(true);
    setError(null);
    setActionPreview(null);

    try {
      const ai = new GoogleGenAI({ apiKey: geminiApiKey });
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: input,
        config: {
            systemInstruction: `You are Silo Chat, an intelligent assistant in a note-taking app. Your primary function is to help users create content like notes, tasks, and meetings. When a user asks you to create something, you MUST respond with a single JSON object. This object must contain two top-level keys: "responseText" and "action".
1. "responseText": A friendly, conversational message for the user, confirming what you've done. Use markdown for bolding important parts (e.g., **this is bold**) and include relevant emojis.
2. "action": An object detailing the item to be created, or null if it's a simple conversation. The "action" object has "type" and "payload".
- For a note: "type" is "CREATE_NOTE". "payload" is an object with "type" (one of "CLASSIC", "STICKY", "JOURNAL"), "title", and "content".
- For a task: "type" is "CREATE_TASK". "payload" is an object with "title" and "priority" (one of "low", "medium", "high"). Default to medium priority if not specified.
- For a meeting: "type" is "CREATE_MEETING". "payload" is an object with "title" and "dateTime".
If the user is just chatting or you are clarifying, "action" should be null. Always be helpful and clear.`,
            responseMimeType: "application/json",
            responseSchema: {
                type: Type.OBJECT,
                properties: {
                    responseText: { type: Type.STRING },
                    action: {
                        type: Type.OBJECT,
                        nullable: true,
                        properties: {
                            type: { type: Type.STRING },
                            payload: { type: Type.OBJECT }
                        }
                    }
                }
            }
        }
      });

      const jsonText = response.text.trim();
      const parsedResponse = JSON.parse(jsonText);
      
      const newAiMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        text: parsedResponse.responseText || "I'm not sure how to respond to that.",
      };
      setMessages(prev => [...prev, newAiMessage]);

      if (parsedResponse.action) {
        setActionPreview(parsedResponse.action);
      }

    } catch (err) {
      console.error("Silo Chat Error:", err);
      const errorMessage = "Sorry, I encountered an error. Please check your API key or try again.";
      setError(errorMessage);
      setMessages(prev => [...prev, { id: (Date.now() + 1).toString(), role: 'model', text: errorMessage }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleApprove = () => {
    if (!actionPreview) return;
    const { type, payload } = actionPreview;
    try {
        switch (type) {
        case 'CREATE_NOTE':
            onSaveNote({ ...payload, privacy: 'public' });
            break;
        case 'CREATE_TASK':
            onAddTask(payload.title, payload.priority || TaskPriority.MEDIUM);
            break;
        case 'CREATE_MEETING':
            onAddMeeting(payload.title, payload.dateTime);
            break;
        }
        setMessages(prev => [...prev, { id: Date.now().toString(), role: 'model', text: "Great! I've added it for you. ✨" }]);
    } catch(e) {
        console.error("Error approving action:", e);
        setMessages(prev => [...prev, { id: Date.now().toString(), role: 'model', text: "Something went wrong while saving. Please try again." }]);
    }
    setActionPreview(null);
  };
  
  const handleRegenerate = () => {
    setInput("Can you try that again, but differently?");
    // Trigger form submission
    const form = document.getElementById('chat-form') as HTMLFormElement;
    if (form) {
        // We need to create a synthetic event for the form to submit
        const event = new Event('submit', { bubbles: true, cancelable: true });
        form.dispatchEvent(event);
    }
  };
  
  const ActionPreviewCard: React.FC<{ preview: ActionPreview }> = ({ preview }) => {
    const { type, payload } = preview;
    
    const renderContent = () => {
        switch(type) {
            case 'CREATE_NOTE':
                return <>
                    <p className="font-semibold">{payload.title}</p>
                    <p className="text-sm text-gray-600 line-clamp-2">{payload.content}</p>
                </>
            case 'CREATE_TASK':
                return <p className="font-semibold">Task: {payload.title}</p>
            case 'CREATE_MEETING':
                return <>
                    <p className="font-semibold">Meeting: {payload.title}</p>
                    <p className="text-sm text-gray-600">{payload.dateTime}</p>
                </>
            default:
                return <p>Unknown action</p>
        }
    }
    return (
        <div className="bg-white/80 backdrop-blur-sm border rounded-xl p-4 w-full max-w-2xl animate-fade-in-up">
            <div className="flex justify-between items-center">
                <div className="flex-grow">{renderContent()}</div>
                <div className="flex items-center gap-2 flex-shrink-0 ml-4">
                    <button onClick={handleRegenerate} className="text-sm font-semibold bg-gray-200 hover:bg-gray-300 px-4 py-2 rounded-full transition-colors">Regenerate</button>
                    <button onClick={handleApprove} className="text-sm font-semibold bg-black text-white hover:bg-gray-800 px-4 py-2 rounded-full transition-colors">Approve</button>
                </div>
            </div>
        </div>
    )
  }

  if (!geminiApiKey) {
    return (
        <div className="h-full flex flex-col bg-white relative overflow-hidden">
            <header className="p-4 text-center border-b z-10 bg-white/50 backdrop-blur-sm">
                <h1 className="text-xl font-bold text-gray-800">Silo Chat</h1>
            </header>
            <div className="flex-grow flex flex-col items-center justify-center text-center p-4 z-10">
                <div className="bg-yellow-100 text-yellow-800 p-3 rounded-full mb-4">
                   <SettingsIcon />
                </div>
                <h2 className="text-2xl font-semibold text-gray-800">API Key Required</h2>
                <p className="text-gray-600 mt-2 max-w-sm">
                    Please set your Google Gemini API key in the Settings to enable Silo Chat.
                </p>
            </div>
        </div>
    );
  }


  return (
    <div className="h-full flex flex-col bg-white relative overflow-hidden">
        {/* Background Gradients */}
        <div className="absolute top-0 left-0 w-72 h-72 bg-blue-200 rounded-full opacity-30 -translate-x-1/2 -translate-y-1/2 filter blur-3xl"></div>
        <div className="absolute bottom-0 right-0 w-72 h-72 bg-green-200 rounded-full opacity-30 translate-x-1/2 translate-y-1/2 filter blur-3xl"></div>
        <div className="absolute bottom-0 left-1/4 w-72 h-72 bg-yellow-200 rounded-full opacity-20 -translate-x-1/2 translate-y-1/2 filter blur-3xl"></div>

      <header className="p-4 text-center border-b z-10 bg-white/50 backdrop-blur-sm">
        <h1 className="text-xl font-bold text-gray-800">Silo Chat</h1>
      </header>

      <main className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6 z-10">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex items-end gap-2 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-md lg:max-w-2xl rounded-2xl p-3 px-4 shadow-sm ${msg.role === 'user' ? 'bg-black text-white rounded-br-lg' : 'bg-white text-black rounded-bl-lg border'}`}>
              <p className="text-base" dangerouslySetInnerHTML={formatText(msg.text)} />
            </div>
          </div>
        ))}
        {isLoading && (
            <div className="flex items-end gap-2 justify-start">
                <div className="max-w-md lg:max-w-2xl rounded-2xl p-3 px-4 shadow-sm bg-white text-black rounded-bl-lg border">
                    <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse" style={{animationDelay: '0s'}}></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse" style={{animationDelay: '0.2s'}}></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse" style={{animationDelay: '0.4s'}}></div>
                    </div>
                </div>
            </div>
        )}
        <div ref={chatEndRef}></div>
      </main>

      <footer className="p-4 md:px-6 z-10 space-y-4">
        {actionPreview && <div className="flex justify-center"><ActionPreviewCard preview={actionPreview} /></div>}
        <div className="max-w-3xl mx-auto">
          <form id="chat-form" onSubmit={handleSend} className="bg-white/80 backdrop-blur-sm border rounded-3xl p-2 flex items-center gap-2 shadow-lg">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={geminiApiKey ? "Ask me to create a note, task, etc..." : "Please set your Gemini API key in Settings"}
              className="flex-1 bg-transparent focus:outline-none px-4 text-lg"
              disabled={isLoading || !geminiApiKey}
            />
            <button
              type="submit"
              className="w-12 h-12 bg-black text-white rounded-full flex items-center justify-center flex-shrink-0 disabled:bg-gray-400 transition-colors"
              disabled={isLoading || !input.trim() || !geminiApiKey}
              aria-label="Send message"
            >
              <ArrowUpIcon />
            </button>
          </form>
          <div className="flex items-center justify-center gap-2 mt-3">
             <button className="text-xs font-semibold bg-white border rounded-full px-3 py-1 hover:bg-gray-100">Summarize</button>
             <button className="text-xs font-semibold bg-white border rounded-full px-3 py-1 hover:bg-gray-100">Text to Speech</button>
          </div>
        </div>
      </footer>
       <style>{`
            @keyframes fade-in-up {
                from { opacity: 0; transform: translateY(10px); }
                to { opacity: 1; transform: translateY(0); }
            }
            .animate-fade-in-up {
                animation: fade-in-up 0.3s ease-out forwards;
            }
       `}</style>
    </div>
  );
};

export default SiloChatView;