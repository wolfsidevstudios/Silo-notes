import React, { useState, useMemo, useEffect } from 'react';
import { Task, Meeting, TaskPriority } from '../types';
import { PlusIcon, GoogleIcon } from './icons';

interface AgendaViewProps {
  tasks: Task[];
  meetings: Meeting[];
  onAddTask: (title: string, priority: TaskPriority) => void;
  onAddMeeting: (title: string, dateTime: string) => void;
  onToggleTask: (taskId: string) => void;
  onDeleteTask: (taskId: string) => void;
  onDeleteMeeting: (meetingId: string) => void;
  googleUser: any | null;
}

const PriorityIndicator: React.FC<{ priority: TaskPriority }> = ({ priority }) => {
  const priorityStyles: { [key in TaskPriority]: string } = {
    [TaskPriority.HIGH]: 'bg-red-500',
    [TaskPriority.MEDIUM]: 'bg-yellow-500',
    [TaskPriority.LOW]: 'bg-blue-500',
  };
  const priorityLabels: { [key in TaskPriority]: string } = {
    [TaskPriority.HIGH]: 'High priority',
    [TaskPriority.MEDIUM]: 'Medium priority',
    [TaskPriority.LOW]: 'Low priority',
  };

  return (
    <span
      aria-label={priorityLabels[priority]}
      title={priorityLabels[priority]}
      className={`w-2.5 h-2.5 rounded-full inline-block ${priorityStyles[priority]}`}
    />
  );
};

const AgendaView: React.FC<AgendaViewProps> = ({ tasks, meetings, onAddTask, onAddMeeting, onToggleTask, onDeleteTask, onDeleteMeeting, googleUser }) => {
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskPriority, setNewTaskPriority] = useState<TaskPriority>(TaskPriority.MEDIUM);
  const [newMeetingTitle, setNewMeetingTitle] = useState('');
  const [newMeetingDateTime, setNewMeetingDateTime] = useState('');
  const [googleMeetings, setGoogleMeetings] = useState<Meeting[]>([]);

  useEffect(() => {
    if (googleUser && window.gapi?.client?.calendar) {
      const fetchGoogleEvents = async () => {
        try {
          const response = await window.gapi.client.calendar.events.list({
            'calendarId': 'primary',
            'timeMin': (new Date()).toISOString(),
            'showDeleted': false,
            'singleEvents': true,
            'maxResults': 15,
            'orderBy': 'startTime'
          });
          
          const events = response.result.items;
          if (events && events.length > 0) {
            const fetchedMeetings: Meeting[] = events.map((event: any) => ({
              id: `google-${event.id}`,
              title: event.summary,
              dateTime: event.start.dateTime || event.start.date,
              createdAt: event.created,
              source: 'google',
              htmlLink: event.htmlLink,
              joinUrl: event.hangoutLink
            }));
            setGoogleMeetings(fetchedMeetings);
          }
        } catch (error) {
          console.error("Error fetching Google Calendar events:", error);
        }
      };
      fetchGoogleEvents();
    } else {
        setGoogleMeetings([]);
    }
  }, [googleUser]);


  const handleAddTaskSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newTaskTitle.trim()) {
      onAddTask(newTaskTitle.trim(), newTaskPriority);
      setNewTaskTitle('');
      setNewTaskPriority(TaskPriority.MEDIUM);
    }
  };

  const handleAddMeetingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newMeetingTitle.trim() && newMeetingDateTime.trim()) {
      onAddMeeting(newMeetingTitle.trim(), newMeetingDateTime.trim());
      setNewMeetingTitle('');
      setNewMeetingDateTime('');
    }
  };
  
  const allMeetings = useMemo(() => {
    return [...meetings, ...googleMeetings]
        .sort((a, b) => new Date(a.dateTime).getTime() - new Date(b.dateTime).getTime());
  }, [meetings, googleMeetings]);

  const incompleteTasks = tasks.filter(t => !t.completed).sort((a, b) => {
    const priorityOrder = { [TaskPriority.HIGH]: 0, [TaskPriority.MEDIUM]: 1, [TaskPriority.LOW]: 2 };
    return priorityOrder[a.priority] - priorityOrder[b.priority];
  });
  const completedTasks = tasks.filter(t => t.completed);

  return (
    <div className="p-8 lg:p-12 h-full flex flex-col bg-gray-50/50">
      <header className="mb-10 flex-shrink-0">
        <h1 className="text-4xl font-bold text-gray-900">Agenda</h1>
        <p className="text-lg text-gray-500 mt-2">Your schedule and tasks, all in one place.</p>
      </header>
      
      <div className="flex-grow grid grid-cols-1 lg:grid-cols-2 gap-8 overflow-y-auto -mx-8 lg:-mx-12 px-8 lg:px-12 pb-8">
        
        {/* Meetings Column */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border flex flex-col">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4 flex-shrink-0">Meetings</h2>
          <form onSubmit={handleAddMeetingSubmit} className="flex-shrink-0 flex flex-col gap-3 mb-4">
            <input type="text" value={newMeetingTitle} onChange={e => setNewMeetingTitle(e.target.value)} placeholder="Meeting Title" className="w-full p-2 border rounded-lg focus:ring-black focus:border-black" required />
            <input type="text" value={newMeetingDateTime} onChange={e => setNewMeetingDateTime(e.target.value)} placeholder="Date & Time" className="w-full p-2 border rounded-lg focus:ring-black focus:border-black" required />
            <button type="submit" className="bg-black text-white p-3 rounded-full flex items-center justify-center font-semibold w-full hover:bg-gray-800 transition-colors">
              <PlusIcon /> <span className="ml-2">Add Meeting</span>
            </button>
          </form>
          <div className="space-y-3 overflow-y-auto flex-grow -mr-2 pr-2">
            {allMeetings.length > 0 ? allMeetings.map(meeting => (
              <div key={meeting.id} className="bg-gray-50/70 p-4 rounded-lg flex justify-between items-start group">
                <div>
                    <div className="flex items-center gap-2">
                        {meeting.source === 'google' && <GoogleIcon className="w-4 h-4" />}
                        <p className="font-semibold text-gray-800">{meeting.title}</p>
                    </div>
                    <p className="text-sm text-gray-500 mt-1">{new Date(meeting.dateTime).toLocaleString()}</p>
                    {meeting.joinUrl && (
                        <a href={meeting.joinUrl} target="_blank" rel="noopener noreferrer" className="text-sm font-semibold text-blue-600 hover:underline mt-2 inline-block">Join Meeting</a>
                    )}
                     {meeting.source === 'google' && meeting.htmlLink && (
                        <a href={meeting.htmlLink} target="_blank" rel="noopener noreferrer" className="text-sm font-semibold text-blue-600 hover:underline mt-2 inline-block ml-4">View on Google Calendar</a>
                    )}
                </div>
                {meeting.source !== 'google' && (
                    <button onClick={() => onDeleteMeeting(meeting.id)} className="text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity p-1">
                        &times;
                    </button>
                )}
              </div>
            )) : <p className="text-gray-500 text-sm">No upcoming meetings.</p>}
          </div>
        </div>
        
        {/* Tasks Column */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border flex flex-col">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4 flex-shrink-0">Tasks</h2>
          <form onSubmit={handleAddTaskSubmit} className="flex-shrink-0 flex items-center gap-3 mb-4">
            <input type="text" value={newTaskTitle} onChange={e => setNewTaskTitle(e.target.value)} placeholder="Add a new task..." className="flex-grow p-2 border rounded-lg focus:ring-black focus:border-black" required />
            <div className="flex items-center gap-2">
                <button type="button" onClick={() => setNewTaskPriority(TaskPriority.LOW)} className={`w-6 h-6 rounded-full border-2 ${newTaskPriority === TaskPriority.LOW ? 'border-blue-500' : 'border-transparent'} p-1`}><div className="w-full h-full rounded-full bg-blue-500" /></button>
                <button type="button" onClick={() => setNewTaskPriority(TaskPriority.MEDIUM)} className={`w-6 h-6 rounded-full border-2 ${newTaskPriority === TaskPriority.MEDIUM ? 'border-yellow-500' : 'border-transparent'} p-1`}><div className="w-full h-full rounded-full bg-yellow-500" /></button>
                <button type="button" onClick={() => setNewTaskPriority(TaskPriority.HIGH)} className={`w-6 h-6 rounded-full border-2 ${newTaskPriority === TaskPriority.HIGH ? 'border-red-500' : 'border-transparent'} p-1`}><div className="w-full h-full rounded-full bg-red-500" /></button>
            </div>
            <button type="submit" className="bg-black text-white p-3 rounded-full flex items-center justify-center font-semibold hover:bg-gray-800 transition-colors"><PlusIcon /></button>
          </form>
          <div className="overflow-y-auto flex-grow -mr-2 pr-2">
            <div className="space-y-3">
              {incompleteTasks.length > 0 ? incompleteTasks.map(task => (
                <div key={task.id} className="bg-gray-50/70 p-3 rounded-lg flex items-center gap-3 group">
                  <input type="checkbox" checked={task.completed} onChange={() => onToggleTask(task.id)} className="h-5 w-5 rounded-full text-black focus:ring-black border-gray-300" />
                  <PriorityIndicator priority={task.priority} />
                  <span className={`flex-grow ${task.completed ? 'line-through text-gray-400' : ''}`}>{task.title}</span>
                  <button onClick={() => onDeleteTask(task.id)} className="text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity p-1">
                    &times;
                  </button>
                </div>
              )) : <p className="text-gray-500 text-sm">No active tasks.</p>}
            </div>
            {completedTasks.length > 0 && (
                <>
                <h3 className="text-sm font-semibold text-gray-500 mt-6 mb-2">Completed</h3>
                <div className="space-y-3">
                    {completedTasks.map(task => (
                    <div key={task.id} className="bg-gray-50/70 p-3 rounded-lg flex items-center gap-3 group">
                        <input type="checkbox" checked={task.completed} onChange={() => onToggleTask(task.id)} className="h-5 w-5 rounded-full text-black focus:ring-black border-gray-300" />
                        <PriorityIndicator priority={task.priority} />
                        <span className={`flex-grow ${task.completed ? 'line-through text-gray-400' : ''}`}>{task.title}</span>
                         <button onClick={() => onDeleteTask(task.id)} className="text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity p-1">
                            &times;
                        </button>
                    </div>
                    ))}
                </div>
                </>
            )}
          </div>
        </div>
        
      </div>
    </div>
  );
};

// FIX: Add default export for component
export default AgendaView;
