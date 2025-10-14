import React from 'react';
import { SiloLabsIcon } from './icons';

interface ComingSoonModalProps {
  onClose: () => void;
}

const ComingSoonModal: React.FC<ComingSoonModalProps> = ({ onClose }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 transition-opacity duration-300" aria-modal="true" role="dialog">
      <div className="bg-white rounded-xl shadow-2xl p-8 w-full max-w-md m-4 transform transition-all duration-300 scale-100 text-center">
        <div className="flex items-center justify-center h-16 w-16 rounded-full bg-blue-100 mb-6 mx-auto">
          <SiloLabsIcon />
        </div>
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Coming Soon!</h2>
        <p className="text-gray-600 mb-8">
          We're hard at work building this feature. It'll be ready for you to use shortly. Stay tuned!
        </p>
        <button
          onClick={onClose}
          className="w-full bg-black text-white font-semibold py-3 px-6 rounded-full hover:bg-gray-800 transition-colors"
        >
          Got it
        </button>
      </div>
    </div>
  );
};

export default ComingSoonModal;
