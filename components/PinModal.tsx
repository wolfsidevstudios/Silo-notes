import React, { useState, useRef, useEffect } from 'react';

interface PinModalProps {
  mode: 'set' | 'enter';
  onClose?: () => void;
  onSubmit: (pin: string) => void;
  error?: string;
}

const PinModal: React.FC<PinModalProps> = ({ mode, onClose, onSubmit, error }) => {
  const [pin, setPin] = useState(['', '', '', '']);
  const inputsRef = useRef<(HTMLInputElement | null)[]>([]);

  const title = mode === 'set' ? 'Set a PIN for this note' : 'Enter PIN to unlock';
  const buttonText = mode === 'set' ? 'Set PIN' : 'Unlock';

  useEffect(() => {
    inputsRef.current[0]?.focus();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
    const value = e.target.value.slice(-1); // Only take the last digit
    if (!/^\d*$/.test(value)) return; // Only allow digits

    const newPin = [...pin];
    newPin[index] = value;
    setPin(newPin);

    // Move to next input
    if (value && index < 3) {
      inputsRef.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
    if (e.key === 'Backspace' && !pin[index] && index > 0) {
      inputsRef.current[index - 1]?.focus();
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const fullPin = pin.join('');
    if (fullPin.length === 4) {
      onSubmit(fullPin);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" aria-modal="true" role="dialog">
      <div className="bg-white rounded-xl shadow-2xl p-8 w-full max-w-sm m-4 text-center">
        <h2 className="text-2xl font-bold mb-2 text-gray-800">{title}</h2>
        <p className="text-gray-500 mb-6">Your PIN is only saved for this note.</p>
        
        <form onSubmit={handleSubmit}>
          <div className="flex justify-center gap-3 mb-6">
            {pin.map((digit, index) => (
              <input
                key={index}
                ref={el => inputsRef.current[index] = el}
                type="password"
                maxLength={1}
                value={digit}
                onChange={(e) => handleChange(e, index)}
                onKeyDown={(e) => handleKeyDown(e, index)}
                className="w-14 h-16 text-center text-3xl font-bold border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-black"
                pattern="\d*"
                inputMode="numeric"
              />
            ))}
          </div>

          {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
          
          <div className="flex flex-col gap-3">
            <button
              type="submit"
              className="w-full bg-black text-white font-semibold py-3 px-6 rounded-full hover:bg-gray-800 transition-colors"
            >
              {buttonText}
            </button>
            {onClose && (
               <button
                  type="button"
                  onClick={onClose}
                  className="w-full bg-gray-100 text-gray-700 font-semibold py-3 px-6 rounded-full hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default PinModal;
