import React, { useRef } from 'react';
import { TextColorIcon, TextSizeIcon, HighlightIcon, FontIcon } from './icons';

interface FloatingToolbarProps {
  top: number;
  left: number;
  onCommand: (command: string, value?: string) => void;
}

const FONT_SIZES = [
    { name: 'Small', value: '3' }, // Corresponds to <font size="3">
    { name: 'Normal', value: '4' },// Corresponds to <font size="4">
    { name: 'Large', value: '6' }, // Corresponds to <font size="6">
];

const FONT_FACES = ['Arial', 'Georgia', 'Inter', 'Verdana'];

const FloatingToolbar: React.FC<FloatingToolbarProps> = ({ top, left, onCommand }) => {
    const colorInputRef = useRef<HTMLInputElement>(null);
    const highlightInputRef = useRef<HTMLInputElement>(null);

    return (
        <div 
            className="absolute z-10 bg-white shadow-lg rounded-full p-1 flex items-center gap-1 border border-gray-200"
            style={{ top: top - 45, left }}
            onMouseDown={(e) => e.preventDefault()} // Prevent losing selection
        >
            <div className="relative group">
                <button className="p-2 hover:bg-gray-100 rounded-full">
                    <FontIcon />
                </button>
                <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 bg-white rounded-md shadow-lg border hidden group-hover:block">
                    {FONT_FACES.map(font => (
                        <button key={font} onClick={() => onCommand('fontName', font)} className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-100" style={{fontFamily: font}}>
                            {font}
                        </button>
                    ))}
                </div>
            </div>

            <div className="relative group">
                <button className="p-2 hover:bg-gray-100 rounded-full">
                    <TextSizeIcon />
                </button>
                <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 bg-white rounded-md shadow-lg border hidden group-hover:block">
                     {FONT_SIZES.map(size => (
                        <button key={size.name} onClick={() => onCommand('fontSize', size.value)} className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-100">
                            {size.name}
                        </button>
                    ))}
                </div>
            </div>

            <button className="p-2 hover:bg-gray-100 rounded-full relative" onClick={() => colorInputRef.current?.click()}>
                <TextColorIcon />
                <input ref={colorInputRef} type="color" className="absolute w-0 h-0 opacity-0" onChange={(e) => onCommand('foreColor', e.target.value)} />
            </button>
             <button className="p-2 hover:bg-gray-100 rounded-full relative" onClick={() => highlightInputRef.current?.click()}>
                <HighlightIcon />
                <input ref={highlightInputRef} type="color" className="absolute w-0 h-0 opacity-0" onChange={(e) => onCommand('hiliteColor', e.target.value)} />
            </button>
        </div>
    );
};

export default FloatingToolbar;
