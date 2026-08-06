import React from 'react';
import { JobPost } from '../types';
import { generateXmlSitemap } from '../utils/seo';
import { X, Code, Download, Copy, Check } from 'lucide-react';

interface SitemapModalProps {
  posts: JobPost[];
  onClose: () => void;
}

export const SitemapModal: React.FC<SitemapModalProps> = ({
  posts,
  onClose,
}) => {
  const xmlContent = generateXmlSitemap(posts);
  const [copied, setCopied] = React.useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(xmlContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([xmlContent], { type: 'text/xml' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'sitemap.xml';
    link.click();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-3xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-800 via-slate-900 to-slate-950 p-5 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-500/20 text-blue-400 rounded-xl flex items-center justify-center">
              <Code className="w-6 h-6" />
            </div>
            <div>
              <h2 className="font-extrabold text-lg sm:text-xl leading-tight">
                XML Sitemap Generator
              </h2>
              <p className="text-xs text-slate-300">
                SEO Sitemap for Google Search Console indexing ({posts.length} Job URLs)
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 hover:bg-white/10 rounded-lg text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Controls */}
        <div className="p-4 bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 flex justify-end gap-3">
          <button
            onClick={handleCopy}
            className="px-4 py-2 bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold text-xs rounded-xl hover:bg-slate-300 flex items-center gap-1.5"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
            {copied ? 'Copied XML' : 'Copy to Clipboard'}
          </button>
          <button
            onClick={handleDownload}
            className="px-4 py-2 bg-blue-700 text-white font-bold text-xs rounded-xl hover:bg-blue-600 flex items-center gap-1.5 shadow-md"
          >
            <Download className="w-4 h-4" /> Download sitemap.xml
          </button>
        </div>

        {/* XML Viewer Codeblock */}
        <div className="flex-1 overflow-y-auto p-5 bg-slate-950 text-slate-200 font-mono text-xs leading-relaxed">
          <pre className="whitespace-pre-wrap">{xmlContent}</pre>
        </div>
      </div>
    </div>
  );
};
