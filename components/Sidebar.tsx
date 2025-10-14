import React, { useState } from 'react';
import { View, Space } from '../types';
import { HomeIcon, CreateIcon, ExploreIcon, IdeasIcon, PlusIcon, HashtagIcon, SettingsIcon } from './icons';

interface SidebarProps {
  activeView: View;
  onViewChange: (view: View) => void;
  spaces: Space[];
  addSpace: (name: string) => void;
  onCreateNewNote: () => void;
  activeSpaceId: string | null;
  onSelectSpace: (spaceId: string) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ 
  activeView, 
  onViewChange, 
  spaces, 
  addSpace, 
  onCreateNewNote,
  activeSpaceId,
  onSelectSpace
}) => {
  const [newSpaceName, setNewSpaceName] = useState('');

  const handleAddSpace = (e: React.FormEvent) => {
    e.preventDefault();
    addSpace(newSpaceName);
    setNewSpaceName('');
  };

  const NavItem: React.FC<{
    icon: React.ReactNode;
    label: string;
    isActive: boolean;
    onClick: () => void;
  }> = ({ icon, label, isActive, onClick }) => (
    <button
      onClick={onClick}
      className={`flex items-center w-full px-4 py-2.5 text-sm font-medium rounded-lg transition-colors duration-200 ${
        isActive ? 'bg-gray-100 text-gray-900' : 'text-gray-500 hover:bg-gray-100 hover:text-gray-900'
      }`}
    >
      {icon}
      <span className="ml-3">{label}</span>
    </button>
  );

  const isNavActive = (view: View) => activeSpaceId === null && activeView === view;

  return (
    <aside className="w-64 flex-shrink-0 border-r border-gray-200 bg-white p-4 flex flex-col">
      <div className="flex items-center mb-8">
        <div className="w-8 h-8 bg-black rounded-full"></div>
        <span className="ml-3 font-bold text-lg">Gemini Notes</span>
      </div>
      
      <div className="flex-1">
        <nav className="space-y-2">
          <NavItem icon={<HomeIcon />} label="Home" isActive={isNavActive(View.HOME)} onClick={() => onViewChange(View.HOME)} />
          <NavItem icon={<CreateIcon />} label="Create" isActive={isNavActive(View.CREATE)} onClick={onCreateNewNote} />
          <NavItem icon={<ExploreIcon />} label="Explore" isActive={isNavActive(View.EXPLORE)} onClick={() => onViewChange(View.EXPLORE)} />
          <NavItem icon={<IdeasIcon />} label="Ideas" isActive={isNavActive(View.IDEAS)} onClick={() => onViewChange(View.IDEAS)} />
        </nav>
        
        <div className="mt-10">
          <h3 className="px-4 text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Spaces</h3>
          <div className="space-y-2">
            {spaces.map(space => (
              <button 
                key={space.id} 
                onClick={() => onSelectSpace(space.id)}
                className={`flex items-center w-full px-4 py-2.5 text-sm font-medium rounded-lg transition-colors duration-200 ${
                  activeSpaceId === space.id ? 'bg-gray-100 text-gray-900' : 'text-gray-500 hover:bg-gray-100 hover:text-gray-900'
                }`}
              >
                <HashtagIcon />
                <span className="ml-3">{space.name}</span>
              </button>
            ))}
          </div>
          <form onSubmit={handleAddSpace} className="mt-4 px-4 flex items-center">
            <input
              type="text"
              value={newSpaceName}
              onChange={(e) => setNewSpaceName(e.target.value)}
              placeholder="Create a space..."
              className="flex-1 w-full bg-transparent text-sm placeholder-gray-400 focus:outline-none"
            />
            <button type="submit" className="ml-2 text-gray-400 hover:text-gray-700">
              <PlusIcon />
            </button>
          </form>
        </div>
      </div>
      
      <div className="border-t border-gray-200 pt-4">
         <NavItem icon={<SettingsIcon />} label="Settings" isActive={isNavActive(View.SETTINGS)} onClick={() => onViewChange(View.SETTINGS)} />
      </div>

      <div className="mt-4">
        <button 
          onClick={onCreateNewNote}
          className="w-full bg-black text-white font-semibold py-3 px-4 rounded-full hover:bg-gray-800 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black"
        >
          New Note
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;