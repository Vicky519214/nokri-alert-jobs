import React, { useState } from 'react';
import { 
  Briefcase, 
  Search, 
  Bookmark, 
  ShieldCheck, 
  Lock, 
  Calculator, 
  Bell, 
  Menu, 
  X, 
  GraduationCap, 
  FileText, 
  Award, 
  Newspaper, 
  Calendar, 
  CheckCircle, 
  Sparkles,
  Sun,
  Moon,
  Globe,
  User,
  BookOpen,
  FileSpreadsheet
} from 'lucide-react';
import { CategoryType, LanguageType, UserProfile } from '../types';
import { getTranslation } from '../utils/i18n';
import { isAdminSessionActive } from '../utils/storage';

interface HeaderProps {
  activeCategory: CategoryType | 'all';
  onSelectCategory: (category: CategoryType | 'all') => void;
  bookmarkCount: number;
  onOpenBookmarks: () => void;
  onOpenAdmin: () => void;
  onOpenAgeCalc: () => void;
  onOpenSubscribe: () => void;
  onOpenPolicyPage: (page: 'about' | 'contact' | 'privacy' | 'terms' | 'disclaimer' | 'cookie' | 'dmca') => void;
  
  // New Feature Props
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
  lang: LanguageType;
  onChangeLang: (lang: LanguageType) => void;
  user: UserProfile;
  onOpenAuth: () => void;
  onOpenExamCalendar: () => void;
  onOpenMockTests: () => void;
  onOpenCurrentAffairs: () => void;
  onOpenPdfNotes: () => void;
  onOpenResumeBuilder: () => void;
  onOpenPushNotification: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeCategory,
  onSelectCategory,
  bookmarkCount,
  onOpenBookmarks,
  onOpenAdmin,
  onOpenAgeCalc,
  onOpenSubscribe,
  onOpenPolicyPage,
  theme,
  onToggleTheme,
  lang,
  onChangeLang,
  user,
  onOpenAuth,
  onOpenExamCalendar,
  onOpenMockTests,
  onOpenCurrentAffairs,
  onOpenPdfNotes,
  onOpenResumeBuilder,
  onOpenPushNotification,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const t = getTranslation(lang);

  const categories: { id: CategoryType | 'all'; label: string; icon: React.ReactNode }[] = [
    { id: 'all', label: t.allCategories, icon: <Sparkles className="w-4 h-4" /> },
    { id: 'govt_jobs', label: t.govtJobs, icon: <Briefcase className="w-4 h-4 text-blue-500" /> },
    { id: 'private_jobs', label: t.privateJobs, icon: <Briefcase className="w-4 h-4 text-purple-500" /> },
    { id: 'admit_card', label: t.admitCard, icon: <FileText className="w-4 h-4 text-emerald-500" /> },
    { id: 'results', label: t.results, icon: <CheckCircle className="w-4 h-4 text-sky-500" /> },
    { id: 'syllabus', label: t.syllabus, icon: <FileText className="w-4 h-4 text-amber-500" /> },
    { id: 'admission', label: t.admission, icon: <GraduationCap className="w-4 h-4 text-indigo-500" /> },
    { id: 'scholarship', label: t.scholarship, icon: <Award className="w-4 h-4 text-rose-500" /> },
    { id: 'job_news', label: t.jobNews, icon: <Newspaper className="w-4 h-4 text-teal-500" /> },
    { id: 'upcoming_exams', label: t.upcomingExams, icon: <Calendar className="w-4 h-4 text-orange-500" /> },
  ];

  return (
    <header className="sticky top-0 z-40 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 shadow-xs transition-colors">
      {/* Top Ticker & Preferences Bar */}
      <div className="bg-slate-950 text-slate-100 text-xs py-1.5 px-4 flex items-center justify-between gap-3 overflow-hidden border-b border-slate-800">
        <div className="flex items-center gap-2 shrink-0 bg-red-600 text-white font-bold px-2 py-0.5 rounded-sm uppercase tracking-wide text-[10px]">
          LIVE UPDATES
        </div>
        <div className="overflow-hidden whitespace-nowrap w-full">
          <div className="inline-block animate-marquee pl-4 text-slate-300 font-medium">
            🔥 <span className="text-amber-300 font-semibold">SSC CGL 2026:</span> 17,727 Vacancies Notification Out • 
            🚀 <span className="text-emerald-300 font-semibold">Railway Group D:</span> 1,03,769 Posts Online Form Active • 
            🎓 <span className="text-sky-300 font-semibold">UPSC CSE Prelims 2026:</span> Merit List PDF Released • 
            💻 <span className="text-purple-300 font-semibold">TCS NQT 2026:</span> Off-Campus Drive Open for Freshers
          </div>
        </div>

        <div className="hidden md:flex items-center gap-3 shrink-0 text-slate-300 font-medium">
          {/* Language Selector */}
          <div className="flex items-center gap-1 bg-slate-900 border border-slate-700 rounded-lg px-2 py-0.5 text-[11px]">
            <Globe className="w-3 h-3 text-amber-400" />
            <select
              value={lang}
              onChange={(e) => onChangeLang(e.target.value as LanguageType)}
              className="bg-transparent text-white font-bold text-[11px] focus:outline-none cursor-pointer"
            >
              <option value="en" className="bg-slate-900">English</option>
              <option value="hi" className="bg-slate-900">हिंदी</option>
              <option value="bn" className="bg-slate-900">বাংলা</option>
            </select>
          </div>

          {/* Dark Mode Toggle */}
          <button
            onClick={onToggleTheme}
            className="p-1 hover:text-amber-400 transition-colors flex items-center gap-1 bg-slate-900 border border-slate-700 rounded-lg px-2 text-[11px]"
            title={theme === 'dark' ? t.lightMode : t.darkMode}
          >
            {theme === 'dark' ? <Sun className="w-3.5 h-3.5 text-amber-400" /> : <Moon className="w-3.5 h-3.5 text-indigo-300" />}
            <span className="capitalize">{theme}</span>
          </button>

          <button 
            onClick={onOpenAgeCalc} 
            className="flex items-center gap-1 hover:text-sky-400 transition-colors text-[11px]"
          >
            <Calculator className="w-3.5 h-3.5" />
            Age Calc
          </button>
        </div>
      </div>

      {/* Main Navigation Header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex items-center justify-between gap-4">
        {/* Brand Logo */}
        <div 
          onClick={() => onSelectCategory('all')} 
          className="flex items-center gap-3 cursor-pointer group"
        >
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-900 via-indigo-800 to-blue-600 text-white flex items-center justify-center shadow-md group-hover:scale-105 transition-transform">
            <ShieldCheck className="w-6 h-6 text-amber-400" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-xl sm:text-2xl font-black tracking-tight text-slate-900 dark:text-white">
                {t.appName.split(' ')[0]}<span className="text-blue-600 dark:text-blue-400">{t.appName.split(' ').slice(1).join(' ')}</span>
              </span>
              <span className="bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 text-[9px] font-extrabold px-1.5 py-0.5 rounded border border-emerald-200 dark:border-emerald-800">
                VERIFIED
              </span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium hidden sm:block">
              {t.tagline}
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-1.5 sm:gap-2.5">
          {/* User Auth Profile Button */}
          <button
            onClick={onOpenAuth}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-slate-800 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl transition border border-slate-200 dark:border-slate-700"
          >
            <User className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            <span className="hidden xs:inline">
              {user?.isLoggedIn ? (user.name ? user.name.split(' ')[0] : 'Profile') : t.login}
            </span>
          </button>

          {/* Job Alerts Bell */}
          <button
            onClick={onOpenSubscribe}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-amber-900 dark:text-amber-300 bg-amber-100 dark:bg-amber-950/60 hover:bg-amber-200 dark:hover:bg-amber-900/80 rounded-xl transition border border-amber-300 dark:border-amber-800 shadow-2xs"
          >
            <Bell className="w-4 h-4 text-amber-700 dark:text-amber-400 animate-bounce" />
            <span className="hidden xs:inline">{t.jobAlerts}</span>
          </button>

          {/* Device Push Notifications Button */}
          <button
            onClick={onOpenPushNotification}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-blue-900 dark:text-blue-200 bg-blue-100 dark:bg-blue-950/70 hover:bg-blue-200 dark:hover:bg-blue-900/80 rounded-xl transition border border-blue-300 dark:border-blue-800 shadow-2xs"
            title="Push Notifications setup"
          >
            <Bell className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            <span className="hidden sm:inline">Push Alerts</span>
          </button>

          {/* Saved Bookmarks */}
          <button
            onClick={onOpenBookmarks}
            className="relative flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-slate-800 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl transition border border-slate-200 dark:border-slate-700"
            title="Saved Posts"
          >
            <Bookmark className="w-4 h-4 text-indigo-600 dark:text-indigo-400 fill-indigo-100 dark:fill-indigo-950" />
            <span className="hidden sm:inline">{t.bookmarked}</span>
            {bookmarkCount > 0 && (
              <span className="bg-indigo-600 text-white text-[10px] font-bold px-1.5 py-0.2 rounded-full">
                {bookmarkCount}
              </span>
            )}
          </button>

          {/* Admin Button (Only visible for Admin users) */}
          {(user?.role === 'admin' || user?.isAdmin || isAdminSessionActive()) && (
            <button
              onClick={onOpenAdmin}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-slate-900 bg-amber-400 hover:bg-amber-300 rounded-xl transition shadow-xs border border-amber-500"
              title="Admin Portal Dashboard"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-slate-950" />
              <span className="hidden sm:inline">Admin Dashboard</span>
            </button>
          )}

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl"
            aria-label="Toggle Menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Quick Interactive Tools Bar */}
      <div className="bg-slate-100 dark:bg-slate-800/80 border-t border-b border-slate-200 dark:border-slate-700/60 py-2 px-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-2 overflow-x-auto no-scrollbar">
          <div className="flex items-center gap-2">
            <button
              onClick={onOpenExamCalendar}
              className="px-3 py-1 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 hover:border-blue-500 rounded-lg text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5 shrink-0 transition"
            >
              <Calendar className="w-3.5 h-3.5 text-blue-600" />
              <span>{t.examCalendar}</span>
            </button>

            <button
              onClick={onOpenMockTests}
              className="px-3 py-1 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 hover:border-emerald-500 rounded-lg text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5 shrink-0 transition"
            >
              <Award className="w-3.5 h-3.5 text-emerald-600" />
              <span>{t.mockTests}</span>
            </button>

            <button
              onClick={onOpenCurrentAffairs}
              className="px-3 py-1 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 hover:border-purple-500 rounded-lg text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5 shrink-0 transition"
            >
              <Globe className="w-3.5 h-3.5 text-purple-600" />
              <span>{t.currentAffairs}</span>
            </button>

            <button
              onClick={onOpenPdfNotes}
              className="px-3 py-1 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 hover:border-red-500 rounded-lg text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5 shrink-0 transition"
            >
              <BookOpen className="w-3.5 h-3.5 text-red-600" />
              <span>{t.pdfNotes}</span>
            </button>

            <button
              onClick={onOpenResumeBuilder}
              className="px-3 py-1 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 hover:border-amber-500 rounded-lg text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5 shrink-0 transition"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-amber-600" />
              <span>{t.resumeBuilder}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Desktop Category Tabs */}
      <div className="hidden lg:block bg-slate-900 text-white">
        <div className="max-w-7xl mx-auto px-4 flex items-center justify-between overflow-x-auto no-scrollbar">
          <div className="flex items-center gap-1 py-1">
            {categories.map((cat) => {
              const isActive = activeCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => onSelectCategory(cat.id)}
                  className={`flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-md transition-all whitespace-nowrap ${
                    isActive
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800'
                  }`}
                >
                  {cat.icon}
                  <span>{cat.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-slate-900 text-slate-100 border-t border-slate-800 p-4 space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <span className="text-xs font-bold uppercase text-slate-400">Language & Theme</span>
            <div className="flex items-center gap-2">
              <select
                value={lang}
                onChange={(e) => onChangeLang(e.target.value as LanguageType)}
                className="bg-slate-800 text-white font-bold text-xs p-1 rounded border border-slate-700"
              >
                <option value="en">English</option>
                <option value="hi">हिंदी</option>
                <option value="bn">বাংলা</option>
              </select>
              <button
                onClick={onToggleTheme}
                className="p-1.5 bg-slate-800 text-amber-400 rounded-lg border border-slate-700"
              >
                {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Job Categories
          </p>
          <div className="grid grid-cols-2 gap-2">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => {
                  onSelectCategory(cat.id);
                  setMobileMenuOpen(false);
                }}
                className={`flex items-center gap-2 p-2.5 rounded-lg text-xs font-semibold text-left transition-colors ${
                  activeCategory === cat.id
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-800/80 text-slate-200 hover:bg-slate-800'
                }`}
              >
                {cat.icon}
                <span className="truncate">{cat.label}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </header>
  );
};
