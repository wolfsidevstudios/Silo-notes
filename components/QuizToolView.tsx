import React, { useState, useEffect } from 'react';
import { BackIcon, QuizIcon, FullScreenIcon, CloseIcon, RestartIcon } from './icons';
import { GoogleGenAI, Type } from "@google/genai";
import { Note, NoteType } from '../types';
import SelectNoteModal from './SelectNoteModal';

interface QuizQuestion {
  question: string;
  options: string[];
  correctAnswer: string;
}

const QuizQuestionComponent: React.FC<{ question: QuizQuestion, onAnswer?: (isCorrect: boolean) => void }> = ({ question, onAnswer }) => {
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);

  const handleAnswer = (option: string) => {
    if (isAnswered) return;
    setSelectedAnswer(option);
    setIsAnswered(true);
    if(onAnswer) onAnswer(option === question.correctAnswer);
  };

  const getOptionClass = (option: string) => {
    if (!isAnswered) return 'bg-white hover:bg-gray-100 border-gray-300';
    if (option === question.correctAnswer) return 'bg-green-100 border-green-500 text-green-800';
    if (option === selectedAnswer) return 'bg-red-100 border-red-500 text-red-800';
    return 'bg-white border-gray-300 text-gray-500';
  }

  return (
    <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
      <p className="font-semibold mb-4 text-gray-800 text-lg">{question.question}</p>
      <div className="space-y-3">
        {question.options.map((option, i) => (
          <button
            key={i}
            onClick={() => handleAnswer(option)}
            disabled={isAnswered}
            className={`w-full text-left p-3 border-2 rounded-lg transition-all duration-200 font-medium ${getOptionClass(option)}`}
          >
            {option}
          </button>
        ))}
      </div>
    </div>
  )
};

const FullScreenQuiz: React.FC<{ questions: QuizQuestion[], onClose: () => void }> = ({ questions, onClose }) => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [answers, setAnswers] = useState<(boolean | null)[]>(Array(questions.length).fill(null));
    const [showResults, setShowResults] = useState(false);

    const handleAnswer = (isCorrect: boolean) => {
        setAnswers(prev => {
            const newAnswers = [...prev];
            newAnswers[currentIndex] = isCorrect;
            return newAnswers;
        });
    };

    const nextQuestion = () => {
        if (currentIndex < questions.length - 1) {
            setCurrentIndex(prev => prev + 1);
        } else {
            setShowResults(true);
        }
    };
    
    const restartQuiz = () => {
        setCurrentIndex(0);
        setAnswers(Array(questions.length).fill(null));
        setShowResults(false);
    };

    const score = answers.filter(a => a === true).length;

    return (
        <div className="fixed inset-0 bg-gray-900/70 backdrop-blur-sm z-50 flex flex-col items-center justify-center p-4">
            <button onClick={onClose} className="absolute top-6 right-6 text-white/70 hover:text-white"><CloseIcon /></button>
            <div className="w-full max-w-2xl">
                {showResults ? (
                    <div className="bg-white p-8 rounded-xl text-center shadow-2xl">
                        <h2 className="text-3xl font-bold text-gray-800">Quiz Complete!</h2>
                        <p className="text-6xl font-bold my-6">{score} / {questions.length}</p>
                        <p className="text-lg text-gray-600 mb-8">You got {((score / questions.length) * 100).toFixed(0)}% correct.</p>
                        <button onClick={restartQuiz} className="bg-black text-white font-semibold py-3 px-8 rounded-full hover:bg-gray-800 transition-colors flex items-center justify-center gap-2 mx-auto">
                            <RestartIcon />
                            <span>Take Again</span>
                        </button>
                    </div>
                ) : (
                    <>
                        <QuizQuestionComponent question={questions[currentIndex]} onAnswer={handleAnswer} />
                        <div className="mt-6 flex justify-between items-center">
                            <p className="text-white font-mono">{currentIndex + 1} / {questions.length}</p>
                            <button onClick={nextQuestion} disabled={answers[currentIndex] === null} className="bg-black text-white font-semibold py-2 px-8 rounded-full hover:bg-gray-800 disabled:bg-gray-400">
                                {currentIndex === questions.length - 1 ? 'Finish' : 'Next'}
                            </button>
                        </div>
                    </>
                )}
            </div>
        </div>
    )
};


interface QuizToolViewProps {
  onBack: () => void;
  currentNote: Note | null;
  onSave: (noteData: Omit<Note, 'id' | 'createdAt'> & { id?: string }) => void;
  notes: Note[];
}

const QuizToolView: React.FC<QuizToolViewProps> = ({ onBack, currentNote, onSave, notes }) => {
  const [inputText, setInputText] = useState('');
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [status, setStatus] = useState<'idle' | 'loading' | 'error' | 'success'>('idle');
  const [error, setError] = useState('');
  const [geminiApiKey, setGeminiApiKey] = useState<string | null>(null);

  const [isViewerMode, setIsViewerMode] = useState(false);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [title, setTitle] = useState('');
  const [showSelectNoteModal, setShowSelectNoteModal] = useState(false);

  useEffect(() => {
    const key = localStorage.getItem('gemini-api-key');
    setGeminiApiKey(key);
  }, []);

  useEffect(() => {
    if (currentNote) {
        setIsViewerMode(true);
        setTitle(currentNote.title);
        try {
            const parsedQuestions = JSON.parse(currentNote.content);
            setQuestions(parsedQuestions);
            setStatus('success');
        } catch (e) {
            setError('Could not load quiz.');
            setStatus('error');
        }
    } else {
        setIsViewerMode(false);
        setInputText('');
        setQuestions([]);
        setStatus('idle');
        setTitle('');
    }
  }, [currentNote]);

  const handleGenerate = async () => {
    if (!geminiApiKey || !inputText.trim()) return;

    setStatus('loading');
    setError('');
    setQuestions([]);
    try {
        const ai = new GoogleGenAI({ apiKey: geminiApiKey });
        const prompt = `Based on the following text, generate a multiple-choice quiz with 4 options for each question. Text:\n\n${inputText}`;
        
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        quiz: {
                            type: Type.ARRAY,
                            items: {
                                type: Type.OBJECT,
                                properties: {
                                    question: { type: Type.STRING },
                                    options: { type: Type.ARRAY, items: { type: Type.STRING } },
                                    correctAnswer: { type: Type.STRING }
                                },
                                required: ["question", "options", "correctAnswer"]
                            }
                        }
                    },
                    required: ["quiz"]
                }
            }
        });
        
        const jsonText = response.text.trim();
        const parsedResponse = JSON.parse(jsonText);
        setQuestions(parsedResponse.quiz || []);
        setStatus('success');
    } catch (err) {
        console.error("Gemini API Error:", err);
        setError("Failed to generate quiz. The AI couldn't process the request. Try rephrasing or simplifying your text.");
        setStatus('error');
    }
  };

  const handleSaveQuiz = () => {
    const noteTitle = prompt("Enter a title for this quiz:", "My New Quiz");
    if (noteTitle && questions.length > 0) {
        onSave({
            title: noteTitle,
            content: JSON.stringify(questions),
            type: NoteType.QUIZ,
            privacy: 'public'
        });
    }
  };
  
  const commonViewClasses = "p-8 lg:p-12 h-full flex flex-col bg-gray-50/50";

  if (!geminiApiKey && !isViewerMode) {
    return (
      <div className={`${commonViewClasses} items-center justify-center text-center`}>
        <h2 className="text-xl font-semibold text-gray-700">API Key Required</h2>
        <p className="text-gray-500 mt-2">Please set your Gemini API key in the Settings to use this tool.</p>
        <button onClick={onBack} className="mt-6 flex items-center text-sm font-semibold text-gray-500 hover:text-gray-800 transition-colors">
            <BackIcon />
            <span>Back to Silo Labs</span>
        </button>
      </div>
    );
  }

  return (
    <div className={commonViewClasses}>
      {isFullScreen && <FullScreenQuiz questions={questions} onClose={() => setIsFullScreen(false)} />}
      {showSelectNoteModal && <SelectNoteModal notes={notes} onClose={() => setShowSelectNoteModal(false)} onSelect={(content) => setInputText(content)} />}
      <header className="mb-10 flex-shrink-0">
        <button onClick={onBack} className="flex items-center text-sm font-semibold text-gray-500 hover:text-gray-800 transition-colors mb-4">
          <BackIcon />
          <span>Back to {isViewerMode ? 'Home' : 'Silo Labs'}</span>
        </button>
        <h1 className="text-4xl font-bold text-gray-900">{isViewerMode ? title : 'Notes to Quiz'}</h1>
        {!isViewerMode && <p className="text-lg text-gray-500 mt-2">Test your knowledge by converting your notes into a practice quiz.</p>}
      </header>

       {isViewerMode ? (
         <div className="flex-grow w-full bg-white p-6 rounded-2xl shadow-sm border relative overflow-y-auto">
            {status === 'success' && questions.length > 0 ? (
                <>
                    <button onClick={() => setIsFullScreen(true)} className="absolute top-4 right-4 z-10 flex items-center gap-2 text-sm font-medium bg-white hover:bg-gray-100 border rounded-full px-3 py-2">
                        <FullScreenIcon />
                        <span>Quiz Mode</span>
                    </button>
                    <div className="space-y-4 max-w-3xl mx-auto">
                        {questions.map((q, i) => <QuizQuestionComponent key={i} question={q} />)}
                    </div>
                </>
              ) : <p className="text-gray-500 text-center pt-10">No questions to display.</p>}
         </div>
      ) : (
        <>
            <div className="flex-grow grid grid-cols-1 md:grid-cols-2 gap-8 min-h-0">
                <div className="bg-white p-6 rounded-2xl shadow-sm border flex flex-col">
                     <div className="flex justify-between items-center mb-2">
                        <h2 className="font-semibold text-gray-800">Your Notes</h2>
                        <button onClick={() => setShowSelectNoteModal(true)} className="text-sm font-semibold text-gray-600 hover:text-black">Select Note</button>
                    </div>
                    <textarea
                        value={inputText}
                        onChange={(e) => setInputText(e.target.value)}
                        placeholder="Paste your notes here..."
                        className="flex-1 w-full p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-black resize-none bg-gray-50/50"
                    />
                </div>
                <div className="bg-white p-6 rounded-2xl shadow-sm border flex flex-col">
                    <h2 className="font-semibold mb-2 text-gray-800">Generated Quiz</h2>
                    <div className="flex-1 w-full p-4 border border-gray-200 rounded-lg bg-gray-50/50 relative overflow-y-auto">
                    {status === 'loading' && (
                        <div className="absolute inset-0 flex items-center justify-center">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
                        </div>
                    )}
                    {status === 'error' && <p className="text-red-500 p-4">{error}</p>}
                    {status === 'success' && questions.length > 0 && (
                        <div className="space-y-4">
                            {questions.map((q, i) => <QuizQuestionComponent key={i} question={q} />)}
                        </div>
                    )}
                    {status !== 'loading' && questions.length === 0 && <p className="text-gray-500 text-center pt-10">Your quiz will appear here.</p>}
                    </div>
                </div>
            </div>
            
            <div className="flex-shrink-0 mt-8 flex justify-end gap-4">
                {status === 'success' && questions.length > 0 && (
                     <button
                        onClick={handleSaveQuiz}
                        className="bg-white text-black border border-black font-semibold py-3 px-8 rounded-full hover:bg-gray-100 transition-colors"
                    >
                        Save Quiz
                    </button>
                )}
                <button
                    onClick={handleGenerate}
                    disabled={status === 'loading' || !inputText.trim()}
                    className="bg-black text-white font-semibold py-3 px-8 rounded-full hover:bg-gray-800 transition-colors disabled:bg-gray-400 flex items-center justify-center gap-2"
                >
                    <QuizIcon />
                    {status === 'loading' ? 'Generating...' : 'Create Quiz'}
                </button>
            </div>
        </>
      )}
    </div>
  );
};

export default QuizToolView;
