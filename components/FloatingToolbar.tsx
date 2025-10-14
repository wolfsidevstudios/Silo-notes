import React, { useRef, useState } from 'react';

interface FloatingToolbarProps {
  top: number;
  left: number;
  onCommand: (command: string, value?: string) => void;
}

const FONT_SIZES = [
    { name: 'Small', value: '3' },
    { name: 'Normal', value: '4' },
    { name: 'Large', value: '6' },
];

const FONT_FACES = ['Arial', 'Georgia', 'Inter', 'Verdana'];

// FIX: Added 'children' to the props destructuring to make it available inside the component.
const ToolbarButton = ({ onClick, children }: { onClick: () => void; children: React.ReactNode }) => (
    <button onClick={onClick} className="p-2 hover:bg-gray-100 rounded-lg flex items-center gap-1.5 text-sm font-medium text-gray-700">
        {children}
    </button>
);

const FloatingToolbar: React.FC<FloatingToolbarProps> = ({ top, left, onCommand }) => {
    const colorInputRef = useRef<HTMLInputElement>(null);
    const highlightInputRef = useRef<HTMLInputElement>(null);
    const [textColor, setTextColor] = useState('#000000');
    const [highlightColor, setHighlightColor] = useState('#FFFF00');

    const handleColorChange = (e: React.ChangeEvent<HTMLInputElement>, command: 'foreColor' | 'hiliteColor') => {
        const newColor = e.target.value;
        if (command === 'foreColor') {
            setTextColor(newColor);
        } else {
            setHighlightColor(newColor);
        }
        onCommand(command, newColor);
    };

    return (
        <div 
            className="absolute z-10 bg-white shadow-xl rounded-xl p-1 flex items-center gap-1 border border-gray-200"
            style={{ 
                top: top - 55,
                left: left,
                transform: 'translateX(-50%)',
            }}
            onMouseDown={(e) => e.preventDefault()}
        >
            <ToolbarButton onClick={() => onCommand('bold')}>
                <span className="material-symbols-rounded" style={{ fontSize: '20px' }}>format_bold</span>
                <span>Bold</span>
            </ToolbarButton>
            <ToolbarButton onClick={() => onCommand('italic')}>
                <span className="material-symbols-rounded" style={{ fontSize: '20px' }}>format_italic</span>
                <span>Italic</span>
            </ToolbarButton>
            <ToolbarButton onClick={() => onCommand('underline')}>
                <span className="material-symbols-rounded" style={{ fontSize: '20px' }}>format_underlined</span>
                <span>Underline</span>
            </ToolbarButton>
            
            <div className="w-px h-6 bg-gray-200 mx-1"></div>

            <div className="relative group">
                <div className="p-2 hover:bg-gray-100 rounded-lg flex items-center gap-1.5 text-sm font-medium text-gray-700 cursor-pointer">
                    <span className="material-symbols-rounded" style={{ fontSize: '20px' }}>text_fields</span>
                    <span>Font</span>
                </div>
                <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 bg-white rounded-md shadow-lg border hidden group-hover:block w-32 z-20">
                    {FONT_FACES.map(font => (
                        <button key={font} onClick={() => onCommand('fontName', font)} className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-100" style={{fontFamily: font}}>
                            {font}
                        </button>
                    ))}
                </div>
            </div>

            <div className="relative group">
                <div className="p-2 hover:bg-gray-100 rounded-lg flex items-center gap-1.5 text-sm font-medium text-gray-700 cursor-pointer">
                    <span className="material-symbols-rounded" style={{ fontSize: '20px' }}>format_size</span>
                    <span>Size</span>
                </div>
                <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 bg-white rounded-md shadow-lg border hidden group-hover:block w-24 z-20">
                     {FONT_SIZES.map(size => (
                        <button key={size.name} onClick={() => onCommand('fontSize', size.value)} className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-100">
                            {size.name}
                        </button>
                    ))}
                </div>
            </div>

            <div className="w-px h-6 bg-gray-200 mx-1"></div>

            <button className="p-2 hover:bg-gray-100 rounded-lg flex items-center gap-1.5 text-sm font-medium text-gray-700 relative" onClick={() => colorInputRef.current?.click()}>
                <span className="material-symbols-rounded" style={{ fontSize: '20px' }}>format_color_text</span>
                <span>Color</span>
                <div className="w-4 h-4 rounded-full border border-gray-300" style={{ backgroundColor: textColor }}></div>
                <input ref={colorInputRef} type="color" className="absolute w-0 h-0 opacity-0" value={textColor} onChange={(e) => handleColorChange(e, 'foreColor')} />
            </button>
            <button className="p-2 hover:bg-gray-100 rounded-lg flex items-center gap-1.5 text-sm font-medium text-gray-700 relative" onClick={() => highlightInputRef.current?.click()}>
                <span className="material-symbols-rounded" style={{ fontSize: '20px' }}>format_ink_highlighter</span>
                <span>Highlight</span>
                <div className="w-4 h-4 rounded-full border border-gray-300" style={{ backgroundColor: highlightColor }}></div>
                <input ref={highlightInputRef} type="color" className="absolute w-0 h-0 opacity-0" value={highlightColor} onChange={(e) => handleColorChange(e, 'hiliteColor')} />
            </button>
        </div>
    );
};

export default FloatingToolbar;