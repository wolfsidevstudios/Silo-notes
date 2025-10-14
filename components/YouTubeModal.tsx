import React, { useState } from 'react';
import { YouTubeIcon } from './icons';

interface YouTubeModalProps {
  onClose: () => void;
  onSubmit: (url: string) => void;
}

const YouTubeModal: React.FC<YouTubeModalProps> = ({ onClose, onSubmit }) => {
  const [url, setUrl] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (url.trim()) {
      onSubmit(url);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 transition-opacity duration-300" aria-modal="true" role="dialog">
      <div className="bg-white rounded-xl shadow-2xl p-8 w-full max-w-lg m-4 transform transition-all duration-300 scale-100">
        <div className="flex items-center mb-6">
          <div className="bg-red-100 p-2 rounded-full mr-4">
            <YouTubeIcon />
          </div>
          <h2 className="text-2xl font-bold text-gray-800">Embed YouTube Video</h2>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="youtube-url" className="block text-sm font-medium text-gray-700 mb-2">YouTube URL</label>
            <input
              type="url"
              id="youtube-url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://www.youtube.com/watch?v=..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-black"
              required
              autoFocus
            />
          </div>
          <div className="flex justify-end gap-3 mt-8">
            <button
              type="button"
              onClick={onClose}
              className="bg-white text-gray-700 font-semibold py-2 px-6 rounded-full border border-gray-300 hover:bg-gray-100 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="bg-black text-white font-semibold py-2 px-6 rounded-full hover:bg-gray-800 transition-colors"
            >
              Add Video
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default YouTubeModal;
