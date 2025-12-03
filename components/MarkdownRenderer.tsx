import React from 'react';
import ReactMarkdown from 'https://esm.sh/react-markdown@9';

interface MarkdownRendererProps {
  content: string;
}

const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ content }) => {
  return (
    <div className="prose prose-slate prose-lg max-w-none prose-headings:font-serif prose-headings:font-bold prose-p:leading-relaxed prose-a:text-primary hover:prose-a:underline prose-code:text-pink-600 prose-pre:bg-slate-900 prose-pre:text-slate-50">
      <ReactMarkdown
        components={{
          h2: ({node, ...props}) => <h2 className="text-2xl font-bold mt-8 mb-4 text-slate-900 border-b pb-2" {...props} />,
          h3: ({node, ...props}) => <h3 className="text-xl font-semibold mt-6 mb-3 text-slate-800" {...props} />,
          p: ({node, ...props}) => <p className="mb-4 text-slate-700 leading-7" {...props} />,
          ul: ({node, ...props}) => <ul className="list-disc list-outside ml-6 mb-4 space-y-1 text-slate-700" {...props} />,
          ol: ({node, ...props}) => <ol className="list-decimal list-outside ml-6 mb-4 space-y-1 text-slate-700" {...props} />,
          blockquote: ({node, ...props}) => <blockquote className="border-l-4 border-primary pl-4 italic my-4 text-slate-600 bg-slate-50 py-2 rounded-r" {...props} />,
          code: ({node, className, children, ...props}) => {
             // Basic inline code vs block detection
             const isInline = !String(children).includes('\n');
             return isInline 
               ? <code className="bg-slate-100 text-pink-600 px-1.5 py-0.5 rounded text-sm font-mono" {...props}>{children}</code>
               : <code className="block bg-slate-900 text-slate-100 p-4 rounded-lg overflow-x-auto text-sm font-mono my-4" {...props}>{children}</code>;
          }
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
};

export default MarkdownRenderer;
