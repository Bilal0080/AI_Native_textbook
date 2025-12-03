import React, { useState } from 'react';
import { CheckCircle, XCircle, RefreshCw } from 'lucide-react';
import { QuizQuestion } from '../types';

interface QuizProps {
  questions: QuizQuestion[];
  onClose: () => void;
}

const Quiz: React.FC<QuizProps> = ({ questions, onClose }) => {
  const [currentQIndex, setCurrentQIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [score, setScore] = useState(0);
  const [showResults, setShowResults] = useState(false);

  const currentQuestion = questions[currentQIndex];

  const handleOptionSelect = (index: number) => {
    if (isSubmitted) return;
    setSelectedOption(index);
  };

  const handleSubmit = () => {
    if (selectedOption === null) return;
    setIsSubmitted(true);
    if (selectedOption === currentQuestion.correctIndex) {
      setScore(prev => prev + 1);
    }
  };

  const handleNext = () => {
    if (currentQIndex < questions.length - 1) {
      setCurrentQIndex(prev => prev + 1);
      setSelectedOption(null);
      setIsSubmitted(false);
    } else {
      setShowResults(true);
    }
  };

  if (showResults) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-lg border border-slate-200 mt-8">
        <div className="text-center space-y-4">
          <h3 className="text-2xl font-bold text-slate-900">Quiz Complete!</h3>
          <p className="text-lg">You scored <span className="font-bold text-primary">{score}</span> out of <span className="font-bold">{questions.length}</span></p>
          <div className="flex justify-center gap-4 pt-4">
            <button 
              onClick={onClose}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 mt-8 transition-all">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500">
          Question {currentQIndex + 1} of {questions.length}
        </h3>
        <span className="text-xs font-mono bg-slate-100 px-2 py-1 rounded text-slate-600">AI Generated</span>
      </div>

      <p className="text-lg font-medium text-slate-900 mb-6">{currentQuestion.question}</p>

      <div className="space-y-3">
        {currentQuestion.options.map((option, idx) => {
          let optionClass = "w-full text-left p-4 rounded-lg border-2 transition-all flex justify-between items-center ";
          
          if (isSubmitted) {
            if (idx === currentQuestion.correctIndex) {
              optionClass += "border-green-500 bg-green-50 text-green-900";
            } else if (idx === selectedOption) {
              optionClass += "border-red-500 bg-red-50 text-red-900";
            } else {
              optionClass += "border-slate-100 text-slate-400";
            }
          } else {
            if (selectedOption === idx) {
              optionClass += "border-primary bg-blue-50 text-primary";
            } else {
              optionClass += "border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-slate-700";
            }
          }

          return (
            <button 
              key={idx} 
              onClick={() => handleOptionSelect(idx)}
              className={optionClass}
              disabled={isSubmitted}
            >
              <span>{option}</span>
              {isSubmitted && idx === currentQuestion.correctIndex && <CheckCircle className="w-5 h-5 text-green-600" />}
              {isSubmitted && idx === selectedOption && idx !== currentQuestion.correctIndex && <XCircle className="w-5 h-5 text-red-600" />}
            </button>
          );
        })}
      </div>

      {isSubmitted && (
        <div className="mt-4 p-4 bg-blue-50 rounded-lg text-blue-900 text-sm">
          <strong>Explanation: </strong> {currentQuestion.explanation}
        </div>
      )}

      <div className="mt-6 flex justify-end">
        {!isSubmitted ? (
          <button 
            onClick={handleSubmit}
            disabled={selectedOption === null}
            className="px-6 py-2 bg-primary text-white font-medium rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Submit Answer
          </button>
        ) : (
          <button 
            onClick={handleNext}
            className="px-6 py-2 bg-slate-900 text-white font-medium rounded-lg hover:bg-slate-800 transition-colors"
          >
            {currentQIndex < questions.length - 1 ? "Next Question" : "See Results"}
          </button>
        )}
      </div>
    </div>
  );
};

export default Quiz;
