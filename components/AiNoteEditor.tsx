import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Note, NoteType } from '../types';
import { GoogleGenAI } from "@google/genai";
import FloatingToolbar from './FloatingToolbar';
import SlashCommandMenu, { Command } from './SlashCommandMenu';
import { ArrowUpIcon, SiloAiIcon, FullWidthIcon, NormalWidthIcon } from './icons';

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
  const [isFullWidth, setIsFullWidth] = useState(false);

  // Chat state
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [isAiLoading, setIsAiLoading] = useState(false);

  // Editor refs and state
  const contentEditableRef = useRef<HTMLDivElement>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const [toolbarState, setToolbarState] = useState<{ top: number; left: number; visible: boolean }>({ top: 0, left: 0, visible: false });
  const selectionRef = useRef<Range | null>(null);

  // Slash Command Menu State
  const [isCommandMenuOpen, setIsCommandMenuOpen] = useState(false);
  const [commandMenuPosition, setCommandMenuPosition] = useState({ top: 0, left: 0 });
  const [commandQuery, setCommandQuery] = useState('');
  const commandRef = useRef<{ range: Range } | null>(null);

  // Effect to load note data and drafts
  useEffect(() => {
    if (currentNote) {
      const draftKey = `silo-editor-draft:${currentNote.id || `new-${currentNote.type}`}`;
      const savedDraftJSON = localStorage.getItem(draftKey);

      let initialTitle = currentNote.title || '';
      let initialContent = currentNote.content || '<div><br></div>';

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
      const editorPane = contentEditableRef.current.parentElement;
      if (editorPane) {
         const editorRect = editorPane.getBoundingClientRect();
         setToolbarState({
            top: rect.top - editorRect.top,
            left: rect.left - editorRect.left + rect.width / 2,
            visible: true,
         });
      }
    } else {
      selectionRef.current = null;
      setToolbarState(prev => ({ ...prev, visible: false }));
    }
  }, []);

  useEffect(() => {
    document.addEventListener('selectionchange', handleSelectionChange);
    return () => document.removeEventListener('selectionchange', handleSelectionChange);
  }, [handleSelectionChange]);

  const handleSave = () => {
    if (currentNote) {
      const draftKey = `silo-editor-draft:${currentNote.id || `new-${currentNote.type}`}`;
      localStorage.removeItem(draftKey);
    }
    onSave({ id: currentNote?.id, title, content, privacy: 'public', type: NoteType.AI_NOTE });
  };
  
  const handleCommand = (command: string, value?: string) => {
    document.execCommand(command, false, value);
    contentEditableRef.current?.focus();
    setContent(contentEditableRef.current?.innerHTML || '');
  };

  const handleInput = useCallback((e: React.FormEvent<HTMLDivElement>) => {
    const selection = window.getSelection();
    if (!selection || !selection.rangeCount) return;
    
    const range = selection.getRangeAt(0);
    const node = range.startContainer;
    
    if (!contentEditableRef.current?.contains(node)) return;

    if (node.textContent && node.textContent.startsWith('/')) {
        const rect = range.getBoundingClientRect();
        const editorRect = contentEditableRef.current.parentElement!.getBoundingClientRect();
        setCommandMenuPosition({ top: rect.bottom - editorRect.top + 5, left: rect.left - editorRect.left });
        setCommandQuery(node.textContent.substring(1));
        setIsCommandMenuOpen(true);
        commandRef.current = { range };
    } else {
        setIsCommandMenuOpen(false);
    }

    setContent(e.currentTarget.innerHTML);
  }, []);

  const executeCommand = useCallback((command: Command) => {
    if (!commandRef.current || !contentEditableRef.current) return;
    
    const { range } = commandRef.current;
    range.selectNodeContents(range.startContainer);
    range.deleteContents();
    
    if (command.tag === 'ul') {
        document.execCommand('insertUnorderedList');
    } else if (command.tag === 'ol') {
        document.execCommand('insertOrderedList');
    } else {
        document.execCommand('formatBlock', false, `<${command.tag}>`);
    }

    setIsCommandMenuOpen(false);
    commandRef.current = null;
    setContent(contentEditableRef.current.innerHTML || '');
    contentEditableRef.current.focus();
  }, []);

  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Enter' && !isCommandMenuOpen) {
        // Simple block creation on Enter
        e.preventDefault();
        document.execCommand('insertHTML', false, '<div><br></div>');
    }
  }, [isCommandMenuOpen]);

  // AI Chat Handlers
  const insertAiText = (textToInsert: string) => {
    if (!contentEditableRef.current) return;
    contentEditableRef.current.focus();
    document.execCommand('insertHTML', false, textToInsert.replace(/\n/g, '<br>'));
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
      setContent(contentEditableRef.current?.innerHTML || '');
  };

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
      <div className="flex-grow flex flex-col relative overflow-hidden">
        <div className="flex items-center justify-between flex-shrink-0 p-8 lg:px-12 pt-8 pb-4">
            <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                <SiloAiIcon /> Silo AI Note
                <span className="bg-gray-200 text-gray-600 text-xs font-semibold px-2 py-0.5 rounded-full">Beta</span>
            </h1>
            <div className="flex items-center gap-4">
                 <button onClick={() => setIsFullWidth(p => !p)} className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg transition-colors" title={isFullWidth ? "Normal width" : "Full width"}>
                    {isFullWidth ? <NormalWidthIcon /> : <FullWidthIcon />}
                 </button>
                <button onClick={handleSave} className="bg-black text-white font-semibold py-2 px-6 rounded-full hover:bg-gray-800 transition-colors">
                    Save Note
                </button>
            </div>
        </div>
        <div className="flex-grow px-8 lg:px-12 pb-8 overflow-y-auto relative">
            <div className={`mx-auto transition-all duration-300 ${isFullWidth ? 'max-w-none' : 'max-w-3xl'}`}>
                <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Untitled Note"
                    className="w-full text-5xl font-bold placeholder-gray-300 focus:outline-none mb-6 bg-transparent"
                />
                <div
                    ref={contentEditableRef}
                    contentEditable
                    onInput={handleInput}
                    onKeyDown={handleKeyDown}
                    data-placeholder="Type '/' for commands..."
                    className="w-full text-lg text-gray-800 focus:outline-none prose max-w-none prose-h1:font-bold prose-h2:font-bold prose-h1:text-4xl prose-h2:text-3xl prose-blockquote:border-l-4 prose-blockquote:border-gray-300 prose-blockquote:pl-4 prose-blockquote:italic prose-pre:bg-gray-100 prose-pre:p-4 prose-pre:rounded-lg"
                />
            </div>
            {isCommandMenuOpen && (
                <SlashCommandMenu 
                    position={commandMenuPosition} 
                    onSelect={executeCommand} 
                    onClose={() => setIsCommandMenuOpen(false)}
                    query={commandQuery}
                />
            )}
            {toolbarState.visible && (
                <div className="absolute" style={{ top: toolbarState.top, left: toolbarState.left }}>
                    <FloatingToolbar onCommand={handleCommand} top={0} left={0} />
                </div>
            )}
        </div>
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
       <style>{`
        .prose > :first-child { margin-top: 0; }
        .prose > :last-child { margin-bottom: 0; }
        [contenteditable] > * {
            margin-top: 0.25em;
            margin-bottom: 0.25em;
        }
        [contenteditable]:empty:before {
            content: attr(data-placeholder);
            color: #d1d5db;
            cursor: text;
            position: absolute;
        }
       `}</style>
    </div>
  );
};

export default AiNoteEditor;