import React, { useState } from 'react';
import { View, Space } from '../types';
import { HomeIcon, CreateIcon, CalendarIcon, IdeasIcon, PlusIcon, HashtagIcon, SettingsIcon, SiloLabsIcon, SiloAiIcon, AgendaIcon, AppLogoIcon, CollapseSidebarIcon } from './icons';

interface SidebarProps {
  activeView: View;
  onViewChange: (view: View) => void;
  spaces: Space[];
  addSpace: (name: string) => void;
  onOpenNewNoteModal: () => void;
  activeSpaceId: string | null;
  onSelectSpace: (spaceId: string) => void;
  onToggleAiChat: () => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ 
  activeView, 
  onViewChange, 
  spaces, 
  addSpace, 
  onOpenNewNoteModal,
  activeSpaceId,
  onSelectSpace,
  onToggleAiChat,
  isCollapsed,
  onToggleCollapse
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
      title={label}
      className={`flex items-center w-full py-2.5 text-sm font-medium rounded-lg transition-colors duration-200 ${isCollapsed ? 'justify-center px-2' : 'px-4'} ${
        isActive ? 'bg-gray-100 text-gray-900' : 'text-gray-500 hover:bg-gray-100 hover:text-gray-900'
      }`}
    >
      {icon}
      {!isCollapsed && <span className="ml-3">{label}</span>}
    </button>
  );

  const isNavActive = (view: View) => activeSpaceId === null && activeView === view;

  return (
    <aside className={`flex-shrink-0 border-r border-gray-200 bg-white p-4 flex flex-col transition-all duration-300 ${isCollapsed ? 'w-20' : 'w-64'}`}>
      <div className={`flex items-center mb-8 w-full ${isCollapsed ? 'justify-center' : 'justify-start'}`}>
        <AppLogoIcon />
        {!isCollapsed && <span className="ml-3 font-bold text-lg">Silo Notes</span>}
      </div>
      
      <div className="flex-1 overflow-y-auto -mx-4 px-4">
        <nav className="space-y-2">
          <NavItem icon={<HomeIcon />} label="Home" isActive={isNavActive(View.HOME)} onClick={() => onViewChange(View.HOME)} />
          <NavItem icon={<CreateIcon />} label="Create" isActive={isNavActive(View.CREATE)} onClick={onOpenNewNoteModal} />
          <NavItem icon={<CalendarIcon />} label="Calendar" isActive={isNavActive(View.CALENDAR)} onClick={() => onViewChange(View.CALENDAR)} />
          <NavItem icon={<IdeasIcon />} label="Ideas" isActive={isNavActive(View.IDEAS)} onClick={() => onViewChange(View.IDEAS)} />
          <NavItem icon={<AgendaIcon />} label="Agenda" isActive={isNavActive(View.AGENDA)} onClick={() => onViewChange(View.AGENDA)} />
          <NavItem icon={<SiloLabsIcon />} label="Silo Labs" isActive={isNavActive(View.SILO_LABS)} onClick={() => onViewChange(View.SILO_LABS)} />
        </nav>
        
        <div className="mt-10">
          {!isCollapsed && <h3 className="px-4 text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Spaces</h3>}
          <div className="space-y-2">
            {spaces.map(space => (
              <button 
                key={space.id} 
                onClick={() => onSelectSpace(space.id)}
                title={space.name}
                className={`flex items-center w-full py-2.5 text-sm font-medium rounded-lg transition-colors duration-200 ${isCollapsed ? 'justify-center px-2' : 'px-4'} ${
                  activeSpaceId === space.id ? 'bg-gray-100 text-gray-900' : 'text-gray-500 hover:bg-gray-100 hover:text-gray-900'
                }`}
              >
                <HashtagIcon />
                {!isCollapsed && <span className="ml-3">{space.name}</span>}
              </button>
            ))}
          </div>
          {!isCollapsed && (
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
          )}
        </div>
      </div>
      
      <div className="border-t border-gray-200 pt-4 mt-4 -mx-4 px-4">
         <NavItem icon={<SettingsIcon />} label="Settings" isActive={isNavActive(View.SETTINGS)} onClick={() => onViewChange(View.SETTINGS)} />
      </div>

      <div className="mt-4 flex items-center gap-2">
        <button 
          onClick={onOpenNewNoteModal}
          className={`font-semibold text-white bg-black hover:bg-gray-800 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black rounded-full flex items-center justify-center ${isCollapsed ? 'w-12 h-12' : 'flex-1 py-3 px-4'}`}
          title="New Note"
        >
          {isCollapsed ? <CreateIcon /> : <span>New Note</span>}
        </button>
        <button
          onClick={onToggleAiChat}
          className="p-3 bg-gray-200 text-black rounded-full hover:bg-gray-300 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black"
          aria-label="Open Silo AI"
          title="Open Silo AI"
        >
          <SiloAiIcon />
        </button>
      </div>

       <div className="border-t border-gray-200 pt-4 mt-4 -mx-4 px-4">
         <button 
            onClick={onToggleCollapse} 
            className="w-full flex items-center text-gray-500 hover:text-gray-900 p-2 rounded-lg hover:bg-gray-100" 
            title={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
          >
            <CollapseSidebarIcon className={`transition-transform duration-300 ${isCollapsed ? 'rotate-180' : ''}`} />
            {!isCollapsed && <span className="ml-3 text-sm font-medium">Collapse</span>}
         </button>
      </div>
    </aside>
  );
};

export default Sidebar;
