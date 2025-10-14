import React, { useState } from 'react';
import { Space, Board, BoardType } from '../types';
import { PlusIcon, NoteBoardIcon, DiagramIcon, JamBoardIcon, HashtagIcon, MindMapIcon } from './icons';

interface SpaceViewProps {
  space: Space;
  boards: Board[];
  addBoard: (name: string, spaceId: string, type: BoardType) => void;
  onSelectBoard: (board: Board) => void;
}

const BoardTypeOption: React.FC<{type: BoardType, selectedType: BoardType, setType: (type: BoardType) => void}> = ({ type, selectedType, setType }) => {
  const isSelected = type === selectedType;
  return (
    <button
      type="button"
      onClick={() => setType(type)}
      className={`text-center px-4 py-3 rounded-lg border-2 transition-colors duration-200 ${
        isSelected ? 'bg-gray-100 border-gray-300' : 'bg-white border-gray-200 hover:border-gray-300'
      }`}
    >
      <span className="font-semibold text-sm">{type}</span>
    </button>
  )
}

const BoardCard: React.FC<{ board: Board, onSelectBoard: (board: Board) => void }> = ({ board, onSelectBoard }) => {
  const getIcon = () => {
    switch(board.type) {
      case BoardType.NOTE_BOARD: return <NoteBoardIcon />;
      case BoardType.DIAGRAM: return <DiagramIcon />;
      case BoardType.JAM_BOARD: return <JamBoardIcon />;
      case BoardType.MIND_MAP: return <MindMapIcon />;
      default: return null;
    }
  }

  return (
    <div 
      onClick={() => onSelectBoard(board)}
      className="bg-gray-50 p-6 rounded-lg cursor-pointer hover:shadow-md hover:-translate-y-1 transition-all duration-200 border border-gray-200 flex flex-col justify-between"
    >
      <div className="flex items-start justify-between">
        <h3 className="font-bold text-lg mb-2 text-gray-800 pr-4">{board.name}</h3>
        <div className="text-gray-400">{getIcon()}</div>
      </div>
      <p className="text-xs text-gray-400 mt-4">{board.type}</p>
    </div>
  );
};

const SpaceView: React.FC<SpaceViewProps> = ({ space, boards, addBoard, onSelectBoard }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newBoardName, setNewBoardName] = useState('');
  const [newBoardType, setNewBoardType] = useState<BoardType>(BoardType.NOTE_BOARD);

  const handleCreateBoard = (e: React.FormEvent) => {
    e.preventDefault();
    if (newBoardName.trim() === '') return;
    addBoard(newBoardName, space.id, newBoardType);
    setNewBoardName('');
    setNewBoardType(BoardType.NOTE_BOARD);
    setIsModalOpen(false);
  };

  return (
    <div className="p-8 lg:p-12">
      <header className="mb-10 flex items-center justify-between">
        <div>
          <div className="flex items-center text-4xl font-bold text-gray-900">
            <HashtagIcon />
            <h1 className="ml-2">{space.name}</h1>
          </div>
          <p className="text-lg text-gray-500 mt-2">Here are your boards for this space.</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-white text-black font-semibold py-2 px-6 rounded-full hover:bg-gray-100 transition-colors duration-200 border-2 border-black focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black flex items-center"
        >
          <PlusIcon />
          <span className="ml-2">Create New</span>
        </button>
      </header>
      
      {boards.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {boards.map(board => (
            <BoardCard key={board.id} board={board} onSelectBoard={onSelectBoard} />
          ))}
        </div>
      ) : (
        <div className="text-center py-20 bg-gray-50 rounded-lg border-2 border-dashed">
          <h2 className="text-xl font-semibold text-gray-700">This space is empty!</h2>
          <p className="text-gray-500 mt-2">Click "Create New" to add your first board.</p>
        </div>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 transition-opacity duration-300" aria-modal="true" role="dialog">
          <div className="bg-white rounded-xl shadow-2xl p-8 w-full max-w-md m-4 transform transition-all duration-300 scale-100">
            <h2 className="text-2xl font-bold mb-6">Create a new board</h2>
            <form onSubmit={handleCreateBoard}>
              <div className="mb-4">
                <label htmlFor="boardName" className="block text-sm font-medium text-gray-700 mb-2">Board Name</label>
                <input
                  type="text"
                  id="boardName"
                  value={newBoardName}
                  onChange={(e) => setNewBoardName(e.target.value)}
                  placeholder="e.g., Q4 Marketing Plan"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-black"
                  required
                />
              </div>
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">Board Type</label>
                <div className="grid grid-cols-2 gap-2">
                  <BoardTypeOption type={BoardType.NOTE_BOARD} selectedType={newBoardType} setType={setNewBoardType} />
                  <BoardTypeOption type={BoardType.MIND_MAP} selectedType={newBoardType} setType={setNewBoardType} />
                  <BoardTypeOption type={BoardType.DIAGRAM} selectedType={newBoardType} setType={setNewBoardType} />
                  <BoardTypeOption type={BoardType.JAM_BOARD} selectedType={newBoardType} setType={setNewBoardType} />
                </div>
              </div>
              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="bg-white text-gray-700 font-semibold py-2 px-6 rounded-full border border-gray-300 hover:bg-gray-100 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-black text-white font-semibold py-2 px-6 rounded-full hover:bg-gray-800 transition-colors"
                >
                  Create Board
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default SpaceView;