import React, { useState } from 'react';
import { Task, Meeting } from '../types';
import { PlusIcon } from './icons';

interface AgendaViewProps {
  tasks: Task[];
  meetings: Meeting[];
  onAddTask: (title: string) => void;
  onAddMeeting: (title: string, dateTime: string) => void;
  onToggleTask: (taskId: string) => void;
  onDeleteTask: (taskId: string) => void;
  onDeleteMeeting: (meetingId: string) => void;
}

const AgendaView: React.FC<AgendaViewProps> = ({ tasks, meetings, onAddTask, onAddMeeting, onToggleTask, onDeleteTask, onDeleteMeeting }) => {
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newMeetingTitle, setNewMeetingTitle] = useState('');
  const [newMeetingDateTime, setNewMeetingDateTime] = useState('');

  const handleAddTaskSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newTaskTitle.trim()) {
      onAddTask(newTaskTitle.trim());
      setNewTaskTitle('');
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
  
  const upcomingMeetings = meetings.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
  const incompleteTasks = tasks.filter(t => !t.completed);
  const completedTasks = tasks.filter(t => t.completed);

  return (
    <div className="p-8 lg:p-12 h-full flex flex-col">
      <header className="mb-10">
        <h1 className="text-4xl font-bold text-gray-900">Agenda</h1>
        <p className="text-lg text-gray-500 mt-2">Keep track of your meetings and tasks.</p>
      </header>
      
      <div className="flex-grow grid grid-cols-1 lg:grid-cols-2 gap-12 overflow-y-auto">
        {/* Meetings Section */}
        <div className="flex flex-col">
          <h2 className="text-2xl font-semibold text-gray-800 mb-6">Upcoming Meetings</h2>
          <form onSubmit={handleAddMeetingSubmit} className="flex gap-2 mb-6">
            <input type="text" value={newMeetingTitle} onChange={e => setNewMeetingTitle(e.target.value)} placeholder="Meeting Title" className="flex-grow p-2 border rounded-lg" required />
            <input type="text" value={newMeetingDateTime} onChange={e => setNewMeetingDateTime(e.target.value)} placeholder="Date & Time" className="p-2 border rounded-lg" required />
            <button type="submit" className="bg-black text-white p-2 rounded-lg"><PlusIcon /></button>
          </form>
          <div className="space-y-4 overflow-y-auto">
            {upcomingMeetings.length > 0 ? upcomingMeetings.map(meeting => (
              <div key={meeting.id} className="bg-gray-50 p-4 rounded-lg flex justify-between items-start">
                <div>
                  <p className="font-semibold text-gray-800">{meeting.title}</p>
                  <p className="text-sm text-gray-500">{meeting.dateTime}</p>
                </div>
                <button onClick={() => onDeleteMeeting(meeting.id)} className="text-gray-400 hover:text-red-500 font-bold">&times;</button>
              </div>
            )) : <p className="text-gray-500">No upcoming meetings.</p>}
          </div>
        </div>

        {/* Tasks Section */}
        <div className="flex flex-col">
          <h2 className="text-2xl font-semibold text-gray-800 mb-6">Task List</h2>
          <form onSubmit={handleAddTaskSubmit} className="flex gap-2 mb-6">
            <input type="text" value={newTaskTitle} onChange={e => setNewTaskTitle(e.target.value)} placeholder="Add a new task..." className="flex-grow p-2 border rounded-lg" />
            <button type="submit" className="bg-black text-white p-2 rounded-lg"><PlusIcon /></button>
          </form>
          <div className="space-y-2 overflow-y-auto">
             {incompleteTasks.length > 0 ? incompleteTasks.map(task => (
              <div key={task.id} className="flex items-center gap-3 p-2 group">
                <input type="checkbox" checked={task.completed} onChange={() => onToggleTask(task.id)} className="h-5 w-5 rounded border-gray-300 text-black focus:ring-black" />
                <span className="flex-grow text-gray-700">{task.title}</span>
                 <button onClick={() => onDeleteTask(task.id)} className="text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity font-bold">&times;</button>
              </div>
            )) : <p className="text-gray-500">No tasks to do. Well done!</p>}
             {completedTasks.length > 0 && (
                <div className="mt-8">
                    <h3 className="text-lg font-semibold text-gray-600 mb-4 border-t pt-4">Completed</h3>
                     {completedTasks.map(task => (
                        <div key={task.id} className="flex items-center gap-3 p-2 group">
                            <input type="checkbox" checked={task.completed} onChange={() => onToggleTask(task.id)} className="h-5 w-5 rounded border-gray-300 text-black focus:ring-black" />
                            <span className="flex-grow text-gray-500 line-through">{task.title}</span>
                            <button onClick={() => onDeleteTask(task.id)} className="text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity font-bold">&times;</button>
                        </div>
                    ))}
                </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AgendaView;
