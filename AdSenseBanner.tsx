import React, { useState, useEffect } from 'react';
import { getMonetizationSettings, MonetizationSettings } from '../utils/storage';
import { ExternalLink, Sparkles, DollarSign, ShieldAlert, Award, Star, Megaphone } from 'lucide-react';

interface AdSenseBannerProps {
  format?: 'leaderboard' | 'rectangle' | 'sidebar' | 'inArticle' | 'stickyBottom' | 'nativeRecommendations';
  placement?: 'headerLeaderboard' | 'sidebarBanner' | 'inArticleDetail' | 'feedInBetween' | 'stickyBottomAnchor' | 'nativeRecommendations';
  className?: string;
}

export const AdSenseBanner: React.FC<AdSenseBannerProps> = ({
  format = 'leaderboard',
  placement,
  className = '',
}) => {
  const [monSettings, setMonSettings] = useState<MonetizationSettings>(() => getMonetizationSettings());

  useEffect(() => {
    // Sync settings on mount / storage update
    const handleStorageChange = () => {
      setMonSettings(getMonetizationSettings());
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  if (!monSettings.masterEnabled) return null;

  // Resolve active placement configuration
  const targetPlacementKey = placement || (
    format === 'leaderboard' ? 'headerLeaderboard' :
    format === 'sidebar' ? 'sidebarBanner' :
    format === 'inArticle' ? 'inArticleDetail' :
    format === 'stickyBottom' ? 'stickyBottomAnchor' :
    format === 'nativeRecommendations' ? 'nativeRecommendations' : 'feedInBetween'
  );

  const placementConfig = monSettings.placements[targetPlacementKey];
  if (placementConfig && !placementConfig.enabled) return null;

  const network = placementConfig?.network || 'adsense';

  // 1. Google AdSense Unit
  if (network === 'adsense') {
    if (!monSettings.googleAdSense.enabled) return null;
    return (
      <div className={`my-4 overflow-hidden rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 p-3 text-center transition-all shadow-2xs ${className}`}>
        <div className="flex items-center justify-between text-[10px] uppercase font-bold tracking-widest text-slate-400 dark:text-slate-500 mb-2 px-1">
          <span>Advertisement • Google AdSense</span>
          <span className="font-mono">{monSettings.googleAdSense.publisherId}</span>
        </div>

        {format === 'leaderboard' || targetPlacementKey === 'headerLeaderboard' ? (
          <div className="w-full bg-gradient-to-r from-blue-950 via-slate-900 to-indigo-950 text-white rounded-lg p-4 flex flex-col sm:flex-row items-center justify-between gap-3 border border-blue-800/40">
            <div className="text-left space-y-1">
              <span className="bg-amber-400 text-slate-950 text-[10px] font-black px-2 py-0.5 rounded uppercase tracking-wider">
                Ad • Google Verified Partner
              </span>
              <h4 className="font-bold text-sm sm:text-base text-blue-100">
                Unacademy & Testbook Online Coaching - 50% Off Sarkari Test Series
              </h4>
              <p className="text-xs text-slate-300">
                Practice 10,000+ mock tests & live classes for SSC CGL, Banking, RRB NTPC.
              </p>
            </div>
            <a
              href="https://google.com"
              target="_blank"
              rel="noreferrer"
              className="shrink-0 px-4 py-2 bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-bold text-xs rounded-lg hover:brightness-110 flex items-center gap-1.5 shadow-sm"
            >
              Visit Partner <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        ) : format === 'sidebar' || targetPlacementKey === 'sidebarBanner' ? (
          <div className="bg-slate-900 text-white p-4 rounded-xl border border-slate-700 text-left space-y-3">
            <span className="bg-yellow-400 text-black text-[9px] font-extrabold px-1.5 py-0.5 rounded uppercase">
              AdSense Sidebar Slot #{monSettings.googleAdSense.sidebarSlotId || '3456'}
            </span>
            <h4 className="font-black text-sm text-amber-300 leading-snug">
              Sarkari Exam Speed Booster & Current Affairs PDF Pack
            </h4>
            <p className="text-xs text-slate-300">
              Download latest 2026 yearly compilation with 5000+ MCQ answers.
            </p>
            <a
              href="https://google.com"
              target="_blank"
              rel="noreferrer"
              className="w-full py-2 bg-emerald-600 text-white font-bold text-xs rounded-lg hover:bg-emerald-500 flex items-center justify-center gap-2"
            >
              Get Free PDF Download
            </a>
          </div>
        ) : (
          <div className="bg-indigo-50 dark:bg-slate-800/80 border border-indigo-200 dark:border-slate-700 rounded-xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-left">
            <div className="space-y-1">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-indigo-700 dark:text-indigo-400">
                Google AdSense • In-Article Unit
              </span>
              <p className="text-xs font-bold text-slate-900 dark:text-slate-100">
                Best Typing Speed Practice Software for High Court & Railway Exams
              </p>
            </div>
            <a
              href="https://google.com"
              target="_blank"
              rel="noreferrer"
              className="px-3 py-1.5 bg-indigo-700 text-white text-xs font-bold rounded-lg hover:bg-indigo-600 shrink-0 flex items-center gap-1"
            >
              Start Free Speed Test <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        )}
      </div>
    );
  }

  // 2. Adsterra Ad Unit
  if (network === 'adsterra') {
    if (!monSettings.adsterra.enabled) return null;
    return (
      <div className={`my-4 overflow-hidden rounded-xl border border-amber-300 dark:border-amber-900/60 bg-gradient-to-r from-amber-950 via-slate-900 to-amber-900 text-amber-100 p-4 shadow-sm ${className}`}>
        <div className="flex items-center justify-between text-[10px] uppercase font-bold text-amber-400 mb-2">
          <span className="flex items-center gap-1"><Sparkles className="w-3.5 h-3.5" /> Adsterra Monetization Engine</span>
          <span>Popunder & Native Banner</span>
        </div>
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <div>
            <h4 className="font-extrabold text-sm text-white">⚡ Instant High-CPM Adsterra Direct SmartLink</h4>
            <p className="text-xs text-amber-200/80">Check eligibility, admit cards, and job alert channels.</p>
          </div>
          <a
            href={monSettings.adsterra.popunderUrl || 'https://www.adsterra.com'}
            target="_blank"
            rel="noreferrer"
            className="shrink-0 px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs rounded-lg transition-transform hover:scale-105 flex items-center gap-1"
          >
            Open Adsterra SmartLink <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>
    );
  }

  // 3. PropellerAds Unit
  if (network === 'propeller') {
    if (!monSettings.propellerAds.enabled) return null;
    return (
      <div className={`my-4 rounded-xl border border-rose-300 dark:border-rose-900 bg-rose-950/40 text-rose-100 p-4 ${className}`}>
        <div className="flex items-center justify-between text-[10px] uppercase font-bold text-rose-400 mb-1">
          <span>PropellerAds Network</span>
          <span>Zone ID: {monSettings.propellerAds.zoneId}</span>
        </div>
        <div className="flex items-center justify-between gap-2">
          <div>
            <h4 className="font-bold text-sm text-white">🔔 Propeller Push Notification & Interstitial Ad</h4>
            <p className="text-xs text-rose-200/70">Click below to subscribe for instant exam result alerts on desktop/mobile.</p>
          </div>
          <button
            onClick={() => alert(`PropellerAds push trigger active (Zone: ${monSettings.propellerAds.zoneId}).`)}
            className="px-3.5 py-2 bg-rose-600 hover:bg-rose-500 text-white font-extrabold text-xs rounded-lg shrink-0"
          >
            Enable Push Alerts
          </button>
        </div>
      </div>
    );
  }

  // 4. Monetag Unit
  if (network === 'monetag') {
    if (!monSettings.monetag.enabled) return null;
    return (
      <div className={`my-4 rounded-xl border border-purple-300 dark:border-purple-900 bg-purple-950/40 text-purple-100 p-4 ${className}`}>
        <div className="flex items-center justify-between text-[10px] uppercase font-bold text-purple-300 mb-1">
          <span>Monetag Monetization</span>
          <span>Zone: {monSettings.monetag.zoneId}</span>
        </div>
        <div className="flex items-center justify-between gap-2">
          <div>
            <h4 className="font-bold text-sm text-white">💰 Monetag High-Yield Direct Partner Banner</h4>
            <p className="text-xs text-purple-200/80">Get direct download access for Sarkari exam solved question papers.</p>
          </div>
          <a
            href={monSettings.monetag.directLink || '#'}
            target="_blank"
            rel="noreferrer"
            className="px-3.5 py-2 bg-purple-600 hover:bg-purple-500 text-white font-extrabold text-xs rounded-lg shrink-0 flex items-center gap-1"
          >
            Visit Monetag Link <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>
    );
  }

  // 5. PopAds Unit
  if (network === 'popads') {
    if (!monSettings.popAds.enabled) return null;
    return (
      <div className={`my-4 rounded-xl border border-sky-300 dark:border-sky-900 bg-sky-950/40 text-sky-100 p-3 flex items-center justify-between text-xs ${className}`}>
        <div>
          <span className="text-[10px] uppercase font-extrabold text-sky-400 block">PopAds Popunder Script</span>
          <span className="font-semibold text-white">PopAds Site ID: {monSettings.popAds.siteId}</span>
        </div>
        <span className="bg-sky-500/20 text-sky-300 border border-sky-500/40 text-[10px] font-bold px-2 py-1 rounded">
          Popunder Script Active
        </span>
      </div>
    );
  }

  // 6. MGID Native Widget
  if (network === 'mgid') {
    if (!monSettings.mgid.enabled) return null;
    return (
      <div className={`my-4 rounded-xl border border-emerald-300 dark:border-emerald-900 bg-emerald-950/40 p-4 text-white ${className}`}>
        <div className="flex items-center justify-between text-[10px] uppercase font-bold text-emerald-400 mb-2">
          <span>MGID Native Recommendation Engine</span>
          <span>Widget: {monSettings.mgid.widgetId}</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="bg-slate-900 p-3 rounded-lg border border-slate-700">
            <span className="text-[9px] bg-emerald-900 text-emerald-300 px-1.5 py-0.5 rounded font-bold uppercase">Trending Story</span>
            <h5 className="font-bold text-xs text-slate-100 mt-1">How 100,000+ Students Cleared SSC CGL Tier-1 in First Attempt</h5>
          </div>
          <div className="bg-slate-900 p-3 rounded-lg border border-slate-700">
            <span className="text-[9px] bg-emerald-900 text-emerald-300 px-1.5 py-0.5 rounded font-bold uppercase">Exam Preparation</span>
            <h5 className="font-bold text-xs text-slate-100 mt-1">Top 5 Daily GK Apps Recommended by Previous Toppers</h5>
          </div>
        </div>
      </div>
    );
  }

  // 7. Taboola & 8. Outbrain Native Widgets
  if (network === 'taboola' || network === 'outbrain') {
    const isTaboola = network === 'taboola';
    const config = isTaboola ? monSettings.taboola : monSettings.outbrain;
    if (!config.enabled) return null;

    return (
      <div className={`my-4 rounded-xl border border-indigo-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 p-4 ${className}`}>
        <div className="flex items-center justify-between text-[10px] uppercase font-bold text-slate-400 mb-2">
          <span>Around The Web • {isTaboola ? 'Taboola' : 'Outbrain'} Native Feed</span>
          <span>ID: {isTaboola ? monSettings.taboola.publisherId : monSettings.outbrain.widgetId}</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {[1, 2, 3].map((item) => (
            <div key={item} className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-3 space-y-1.5">
              <span className="text-[9px] font-black uppercase text-indigo-600 dark:text-indigo-400">Sponsored Content</span>
              <h5 className="font-bold text-xs text-slate-800 dark:text-slate-100 line-clamp-2">
                {item === 1 ? 'Free Banking Aptitude Formula Sheet PDF Download' : item === 2 ? 'Latest Railway Recruitment Board Exam Pattern' : 'UPSC Civil Services Recommended Reading List'}
              </h5>
              <span className="text-[10px] text-slate-400 block">Sarkari Learning Hub</span>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // 9. Affiliate Ads
  if (network === 'affiliate') {
    const activeAffiliates = (monSettings.affiliateAds || []).filter((a) => a.enabled);
    if (activeAffiliates.length === 0) return null;

    const aff = activeAffiliates[0];
    return (
      <div className={`my-4 rounded-2xl border border-blue-300 dark:border-blue-900/80 bg-gradient-to-r from-blue-900 via-indigo-950 to-slate-900 text-white p-4 shadow-md ${className}`}>
        <div className="flex items-center justify-between text-[10px] uppercase font-bold tracking-widest text-amber-300 mb-2">
          <span className="flex items-center gap-1"><Award className="w-3.5 h-3.5" /> {aff.badge || 'VERIFIED AFFILIATE AD'}</span>
          <span>{aff.categoryTag || 'Recommended'}</span>
        </div>
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="space-y-1">
            <h4 className="font-black text-sm sm:text-base text-white">{aff.title}</h4>
            <p className="text-xs text-slate-300">{aff.description}</p>
          </div>
          <a
            href={aff.targetUrl}
            target="_blank"
            rel="noreferrer"
            className="shrink-0 px-4 py-2 bg-gradient-to-r from-emerald-500 to-teal-600 hover:brightness-110 text-slate-950 font-black text-xs rounded-xl shadow-md transition-all flex items-center gap-1.5"
          >
            <span>{aff.ctaText || 'Claim Deal'}</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>
    );
  }

  // 10. Sponsored Posts / Direct Ads
  if (network === 'sponsored') {
    const activeSponsored = (monSettings.sponsoredPosts || []).filter((s) => s.enabled);
    if (activeSponsored.length === 0) return null;

    const spon = activeSponsored[0];
    return (
      <div className={`my-4 rounded-2xl border border-amber-300 dark:border-amber-900/80 bg-amber-500/10 dark:bg-amber-950/40 border-dashed p-4 text-slate-900 dark:text-slate-100 ${className}`}>
        <div className="flex items-center justify-between text-[10px] uppercase font-bold text-amber-700 dark:text-amber-400 mb-1">
          <span className="flex items-center gap-1"><Megaphone className="w-3.5 h-3.5" /> {spon.badgeText || 'OFFICIAL SPONSOR'}</span>
          <span>{spon.sponsorName}</span>
        </div>
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <div>
            <h4 className="font-extrabold text-sm text-slate-900 dark:text-white">{spon.headline}</h4>
            <p className="text-xs text-slate-600 dark:text-slate-300">Verified official promotional publication.</p>
          </div>
          <a
            href={spon.targetUrl}
            target="_blank"
            rel="noreferrer"
            className="shrink-0 px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white font-extrabold text-xs rounded-xl flex items-center gap-1"
          >
            Visit Sponsor <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>
    );
  }

  // Fallback Custom Script Code
  if (placementConfig?.customScript) {
    return (
      <div
        className={`my-4 p-3 bg-slate-900 text-slate-200 rounded-xl text-xs border border-slate-700 ${className}`}
        dangerouslySetInnerHTML={{ __html: placementConfig.customScript }}
      />
    );
  }

  return null;
};
