import React, { useState } from 'react';
import { LanguageType, PdfNoteItem } from '../types';
import { getTranslation } from '../utils/i18n';
import { X, FileText, Download, Search, FileCheck, BookOpen, Layers } from 'lucide-react';

interface PdfNotesModalProps {
  lang: LanguageType;
  onClose: () => void;
}

const PDF_ITEMS: PdfNoteItem[] = [
  {
    id: 'pdf1',
    title: 'UPSC IAS Prelims 10 Years Solved Papers (2016-2025)',
    examCategory: 'UPSC CSE',
    subject: 'General Studies & CSAT',
    fileSize: '12.4 MB',
    year: '2025',
    type: 'Previous Paper',
    downloadUrl: '#',
  },
  {
    id: 'pdf2',
    title: 'SSC CGL Tier-1 Complete Quantitative Aptitude Formulas & Tricks',
    examCategory: 'SSC CGL',
    subject: 'Mathematics',
    fileSize: '4.2 MB',
    type: 'Note',
    downloadUrl: '#',
  },
  {
    id: 'pdf3',
    title: 'RRB NTPC CBT-1 & CBT-2 General Science One-Liner Notes (Physics/Chem/Bio)',
    examCategory: 'RRB Railway',
    subject: 'General Science',
    fileSize: '8.1 MB',
    type: 'Note',
    downloadUrl: '#',
  },
  {
    id: 'pdf4',
    title: 'SBI PO & IBPS PO Reasoning Puzzles Handbook (500+ Solved Questions)',
    examCategory: 'Banking',
    subject: 'Reasoning',
    fileSize: '6.5 MB',
    type: 'Note',
    downloadUrl: '#',
  },
  {
    id: 'pdf5',
    title: 'Indian Polity Laxmikanth Chapter-wise Summary Mindmaps',
    examCategory: 'UPSC / State PSC',
    subject: 'Indian Polity',
    fileSize: '15.8 MB',
    type: 'Note',
    downloadUrl: '#',
  },
  {
    id: 'pdf6',
    title: 'SSC CHSL 2025 Official Answer Key Question Papers (All Shifts)',
    examCategory: 'SSC CHSL',
    subject: 'All Subjects',
    fileSize: '9.3 MB',
    year: '2025',
    type: 'Previous Paper',
    downloadUrl: '#',
  },
];

export const PdfNotesModal: React.FC<PdfNotesModalProps> = ({
  lang,
  onClose,
}) => {
  const t = getTranslation(lang);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<'All' | 'Note' | 'Previous Paper'>('All');

  const filteredPdfs = PDF_ITEMS.filter((item) => {
    const matchesSearch =
      item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.examCategory.toLowerCase().includes(searchTerm.toLowerCase());

    if (activeTab !== 'All') {
      return matchesSearch && item.type === activeTab;
    }
    return matchesSearch;
  });

  const handleDownload = (item: PdfNoteItem) => {
    alert(`Starting download for: ${item.title} (${item.fileSize})`);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-4xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-red-800 via-rose-900 to-slate-900 p-5 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-amber-400/20 text-amber-300 rounded-xl flex items-center justify-center">
              <FileText className="w-6 h-6" />
            </div>
            <div>
              <h2 className="font-extrabold text-lg sm:text-xl leading-tight">
                {t.pdfNotes}
              </h2>
              <p className="text-xs text-red-200">
                Free PDF study guides, formula sheets, and solved previous year papers
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

        {/* Filter Controls */}
        <div className="p-4 bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 space-y-3">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search PDF notes by exam name, subject, polity, maths..."
                className="w-full pl-9 pr-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-600"
              />
            </div>

            <div className="flex gap-2">
              {(['All', 'Note', 'Previous Paper'] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-3 py-2 rounded-xl text-xs font-bold transition ${
                    activeTab === tab
                      ? 'bg-red-700 text-white shadow-xs'
                      : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-100'
                  }`}
                >
                  {tab === 'Note' ? 'Study Notes' : tab === 'Previous Paper' ? 'Previous Papers' : 'All PDFs'}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* List Grid */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredPdfs.map((pdf) => (
              <div
                key={pdf.id}
                className="bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl p-4 space-y-3 flex flex-col justify-between hover:border-red-500 transition shadow-2xs"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <span className="px-2 py-0.5 bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300 text-[10px] font-black rounded uppercase">
                      {pdf.examCategory}
                    </span>
                    <span className="text-[10px] font-bold text-slate-400">
                      {pdf.fileSize} • PDF
                    </span>
                  </div>

                  <h3 className="font-extrabold text-sm text-slate-900 dark:text-white leading-snug">
                    {pdf.title}
                  </h3>

                  <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-2">
                    <BookOpen className="w-3.5 h-3.5 text-slate-400" />
                    <span>Subject: {pdf.subject}</span>
                  </div>
                </div>

                <button
                  onClick={() => handleDownload(pdf)}
                  className="w-full py-2 bg-red-700 text-white font-bold text-xs rounded-lg hover:bg-red-600 flex items-center justify-center gap-1.5 transition shadow-xs"
                >
                  <Download className="w-4 h-4" /> Download PDF Book
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
