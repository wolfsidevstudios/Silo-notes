import React, { useState, useMemo, useEffect } from 'react';
import { CalendarEvent, Note, Task, NoteType } from '../types';
import { ChevronLeftIcon, ChevronRightIcon, PlusIcon, CloseIcon, JournalIcon } from './icons';

const AddItemModal = ({
  onClose,
  onAddItems,
  notes,
  tasks,
}: {
  onClose: () => void;
  onAddItems: (items: { id: string; type: 'note' | 'task' }[]) => void;
  notes: Note[];
  tasks: Task[];
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedItems, setSelectedItems] = useState<{ [key: string]: { id: string; type: 'note' | 'task' } }>({});

  const combinedItems = useMemo(() => {
    const allNotes = notes.map(n => ({ ...n, itemType: 'note' as const }));
    const allTasks = tasks.filter(t => !t.completed).map(t => ({ ...t, itemType: 'task' as const }));
    return [...allNotes, ...allTasks]
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [notes, tasks]);

  const filteredItems = useMemo(() => {
    if (!searchTerm) return combinedItems;
    return combinedItems.filter(item =>
      item.title.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [searchTerm, combinedItems]);

  const toggleItem = (item: { id: string; type: 'note' | 'task' }) => {
    const key = `${item.type}-${item.id}`;
    setSelectedItems(prev => {
      const newSelected = { ...prev };
      if (newSelected[key]) {
        delete newSelected[key];
      } else {
        newSelected[key] = item;
      }
      return newSelected;
    });
  };
  
  const handleAddClick = () => {
    onAddItems(Object.values(selectedItems));
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl m-4 flex flex-col max-h-[80vh]" onClick={e => e.stopPropagation()}>
        <div className="p-6 border-b sticky top-0 bg-white z-10">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Add to Calendar</h2>
          <div className="relative">
            <input
              type="text"
              placeholder="Search notes and tasks..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-full focus:ring-2 focus:ring-black focus:border-black"
            />
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
            </div>
          </div>
        </div>
        <div className="p-6 flex-grow overflow-y-auto">
          <div className="space-y-2">
            {filteredItems.map(item => (
              <div key={`${item.itemType}-${item.id}`} onClick={() => toggleItem({ id: item.id, type: item.itemType })} className={`p-3 rounded-lg flex items-center gap-4 cursor-pointer transition-colors border ${selectedItems[`${item.itemType}-${item.id}`] ? 'bg-gray-100 border-gray-400' : 'hover:bg-gray-50 border-gray-200'}`}>
                <input type="checkbox" readOnly checked={!!selectedItems[`${item.itemType}-${item.id}`]} className="h-5 w-5 rounded border-gray-300 text-black focus:ring-black cursor-pointer" />
                {item.itemType === 'note' && (item as Note).type === NoteType.STICKY && <div className="w-4 h-4 rounded" style={{ backgroundColor: (item as Note).color || '#FFF9C4' }}></div>}
                {item.itemType === 'note' && (item as Note).type === NoteType.JOURNAL && <JournalIcon />}
                {item.itemType === 'task' && <div className="w-4 h-4 rounded-full bg-gray-300"></div>}
                <span className="font-medium text-gray-800 flex-grow">{item.title || (item.itemType === 'note' ? 'Untitled Note' : 'Untitled Task')}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="p-6 border-t flex justify-end sticky bottom-0 bg-white z-10">
          <button onClick={handleAddClick} disabled={Object.keys(selectedItems).length === 0} className="bg-black text-white font-semibold py-3 px-6 rounded-full hover:bg-gray-800 transition-colors disabled:bg-gray-400">
            Add to Calendar
          </button>
        </div>
      </div>
    </div>
  );
};

const ItemPreviewModal = ({ item, onClose, onGoToItem }: { item: Note | Task; onClose: () => void; onGoToItem: (item: Note) => void; }) => {
    const isNote = 'content' in item;

    const stripHtml = (html: string) => {
        const doc = new DOMParser().parseFromString(html, 'text/html');
        return doc.body.textContent || "";
    };

    return (
         <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" onClick={onClose}>
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg m-4 flex flex-col max-h-[70vh]" onClick={e => e.stopPropagation()}>
                <div className="p-6 border-b flex justify-between items-center">
                    <h2 className="text-xl font-bold text-gray-800 truncate pr-4">{item.title}</h2>
                    <button onClick={onClose}><CloseIcon /></button>
                </div>
                <div className="p-6 flex-grow overflow-y-auto">
                    {isNote ? (
                        <div className="prose max-w-none">
                           <p>{stripHtml((item as Note).content)}</p>
                        </div>
                    ) : (
                        <div>
                            <p className="text-lg">Status: <span className="font-semibold">{(item as Task).completed ? 'Completed' : 'To-Do'}</span></p>
                        </div>
                    )}
                </div>
                {isNote && (
                    <div className="p-6 border-t flex justify-end">
                        <button onClick={() => onGoToItem(item as Note)} className="bg-gray-100 font-semibold py-2 px-5 rounded-full hover:bg-gray-200 transition-colors">
                            View Full Note
                        </button>
                    </div>
                )}
            </div>
        </div>
    )
}

interface CalendarViewProps {
  events: CalendarEvent[];
  notes: Note[];
  tasks: Task[];
  onAddEvents: (date: string, items: { id: string; type: 'note' | 'task' }[]) => void;
  onDeleteEvent: (eventId: string) => void;
  onEditNote: (note: Note) => void;
}

const CalendarView: React.FC<CalendarViewProps> = ({ events, notes, tasks, onAddEvents, onDeleteEvent, onEditNote }) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [previewItem, setPreviewItem] = useState<Note | Task | null>(null);

  const firstDayOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
  const daysInMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0).getDate();

  const startingDayOfWeek = firstDayOfMonth.getDay();

  const calendarDays = useMemo(() => {
    const days = [];
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(new Date(currentMonth.getFullYear(), currentMonth.getMonth(), i));
    }
    return days;
  }, [currentMonth, daysInMonth, startingDayOfWeek]);

  const changeMonth = (offset: number) => {
    setCurrentMonth(prev => new Date(prev.getFullYear(), prev.getMonth() + offset, 1));
  };
  
  const openAddItemModal = (day: Date) => {
    setSelectedDate(day.toISOString().split('T')[0]);
    setIsModalOpen(true);
  };

  const handlePreviewItem = (event: CalendarEvent) => {
      const item = event.itemType === 'note' 
        ? notes.find(n => n.id === event.itemId)
        : tasks.find(t => t.id === event.itemId);
      if (item) {
          setPreviewItem(item);
      }
  };

  return (
    <div className="p-8 lg:p-12 h-full flex flex-col">
      {isModalOpen && selectedDate && <AddItemModal onClose={() => setIsModalOpen(false)} onAddItems={(items) => onAddEvents(selectedDate, items)} notes={notes} tasks={tasks} />}
      {previewItem && <ItemPreviewModal item={previewItem} onClose={() => setPreviewItem(null)} onGoToItem={onEditNote} />}

      <header className="mb-8 flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">
          {currentMonth.toLocaleString('default', { month: 'long', year: 'numeric' })}
        </h1>
        <div className="flex items-center gap-2">
          <button onClick={() => changeMonth(-1)} className="p-2 rounded-full hover:bg-gray-100"><ChevronLeftIcon /></button>
          <button onClick={() => changeMonth(1)} className="p-2 rounded-full hover:bg-gray-100"><ChevronRightIcon /></button>
        </div>
      </header>
      <div className="grid grid-cols-7 text-center font-semibold text-gray-500 text-sm pb-2 border-b">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => <div key={day}>{day}</div>)}
      </div>
      <div className="grid grid-cols-7 flex-grow -mx-1">
        {calendarDays.map((day, index) => (
          <div key={index} className="border-r border-b p-2 flex flex-col group relative">
            {day && (
              <>
                <span className={`text-sm font-medium ${new Date().toDateString() === day.toDateString() ? 'bg-black text-white rounded-full h-6 w-6 flex items-center justify-center' : 'text-gray-700'}`}>
                  {day.getDate()}
                </span>
                 <button onClick={() => openAddItemModal(day)} className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded-full bg-gray-100 hover:bg-gray-200">
                   <PlusIcon />
                 </button>
                <div className="mt-2 space-y-1 overflow-y-auto">
                    {events.filter(e => e.date === day.toISOString().split('T')[0]).map(event => {
                        const item = event.itemType === 'note' ? notes.find(n => n.id === event.itemId) : tasks.find(t => t.id === event.itemId);
                        if (!item) return null;
                        const noteColor = (item as Note).color;
                        const isSticky = (item as Note).type === NoteType.STICKY;
                        return (
                            <div key={event.id} onClick={() => handlePreviewItem(event)} className="p-1.5 px-2 rounded-full text-xs font-medium cursor-pointer truncate" style={{backgroundColor: isSticky ? noteColor || '#FFF9C4' : '#f3f4f6'}}>
                                {item.title || 'Untitled'}
                            </div>
                        )
                    })}
                </div>
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default CalendarView;
