import React, { useState, useEffect } from 'react';
import { GoogleGenAI, Type } from "@google/genai";
import { CloseIcon, RewriteIcon } from './icons';

interface RewriteModalProps {
  textToProcess: string;
  onClose: () => void;
  onReplace: (newText: string) => void;
  geminiApiKey: string | null;
}

const RewriteModal: React.FC<RewriteModalProps> = ({ textToProcess, onClose, onReplace, geminiApiKey }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [variations, setVariations] = useState<string[]>([]);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const generateVariations = async () => {
      if (!geminiApiKey) {
        setError("Gemini API key is not configured.");
        setIsLoading(false);
        return;
      }
      try {
        const ai = new GoogleGenAI({ apiKey: geminiApiKey });
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: `Rewrite the following text in three distinct variations. The variations should be different in tone, style, or structure. Text: "${textToProcess}"`,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        variations: {
                            type: Type.ARRAY,
                            items: { type: Type.STRING },
                            description: "An array of three distinct rewritten text variations."
                        }
                    },
                    required: ["variations"],
                },
            },
        });
        
        const jsonText = response.text.trim();
        const parsedResponse = JSON.parse(jsonText);
        
        if (parsedResponse.variations && parsedResponse.variations.length > 0) {
            setVariations(parsedResponse.variations);
        } else {
            // Fallback if structured response fails
            setVariations([response.text, `Variation 2: ${response.text}`, `Variation 3: ${response.text}`]);
        }
      } catch (err) {
        console.error("Rewrite API Error:", err);
        setError("Failed to generate variations. Please try again.");
      } finally {
        setIsLoading(false);
      }
    };

    generateVariations();
  }, [textToProcess, geminiApiKey]);

  const handleReplaceClick = () => {
    if (selectedIndex !== null && variations[selectedIndex]) {
      onReplace(variations[selectedIndex]);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl m-4 transform transition-all duration-300 scale-100 flex flex-col max-h-[90vh]" onClick={e => e.stopPropagation()}>
        <div className="p-6 border-b flex justify-between items-center">
            <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                <RewriteIcon />
                <span>Rewrite Text</span>
            </h2>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-700">
                <CloseIcon />
            </button>
        </div>
        
        <div className="p-6 flex-grow overflow-y-auto">
            {isLoading && (
                <div className="flex flex-col items-center justify-center h-full text-center">
                    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-gray-900 mb-4"></div>
                    <p className="text-gray-600 font-semibold">Generating variations...</p>
                </div>
            )}
            {error && <p className="text-red-500 text-center">{error}</p>}
            {!isLoading && !error && (
                <div className="space-y-4">
                    {variations.map((text, index) => (
                        <div
                            key={index}
                            onClick={() => setSelectedIndex(index)}
                            className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                                selectedIndex === index ? 'border-black bg-gray-50' : 'border-gray-200 hover:border-gray-400'
                            }`}
                        >
                           <p className="text-gray-700">{text}</p>
                        </div>
                    ))}
                </div>
            )}
        </div>

        <div className="p-6 border-t flex justify-end">
            <button
                onClick={handleReplaceClick}
                disabled={selectedIndex === null}
                className="bg-black text-white font-semibold py-2 px-6 rounded-full hover:bg-gray-800 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
                Replace
            </button>
        </div>
      </div>
    </div>
  );
};

export default RewriteModal;
