import React, { useState } from 'react';
import { BookOpen, ArrowRight, Library, GraduationCap, School, Baby } from 'lucide-react';

interface WelcomeProps {
  onStart: (topic: string, audience: string) => void;
  isLoading: boolean;
}

const Welcome: React.FC<WelcomeProps> = ({ onStart, isLoading }) => {
  const [topic, setTopic] = useState('');
  const [audience, setAudience] = useState('College Student');

  const audiences = [
    { label: '5 Year Old', icon: Baby, value: '5-year-old child' },
    { label: 'High School', icon: School, value: 'High School Student' },
    { label: 'College', icon: GraduationCap, value: 'College Student' },
    { label: 'Professional', icon: Library, value: 'Industry Professional' },
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (topic.trim()) {
      onStart(topic, audience);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="max-w-xl w-full">
        <div className="text-center mb-12 space-y-4">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary text-white mb-4 shadow-lg shadow-blue-500/20">
            <BookOpen className="w-8 h-8" />
          </div>
          <h1 className="text-4xl md:text-5xl font-serif font-bold text-slate-900 tracking-tight">
            Lumina
          </h1>
          <p className="text-lg text-slate-600">
            The AI-native textbook platform. <br/>
            Learn anything, tailored exactly to you.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white p-8 rounded-2xl shadow-xl border border-slate-100 space-y-8">
          
          <div className="space-y-3">
            <label className="block text-sm font-semibold text-slate-700 uppercase tracking-wider">
              What do you want to learn?
            </label>
            <input
              type="text"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="e.g. Quantum Physics, Roman History, Gardening..."
              className="w-full text-lg px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all placeholder:text-slate-400"
              autoFocus
            />
          </div>

          <div className="space-y-3">
            <label className="block text-sm font-semibold text-slate-700 uppercase tracking-wider">
              Target Audience
            </label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {audiences.map((aud) => {
                const Icon = aud.icon;
                const isSelected = audience === aud.value;
                return (
                  <button
                    key={aud.value}
                    type="button"
                    onClick={() => setAudience(aud.value)}
                    className={`
                      flex flex-col items-center justify-center p-3 rounded-lg border transition-all gap-2
                      ${isSelected 
                        ? 'bg-blue-50 border-primary text-primary shadow-sm' 
                        : 'border-slate-100 text-slate-500 hover:bg-slate-50 hover:border-slate-200'}
                    `}
                  >
                    <Icon className={`w-5 h-5 ${isSelected ? 'text-primary' : 'text-slate-400'}`} />
                    <span className="text-xs font-medium">{aud.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <button
            type="submit"
            disabled={!topic.trim() || isLoading}
            className="w-full flex items-center justify-center gap-2 bg-slate-900 hover:bg-slate-800 text-white text-lg font-medium py-4 rounded-lg transition-all transform hover:scale-[1.02] disabled:opacity-50 disabled:hover:scale-100"
          >
            {isLoading ? (
              <span className="animate-pulse">Designing Curriculum...</span>
            ) : (
              <>
                Generate Textbook <ArrowRight className="w-5 h-5" />
              </>
            )}
          </button>
        </form>

        <p className="text-center text-xs text-slate-400 mt-8">
          Powered by Google Gemini 2.5 Flash
        </p>
      </div>
    </div>
  );
};

export default Welcome;
