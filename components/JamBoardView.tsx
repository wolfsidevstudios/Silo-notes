import React, { useState, useEffect, useRef } from 'react';
import { Board, Space } from '../types';
import { BackIcon, HashtagIcon, PlusIcon, CloseIcon } from './icons';

interface JamElement {
  id: string;
  type: 'sticky' | 'text';
  position: { x: number; y: number };
  size: { width: number; height: number };
  text: string;
  color?: string;
  zIndex: number;
}

const STICKY_COLORS = ['#FFF9C4', '#FFCDD2', '#C8E6C9', '#BBDEFB', '#D1C4E9'];
let zIndexCounter = 1;

const JamElementComponent: React.FC<{
  element: JamElement;
  onTextChange: (id: string, text: string) => void;
  onDelete: (id: string) => void;
  onMouseDown: (e: React.MouseEvent, id: string) => void;
}> = ({ element, onTextChange, onDelete, onMouseDown }) => {
  const [isEditing, setIsEditing] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (isEditing) {
      textareaRef.current?.focus();
      textareaRef.current?.select();
    }
  }, [isEditing]);

  const handleBlur = () => {
    setIsEditing(false);
  };

  const commonStyle: React.CSSProperties = {
    position: 'absolute',
    left: element.position.x,
    top: element.position.y,
    width: element.size.width,
    height: element.size.height,
    zIndex: element.zIndex,
  };

  if (isEditing) {
    return (
      <textarea
        ref={textareaRef}
        value={element.text}
        onChange={(e) => onTextChange(element.id, e.target.value)}
        onBlur={handleBlur}
        style={{...commonStyle, backgroundColor: element.color || 'transparent', fontFamily: element.type === 'sticky' ? 'inherit' : "'Inter', sans-serif"}}
        className={`shadow-lg resize-none focus:outline-none p-4 ${element.type === 'sticky' ? 'rounded-lg' : ''} text-lg`}
      />
    );
  }

  return (
    <div
      style={commonStyle}
      className={`cursor-grab group ${element.type === 'sticky' ? 'p-4 rounded-lg shadow-lg' : 'p-2'}`}
      onMouseDown={(e) => onMouseDown(e, element.id)}
      onDoubleClick={() => setIsEditing(true)}
    >
        <div style={{backgroundColor: element.color}} className="w-full h-full rounded-lg absolute inset-0"></div>
        <div className="relative whitespace-pre-wrap text-lg break-words">
            {element.text || (element.type === 'sticky' ? '...' : 'Type here...')}
        </div>
      <button 
        onClick={() => onDelete(element.id)} 
        className="absolute top-0 right-0 transform translate-x-1/2 -translate-y-1/2 p-1 bg-white rounded-full shadow-md text-gray-500 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
        aria-label="Delete element"
      >
        <CloseIcon />
      </button>
    </div>
  );
};


const JamBoardView: React.FC<{ board: Board; space: Space; onBack: () => void; }> = ({ board, space, onBack }) => {
  const [elements, setElements] = useState<JamElement[]>([]);
  const [draggingElement, setDraggingElement] = useState<{ id: string, offset: { x: number, y: number } } | null>(null);
  const canvasRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    try {
        const savedData = localStorage.getItem(`jamboard-${board.id}`);
        if(savedData) {
            const parsed = JSON.parse(savedData);
            setElements(parsed.elements || []);
            zIndexCounter = parsed.zIndexCounter || 1;
        }
    } catch (e) { console.error("Failed to load Jam Board data", e); }
  }, [board.id]);

  useEffect(() => {
    localStorage.setItem(`jamboard-${board.id}`, JSON.stringify({ elements, zIndexCounter }));
  }, [elements, board.id]);

  const addElement = (type: 'sticky' | 'text') => {
    const canvasBounds = canvasRef.current?.getBoundingClientRect();
    const newElement: JamElement = {
      id: new Date().toISOString(),
      type,
      position: { x: (canvasBounds?.width || 0)/2 - 125, y: (canvasBounds?.height || 0)/2 - 75 },
      size: type === 'sticky' ? { width: 250, height: 150 } : { width: 250, height: 50 },
      text: '',
      color: type === 'sticky' ? STICKY_COLORS[Math.floor(Math.random() * STICKY_COLORS.length)] : undefined,
      zIndex: zIndexCounter++,
    };
    setElements(prev => [...prev, newElement]);
  };

  const updateElementText = (id: string, text: string) => {
    setElements(prev => prev.map(el => el.id === id ? { ...el, text } : el));
  };
  
  const deleteElement = (id: string) => {
    setElements(prev => prev.filter(el => el.id !== id));
  };

  const handleMouseDown = (e: React.MouseEvent, id: string) => {
    const element = elements.find(el => el.id === id);
    if (!element || !canvasRef.current) return;

    const canvasRect = canvasRef.current.getBoundingClientRect();
    const mouseX = e.clientX - canvasRect.left;
    const mouseY = e.clientY - canvasRect.top;

    setDraggingElement({
      id,
      offset: {
        x: mouseX - element.position.x,
        y: mouseY - element.position.y,
      }
    });

    setElements(prev => prev.map(el => el.id === id ? { ...el, zIndex: zIndexCounter++ } : el));
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!draggingElement || !canvasRef.current) return;
    const canvasRect = canvasRef.current.getBoundingClientRect();
    const newX = e.clientX - canvasRect.left - draggingElement.offset.x;
    const newY = e.clientY - canvasRect.top - draggingElement.offset.y;
    setElements(prev => prev.map(el => el.id === draggingElement.id ? { ...el, position: { x: newX, y: newY } } : el));
  };

  const handleMouseUp = () => {
    setDraggingElement(null);
  };

  return (
    <div className="p-8 lg:p-12 h-full flex flex-col">
      <header className="mb-6 flex items-center justify-between flex-shrink-0">
        <div>
            <button onClick={onBack} className="flex items-center text-sm font-semibold text-gray-500 hover:text-gray-800 transition-colors mb-4">
              <BackIcon />
              <HashtagIcon />
              <span className="ml-1">Back to {space.name}</span>
            </button>
            <h1 className="text-4xl font-bold text-gray-900">{board.name}</h1>
        </div>
        <div className="flex items-center gap-2">
            <button onClick={() => addElement('sticky')} className="bg-white text-black font-semibold py-2 px-4 rounded-full border flex items-center gap-2 hover:bg-gray-100">
                <PlusIcon /> Sticky Note
            </button>
             <button onClick={() => addElement('text')} className="bg-white text-black font-semibold py-2 px-4 rounded-full border flex items-center gap-2 hover:bg-gray-100">
                <PlusIcon /> Text
            </button>
        </div>
      </header>
      <div 
        ref={canvasRef}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        className="flex-grow bg-gray-100 rounded-lg relative overflow-hidden border border-gray-200"
      >
        {elements.map(el => (
            <JamElementComponent 
                key={el.id} 
                element={el}
                onTextChange={updateElementText}
                onDelete={deleteElement}
                onMouseDown={handleMouseDown}
            />
        ))}
        {elements.length === 0 && (
           <div className="absolute inset-0 flex items-center justify-center text-center pointer-events-none">
             <div>
                <h2 className="text-xl font-semibold text-gray-700">Empty board!</h2>
                <p className="text-gray-500 mt-2">Add a sticky note or text to get started.</p>
             </div>
           </div>
        )}
      </div>
    </div>
  );
};

export default JamBoardView;
