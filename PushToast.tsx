import React, { useState, useEffect } from 'react';
import { Bell, X, ArrowRight } from 'lucide-react';

interface ToastData {
  title: string;
  body: string;
  url?: string;
  timestamp: string;
}

export const PushToast: React.FC = () => {
  const [toast, setToast] = useState<ToastData | null>(null);

  useEffect(() => {
    const handlePushEvent = (e: Event) => {
      const customEvent = e as CustomEvent<ToastData>;
      if (customEvent.detail) {
        setToast(customEvent.detail);
        // Auto-dismiss after 6 seconds
        const timer = setTimeout(() => {
          setToast(null);
        }, 6000);
        return () => clearTimeout(timer);
      }
    };

    window.addEventListener('nokri_push_event', handlePushEvent);
    return () => {
      window.removeEventListener('nokri_push_event', handlePushEvent);
    };
  }, []);

  if (!toast) return null;

  return (
    <div className="fixed top-4 right-4 z-50 max-w-sm w-full bg-slate-900 text-white p-4 rounded-2xl shadow-2xl border border-blue-500/50 animate-bounce-short flex items-start gap-3">
      <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shrink-0 shadow-md">
        <Bell className="w-5 h-5 text-white animate-pulse" />
      </div>
      <div className="flex-1 space-y-1 pr-2">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-extrabold uppercase tracking-wider text-blue-400">
            Push Alert
          </span>
          <span className="text-[10px] text-slate-400">Just Now</span>
        </div>
        <h4 className="text-xs font-bold leading-snug text-white line-clamp-1">{toast.title}</h4>
        <p className="text-[11px] text-slate-300 leading-relaxed line-clamp-2">{toast.body}</p>
      </div>
      <button
        onClick={() => setToast(null)}
        className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
};
