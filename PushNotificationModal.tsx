import React, { useState, useEffect } from 'react';
import { Bell, X, CheckCircle, Smartphone, ShieldCheck, Send, AlertCircle, Volume2 } from 'lucide-react';
import {
  PushSettings,
  getPushSettings,
  savePushSettings,
  requestBrowserNotificationPermission,
  sendPushNotification,
} from '../utils/notifications';

interface PushNotificationModalProps {
  onClose: () => void;
}

export const PushNotificationModal: React.FC<PushNotificationModalProps> = ({ onClose }) => {
  const [settings, setSettings] = useState<PushSettings>(getPushSettings());
  const [permissionState, setPermissionState] = useState<string>(
    typeof window !== 'undefined' && 'Notification' in window ? Notification.permission : 'unsupported'
  );
  const [statusMsg, setStatusMsg] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      setPermissionState(Notification.permission);
    }
  }, []);

  const handleToggleEnable = async () => {
    if (!settings.enabled) {
      const perm = await requestBrowserNotificationPermission();
      setPermissionState(perm);

      const updated = { ...settings, enabled: true };
      setSettings(updated);
      savePushSettings(updated);

      if (perm === 'granted') {
        setStatusMsg('✅ Push notifications enabled! Testing live alert...');
        sendPushNotification(
          '🔔 Nokri Alert Notifications Enabled!',
          'You will now receive instant push alerts for SSC, Railway, UPSC, Admit Cards & Results.'
        );
      } else {
        setStatusMsg('🔔 Notifications enabled in-app! (Browser permission: ' + perm + ')');
      }
    } else {
      const updated = { ...settings, enabled: false };
      setSettings(updated);
      savePushSettings(updated);
      setStatusMsg('Notifications muted.');
    }
  };

  const handleCategoryToggle = (key: keyof Omit<PushSettings, 'enabled'>) => {
    const updated = { ...settings, [key]: !settings[key] };
    setSettings(updated);
    savePushSettings(updated);
  };

  const handleTestNotification = (type: 'jobs' | 'results' | 'admitCards' | 'notifications') => {
    let title = '';
    let body = '';

    if (type === 'jobs') {
      title = '🔥 New Job Alert: SSC CGL 2026';
      body = '17,727 Posts Vacancy Released! Apply online before deadline.';
    } else if (type === 'results') {
      title = '📊 Exam Result Out: UPSC CSE Prelims 2026';
      body = 'Official Merit List and cut-off marks PDF uploaded. Check now!';
    } else if (type === 'admitCards') {
      title = '🎟️ Admit Card Released: Railway RRB NTPC';
      body = 'Download Exam City Slip & Hall Ticket for CBT-1 Exam.';
    } else {
      title = '📢 Urgent Notice: IBPS PO Exam Date Extended';
      body = 'Last date to submit application extended by 7 days. Don\'t miss out!';
    }

    sendPushNotification(title, body);
    setStatusMsg(`Sent sample "${type}" notification!`);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-xs animate-fade-in">
      <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-5 relative text-slate-900 dark:text-white">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-blue-100 dark:bg-blue-950/80 text-blue-600 dark:text-blue-400 rounded-2xl flex items-center justify-center shrink-0 border border-blue-200 dark:border-blue-900">
            <Bell className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-black tracking-tight">Instant Push Alerts</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Get immediate alerts on your device for new hiring, hall tickets & exam results.
            </p>
          </div>
        </div>

        {/* Browser Status Pill */}
        <div className="bg-slate-50 dark:bg-slate-800/80 p-3.5 rounded-xl border border-slate-200 dark:border-slate-700/80 flex items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <Smartphone className="w-4 h-4 text-blue-500 shrink-0" />
            <span>
              Browser Permission Status:{' '}
              <strong className="capitalize text-slate-900 dark:text-slate-100">
                {permissionState}
              </strong>
            </span>
          </div>

          <button
            onClick={handleToggleEnable}
            className={`px-3 py-1.5 rounded-lg font-bold transition-colors ${
              settings.enabled
                ? 'bg-emerald-600 text-white hover:bg-emerald-700'
                : 'bg-blue-600 text-white hover:bg-blue-700'
            }`}
          >
            {settings.enabled ? 'Enabled ✓' : 'Turn On'}
          </button>
        </div>

        {statusMsg && (
          <div className="bg-amber-50 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 p-2.5 rounded-lg border border-amber-200 dark:border-amber-800 text-xs flex items-center gap-2">
            <CheckCircle className="w-4 h-4 shrink-0" />
            <span>{statusMsg}</span>
          </div>
        )}

        {/* Category Alert Options */}
        <div className="space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Select Notification Categories
          </h3>

          <div className="space-y-2">
            {[
              { id: 'jobs', label: 'Government & Corporate Job Openings', desc: 'SSC, Railway, Bank, UPSC, State PSC & Corporate' },
              { id: 'admitCards', label: 'Admit Cards & Exam City Slips', desc: 'Hall tickets, exam dates, center updates' },
              { id: 'results', label: 'Exam Results & Answer Keys', desc: 'Cut-offs, merit lists, scorecard releases' },
              { id: 'notifications', label: 'Urgent Notices & Important Updates', desc: 'Deadline extensions, syllabus modifications' },
            ].map((cat) => {
              const key = cat.id as keyof Omit<PushSettings, 'enabled'>;
              const isChecked = settings[key];

              return (
                <label
                  key={cat.id}
                  className="flex items-start justify-between p-3 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer transition-colors"
                >
                  <div className="space-y-0.5 pr-3">
                    <p className="text-xs font-bold text-slate-800 dark:text-slate-200">{cat.label}</p>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">{cat.desc}</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={isChecked}
                    onChange={() => handleCategoryToggle(key)}
                    className="mt-1 w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500 cursor-pointer"
                  />
                </label>
              );
            })}
          </div>
        </div>

        {/* Live Push Test Bar */}
        <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-2">
          <p className="text-[11px] font-bold text-slate-500 dark:text-slate-400 flex items-center gap-1">
            <Volume2 className="w-3.5 h-3.5 text-blue-500" />
            <span>Test Device Push Notifications:</span>
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            <button
              onClick={() => handleTestNotification('jobs')}
              className="py-1.5 px-2 bg-slate-100 dark:bg-slate-800 hover:bg-blue-100 dark:hover:bg-blue-950 text-slate-700 dark:text-slate-200 rounded-lg text-[11px] font-bold transition-colors border border-slate-200 dark:border-slate-700"
            >
              💼 Test Job
            </button>
            <button
              onClick={() => handleTestNotification('admitCards')}
              className="py-1.5 px-2 bg-slate-100 dark:bg-slate-800 hover:bg-emerald-100 dark:hover:bg-emerald-950 text-slate-700 dark:text-slate-200 rounded-lg text-[11px] font-bold transition-colors border border-slate-200 dark:border-slate-700"
            >
              🎟️ Test Admit
            </button>
            <button
              onClick={() => handleTestNotification('results')}
              className="py-1.5 px-2 bg-slate-100 dark:bg-slate-800 hover:bg-sky-100 dark:hover:bg-sky-950 text-slate-700 dark:text-slate-200 rounded-lg text-[11px] font-bold transition-colors border border-slate-200 dark:border-slate-700"
            >
              📊 Test Result
            </button>
            <button
              onClick={() => handleTestNotification('notifications')}
              className="py-1.5 px-2 bg-slate-100 dark:bg-slate-800 hover:bg-purple-100 dark:hover:bg-purple-950 text-slate-700 dark:text-slate-200 rounded-lg text-[11px] font-bold transition-colors border border-slate-200 dark:border-slate-700"
            >
              📢 Test Notice
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
