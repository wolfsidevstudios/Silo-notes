
import React from 'react';
import { IdeasIcon } from './icons';

const ideas = [
  {
    category: 'Creativity',
    color: 'bg-indigo-100 text-indigo-800',
    items: [
      {
        title: 'Morning Pages',
        description: 'Start your day by writing three pages of stream-of-consciousness thought to clear your mind.',
      },
      {
        title: 'Story from a Photo',
        description: 'Find an interesting old photograph and write a short story about the people or place in it.',
      },
      {
        title: 'SCAMPER Method',
        description: 'Use the SCAMPER checklist (Substitute, Combine, Adapt, Modify, etc.) to brainstorm new ideas for a project.',
      },
    ],
  },
  {
    category: 'Productivity',
    color: 'bg-green-100 text-green-800',
    items: [
      {
        title: 'The Pomodoro Technique',
        description: 'Work in focused 25-minute intervals, separated by short breaks, to maintain high concentration.',
      },
      {
        title: 'Eat The Frog',
        description: "Tackle your most challenging task first thing in the morning to build momentum for the day.",
      },
      {
        title: 'Weekly Review',
        description: 'Set aside time each week to reflect on what went well, what didn"t, and what to improve next week.',
      },
    ],
  },
  {
    category: 'Personal Growth',
    color: 'bg-amber-100 text-amber-800',
    items: [
      {
        title: 'Gratitude Journaling',
        description: 'Each day, write down three things you are grateful for. It can shift your entire perspective.',
      },
      {
        title: 'Define Your Values',
        description: 'List your top 5 personal values. Are your daily actions aligned with them?',
      },
      {
        title: 'Learn a New Skill',
        description: 'Dedicate 30 minutes every day to learning something new, like an instrument, language, or coding.',
      },
    ],
  },
];

const IdeaCard: React.FC<{ title: string, description: string }> = ({ title, description }) => (
  <div className="bg-white p-6 rounded-lg border border-gray-200 hover:shadow-lg hover:-translate-y-1 transition-all duration-200">
    <h3 className="font-bold text-gray-800 mb-2">{title}</h3>
    <p className="text-gray-600 text-sm">{description}</p>
  </div>
);

const IdeasView: React.FC = () => {
  return (
    <div className="p-8 lg:p-12">
      <header className="mb-10">
        <div className="flex items-center mb-2">
           <div className="bg-yellow-200 p-2 rounded-full">
              <IdeasIcon />
           </div>
           <h1 className="text-4xl font-bold text-gray-900 ml-4">Idea Starters</h1>
        </div>
        <p className="text-lg text-gray-500 mt-2">A space to ignite your imagination. Grab an idea and start creating.</p>
      </header>

      <div className="space-y-12">
        {ideas.map((category) => (
          <section key={category.category}>
            <div className="flex items-center mb-6">
              <span className={`px-3 py-1 text-sm font-semibold rounded-full ${category.color}`}>
                {category.category}
              </span>
              <div className="flex-grow h-px bg-gray-200 ml-4"></div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {category.items.map((idea) => (
                <IdeaCard key={idea.title} title={idea.title} description={idea.description} />
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
};

export default IdeasView;
