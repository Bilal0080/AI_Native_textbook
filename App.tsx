import React, { useState } from 'react';
import { AppState, TextbookStructure, Chapter, Section } from './types';
import { generateTextbookStructure } from './services/geminiService';
import Welcome from './components/Welcome';
import Sidebar from './components/Sidebar';
import Reader from './components/Reader';
import { Menu } from 'lucide-react';

const App: React.FC = () => {
  const [appState, setAppState] = useState<AppState>(AppState.WELCOME);
  const [structure, setStructure] = useState<TextbookStructure | null>(null);
  const [currentChapter, setCurrentChapter] = useState<Chapter | null>(null);
  const [currentSection, setCurrentSection] = useState<Section | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleStart = async (topic: string, audience: string) => {
    setAppState(AppState.GENERATING_STRUCTURE);
    setError(null);
    try {
      const newStructure = await generateTextbookStructure(topic, audience);
      setStructure(newStructure);
      
      // Auto-select first section
      if (newStructure.chapters.length > 0 && newStructure.chapters[0].sections.length > 0) {
        const firstChapter = newStructure.chapters[0];
        setCurrentChapter(firstChapter);
        setCurrentSection(firstChapter.sections[0]);
      }
      
      setAppState(AppState.READING);
    } catch (err) {
      console.error(err);
      setError("Failed to create curriculum. Please try again with a simpler topic.");
      setAppState(AppState.WELCOME);
    }
  };

  const handleSelectSection = (chapter: Chapter, section: Section) => {
    setCurrentChapter(chapter);
    setCurrentSection(section);
    setSidebarOpen(false); // Close sidebar on mobile selection
    // Reset scroll
    window.scrollTo(0, 0);
  };

  const handleNextSection = () => {
    if (!structure || !currentChapter || !currentSection) return;

    const currentChapterIndex = structure.chapters.findIndex(c => c.id === currentChapter.id);
    const currentSectionIndex = currentChapter.sections.findIndex(s => s.id === currentSection.id);

    if (currentSectionIndex < currentChapter.sections.length - 1) {
      // Next section in same chapter
      handleSelectSection(currentChapter, currentChapter.sections[currentSectionIndex + 1]);
    } else if (currentChapterIndex < structure.chapters.length - 1) {
      // First section of next chapter
      const nextChapter = structure.chapters[currentChapterIndex + 1];
      if (nextChapter.sections.length > 0) {
        handleSelectSection(nextChapter, nextChapter.sections[0]);
      }
    }
  };

  if (appState === AppState.WELCOME || appState === AppState.GENERATING_STRUCTURE) {
    return (
      <div className="relative">
        {error && (
            <div className="absolute top-4 left-0 right-0 mx-auto w-fit bg-red-100 text-red-700 px-4 py-2 rounded-lg shadow-lg z-50">
                {error}
            </div>
        )}
        <Welcome 
          onStart={handleStart} 
          isLoading={appState === AppState.GENERATING_STRUCTURE} 
        />
      </div>
    );
  }

  if (appState === AppState.READING && structure && currentChapter && currentSection) {
    return (
      <div className="flex h-screen bg-white overflow-hidden">
        {/* Mobile Header */}
        <div className="md:hidden fixed top-0 left-0 right-0 h-16 bg-white border-b z-20 flex items-center px-4 justify-between">
           <button onClick={() => setSidebarOpen(true)} className="p-2 -ml-2 text-slate-600">
             <Menu className="w-6 h-6" />
           </button>
           <span className="font-serif font-bold truncate">{structure.topic}</span>
           <div className="w-6"></div>
        </div>

        <Sidebar 
          structure={structure}
          currentChapterId={currentChapter.id}
          currentSectionId={currentSection.id}
          onSelectSection={handleSelectSection}
          isOpen={sidebarOpen}
          toggleSidebar={() => setSidebarOpen(!sidebarOpen)}
        />
        
        <main className="flex-1 overflow-y-auto h-full scroll-smooth pt-16 md:pt-0">
          <Reader 
            topic={structure.topic}
            audience={structure.targetAudience}
            chapter={currentChapter}
            section={currentSection}
            onNextSection={handleNextSection}
          />
        </main>
      </div>
    );
  }

  return <div>Error State</div>;
};

export default App;
