import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Note, NoteType } from '../types';
import { GoogleGenAI } from "@google/genai";
import FloatingToolbar from './FloatingToolbar';
import { ArrowUpIcon, SiloAiIcon } from './icons';

interface AiNoteEditorProps {
  currentNote: Note | null;
  onSave: (note: Omit<Note, 'id' | 'createdAt'> & { id?: string; type: NoteType; }) => void;
  geminiApiKey: string | null;
}

type ChatMessage = {
  role: 'user' | 'model';
  text: string;
  id: string;
};

const AiNoteEditor: React.FC<AiNoteEditorProps> = ({ currentNote, onSave, geminiApiKey }) => {
  // Note state
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [privacy, setPrivacy] = useState<'public' | 'private'>('public');

  // Chat state
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [isAiLoading, setIsAiLoading] = useState(false);

  // Editor refs and state
  const contentEditableRef = useRef<HTMLDivElement>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const [toolbarState, setToolbarState] = useState<{ top: number; left: number; visible: boolean }>({ top: 0, left: 0, visible: false });
  const selectionRef = useRef<Range | null>(null);

  // Effect to load note data and drafts
  useEffect(() => {
    if (currentNote) {
      const draftKey = `silo-editor-draft:${currentNote.id || `new-${currentNote.type}`}`;
      const savedDraftJSON = localStorage.getItem(draftKey);

      let initialTitle = currentNote.title;
      let initialContent = currentNote.content || '';

      if (savedDraftJSON) {
        try {
          const savedDraft = JSON.parse(savedDraftJSON);
          initialTitle = savedDraft.title;
          initialContent = savedDraft.content;
        } catch (e) { console.error("Failed to parse editor draft", e); }
      }
      
      setTitle(initialTitle);
      setContent(initialContent);
      if (contentEditableRef.current) {
        contentEditableRef.current.innerHTML = initialContent;
      }
      setPrivacy(currentNote.privacy);
    }
  }, [currentNote]);

  // Effect to save drafts
  useEffect(() => {
    if (currentNote) {
        const draftKey = `silo-editor-draft:${currentNote.id || `new-${currentNote.type}`}`;
        const draft = { title, content };
        localStorage.setItem(draftKey, JSON.stringify(draft));
    }
  }, [title, content, currentNote]);

  // Scroll chat to bottom
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages, isAiLoading]);

  // Toolbar logic
  const handleSelectionChange = useCallback(() => {
    const selection = window.getSelection();
    if (selection && !selection.isCollapsed && contentEditableRef.current?.contains(selection.anchorNode)) {
      selectionRef.current = selection.getRangeAt(0).cloneRange();
      const range = selection.getRangeAt(0);
      const rect = range.getBoundingClientRect();
      setToolbarState({
        top: rect.top + window.scrollY,
        left: rect.left + window.scrollX + rect.width / 2,
        visible: true,
      });
    } else {
      selectionRef.current = null;
      setToolbarState(prev => ({ ...prev, visible: false }));
    }
  }, []);

  useEffect(() => {
    document.addEventListener('selectionchange', handleSelectionChange);
    return () => document.removeEventListener('selectionchange', handleSelectionChange);
  }, [handleSelectionChange]);

  // Save note handler
  const handleSave = () => {
    if (currentNote) {
      const draftKey = `silo-editor-draft:${currentNote.id || `new-${currentNote.type}`}`;
      localStorage.removeItem(draftKey);
    }
    onSave({ id: currentNote?.id, title, content, privacy, type: NoteType.AI_NOTE });
  };
  
  // Editor command handler
  const handleCommand = (command: string, value?: string) => {
    document.execCommand(command, false, value);
    contentEditableRef.current?.focus();
    setContent(contentEditableRef.current?.innerHTML || '');
  };

  const insertAiText = (textToInsert: string) => {
    if (!contentEditableRef.current) return;
    contentEditableRef.current.focus();
    
    const selection = window.getSelection();
    if (selection && selection.rangeCount > 0) {
        const range = selection.getRangeAt(0);
        range.deleteContents();
        // To preserve line breaks from AI response
        const lines = textToInsert.split('\n');
        lines.forEach((line, index) => {
            range.insertNode(document.createTextNode(line));
            if(index < lines.length -1) {
                range.insertNode(document.createElement('br'));
            }
        });
        range.collapse(false); // Move cursor to end
    } else {
        document.execCommand('insertHTML', false, textToInsert.replace(/\n/g, '<br>'));
    }
    setContent(contentEditableRef.current.innerHTML);
  };

  const replaceSelectionWithAiText = (textToInsert: string) => {
      if (!contentEditableRef.current) return;
      contentEditableRef.current.focus();

      if (selectionRef.current) {
          const selection = window.getSelection();
          selection?.removeAllRanges();
          selection?.addRange(selectionRef.current);
          document.execCommand('insertText', false, textToInsert);
          selectionRef.current = null;
      } else {
          insertAiText(textToInsert);
      }
      setContent(contentEditableRef.current.innerHTML);
  };


  // AI Chat send handler
  const handleChatSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim() || isAiLoading || !geminiApiKey) return;
    const promptText = chatInput;
    setChatInput('');
    setChatMessages(prev => [...prev, { role: 'user', text: promptText, id: Date.now().toString() }]);
    setIsAiLoading(true);

    const selection = selectionRef.current ? selectionRef.current.toString() : '';
    let fullPrompt = promptText;
    if (selection.trim()) {
        fullPrompt = `User wants to "${promptText}" for the following selected text. \n\nSelected Text:\n"""\n${selection}\n"""\n\n Please provide the modified or new text.`;
    } else {
        fullPrompt = `User wants to "${promptText}". The current note content is:\n"""\n${contentEditableRef.current?.innerText || ''}\n"""\n\n Generate the requested content.`
    }
    
    try {
        const ai = new GoogleGenAI({ apiKey: geminiApiKey });
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: fullPrompt,
            config: {
              systemInstruction: "You are an AI writing assistant in a note editor. Your goal is to help the user write and edit their note. Provide clear, concise, and helpful text responses that can be directly inserted or used to replace existing text. Respond only with the generated text, without conversational fluff unless the user is just chatting."
            }
        });

        setChatMessages(prev => [...prev, { role: 'model', text: response.text, id: (Date.now() + 1).toString() }]);
    } catch (err) {
        console.error("AI Editor Error:", err);
        setChatMessages(prev => [...prev, { role: 'model', text: "Sorry, I ran into an error. Please check your API key or try again.", id: (Date.now() + 1).toString() }]);
    } finally {
        setIsAiLoading(false);
    }
  };

  return (
    <div className="flex h-full font-sans bg-white">
      {/* Main Editor Panel (Left) */}
      <div className="flex-grow flex flex-col relative">
        <div className="flex items-center justify-between mb-8 flex-shrink-0 p-8 lg:px-12 pt-8">
            <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                <SiloAiIcon /> Silo AI Note
                <span className="bg-gray-200 text-gray-600 text-xs font-semibold px-2 py-0.5 rounded-full">Beta</span>
            </h1>
            <button onClick={handleSave} className="bg-black text-white font-semibold py-2 px-6 rounded-full hover:bg-gray-800 transition-colors">
                Save Note
            </button>
        </div>
        <div className="flex-grow flex flex-col px-8 lg:px-12 pb-8 overflow-y-auto">
            <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Note Title"
                className="text-4xl font-bold placeholder-gray-300 focus:outline-none mb-6 pb-2 border-b border-transparent focus:border-gray-200 bg-transparent flex-shrink-0"
            />
            <div
                ref={contentEditableRef}
                contentEditable
                onInput={(e) => setContent(e.currentTarget.innerHTML)}
                data-placeholder="Start writing, or ask the AI for help..."
                className="flex-1 w-full text-lg leading-relaxed text-gray-700 focus:outline-none resize-none [&:empty]:before:content-[attr(data-placeholder)] [&:empty]:before:text-gray-400"
            />
        </div>
        {toolbarState.visible && <FloatingToolbar {...toolbarState} onCommand={handleCommand} />}
      </div>
      
      {/* AI Chat Panel (Right) */}
      <div className="w-[450px] flex-shrink-0 border-l border-gray-200 bg-gray-50 flex flex-col">
        <div className="p-4 border-b text-center flex-shrink-0">
          <h2 className="font-semibold text-gray-800">AI Assistant</h2>
        </div>
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {chatMessages.map(msg => (
                <div key={msg.id} className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                    <div className={`max-w-sm rounded-lg p-3 px-4 ${msg.role === 'user' ? 'bg-black text-white' : 'bg-white text-black border'}`}>
                       <p className="text-sm whitespace-pre-wrap">{msg.text}</p>
                    </div>
                     {msg.role === 'model' && !msg.text.startsWith("Sorry") && (
                        <div className="mt-2 flex gap-2">
                           <button onClick={() => insertAiText(msg.text)} className="text-xs font-semibold bg-white border rounded-full px-3 py-1 hover:bg-gray-100">Insert</button>
                           {selectionRef.current && <button onClick={() => replaceSelectionWithAiText(msg.text)} className="text-xs font-semibold bg-white border rounded-full px-3 py-1 hover:bg-gray-100">Replace</button>}
                        </div>
                    )}
                </div>
            ))}
             {isAiLoading && (
                <div className="flex items-start">
                    <div className="max-w-sm rounded-lg p-3 px-4 bg-white text-black border">
                        <div className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse" style={{animationDelay: '0s'}}></div>
                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse" style={{animationDelay: '0.2s'}}></div>
                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse" style={{animationDelay: '0.4s'}}></div>
                        </div>
                    </div>
                </div>
            )}
          <div ref={chatEndRef}></div>
        </div>
        <div className="p-4 border-t flex-shrink-0">
          <form onSubmit={handleChatSend} className="flex items-center gap-2">
            <input
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                placeholder="Ask AI to write, edit, etc..."
                className="flex-1 w-full bg-white px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-black"
                disabled={isAiLoading || !geminiApiKey}
            />
            <button type="submit" className="w-10 h-10 bg-black text-white rounded-lg flex items-center justify-center flex-shrink-0 disabled:bg-gray-400">
                <ArrowUpIcon />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AiNoteEditor;
