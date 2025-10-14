import React, { useState, useEffect, useRef } from 'react';
import { Heading1Icon, Heading2Icon, ListIcon, NumberListIcon, QuoteIcon, CodeIcon } from './icons';

export interface Command {
  id: string;
  tag: string;
  label: string;
  icon: React.ReactNode;
  description: string;
}

export const COMMANDS: Command[] = [
  { id: 'h1', tag: 'h1', label: 'Heading 1', icon: <Heading1Icon />, description: 'Big section heading.' },
  { id: 'h2', tag: 'h2', label: 'Heading 2', icon: <Heading2Icon />, description: 'Medium section heading.' },
  { id: 'ul', tag: 'ul', label: 'Bulleted list', icon: <ListIcon />, description: 'Create a simple bulleted list.' },
  { id: 'ol', tag: 'ol', label: 'Numbered list', icon: <NumberListIcon />, description: 'Create a list with numbering.' },
  { id: 'quote', tag: 'blockquote', label: 'Quote', icon: <QuoteIcon />, description: 'Capture a quote.' },
  { id: 'code', tag: 'pre', label: 'Code block', icon: <CodeIcon />, description: 'Capture a code snippet.' },
];

interface SlashCommandMenuProps {
  position: { top: number; left: number };
  onSelect: (command: Command) => void;
  onClose: () => void;
  query: string;
}

const SlashCommandMenu: React.FC<SlashCommandMenuProps> = ({ position, onSelect, onClose, query }) => {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const menuRef = useRef<HTMLDivElement>(null);

  const filteredCommands = COMMANDS.filter(cmd => cmd.label.toLowerCase().startsWith(query.toLowerCase()));

  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (filteredCommands.length === 0) return;
      if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex(prev => (prev === 0 ? filteredCommands.length - 1 : prev - 1));
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex(prev => (prev === filteredCommands.length - 1 ? 0 : prev + 1));
      } else if (e.key === 'Enter') {
        e.preventDefault();
        onSelect(filteredCommands[selectedIndex]);
      } else if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      }
    };
    document.addEventListener('keydown', handleKeyDown, true);
    return () => document.removeEventListener('keydown', handleKeyDown, true);
  }, [filteredCommands, selectedIndex, onSelect, onClose]);

  useEffect(() => {
    menuRef.current?.children[selectedIndex + 1]?.scrollIntoView({ block: 'nearest' });
  }, [selectedIndex]);

  if (filteredCommands.length === 0) {
    return (
        <div className="absolute z-50 bg-white shadow-xl rounded-lg p-2 border border-gray-200 w-72" style={{ top: position.top, left: position.left }}>
            <div className="text-sm text-gray-500 p-2">No results</div>
        </div>
    );
  }

  return (
    <div
      ref={menuRef}
      className="absolute z-50 bg-white shadow-xl rounded-lg p-2 border border-gray-200 w-72 max-h-80 overflow-y-auto"
      style={{ top: position.top, left: position.left }}
    >
      <p className="text-xs font-semibold text-gray-400 uppercase px-2 py-1">Blocks</p>
      {filteredCommands.map((cmd, index) => (
        <button
          key={cmd.id}
          onClick={() => onSelect(cmd)}
          className={`flex items-center w-full text-left p-2 rounded-md transition-colors ${
            index === selectedIndex ? 'bg-gray-100' : 'hover:bg-gray-50'
          }`}
        >
          <div className="p-2 bg-white border rounded-md mr-3">{cmd.icon}</div>
          <div>
            <p className="font-semibold text-gray-800">{cmd.label}</p>
            <p className="text-xs text-gray-500">{cmd.description}</p>
          </div>
        </button>
      ))}
    </div>
  );
};

export default SlashCommandMenu;
