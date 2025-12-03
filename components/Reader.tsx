import React, { useState, useEffect, useRef } from 'react';
import { BookOpen, HelpCircle, ChevronRight, BrainCircuit, Sparkles, RefreshCcw, Quote } from 'lucide-react';
import { Chapter, Section, QuizQuestion } from '../types';
import { generateSectionContent, generateQuizForSection, explainConcept } from '../services/geminiService';
import MarkdownRenderer from './MarkdownRenderer';
import { ContentSkeleton, LoadingSpinner } from './Loading';
import Quiz from './Quiz';
import { CitationModal } from './CitationModal';

interface ReaderProps {
  topic: string;
  audience: string;
  chapter: Chapter;
  section: Section;
  onNextSection: () => void;
}

const Reader: React.FC<ReaderProps> = ({ topic, audience, chapter, section, onNextSection }) => {
  const [content, setContent] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Interactive states
  const [quizQuestions, setQuizQuestions] = useState<QuizQuestion[] | null>(null);
  const [loadingQuiz, setLoadingQuiz] = useState(false);
  const [selection, setSelection] = useState<string | null>(null);
  const [selectionExplanation, setSelectionExplanation] = useState<string | null>(null);
  const [loadingExplanation, setLoadingExplanation] = useState(false);
  const [explanationPos, setExplanationPos] = useState({ top: 0, left: 0 });

  // Citation
  const [showCitation, setShowCitation] = useState(false);

  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let isMounted = true;
    
    const fetchContent = async () => {
      setLoading(true);
      setError(null);
      setContent(null);
      setQuizQuestions(null);
      setSelection(null);
      setSelectionExplanation(null);
      setShowCitation(false);
      
      try {
        const text = await generateSectionContent(topic, chapter.title, section.title, audience);
        if (isMounted) setContent(text);
      } catch (err) {
        if (isMounted) setError("Failed to generate content. Please try again.");
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchContent();
    return () => { isMounted = false; };
  }, [topic, audience, chapter.id, section.id]);

  // Handle Text Selection
  useEffect(() => {
    const handleSelection = () => {
      const sel = window.getSelection();
      if (sel && sel.toString().trim().length > 0 && contentRef.current?.contains(sel.anchorNode)) {
        const range = sel.getRangeAt(0);
        const rect = range.getBoundingClientRect();
        
        // Only show if selection is reasonable length
        if (sel.toString().length < 200) {
           setSelection(sel.toString());
           setExplanationPos({
             top: rect.bottom + window.scrollY + 10,
             left: Math.min(Math.max(10, rect.left + rect.width / 2 - 150), window.innerWidth - 310) // Center but clamp
           });
           setSelectionExplanation(null); // Reset prev explanation
        }
      } else {
        // Delay clearing to allow clicking the popup
        setTimeout(() => {
            // Check if we are not clicking inside the popup (handled by click event logic usually, but simplified here)
        }, 200);
      }
    };

    document.addEventListener('selectionchange', handleSelection);
    return () => document.removeEventListener('selectionchange', handleSelection);
  }, []);

  const handleExplainSelection = async () => {
    if (!selection || !content) return;
    setLoadingExplanation(true);
    try {
      const explanation = await explainConcept(selection, content, audience);
      setSelectionExplanation(explanation);
    } catch (e) {
      setSelectionExplanation("Failed to explain.");
    } finally {
      setLoadingExplanation(false);
    }
  };

  const handleGenerateQuiz = async () => {
    if (!content) return;
    setLoadingQuiz(true);
    try {
      const questions = await generateQuizForSection(content);
      setQuizQuestions(questions);
      // Scroll to quiz
      setTimeout(() => {
        window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
      }, 100);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingQuiz(false);
    }
  };

  if (loading) return <ContentSkeleton />;
  if (error) return (
    <div className="flex flex-col items-center justify-center h-full text-red-500">
      <p className="mb-4">{error}</p>
      <button onClick={() => window.location.reload()} className="text-primary underline">Retry</button>
    </div>
  );

  return (
    <div className="max-w-3xl mx-auto px-6 py-12 relative min-h-screen pb-32">
      <CitationModal 
        isOpen={showCitation} 
        onClose={() => setShowCitation(false)} 
        details={{
            topic: topic,
            chapter: chapter.title,
            section: section.title
        }}
      />

      {/* Breadcrumbs & Tools */}
      <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-2 text-sm text-slate-500 font-medium truncate">
            <span className="truncate">{chapter.title}</span>
            <ChevronRight className="w-4 h-4 flex-shrink-0" />
            <span className="text-primary truncate">{section.title}</span>
          </div>
          <button 
            onClick={() => setShowCitation(true)}
            className="flex-shrink-0 flex items-center gap-2 text-sm text-slate-400 hover:text-primary transition-colors px-3 py-1 rounded-full hover:bg-blue-50 ml-2"
          >
            <Quote className="w-4 h-4" />
            <span className="hidden sm:inline">Cite</span>
          </button>
      </div>

      {/* Main Content */}
      <div ref={contentRef} className="relative">
        {content && <MarkdownRenderer content={content} />}
      </div>

      {/* Popover for Explain */}
      {selection && !selectionExplanation && !loadingExplanation && (
        <div 
            className="fixed z-50 bg-slate-900 text-white px-3 py-2 rounded shadow-xl text-sm font-medium cursor-pointer hover:bg-slate-800 transition-colors flex items-center gap-2 animate-in fade-in zoom-in-95 duration-200"
            style={{ top: explanationPos.top, left: explanationPos.left }}
            onMouseDown={(e) => { e.preventDefault(); handleExplainSelection(); }}
        >
            <Sparkles className="w-4 h-4 text-yellow-400" />
            Explain this
        </div>
      )}

      {/* Explanation Result Bubble */}
      {(loadingExplanation || selectionExplanation) && (
         <div 
         className="fixed z-50 bg-white border border-slate-200 p-4 rounded-lg shadow-xl w-[300px] text-sm text-slate-700 animate-in fade-in slide-in-from-bottom-2 duration-200"
         style={{ top: explanationPos.top, left: explanationPos.left }}
        >
            <div className="flex justify-between items-start mb-2">
                <span className="font-bold text-slate-900 flex items-center gap-2">
                    <BrainCircuit className="w-4 h-4 text-primary" />
                    AI Explanation
                </span>
                <button onClick={() => { setSelection(null); setSelectionExplanation(null); }} className="text-slate-400 hover:text-slate-600">
                    &times;
                </button>
            </div>
            {loadingExplanation ? <LoadingSpinner message="Thinking..." /> : <p>{selectionExplanation}</p>}
        </div>
      )}

      {/* Actions Footer */}
      <div className="mt-16 border-t pt-8 flex flex-col items-center space-y-8">
        {!quizQuestions && (
            <button 
                onClick={handleGenerateQuiz}
                disabled={loadingQuiz}
                className="group flex items-center gap-3 px-6 py-3 bg-white border border-slate-200 shadow-sm hover:shadow-md hover:border-primary/50 rounded-full transition-all text-slate-700"
            >
                {loadingQuiz ? <LoaderIcon /> : <BrainCircuit className="w-5 h-5 text-primary group-hover:scale-110 transition-transform" />}
                <span className="font-medium">Quiz me on this section</span>
            </button>
        )}

        {quizQuestions && (
            <div className="w-full">
                <Quiz questions={quizQuestions} onClose={() => setQuizQuestions(null)} />
            </div>
        )}

        <button 
            onClick={onNextSection}
            className="flex items-center gap-2 text-primary font-bold hover:gap-3 transition-all text-lg"
        >
            Next Section <ChevronRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};

const LoaderIcon = () => (
    <svg className="animate-spin h-5 w-5 text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
    </svg>
)

export default Reader;