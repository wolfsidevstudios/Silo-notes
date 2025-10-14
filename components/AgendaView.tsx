import React, { useState } from 'react';
import { Task, Meeting, TaskPriority } from '../types';
import { PlusIcon } from './icons';

interface AgendaViewProps {
  tasks: Task[];
  meetings: Meeting[];
  onAddTask: (title: string, priority: TaskPriority) => void;
  onAddMeeting: (title: string, dateTime: string) => void;
  onToggleTask: (taskId: string) => void;
  onDeleteTask: (taskId: string) => void;
  onDeleteMeeting: (meetingId: string) => void;
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

const AgendaView: React.FC<AgendaViewProps> = ({ tasks, meetings, onAddTask, onAddMeeting, onToggleTask, onDeleteTask, onDeleteMeeting }) => {
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskPriority, setNewTaskPriority] = useState<TaskPriority>(TaskPriority.MEDIUM);
  const [newMeetingTitle, setNewMeetingTitle] = useState('');
  const [newMeetingDateTime, setNewMeetingDateTime] = useState('');

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
  
  const upcomingMeetings = [...meetings].sort((a, b) => new Date(a.dateTime).getTime() - new Date(b.dateTime).getTime());
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
            {upcomingMeetings.length > 0 ? upcomingMeetings.map(meeting => (
              <div key={meeting.id} className="bg-gray-50/70 p-4 rounded-lg flex justify-between items-start group">
                <div>
                    <div className="flex items-center gap-2">
                        <p className="font-semibold text-gray-800">{meeting.title}</p>
                    </div>
                    <p className="text-sm text-gray-500 mt-1">{new Date(meeting.dateTime).toLocaleString()}</p>
                    {meeting.joinUrl && (
                        <a href={meeting.joinUrl} target="_blank" rel="noopener noreferrer" className="text-sm font-semibold text-blue-600 hover:underline mt-2 inline-block">Join Meeting</a>
                    )}
                </div>
                <button onClick={() => onDeleteMeeting(meeting.id)} className="text-gray-400 hover:text-red-500 font-bold opacity-0 group-hover:opacity-100 transition-opacity text-xl">&times;</button>
              </div>
            )) : <p className="text-gray-500 text-center pt-10">No upcoming meetings.</p>}
          </div>
        </div>

        {/* Tasks Column */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border flex flex-col">
           <h2 className="text-2xl font-semibold text-gray-800 mb-4 flex-shrink-0">Tasks</h2>
           <form onSubmit={handleAddTaskSubmit} className="flex-shrink-0 flex gap-2 mb-4">
            <input type="text" value={newTaskTitle} onChange={e => setNewTaskTitle(e.target.value)} placeholder="Add a new task..." className="flex-grow p-2 border rounded-lg focus:ring-black focus:border-black" />
            <select value={newTaskPriority} onChange={e => setNewTaskPriority(e.target.value as TaskPriority)} className="p-2 border rounded-lg focus:ring-black focus:border-black bg-white">
                <option value={TaskPriority.LOW}>Low</option>
                <option value={TaskPriority.MEDIUM}>Medium</option>
                <option value={TaskPriority.HIGH}>High</option>
            </select>
            <button type="submit" className="bg-black text-white p-2 rounded-lg flex items-center justify-center"><PlusIcon /></button>
          </form>
           <div className="overflow-y-auto flex-grow -mr-2 pr-2">
              <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-2">To-Do</h3>
              <div className="space-y-2">
                 {incompleteTasks.length > 0 ? incompleteTasks.map(task => (
                  <div key={task.id} className="flex items-center gap-3 p-2 group hover:bg-gray-50 rounded-md">
                    <input type="checkbox" checked={task.completed} onChange={() => onToggleTask(task.id)} className="h-5 w-5 rounded border-gray-300 text-black focus:ring-black cursor-pointer flex-shrink-0" />
                    <PriorityIndicator priority={task.priority} />
                    <span className="flex-grow text-gray-700">{task.title}</span>
                     <button onClick={() => onDeleteTask(task.id)} className="text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity font-bold flex-shrink-0">&times;</button>
                  </div>
                )) : <p className="text-gray-500">No tasks to do. Well done!</p>}
              </div>

             {completedTasks.length > 0 && (
                <div className="mt-6">
                    <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-2 border-t pt-4">Completed</h3>
                     <div className="space-y-2">
                        {completedTasks.map(task => (
                            <div key={task.id} className="flex items-center gap-3 p-2 group hover:bg-gray-50 rounded-md">
                                <input type="checkbox" checked={task.completed} onChange={() => onToggleTask(task.id)} className="h-5 w-5 rounded border-gray-300 text-black focus:ring-black cursor-pointer flex-shrink-0" />
                                <PriorityIndicator priority={task.priority} />
                                <span className="flex-grow text-gray-500 line-through">{task.title}</span>
                                <button onClick={() => onDeleteTask(task.id)} className="text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity font-bold flex-shrink-0">&times;</button>
                            </div>
                        ))}
                     </div>
                </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AgendaView;