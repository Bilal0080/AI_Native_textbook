import React, { useState } from 'react';
import { Copy, Check, X, Quote, Download } from 'lucide-react';

interface CitationModalProps {
  isOpen: boolean;
  onClose: () => void;
  details: {
    topic: string;
    chapter: string;
    section: string;
  };
}

type CitationStyle = 'APA' | 'MLA' | 'Chicago' | 'Harvard';

export const CitationModal: React.FC<CitationModalProps> = ({ isOpen, onClose, details }) => {
  const [style, setStyle] = useState<CitationStyle>('APA');
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const getCitation = (style: CitationStyle) => {
    const date = new Date();
    const year = date.getFullYear();
    const dateStr = date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
    const accessDate = date.toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' });
    const url = window.location.href; 
    const section = details.section;
    const bookTitle = `Lumina: AI Native Textbook`;
    const topicTitle = details.topic;

    switch (style) {
      case 'APA':
        // Author, A. A. (Year). Title of work. Publisher. URL
        return `Lumina AI. (${year}). ${section}. In ${bookTitle} (${topicTitle}). Retrieved ${dateStr}, from ${url}`;
      case 'MLA':
        // "Article Title." Website Title, Publisher, Publication Date, URL.
        return `"${section}." ${bookTitle}, Lumina AI, ${year}, ${url}.`;
      case 'Chicago':
        // Author. "Title." Website Title. Date. URL.
        return `Lumina AI. "${section}." ${bookTitle} (${topicTitle}). ${year}. ${url}.`;
      case 'Harvard':
        // Author (Year) 'Title', Website Title. Available at: URL (Accessed: Date).
        return `Lumina AI (${year}) '${section}', in ${bookTitle} (${topicTitle}). Available at: ${url} (Accessed: ${accessDate}).`;
      default:
        return '';
    }
  };

  const citationText = getCitation(style);

  const handleCopy = () => {
    navigator.clipboard.writeText(citationText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const element = document.createElement("a");
    const file = new Blob([citationText], {type: 'text/plain'});
    element.href = URL.createObjectURL(file);
    element.download = `citation-${details.section.substring(0, 20).replace(/\s+/g, '-').toLowerCase()}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity" onClick={onClose} />
      <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-2xl p-0 overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
            <div className="flex items-center gap-2 text-slate-800">
                <div className="p-1.5 bg-blue-100 rounded-lg">
                  <Quote className="w-4 h-4 text-primary" />
                </div>
                <h3 className="font-bold text-lg">Cite this Section</h3>
            </div>
            <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors p-1 rounded-full hover:bg-slate-100">
                <X className="w-5 h-5" />
            </button>
        </div>
        
        <div className="p-6">
            <p className="text-slate-600 mb-6 text-sm">
                Cite this AI-generated content in your research or notes using the formats below.
            </p>

            {/* Tabs */}
            <div className="flex gap-2 border-b border-slate-200 mb-6 overflow-x-auto scrollbar-hide">
                {(['APA', 'MLA', 'Chicago', 'Harvard'] as CitationStyle[]).map((s) => (
                    <button
                        key={s}
                        onClick={() => setStyle(s)}
                        className={`px-4 py-2 text-sm font-semibold rounded-t-lg transition-all relative top-[1px] whitespace-nowrap ${
                            style === s 
                                ? 'text-primary border-x border-t border-slate-200 bg-white' 
                                : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'
                        }`}
                    >
                        {s}
                    </button>
                ))}
            </div>

            {/* Content */}
            <div className="relative group">
                <div className="bg-slate-50 p-6 rounded-lg border border-slate-200 font-serif text-slate-800 leading-relaxed break-words min-h-[100px] flex items-center shadow-inner">
                    {citationText}
                </div>
            </div>

            {/* Footer Actions */}
            <div className="flex justify-between items-center mt-6">
                <button
                    onClick={handleDownload}
                    className="flex items-center gap-2 px-4 py-2 text-slate-600 font-medium hover:bg-slate-100 rounded-lg transition-colors text-sm"
                    title="Download as text file"
                >
                   <Download className="w-4 h-4" />
                   <span className="hidden sm:inline">Export Text</span>
                </button>
                
                <div className="flex items-center gap-3">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 text-slate-600 font-medium hover:bg-slate-50 rounded-lg transition-colors"
                    >
                        Done
                    </button>
                    <button
                        onClick={handleCopy}
                        className={`flex items-center gap-2 px-6 py-2.5 rounded-lg text-white font-medium transition-all shadow-sm ${
                            copied ? 'bg-green-600 hover:bg-green-700' : 'bg-primary hover:bg-blue-600'
                        }`}
                    >
                        {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                        {copied ? 'Copied' : 'Copy'}
                    </button>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};
