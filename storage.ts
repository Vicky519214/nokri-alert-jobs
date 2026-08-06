import { JobPost, UserProfile, JobComment, LanguageType } from '../types';
import { INITIAL_JOB_POSTS } from '../data/initialPosts';

const POSTS_KEY = 'nokri_job_posts_v1';
const BOOKMARKS_KEY = 'nokri_bookmarks_v1';
const ADMIN_PASS_KEY = 'nokri_admin_pass_v1';
const USER_PROFILE_KEY = 'nokri_user_profile_v1';
const COMMENTS_KEY = 'nokri_job_comments_v1';
const ADSENSE_KEY = 'nokri_adsense_settings_v1';
const THEME_KEY = 'nokri_theme_v1';
const LANG_KEY = 'nokri_lang_v1';

export const getStoredPosts = (): JobPost[] => {
  try {
    const data = localStorage.getItem(POSTS_KEY);
    if (!data) {
      localStorage.setItem(POSTS_KEY, JSON.stringify(INITIAL_JOB_POSTS));
      return INITIAL_JOB_POSTS;
    }
    return JSON.parse(data);
  } catch (err) {
    console.error('Error reading posts from storage:', err);
    return INITIAL_JOB_POSTS;
  }
};

export const savePosts = (posts: JobPost[]): void => {
  try {
    localStorage.setItem(POSTS_KEY, JSON.stringify(posts));
  } catch (err) {
    console.error('Error saving posts to storage:', err);
  }
};

export const resetPostsToDefault = (): JobPost[] => {
  try {
    localStorage.setItem(POSTS_KEY, JSON.stringify(INITIAL_JOB_POSTS));
    return INITIAL_JOB_POSTS;
  } catch (err) {
    console.error('Error resetting posts:', err);
    return INITIAL_JOB_POSTS;
  }
};

export const incrementPostViews = (postId: string): JobPost[] => {
  const posts = getStoredPosts();
  const updated = posts.map((p) => {
    if (p.id === postId) {
      return { ...p, viewsCount: (p.viewsCount || 0) + 1 };
    }
    return p;
  });
  savePosts(updated);
  return updated;
};

// Bookmarks
export const getBookmarks = (): string[] => {
  try {
    const data = localStorage.getItem(BOOKMARKS_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
};

export const toggleBookmark = (postId: string): string[] => {
  const bookmarks = getBookmarks();
  let updated: string[];
  if (bookmarks.includes(postId)) {
    updated = bookmarks.filter((id) => id !== postId);
  } else {
    updated = [...bookmarks, postId];
  }
  localStorage.setItem(BOOKMARKS_KEY, JSON.stringify(updated));
  return updated;
};

// User Profile
export const getStoredUserProfile = (): UserProfile => {
  try {
    const data = localStorage.getItem(USER_PROFILE_KEY);
    if (data) return JSON.parse(data);
  } catch {
    // fallback
  }
  return {
    id: '',
    name: '',
    email: '',
    isLoggedIn: false,
    savedAlertsEnabled: true,
  };
};

export const saveUserProfile = (profile: UserProfile): void => {
  try {
    localStorage.setItem(USER_PROFILE_KEY, JSON.stringify(profile));
  } catch (err) {
    console.error('Error saving user profile:', err);
  }
};

export const clearAllUserData = (): void => {
  try {
    localStorage.removeItem(USER_PROFILE_KEY);
    localStorage.removeItem('nokri_user_token');
    localStorage.removeItem(BOOKMARKS_KEY);
    localStorage.removeItem('nokri_saved_alerts');
  } catch (err) {
    console.error('Error clearing user data from localStorage:', err);
  }
};

// Comments
const DEFAULT_COMMENTS: JobComment[] = [
  {
    id: 'c1',
    jobId: 'ssc-cgl-2026',
    userName: 'Rahul Sharma',
    userEmail: 'rahul.s@gmail.com',
    content: 'Are 3rd-year final semester students eligible for SSC CGL 2026 degree requirement?',
    createdAt: '2026-08-01 10:30 AM',
    isApproved: true,
    likes: 12,
  },
  {
    id: 'c2',
    jobId: 'ssc-cgl-2026',
    userName: 'Priya Verma',
    userEmail: 'priya.v@gmail.com',
    content: 'Yes! As long as your graduation degree result is declared before the specified cutoff date.',
    createdAt: '2026-08-01 11:15 AM',
    isApproved: true,
    likes: 8,
  },
  {
    id: 'c3',
    jobId: 'rrb-ntpc-2026',
    userName: 'Amit Kumar',
    userEmail: 'amit.k@gmail.com',
    content: 'What is the age relaxation for OBC candidates in RRB NTPC Under Graduate posts?',
    createdAt: '2026-08-02 02:45 PM',
    isApproved: true,
    likes: 5,
  },
];

export const getStoredComments = (jobId?: string): JobComment[] => {
  try {
    const data = localStorage.getItem(COMMENTS_KEY);
    const comments: JobComment[] = data ? JSON.parse(data) : DEFAULT_COMMENTS;
    if (!data) {
      localStorage.setItem(COMMENTS_KEY, JSON.stringify(DEFAULT_COMMENTS));
    }
    if (jobId) {
      return comments.filter((c) => c.jobId === jobId && c.isApproved);
    }
    return comments;
  } catch {
    return DEFAULT_COMMENTS;
  }
};

export const addJobComment = (comment: Omit<JobComment, 'id' | 'createdAt' | 'isApproved' | 'likes'>): JobComment => {
  const comments = getStoredComments();
  const newComment: JobComment = {
    ...comment,
    id: `c_${Date.now()}`,
    createdAt: new Date().toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' }),
    isApproved: true, // auto approve for smooth demo
    likes: 0,
  };
  const updated = [newComment, ...comments];
  localStorage.setItem(COMMENTS_KEY, JSON.stringify(updated));
  return newComment;
};

export const deleteJobComment = (commentId: string): void => {
  const comments = getStoredComments();
  const updated = comments.filter((c) => c.id !== commentId);
  localStorage.setItem(COMMENTS_KEY, JSON.stringify(updated));
};

// Full Multi-Network Monetization Settings
export interface AffiliateAdItem {
  id: string;
  title: string;
  description: string;
  badge: string;
  ctaText: string;
  targetUrl: string;
  imageUrl?: string;
  categoryTag?: string;
  enabled: boolean;
}

export interface SponsoredPostItem {
  id: string;
  sponsorName: string;
  headline: string;
  bannerHtmlOrImage?: string;
  targetUrl: string;
  badgeText: string;
  enabled: boolean;
}

export interface AdPlacementConfig {
  enabled: boolean;
  network: 'adsense' | 'adsterra' | 'propeller' | 'monetag' | 'popads' | 'mgid' | 'taboola' | 'outbrain' | 'affiliate' | 'sponsored' | 'custom_script';
  customScript?: string;
}

export interface MonetizationSettings {
  masterEnabled: boolean;
  googleAdSense: {
    enabled: boolean;
    publisherId: string;
    autoAds: boolean;
    leaderboardSlotId?: string;
    rectangleSlotId?: string;
    sidebarSlotId?: string;
    inArticleSlotId?: string;
    stickyBottomSlotId?: string;
  };
  adsterra: {
    enabled: boolean;
    scriptCode: string;
    popunderUrl?: string;
  };
  propellerAds: {
    enabled: boolean;
    zoneId: string;
    scriptCode: string;
  };
  monetag: {
    enabled: boolean;
    zoneId: string;
    directLink: string;
    scriptCode: string;
  };
  popAds: {
    enabled: boolean;
    siteId: string;
    scriptCode: string;
  };
  mgid: {
    enabled: boolean;
    widgetId: string;
    scriptCode: string;
  };
  taboola: {
    enabled: boolean;
    publisherId: string;
    mode: string;
    scriptCode: string;
  };
  outbrain: {
    enabled: boolean;
    widgetId: string;
    scriptCode: string;
  };
  affiliateAds: AffiliateAdItem[];
  sponsoredPosts: SponsoredPostItem[];
  placements: {
    headerLeaderboard: AdPlacementConfig;
    sidebarBanner: AdPlacementConfig;
    inArticleDetail: AdPlacementConfig;
    feedInBetween: AdPlacementConfig;
    stickyBottomAnchor: AdPlacementConfig;
    nativeRecommendations: AdPlacementConfig;
  };
}

const MONETIZATION_KEY = 'nokri_monetization_v2';

export const DEFAULT_MONETIZATION: MonetizationSettings = {
  masterEnabled: true,
  googleAdSense: {
    enabled: true,
    publisherId: 'ca-pub-9876543210987654',
    autoAds: true,
    leaderboardSlotId: '1234567890',
    rectangleSlotId: '2345678901',
    sidebarSlotId: '3456789012',
    inArticleSlotId: '4567890123',
    stickyBottomSlotId: '5678901234',
  },
  adsterra: {
    enabled: true,
    scriptCode: '<script type="text/javascript" src="//pl123456.adsterra.com/format.js"></script>',
    popunderUrl: 'https://www.adsterra.com/direct-link-demo',
  },
  propellerAds: {
    enabled: true,
    zoneId: 'zone_789012',
    scriptCode: '<script src="https://propellerpush.com/sdk.js" data-zone="789012"></script>',
  },
  monetag: {
    enabled: true,
    zoneId: 'monetag_3456',
    directLink: 'https://monetag.com/direct-link-demo',
    scriptCode: '<script src="//monetag.com/tag.js" data-zone="3456"></script>',
  },
  popAds: {
    enabled: true,
    siteId: 'pop_998877',
    scriptCode: '<script type="text/javascript" src="//popads.net/pop.js?id=998877"></script>',
  },
  mgid: {
    enabled: true,
    widgetId: 'mgid_112233',
    scriptCode: '<div id="M112233ScriptRoot"></div><script src="https://jsc.mgid.com/s/a/sarkarijob.js" async></script>',
  },
  taboola: {
    enabled: true,
    publisherId: 'sarkari-portal-taboola',
    mode: 'thumbnails-a',
    scriptCode: '<script type="text/javascript">window._taboola = window._taboola || []; _taboola.push({article:\'auto\'});</script>',
  },
  outbrain: {
    enabled: true,
    widgetId: 'AR_1',
    scriptCode: '<div className="OUTBRAIN" data-src="DROP_PERMALINK_HERE" data-widget-id="AR_1"></div>',
  },
  affiliateAds: [
    {
      id: 'aff_1',
      title: 'Testbook Pass Pro - 10,000+ Mock Tests for All Govt Exams',
      description: 'Get instant access to SSC CGL, Banking, Railway, and State PCS mock tests with detailed solutions.',
      badge: 'AFFILIATE PARTNER',
      ctaText: 'Get 50% Off Pass',
      targetUrl: 'https://testbook.com',
      imageUrl: '',
      categoryTag: 'Mock Tests',
      enabled: true,
    },
    {
      id: 'aff_2',
      title: 'Adda247 Live Online Coaching Classes 2026',
      description: 'Join top educators for live interactive batches, doubt sessions, and daily current affairs PDFs.',
      badge: 'TOP COURSE LINK',
      ctaText: 'Enroll Now (Special Discount)',
      targetUrl: 'https://adda247.com',
      imageUrl: '',
      categoryTag: 'Online Course',
      enabled: true,
    },
  ],
  sponsoredPosts: [
    {
      id: 'spon_1',
      sponsorName: 'Oliveboard Exam Prep',
      headline: 'Free All India Weekly Live Mock Test for SBI PO & SSC CGL 2026',
      targetUrl: 'https://oliveboard.in',
      badgeText: 'SPONSORED NOTICE',
      enabled: true,
    },
  ],
  placements: {
    headerLeaderboard: { enabled: true, network: 'adsense' },
    sidebarBanner: { enabled: true, network: 'affiliate' },
    inArticleDetail: { enabled: true, network: 'adsense' },
    feedInBetween: { enabled: true, network: 'sponsored' },
    stickyBottomAnchor: { enabled: true, network: 'adsterra' },
    nativeRecommendations: { enabled: true, network: 'taboola' },
  },
};

export const getMonetizationSettings = (): MonetizationSettings => {
  try {
    const data = localStorage.getItem(MONETIZATION_KEY);
    if (data) {
      const parsed = JSON.parse(data);
      return { ...DEFAULT_MONETIZATION, ...parsed };
    }
  } catch {
    // fallback
  }
  return DEFAULT_MONETIZATION;
};

export const saveMonetizationSettings = (settings: MonetizationSettings): void => {
  try {
    localStorage.setItem(MONETIZATION_KEY, JSON.stringify(settings));
    // Keep legacy AdSense key synced
    localStorage.setItem(ADSENSE_KEY, JSON.stringify(settings.googleAdSense));
  } catch (err) {
    console.error('Error saving monetization settings:', err);
  }
};

export interface AdSenseSettings {
  enabled: boolean;
  publisherId: string;
  autoAds: boolean;
}

export const getAdSenseSettings = (): AdSenseSettings => {
  const mon = getMonetizationSettings();
  return {
    enabled: mon.masterEnabled && mon.googleAdSense.enabled,
    publisherId: mon.googleAdSense.publisherId,
    autoAds: mon.googleAdSense.autoAds,
  };
};

export const saveAdSenseSettings = (settings: AdSenseSettings): void => {
  const current = getMonetizationSettings();
  current.googleAdSense.enabled = settings.enabled;
  current.googleAdSense.publisherId = settings.publisherId;
  current.googleAdSense.autoAds = settings.autoAds;
  saveMonetizationSettings(current);
};

// Theme & Language
export const getStoredTheme = (): 'light' | 'dark' => {
  try {
    const theme = localStorage.getItem(THEME_KEY);
    if (theme === 'dark' || theme === 'light') return theme;
  } catch {
    // fallback
  }
  return 'light';
};

export const saveTheme = (theme: 'light' | 'dark'): void => {
  localStorage.setItem(THEME_KEY, theme);
};

export const getThemeMode = getStoredTheme;
export const setThemeMode = saveTheme;

export const getStoredLang = (): LanguageType => {
  try {
    const lang = localStorage.getItem(LANG_KEY);
    if (lang === 'hi' || lang === 'bn' || lang === 'en') return lang as LanguageType;
  } catch {
    // fallback
  }
  return 'en';
};

export const saveLang = (lang: LanguageType): void => {
  localStorage.setItem(LANG_KEY, lang);
};

// Admin Security
export const getAdminPasscode = (): string => {
  return localStorage.getItem(ADMIN_PASS_KEY) || 'admin123';
};

export const updateAdminPasscode = (newPass: string): void => {
  localStorage.setItem(ADMIN_PASS_KEY, newPass);
};

export const verifyAdminPasscode = (inputPass: string): boolean => {
  return inputPass === getAdminPasscode();
};

export const isAdminSessionActive = (): boolean => {
  try {
    const token = localStorage.getItem('nokri_admin_token');
    const flag = localStorage.getItem('nokri_admin_logged_in');
    return Boolean(token || flag === 'true');
  } catch {
    return false;
  }
};

export const setAdminSessionActive = (active: boolean): void => {
  try {
    if (active) {
      localStorage.setItem('nokri_admin_logged_in', 'true');
    } else {
      localStorage.removeItem('nokri_admin_logged_in');
      localStorage.removeItem('nokri_admin_token');
    }
  } catch (err) {
    console.error('Error updating admin session status:', err);
  }
};
