import React, { useState } from 'react';
import { 
  Lock, 
  Plus, 
  Trash2, 
  Edit3, 
  Copy, 
  RotateCcw, 
  Search, 
  Filter, 
  X, 
  CheckCircle, 
  ShieldCheck, 
  Key, 
  FileText, 
  Calendar, 
  Sparkles, 
  LogOut,
  Building2,
  Users,
  DollarSign,
  Code,
  Check,
  HelpCircle,
  PlusCircle,
  Clock,
  BookOpen,
  Link,
  Award,
  Megaphone,
  Star
} from 'lucide-react';
import { JobPost, CategoryType } from '../types';
import { 
  verifyAdminPasscode, 
  updateAdminPasscode, 
  resetPostsToDefault,
  getAdSenseSettings,
  saveAdSenseSettings,
  getMonetizationSettings,
  saveMonetizationSettings,
  MonetizationSettings,
  AffiliateAdItem,
  SponsoredPostItem,
  getStoredComments,
  deleteJobComment,
  isAdminSessionActive,
  setAdminSessionActive
} from '../utils/storage';
import { api } from '../utils/api';
import { sendPushNotification } from '../utils/notifications';

interface AdminPanelProps {
  posts: JobPost[];
  onSavePosts: (updated: JobPost[]) => void;
  onClose: () => void;
  onOpenSitemap: () => void;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({
  posts,
  onSavePosts,
  onClose,
  onOpenSitemap,
}) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => isAdminSessionActive());
  const [passcode, setPasscode] = useState<string>('');
  const [authError, setAuthError] = useState<string>('');

  const [activeTab, setActiveTab] = useState<'posts' | 'create' | 'comments' | 'adsense' | 'settings'>('posts');
  const [searchFilter, setSearchFilter] = useState<string>('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');

  // Comments state
  const [comments, setComments] = useState(() => getStoredComments());

  // Full Monetization & Multi-Network state
  const [monSettings, setMonSettings] = useState<MonetizationSettings>(() => getMonetizationSettings());
  const [monMsg, setMonMsg] = useState<string>('');
  const [monSubTab, setMonSubTab] = useState<'placements' | 'networks' | 'affiliate' | 'sponsored'>('placements');

  // Legacy AdSense state sync
  const [adSettings, setAdSettings] = useState(() => getAdSenseSettings());
  const [adMsg, setAdMsg] = useState<string>('');

  const handleSaveMonetization = (updated: MonetizationSettings) => {
    setMonSettings(updated);
    saveMonetizationSettings(updated);
    window.dispatchEvent(new Event('storage'));
    setMonMsg('Monetization settings & ad codes updated successfully!');
    setTimeout(() => setMonMsg(''), 3000);
  };

  // Editing state
  const [editingPost, setEditingPost] = useState<Partial<JobPost> | null>(null);

  // Settings passcode change
  const [newPasscode, setNewPasscode] = useState<string>('');
  const [settingsMsg, setSettingsMsg] = useState<string>('');

  // Handle Login
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!passcode.trim()) {
      setAuthError('Please enter admin passcode.');
      return;
    }
    const res = await api.loginAdmin(passcode);
    if (res.success || verifyAdminPasscode(passcode)) {
      setIsAuthenticated(true);
      setAdminSessionActive(true);
      if (res.token) {
        localStorage.setItem('nokri_admin_token', res.token);
      }
      setAuthError('');
      window.dispatchEvent(new Event('storage'));
    } else {
      setAuthError(res.message || 'Access Denied: Invalid Admin Passcode. Default is admin123');
    }
  };

  const handleLockPanel = () => {
    setIsAuthenticated(false);
    setAdminSessionActive(false);
    window.dispatchEvent(new Event('storage'));
  };

  // Open Create New Post Form
  const handleStartCreate = () => {
    setEditingPost({
      id: `post-${Date.now()}`,
      title: '',
      organization: '',
      category: 'govt_jobs',
      department: '',
      location: 'All India',
      totalVacancies: 100,
      salary: '₹25,000 - ₹80,000/-',
      qualification: 'Graduate / 10th / 12th',
      summary: 'New recruitment notification released by official examination authority.',
      details: 'Complete notification guidelines, eligibility criteria, and instructions for online application.',
      importantDates: {
        startDate: new Date().toISOString().split('T')[0],
        lastDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        feeLastDate: new Date(Date.now() + 32 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        examDate: 'To be announced',
        admitCardDate: '10 days before exam',
      },
      applicationFee: {
        generalObcEws: '₹100',
        scStPwd: '₹0',
        female: '₹0',
        paymentMode: 'Online via Debit/Credit Card, Net Banking, UPI',
      },
      ageLimit: {
        minAge: '18 Years',
        maxAge: '30 Years',
        asOnDate: '2026-08-01',
        relaxationDetails: 'SC/ST: 5 Years | OBC: 3 Years | PwD: 10 Years',
      },
      vacancies: [
        { postName: 'General Post', totalPosts: 100, eligibility: 'Bachelor Degree in any stream' }
      ],
      selectionProcess: '1. Computer Based Test (CBT)\n2. Skill Test / Document Verification\n3. Medical Examination',
      cutOffInfo: 'UR: 120+ | OBC: 110+ | SC/ST: 95+',
      syllabusDetails: 'Objective MCQs covering General Knowledge, Reasoning, Quant, and English Language.',
      applyUrl: 'https://example.gov.in',
      notificationPdfUrl: 'https://example.gov.in/notification.pdf',
      officialWebsiteUrl: 'https://example.gov.in',
      faqs: [
        { question: 'What is the last date to apply?', answer: 'Applications close on the specified last date in important dates.' },
        { question: 'What is the qualification required?', answer: 'Check the post-wise eligibility breakdown table.' }
      ],
      status: 'Active',
      isFeatured: false,
      postedDate: new Date().toISOString().split('T')[0],
      viewsCount: 1,
    });
    setActiveTab('create');
  };

  // Save (Create or Edit) Post
  const handleSavePostForm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPost || !editingPost.title || !editingPost.organization) {
      alert('Please fill out the post title and organization name.');
      return;
    }

    const fullPost = editingPost as JobPost;
    const exists = posts.some((p) => p.id === fullPost.id);

    let updatedPosts: JobPost[];
    if (exists) {
      await api.updatePost(fullPost.id, fullPost);
      updatedPosts = posts.map((p) => (p.id === fullPost.id ? fullPost : p));
    } else {
      const res = await api.createPost(fullPost);
      const savedPost = res.post || fullPost;
      updatedPosts = [savedPost, ...posts];

      // Trigger instant push notification for new post
      sendPushNotification(
        `📢 New ${fullPost.category.toUpperCase().replace('_', ' ')} Alert!`,
        `${fullPost.title} - ${fullPost.organization} (${fullPost.totalVacancies || 'New'} Posts)`
      );
    }

    onSavePosts(updatedPosts);
    setEditingPost(null);
    setActiveTab('posts');
  };

  // Delete Post
  const handleDeletePost = async (id: string) => {
    if (confirm('Are you sure you want to delete this job post?')) {
      await api.deletePost(id);
      const updated = posts.filter((p) => p.id !== id);
      onSavePosts(updated);
    }
  };

  // Duplicate Post
  const handleDuplicatePost = async (post: JobPost) => {
    const dup: JobPost = {
      ...post,
      id: `post-dup-${Date.now()}`,
      title: `${post.title} (Copy)`,
      postedDate: new Date().toISOString().split('T')[0],
    };
    await api.createPost(dup);
    onSavePosts([dup, ...posts]);
  };

  // Save AdSense Settings
  const handleSaveAdSense = async (e: React.FormEvent) => {
    e.preventDefault();
    saveAdSenseSettings(adSettings);
    await api.updateAdSense(adSettings);
    setAdMsg('Google AdSense settings updated successfully!');
    setTimeout(() => setAdMsg(''), 3000);
  };

  // Delete Comment
  const handleDeleteComment = async (commentId: string) => {
    deleteJobComment(commentId);
    await api.deleteComment(commentId);
    setComments((prev) => prev.filter((c) => c.id !== commentId));
  };

  // Change Admin Passcode
  const handleChangePasscode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPasscode.length < 4) {
      setSettingsMsg('Passcode must be at least 4 characters long.');
      return;
    }
    updateAdminPasscode(newPasscode);
    await api.changeAdminPasscode(newPasscode);
    setSettingsMsg('Admin passcode updated successfully!');
    setNewPasscode('');
  };

  // Reset to default sample posts
  const handleResetSeed = async () => {
    if (confirm('Reset all posts to default dataset? Any custom created posts will be overwritten.')) {
      const apiRes = await api.resetPosts();
      const res = apiRes.posts || resetPostsToDefault();
      onSavePosts(res);
      alert('Dataset reset to default initial posts!');
    }
  };

  // Filtered posts in admin
  const filteredPosts = posts.filter((p) => {
    const matchesQuery =
      p.title.toLowerCase().includes(searchFilter.toLowerCase()) ||
      p.organization.toLowerCase().includes(searchFilter.toLowerCase());
    const matchesCat = categoryFilter === 'all' || p.category === categoryFilter;
    return matchesQuery && matchesCat;
  });

  // If not logged in, render PIN login overlay
  if (!isAuthenticated) {
    return (
      <div className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-4">
        <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 w-full max-w-md overflow-hidden p-6 sm:p-8 space-y-5 animate-in fade-in zoom-in-95 duration-200">
          
          <div className="text-center space-y-3">
            <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-500 flex items-center justify-center mx-auto shadow-inner">
              <Lock className="w-7 h-7" />
            </div>
            <div>
              <span className="inline-block bg-rose-100 text-rose-800 dark:bg-rose-950/70 dark:text-rose-300 text-[10px] font-extrabold px-2.5 py-0.5 rounded-full mb-1.5 border border-rose-200 dark:border-rose-900">
                🔒 Restricted Access
              </span>
              <h2 className="text-2xl font-black text-slate-900 dark:text-white">Admin Portal Sign In</h2>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed max-w-xs mx-auto">
              Direct URL access without authentication is strictly blocked. Enter your administrator passcode to unlock panel management.
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                Admin Passcode:
              </label>
              <div className="relative">
                <Key className="w-4 h-4 absolute left-3 top-3.5 text-slate-400" />
                <input
                  type="password"
                  value={passcode}
                  onChange={(e) => setPasscode(e.target.value)}
                  placeholder="Enter admin passcode..."
                  className="w-full pl-9 pr-3 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-sm font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                  autoFocus
                />
              </div>
              <p className="text-[10px] text-slate-400 mt-1">
                Default Passcode: <code className="text-amber-600 dark:text-amber-400 font-bold">admin123</code>
              </p>
            </div>

            {authError && (
              <div className="text-xs text-rose-600 dark:text-rose-400 font-bold bg-rose-50 dark:bg-rose-950/60 p-3 rounded-xl border border-rose-200 dark:border-rose-900 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-rose-500 shrink-0" />
                <span>{authError}</span>
              </div>
            )}

            <div className="flex items-center gap-2 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="w-1/2 py-2.5 text-xs font-bold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="w-1/2 py-2.5 text-xs font-bold text-slate-950 bg-amber-400 hover:bg-amber-300 rounded-xl shadow-md transition cursor-pointer flex items-center justify-center gap-1.5"
              >
                <ShieldCheck className="w-4 h-4" />
                <span>Unlock Panel</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 w-full max-w-5xl max-h-[92vh] flex flex-col overflow-hidden my-auto">
        
        {/* Admin Header */}
        <div className="bg-slate-900 text-white p-4 flex items-center justify-between border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center font-black shadow-inner">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h2 className="font-extrabold text-base text-white">Sarkari Express Admin Dashboard</h2>
              <p className="text-xs text-slate-400">Total Live Posts: {posts.length}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onOpenSitemap}
              className="p-2 text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition-colors flex items-center gap-1 text-xs font-semibold"
            >
              <Code className="w-4 h-4 text-amber-400" />
              <span className="hidden sm:inline">Sitemap XML</span>
            </button>
            <button
              onClick={handleLockPanel}
              className="p-2 text-slate-300 hover:text-rose-400 hover:bg-slate-800 rounded-lg transition-colors flex items-center gap-1 text-xs font-semibold"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Lock Panel</span>
            </button>
            <button onClick={onClose} className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg">
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Admin Navigation Tabs */}
        <div className="bg-slate-100 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 px-4 pt-3 flex items-center justify-between gap-2 overflow-x-auto">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('posts')}
              className={`px-4 py-2 text-xs font-bold rounded-t-lg transition-colors ${
                activeTab === 'posts'
                  ? 'bg-white dark:bg-slate-900 text-blue-700 dark:text-blue-400 border-t-2 border-blue-600'
                  : 'text-slate-600 dark:text-slate-300 hover:bg-slate-200'
              }`}
            >
              Manage Posts ({posts.length})
            </button>

            <button
              onClick={handleStartCreate}
              className={`px-4 py-2 text-xs font-bold rounded-t-lg transition-colors flex items-center gap-1 ${
                activeTab === 'create'
                  ? 'bg-white dark:bg-slate-900 text-blue-700 dark:text-blue-400 border-t-2 border-blue-600'
                  : 'text-slate-600 dark:text-slate-300 hover:bg-slate-200'
              }`}
            >
              <Plus className="w-3.5 h-3.5 text-emerald-600" />
              <span>Add New Post</span>
            </button>

            <button
              onClick={() => setActiveTab('comments')}
              className={`px-4 py-2 text-xs font-bold rounded-t-lg transition-colors ${
                activeTab === 'comments'
                  ? 'bg-white dark:bg-slate-900 text-blue-700 dark:text-blue-400 border-t-2 border-blue-600'
                  : 'text-slate-600 dark:text-slate-300 hover:bg-slate-200'
              }`}
            >
              Comments Moderation ({comments.length})
            </button>

            <button
              onClick={() => setActiveTab('adsense')}
              className={`px-4 py-2 text-xs font-bold rounded-t-lg transition-colors flex items-center gap-1 ${
                activeTab === 'adsense'
                  ? 'bg-white dark:bg-slate-900 text-amber-600 dark:text-amber-400 border-t-2 border-amber-500'
                  : 'text-slate-600 dark:text-slate-300 hover:bg-slate-200'
              }`}
            >
              <DollarSign className="w-3.5 h-3.5 text-amber-500" />
              <span>💰 Monetization & Ads (9 Networks)</span>
            </button>

            <button
              onClick={() => setActiveTab('settings')}
              className={`px-4 py-2 text-xs font-bold rounded-t-lg transition-colors flex items-center gap-1 ${
                activeTab === 'settings'
                  ? 'bg-white dark:bg-slate-900 text-blue-700 dark:text-blue-400 border-t-2 border-blue-600'
                  : 'text-slate-600 dark:text-slate-300 hover:bg-slate-200'
              }`}
            >
              <Key className="w-3.5 h-3.5" />
              <span>Passcode</span>
            </button>
          </div>

          <button
            onClick={handleResetSeed}
            className="text-[11px] font-bold text-rose-700 hover:text-rose-900 bg-rose-50 border border-rose-200 px-2.5 py-1 rounded transition-colors flex items-center gap-1 shrink-0"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Reset Dataset</span>
          </button>
        </div>

        {/* Tab 1: Posts List */}
        {activeTab === 'posts' && (
          <div className="p-4 sm:p-6 overflow-y-auto space-y-4">
            {/* Search & Category Filter */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-50 dark:bg-slate-800 p-3 rounded-xl border border-slate-200 dark:border-slate-700">
              <div className="relative w-full sm:w-72">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  value={searchFilter}
                  onChange={(e) => setSearchFilter(e.target.value)}
                  placeholder="Filter by title, org..."
                  className="w-full pl-9 pr-3 py-1.5 text-xs bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg font-semibold text-slate-900 dark:text-white"
                />
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="w-full sm:w-48 text-xs p-1.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg font-bold text-slate-900 dark:text-white"
                >
                  <option value="all">All Categories</option>
                  <option value="govt_jobs">Govt Jobs</option>
                  <option value="private_jobs">Private Jobs</option>
                  <option value="admit_card">Admit Card</option>
                  <option value="results">Results</option>
                  <option value="syllabus">Syllabus</option>
                </select>

                <button
                  onClick={handleStartCreate}
                  className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-lg flex items-center gap-1 shrink-0"
                >
                  <Plus className="w-4 h-4" />
                  <span>Create Post</span>
                </button>
              </div>
            </div>

            {/* Posts Table */}
            <div className="border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-900 text-white font-bold uppercase text-[10px] tracking-wider">
                  <tr>
                    <th className="p-3">Title & Organization</th>
                    <th className="p-3">Category</th>
                    <th className="p-3">Vacancies</th>
                    <th className="p-3">Last Date</th>
                    <th className="p-3">Status</th>
                    <th className="p-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-800 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200">
                  {filteredPosts.length > 0 ? (
                    filteredPosts.map((p) => (
                      <tr key={p.id} className="hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                        <td className="p-3 space-y-0.5 max-w-xs">
                          <p className="font-bold text-slate-900 dark:text-white line-clamp-1">{p.title}</p>
                          <p className="text-[11px] text-slate-500 dark:text-slate-400">{p.organization}</p>
                        </td>
                        <td className="p-3 font-semibold uppercase text-[10px]">
                          {p.category.replace('_', ' ')}
                        </td>
                        <td className="p-3 font-bold text-blue-700 dark:text-blue-400">
                          {p.totalVacancies ? p.totalVacancies.toLocaleString() : 'N/A'}
                        </td>
                        <td className="p-3 font-medium">
                          {p.importantDates.lastDate || 'N/A'}
                        </td>
                        <td className="p-3">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              p.status === 'Active'
                                ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                                : p.status === 'Closing Soon'
                                ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                                : 'bg-slate-100 text-slate-600'
                            }`}
                          >
                            {p.status}
                          </span>
                        </td>
                        <td className="p-3 text-right space-x-1 whitespace-nowrap">
                          <button
                            onClick={() => {
                              setEditingPost(p);
                              setActiveTab('create');
                            }}
                            title="Edit Post"
                            className="p-1.5 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-slate-800 rounded"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDuplicatePost(p)}
                            title="Duplicate Post"
                            className="p-1.5 text-purple-600 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-slate-800 rounded"
                          >
                            <Copy className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeletePost(p.id)}
                            title="Delete Post"
                            className="p-1.5 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-slate-800 rounded"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={6} className="p-6 text-center text-slate-400 italic">
                        No posts found matching filter criteria.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab 2: Create / Edit Form */}
        {activeTab === 'create' && editingPost && (
          <form onSubmit={handleSavePostForm} className="p-4 sm:p-6 overflow-y-auto space-y-6 text-xs">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <div>
                <h3 className="font-extrabold text-base text-slate-900 dark:text-white">
                  {posts.some((p) => p.id === editingPost.id) ? '✏️ Edit Post Details' : '✨ Create New Job / Result / Admit Card Post'}
                </h3>
                <p className="text-[11px] text-slate-500">
                  Fill in official parameters. Changes will publish automatically across the website.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setActiveTab('posts')}
                className="text-xs font-bold text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 px-3 py-1.5 bg-slate-100 dark:bg-slate-800 rounded-lg"
              >
                ← Back to Posts
              </button>
            </div>

            {/* SECTION 1: JOB OVERVIEW & BASIC INFO */}
            <div className="bg-slate-50 dark:bg-slate-800/60 p-4 rounded-xl border border-slate-200 dark:border-slate-700/80 space-y-3">
              <h4 className="font-extrabold text-xs uppercase text-blue-600 dark:text-blue-400 flex items-center gap-2">
                <Building2 className="w-4 h-4" />
                <span>1. Job Overview & Basic Info</span>
              </h4>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="md:col-span-2">
                  <label className="block font-bold text-slate-800 dark:text-slate-200 mb-1">Post Title *</label>
                  <input
                    type="text"
                    required
                    value={editingPost.title || ''}
                    onChange={(e) => setEditingPost({ ...editingPost, title: e.target.value })}
                    placeholder="e.g. SSC CGL 2026 Recruitment Notification Out (17,727 Vacancies)"
                    className="w-full p-2.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-sm font-bold text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-800 dark:text-slate-200 mb-1">Organization / Exam Board *</label>
                  <input
                    type="text"
                    required
                    value={editingPost.organization || ''}
                    onChange={(e) => setEditingPost({ ...editingPost, organization: e.target.value })}
                    placeholder="e.g. Staff Selection Commission (SSC)"
                    className="w-full p-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white font-medium"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-800 dark:text-slate-200 mb-1">Category *</label>
                  <select
                    value={editingPost.category || 'govt_jobs'}
                    onChange={(e) => setEditingPost({ ...editingPost, category: e.target.value as CategoryType })}
                    className="w-full p-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg font-bold text-slate-900 dark:text-white"
                  >
                    <option value="govt_jobs">Government Jobs</option>
                    <option value="admit_card">Admit Card</option>
                    <option value="results">Results</option>
                    <option value="private_jobs">Private / Corporate Jobs</option>
                    <option value="syllabus">Syllabus</option>
                    <option value="admission">Admission</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-800 dark:text-slate-200 mb-1">Status</label>
                  <select
                    value={editingPost.status || 'Active'}
                    onChange={(e) => setEditingPost({ ...editingPost, status: e.target.value as any })}
                    className="w-full p-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg font-bold text-slate-900 dark:text-white"
                  >
                    <option value="Active">Active / Accepting Applications</option>
                    <option value="Closing Soon">Closing Soon ⏳</option>
                    <option value="Closed">Closed</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-800 dark:text-slate-200 mb-1">Total Vacancies</label>
                  <input
                    type="number"
                    value={editingPost.totalVacancies || 0}
                    onChange={(e) => setEditingPost({ ...editingPost, totalVacancies: Number(e.target.value) })}
                    className="w-full p-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg font-bold text-blue-600 dark:text-blue-400"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-800 dark:text-slate-200 mb-1">Salary / Pay Scale</label>
                  <input
                    type="text"
                    value={editingPost.salary || ''}
                    onChange={(e) => setEditingPost({ ...editingPost, salary: e.target.value })}
                    placeholder="e.g. ₹35,400 - ₹1,12,400/- (Pay Level-6)"
                    className="w-full p-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-800 dark:text-slate-200 mb-1">Qualification Required</label>
                  <input
                    type="text"
                    value={editingPost.qualification || ''}
                    onChange={(e) => setEditingPost({ ...editingPost, qualification: e.target.value })}
                    placeholder="e.g. 10th / 12th / Graduate Degree"
                    className="w-full p-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-800 dark:text-slate-200 mb-1">Job / Exam Location</label>
                  <input
                    type="text"
                    value={editingPost.location || ''}
                    onChange={(e) => setEditingPost({ ...editingPost, location: e.target.value })}
                    placeholder="e.g. All India / Delhi / UP"
                    className="w-full p-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                  />
                </div>

                <div className="flex items-center gap-2 pt-4">
                  <input
                    type="checkbox"
                    id="isFeatured"
                    checked={editingPost.isFeatured || false}
                    onChange={(e) => setEditingPost({ ...editingPost, isFeatured: e.target.checked })}
                    className="w-4 h-4 text-blue-600 rounded border-slate-300 cursor-pointer"
                  />
                  <label htmlFor="isFeatured" className="font-bold text-slate-800 dark:text-slate-200 cursor-pointer">
                    🔥 Mark as Hot / Featured Notice
                  </label>
                </div>

                <div className="md:col-span-2">
                  <label className="block font-bold text-slate-800 dark:text-slate-200 mb-1">Short Summary (Preview Text)</label>
                  <input
                    type="text"
                    value={editingPost.summary || ''}
                    onChange={(e) => setEditingPost({ ...editingPost, summary: e.target.value })}
                    placeholder="Brief 1-2 sentence overview for home feed cards..."
                    className="w-full p-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block font-bold text-slate-800 dark:text-slate-200 mb-1">Full Description & Overview</label>
                  <textarea
                    rows={4}
                    value={editingPost.details || ''}
                    onChange={(e) => setEditingPost({ ...editingPost, details: e.target.value })}
                    placeholder="Complete notification summary, terms, and guidelines..."
                    className="w-full p-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                  />
                </div>
              </div>
            </div>

            {/* SECTION 2: IMPORTANT DATES */}
            <div className="bg-blue-50/60 dark:bg-blue-950/40 p-4 rounded-xl border border-blue-200 dark:border-blue-900/60 space-y-3">
              <h4 className="font-extrabold text-xs uppercase text-blue-900 dark:text-blue-300 flex items-center gap-2">
                <Calendar className="w-4 h-4 text-blue-600" />
                <span>2. Important Dates</span>
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-slate-800 dark:text-slate-200 mb-1">Application Start Date</label>
                  <input
                    type="text"
                    value={editingPost.importantDates?.startDate || ''}
                    onChange={(e) => setEditingPost({
                      ...editingPost,
                      importantDates: { ...editingPost.importantDates!, startDate: e.target.value }
                    })}
                    placeholder="e.g. 24 June 2026"
                    className="w-full p-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg font-semibold text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-800 dark:text-slate-200 mb-1">Last Date to Apply *</label>
                  <input
                    type="text"
                    required
                    value={editingPost.importantDates?.lastDate || ''}
                    onChange={(e) => setEditingPost({
                      ...editingPost,
                      importantDates: { ...editingPost.importantDates!, lastDate: e.target.value }
                    })}
                    placeholder="e.g. 24 July 2026"
                    className="w-full p-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg font-bold text-red-600 dark:text-red-400"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-800 dark:text-slate-200 mb-1">Fee Payment Last Date</label>
                  <input
                    type="text"
                    value={editingPost.importantDates?.feeLastDate || ''}
                    onChange={(e) => setEditingPost({
                      ...editingPost,
                      importantDates: { ...editingPost.importantDates!, feeLastDate: e.target.value }
                    })}
                    placeholder="e.g. 25 July 2026"
                    className="w-full p-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg font-semibold text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-800 dark:text-slate-200 mb-1">Exam Date</label>
                  <input
                    type="text"
                    value={editingPost.importantDates?.examDate || ''}
                    onChange={(e) => setEditingPost({
                      ...editingPost,
                      importantDates: { ...editingPost.importantDates!, examDate: e.target.value }
                    })}
                    placeholder="e.g. Sept / Oct 2026"
                    className="w-full p-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg font-semibold text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-800 dark:text-slate-200 mb-1">Admit Card Release Date</label>
                  <input
                    type="text"
                    value={editingPost.importantDates?.admitCardDate || ''}
                    onChange={(e) => setEditingPost({
                      ...editingPost,
                      importantDates: { ...editingPost.importantDates!, admitCardDate: e.target.value }
                    })}
                    placeholder="e.g. 10 Days Before Exam"
                    className="w-full p-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg font-semibold text-slate-900 dark:text-white"
                  />
                </div>
              </div>
            </div>

            {/* SECTION 3: APPLICATION FEE */}
            <div className="bg-emerald-50/60 dark:bg-emerald-950/40 p-4 rounded-xl border border-emerald-200 dark:border-emerald-900/60 space-y-3">
              <h4 className="font-extrabold text-xs uppercase text-emerald-900 dark:text-emerald-300 flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-emerald-600" />
                <span>3. Application Fee</span>
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                <div>
                  <label className="block font-bold text-slate-800 dark:text-slate-200 mb-1">General / OBC / EWS</label>
                  <input
                    type="text"
                    value={editingPost.applicationFee?.generalObcEws || ''}
                    onChange={(e) => setEditingPost({
                      ...editingPost,
                      applicationFee: { ...editingPost.applicationFee!, generalObcEws: e.target.value }
                    })}
                    placeholder="e.g. ₹100/-"
                    className="w-full p-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg font-bold text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-800 dark:text-slate-200 mb-1">SC / ST / PwD</label>
                  <input
                    type="text"
                    value={editingPost.applicationFee?.scStPwd || ''}
                    onChange={(e) => setEditingPost({
                      ...editingPost,
                      applicationFee: { ...editingPost.applicationFee!, scStPwd: e.target.value }
                    })}
                    placeholder="e.g. ₹0/- (Exempted)"
                    className="w-full p-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg font-bold text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-800 dark:text-slate-200 mb-1">Female Candidates</label>
                  <input
                    type="text"
                    value={editingPost.applicationFee?.female || ''}
                    onChange={(e) => setEditingPost({
                      ...editingPost,
                      applicationFee: { ...editingPost.applicationFee!, female: e.target.value }
                    })}
                    placeholder="e.g. ₹0/- (Exempted)"
                    className="w-full p-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg font-bold text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-800 dark:text-slate-200 mb-1">Payment Mode</label>
                  <input
                    type="text"
                    value={editingPost.applicationFee?.paymentMode || ''}
                    onChange={(e) => setEditingPost({
                      ...editingPost,
                      applicationFee: { ...editingPost.applicationFee!, paymentMode: e.target.value }
                    })}
                    placeholder="Online via Net Banking, Debit Card, UPI"
                    className="w-full p-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                  />
                </div>
              </div>
            </div>

            {/* SECTION 4: AGE LIMIT */}
            <div className="bg-amber-50/60 dark:bg-amber-950/40 p-4 rounded-xl border border-amber-200 dark:border-amber-900/60 space-y-3">
              <h4 className="font-extrabold text-xs uppercase text-amber-900 dark:text-amber-300 flex items-center gap-2">
                <Clock className="w-4 h-4 text-amber-600" />
                <span>4. Age Limit & Relaxation</span>
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                <div>
                  <label className="block font-bold text-slate-800 dark:text-slate-200 mb-1">Minimum Age</label>
                  <input
                    type="text"
                    value={editingPost.ageLimit?.minAge || ''}
                    onChange={(e) => setEditingPost({
                      ...editingPost,
                      ageLimit: { ...editingPost.ageLimit!, minAge: e.target.value }
                    })}
                    placeholder="e.g. 18 Years"
                    className="w-full p-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg font-semibold text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-800 dark:text-slate-200 mb-1">Maximum Age</label>
                  <input
                    type="text"
                    value={editingPost.ageLimit?.maxAge || ''}
                    onChange={(e) => setEditingPost({
                      ...editingPost,
                      ageLimit: { ...editingPost.ageLimit!, maxAge: e.target.value }
                    })}
                    placeholder="e.g. 27 - 32 Years"
                    className="w-full p-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg font-semibold text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-800 dark:text-slate-200 mb-1">Age Calculated As On Date</label>
                  <input
                    type="text"
                    value={editingPost.ageLimit?.asOnDate || ''}
                    onChange={(e) => setEditingPost({
                      ...editingPost,
                      ageLimit: { ...editingPost.ageLimit!, asOnDate: e.target.value }
                    })}
                    placeholder="e.g. 01 August 2026"
                    className="w-full p-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-800 dark:text-slate-200 mb-1">Age Relaxation Summary</label>
                  <input
                    type="text"
                    value={editingPost.ageLimit?.relaxationDetails || ''}
                    onChange={(e) => setEditingPost({
                      ...editingPost,
                      ageLimit: { ...editingPost.ageLimit!, relaxationDetails: e.target.value }
                    })}
                    placeholder="e.g. SC/ST: 5 Yrs | OBC: 3 Yrs"
                    className="w-full p-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                  />
                </div>
              </div>
            </div>

            {/* SECTION 5: VACANCY BREAKDOWN TABLE */}
            <div className="bg-slate-50 dark:bg-slate-800/60 p-4 rounded-xl border border-slate-200 dark:border-slate-700 space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="font-extrabold text-xs uppercase text-slate-900 dark:text-slate-200 flex items-center gap-2">
                  <Award className="w-4 h-4 text-blue-600" />
                  <span>5. Post-Wise Vacancy Breakdown</span>
                </h4>

                <button
                  type="button"
                  onClick={() => {
                    const current = editingPost.vacancies || [];
                    setEditingPost({
                      ...editingPost,
                      vacancies: [...current, { postName: '', totalPosts: 0, eligibility: '' }]
                    });
                  }}
                  className="px-3 py-1 bg-blue-600 text-white font-bold rounded hover:bg-blue-700 transition-colors flex items-center gap-1 text-xs"
                >
                  <PlusCircle className="w-3.5 h-3.5" />
                  <span>Add Vacancy Row</span>
                </button>
              </div>

              {(editingPost.vacancies || []).map((v, idx) => (
                <div key={idx} className="grid grid-cols-1 sm:grid-cols-12 gap-2 bg-white dark:bg-slate-900 p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 items-center">
                  <div className="sm:col-span-4">
                    <input
                      type="text"
                      value={v.postName}
                      onChange={(e) => {
                        const updated = [...(editingPost.vacancies || [])];
                        updated[idx].postName = e.target.value;
                        setEditingPost({ ...editingPost, vacancies: updated });
                      }}
                      placeholder="Post Name (e.g. Assistant Section Officer)"
                      className="w-full p-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded text-xs font-bold"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <input
                      type="number"
                      value={v.totalPosts}
                      onChange={(e) => {
                        const updated = [...(editingPost.vacancies || [])];
                        updated[idx].totalPosts = Number(e.target.value);
                        setEditingPost({ ...editingPost, vacancies: updated });
                      }}
                      placeholder="Posts Count"
                      className="w-full p-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded text-xs font-extrabold text-blue-600"
                    />
                  </div>
                  <div className="sm:col-span-5">
                    <input
                      type="text"
                      value={v.eligibility}
                      onChange={(e) => {
                        const updated = [...(editingPost.vacancies || [])];
                        updated[idx].eligibility = e.target.value;
                        setEditingPost({ ...editingPost, vacancies: updated });
                      }}
                      placeholder="Eligibility Criteria (e.g. Bachelor Degree + Typing)"
                      className="w-full p-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded text-xs"
                    />
                  </div>
                  <div className="sm:col-span-1 text-right">
                    <button
                      type="button"
                      onClick={() => {
                        const updated = (editingPost.vacancies || []).filter((_, i) => i !== idx);
                        setEditingPost({ ...editingPost, vacancies: updated });
                      }}
                      className="p-1 text-rose-600 hover:bg-rose-50 rounded"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* SECTION 6 & 7: SELECTION PROCESS & SYLLABUS */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-purple-50/60 dark:bg-purple-950/40 p-4 rounded-xl border border-purple-200 dark:border-purple-900/60 space-y-2">
                <h4 className="font-extrabold text-xs uppercase text-purple-900 dark:text-purple-300 flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-purple-600" />
                  <span>6. Selection Process & Cut-Off Marks</span>
                </h4>

                <div>
                  <label className="block font-bold text-slate-800 dark:text-slate-200 mb-1">Selection Steps</label>
                  <textarea
                    rows={2}
                    value={editingPost.selectionProcess || ''}
                    onChange={(e) => setEditingPost({ ...editingPost, selectionProcess: e.target.value })}
                    placeholder="1. CBT Exam 2. Skill Test 3. Document Verification"
                    className="w-full p-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-800 dark:text-slate-200 mb-1">Cut-Off Marks Info</label>
                  <input
                    type="text"
                    value={editingPost.cutOffInfo || ''}
                    onChange={(e) => setEditingPost({ ...editingPost, cutOffInfo: e.target.value })}
                    placeholder="e.g. UR: 135.5 | OBC: 128.2 | SC: 112.0"
                    className="w-full p-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="bg-sky-50/60 dark:bg-sky-950/40 p-4 rounded-xl border border-sky-200 dark:border-sky-900/60 space-y-2">
                <h4 className="font-extrabold text-xs uppercase text-sky-900 dark:text-sky-300 flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-sky-600" />
                  <span>7. Syllabus Details & Pattern</span>
                </h4>

                <div>
                  <label className="block font-bold text-slate-800 dark:text-slate-200 mb-1">Syllabus Overview Text</label>
                  <textarea
                    rows={2}
                    value={editingPost.syllabusDetails || ''}
                    onChange={(e) => setEditingPost({ ...editingPost, syllabusDetails: e.target.value })}
                    placeholder="Overview of Reasoning, GK, Quant, and English subjects..."
                    className="w-full p-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-800 dark:text-slate-200 mb-1">Syllabus PDF Direct URL</label>
                  <input
                    type="url"
                    value={editingPost.syllabusPdfUrl || ''}
                    onChange={(e) => setEditingPost({ ...editingPost, syllabusPdfUrl: e.target.value })}
                    placeholder="https://example.gov.in/syllabus.pdf"
                    className="w-full p-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white font-mono"
                  />
                </div>
              </div>
            </div>

            {/* SECTION 8: IMPORTANT DIRECT LINKS */}
            <div className="bg-indigo-50/60 dark:bg-indigo-950/40 p-4 rounded-xl border border-indigo-200 dark:border-indigo-900/60 space-y-3">
              <h4 className="font-extrabold text-xs uppercase text-indigo-900 dark:text-indigo-300 flex items-center gap-2">
                <Link className="w-4 h-4 text-indigo-600" />
                <span>8. Important Direct Links</span>
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-slate-800 dark:text-slate-200 mb-1">Apply Online Form URL</label>
                  <input
                    type="url"
                    value={editingPost.applyUrl || ''}
                    onChange={(e) => setEditingPost({ ...editingPost, applyUrl: e.target.value })}
                    placeholder="https://ssc.gov.in/apply"
                    className="w-full p-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg font-mono text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-800 dark:text-slate-200 mb-1">Notification PDF Download URL</label>
                  <input
                    type="url"
                    value={editingPost.notificationPdfUrl || ''}
                    onChange={(e) => setEditingPost({ ...editingPost, notificationPdfUrl: e.target.value })}
                    placeholder="https://ssc.gov.in/notice.pdf"
                    className="w-full p-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg font-mono text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-800 dark:text-slate-200 mb-1">Official Website URL</label>
                  <input
                    type="url"
                    value={editingPost.officialWebsiteUrl || ''}
                    onChange={(e) => setEditingPost({ ...editingPost, officialWebsiteUrl: e.target.value })}
                    placeholder="https://ssc.gov.in"
                    className="w-full p-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg font-mono text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-800 dark:text-slate-200 mb-1">Admit Card Download URL (Optional)</label>
                  <input
                    type="url"
                    value={editingPost.admitCardDownloadUrl || ''}
                    onChange={(e) => setEditingPost({ ...editingPost, admitCardDownloadUrl: e.target.value })}
                    placeholder="https://ssc.gov.in/admit-card"
                    className="w-full p-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg font-mono text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-800 dark:text-slate-200 mb-1">Result Direct URL (Optional)</label>
                  <input
                    type="url"
                    value={editingPost.resultLinkUrl || ''}
                    onChange={(e) => setEditingPost({ ...editingPost, resultLinkUrl: e.target.value })}
                    placeholder="https://ssc.gov.in/result"
                    className="w-full p-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg font-mono text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-800 dark:text-slate-200 mb-1">Merit List PDF URL (Optional)</label>
                  <input
                    type="url"
                    value={editingPost.meritListPdfUrl || ''}
                    onChange={(e) => setEditingPost({ ...editingPost, meritListPdfUrl: e.target.value })}
                    placeholder="https://ssc.gov.in/merit.pdf"
                    className="w-full p-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg font-mono text-slate-900 dark:text-white"
                  />
                </div>
              </div>
            </div>

            {/* SECTION 9: FREQUENTLY ASKED QUESTIONS (FAQS) */}
            <div className="bg-slate-50 dark:bg-slate-800/60 p-4 rounded-xl border border-slate-200 dark:border-slate-700 space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="font-extrabold text-xs uppercase text-slate-900 dark:text-slate-200 flex items-center gap-2">
                  <HelpCircle className="w-4 h-4 text-blue-600" />
                  <span>9. Frequently Asked Questions (FAQs)</span>
                </h4>

                <button
                  type="button"
                  onClick={() => {
                    const current = editingPost.faqs || [];
                    setEditingPost({
                      ...editingPost,
                      faqs: [...current, { question: '', answer: '' }]
                    });
                  }}
                  className="px-3 py-1 bg-blue-600 text-white font-bold rounded hover:bg-blue-700 transition-colors flex items-center gap-1 text-xs"
                >
                  <PlusCircle className="w-3.5 h-3.5" />
                  <span>Add FAQ Row</span>
                </button>
              </div>

              {(editingPost.faqs || []).map((faq, idx) => (
                <div key={idx} className="bg-white dark:bg-slate-900 p-3 rounded-lg border border-slate-200 dark:border-slate-700 space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-bold text-xs text-blue-600">Question #{idx + 1}</span>
                    <button
                      type="button"
                      onClick={() => {
                        const updated = (editingPost.faqs || []).filter((_, i) => i !== idx);
                        setEditingPost({ ...editingPost, faqs: updated });
                      }}
                      className="text-rose-600 hover:bg-rose-50 p-1 rounded text-xs font-bold"
                    >
                      Delete FAQ
                    </button>
                  </div>

                  <input
                    type="text"
                    value={faq.question}
                    onChange={(e) => {
                      const updated = [...(editingPost.faqs || [])];
                      updated[idx].question = e.target.value;
                      setEditingPost({ ...editingPost, faqs: updated });
                    }}
                    placeholder="e.g. What is the last date to submit online application?"
                    className="w-full p-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded text-xs font-bold"
                  />

                  <textarea
                    rows={2}
                    value={faq.answer}
                    onChange={(e) => {
                      const updated = [...(editingPost.faqs || [])];
                      updated[idx].answer = e.target.value;
                      setEditingPost({ ...editingPost, faqs: updated });
                    }}
                    placeholder="Official answer for candidates..."
                    className="w-full p-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded text-xs"
                  />
                </div>
              ))}
            </div>

            {/* FORM SUBMIT BAR */}
            <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3 sticky bottom-0 bg-white dark:bg-slate-900 py-3 shadow-md">
              <button
                type="button"
                onClick={() => setActiveTab('posts')}
                className="px-5 py-2.5 bg-slate-100 dark:bg-slate-800 font-bold text-slate-700 dark:text-slate-300 rounded-xl"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-8 py-2.5 bg-blue-600 hover:bg-blue-700 font-extrabold text-white text-xs sm:text-sm rounded-xl shadow-lg transition-transform active:scale-95 cursor-pointer"
              >
                💾 Publish Notification to Website
              </button>
            </div>
          </form>
        )}

        {/* Tab 3: Comments Moderation */}
        {activeTab === 'comments' && (
          <div className="p-6 overflow-y-auto space-y-4">
            <h3 className="font-extrabold text-sm text-slate-900 dark:text-white uppercase tracking-wider">
              Candidate Discussion Comments ({comments.length})
            </h3>
            <div className="space-y-3">
              {comments.map((c) => (
                <div
                  key={c.id}
                  className="p-4 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl flex items-start justify-between gap-3 text-xs"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900 dark:text-white">{c.userName}</span>
                      <span className="text-[10px] text-slate-400">({c.createdAt})</span>
                    </div>
                    <p className="text-slate-700 dark:text-slate-300 font-medium">{c.content}</p>
                    <span className="text-[10px] text-blue-600 font-mono">Job ID: {c.jobId}</span>
                  </div>

                  <button
                    onClick={() => handleDeleteComment(c.id)}
                    className="p-1.5 text-red-600 hover:bg-red-50 rounded"
                    title="Delete Comment"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 4: Monetization & Ad Network Control Hub */}
        {activeTab === 'adsense' && (
          <div className="p-4 sm:p-6 overflow-y-auto space-y-6 text-xs max-w-5xl mx-auto">
            {/* Header & Master Toggle */}
            <div className="bg-gradient-to-r from-slate-900 via-amber-950 to-slate-900 text-white p-5 rounded-2xl border border-amber-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-lg">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <DollarSign className="w-6 h-6 text-amber-400" />
                  <h3 className="font-black text-base sm:text-lg text-white">Multi-Network Monetization & Ad Manager</h3>
                  <span className="bg-amber-400 text-slate-950 font-black text-[10px] px-2 py-0.5 rounded uppercase">
                    PRO ENGINE
                  </span>
                </div>
                <p className="text-slate-300 text-xs">
                  Manage Google AdSense, Adsterra, PropellerAds, Monetag, PopAds, MGID, Taboola, Outbrain & Custom Banners.
                </p>
              </div>

              <label className="flex items-center gap-3 bg-slate-800/80 hover:bg-slate-800 px-4 py-2.5 rounded-xl border border-amber-400/40 cursor-pointer shrink-0">
                <span className="font-extrabold text-xs text-amber-200">MASTER MONETIZATION SWITCH</span>
                <input
                  type="checkbox"
                  checked={monSettings.masterEnabled}
                  onChange={(e) => {
                    const updated = { ...monSettings, masterEnabled: e.target.checked };
                    handleSaveMonetization(updated);
                  }}
                  className="w-5 h-5 text-amber-500 rounded cursor-pointer"
                />
              </label>
            </div>

            {monMsg && (
              <div className="p-3 bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-200 border border-emerald-300 dark:border-emerald-800 rounded-xl font-bold flex items-center justify-between">
                <span>{monMsg}</span>
                <CheckCircle className="w-4 h-4 text-emerald-600" />
              </div>
            )}

            {/* Sub Tabs Navigation */}
            <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2">
              <button
                type="button"
                onClick={() => setMonSubTab('placements')}
                className={`px-4 py-2 font-bold rounded-lg text-xs transition-colors ${
                  monSubTab === 'placements'
                    ? 'bg-amber-500 text-slate-950'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
                }`}
              >
                🎯 Ad Slot Placements
              </button>
              <button
                type="button"
                onClick={() => setMonSubTab('networks')}
                className={`px-4 py-2 font-bold rounded-lg text-xs transition-colors ${
                  monSubTab === 'networks'
                    ? 'bg-amber-500 text-slate-950'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
                }`}
              >
                🌐 Ad Networks & Publisher IDs (8 Networks)
              </button>
              <button
                type="button"
                onClick={() => setMonSubTab('affiliate')}
                className={`px-4 py-2 font-bold rounded-lg text-xs transition-colors ${
                  monSubTab === 'affiliate'
                    ? 'bg-amber-500 text-slate-950'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
                }`}
              >
                🔗 Custom Affiliate Banners ({monSettings.affiliateAds?.length || 0})
              </button>
              <button
                type="button"
                onClick={() => setMonSubTab('sponsored')}
                className={`px-4 py-2 font-bold rounded-lg text-xs transition-colors ${
                  monSubTab === 'sponsored'
                    ? 'bg-amber-500 text-slate-950'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
                }`}
              >
                📢 Sponsored Posts ({monSettings.sponsoredPosts?.length || 0})
              </button>
            </div>

            {/* SUB TAB 1: PLACEMENTS CONTROL */}
            {monSubTab === 'placements' && (
              <div className="space-y-4">
                <div className="bg-amber-50 dark:bg-amber-950/30 p-4 rounded-xl border border-amber-200 dark:border-amber-900/60">
                  <h4 className="font-extrabold text-slate-900 dark:text-white text-xs uppercase mb-1">
                    Manage Active Ad Positions & Target Network Assignment
                  </h4>
                  <p className="text-slate-600 dark:text-slate-300 text-[11px]">
                    Enable or disable specific ad slots on the portal and assign which network populates that position.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[
                    { key: 'headerLeaderboard', label: 'Header Top Leaderboard Banner', defaultNet: 'adsense' },
                    { key: 'sidebarBanner', label: 'Right Sidebar Sticky Banner', defaultNet: 'affiliate' },
                    { key: 'inArticleDetail', label: 'In-Article Job Details Banner', defaultNet: 'adsense' },
                    { key: 'feedInBetween', label: 'Home Feed Cards In-Between Ad', defaultNet: 'sponsored' },
                    { key: 'stickyBottomAnchor', label: 'Sticky Bottom Anchor Footer Bar', defaultNet: 'adsterra' },
                    { key: 'nativeRecommendations', label: 'Bottom Native Article Recommendations', defaultNet: 'taboola' },
                  ].map((slot) => {
                    const currentConfig = (monSettings.placements as any)[slot.key] || { enabled: true, network: slot.defaultNet };
                    return (
                      <div key={slot.key} className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="font-extrabold text-xs text-slate-900 dark:text-white">{slot.label}</span>
                          <label className="flex items-center gap-2 cursor-pointer">
                            <span className="text-[10px] font-bold text-slate-500">
                              {currentConfig.enabled ? 'ACTIVE' : 'HIDDEN'}
                            </span>
                            <input
                              type="checkbox"
                              checked={currentConfig.enabled}
                              onChange={(e) => {
                                const updated = {
                                  ...monSettings,
                                  placements: {
                                    ...monSettings.placements,
                                    [slot.key]: { ...currentConfig, enabled: e.target.checked }
                                  }
                                };
                                handleSaveMonetization(updated);
                              }}
                              className="w-4 h-4 text-emerald-600 rounded"
                            />
                          </label>
                        </div>

                        <div>
                          <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">Assigned Ad Network</label>
                          <select
                            value={currentConfig.network}
                            onChange={(e) => {
                              const updated = {
                                ...monSettings,
                                placements: {
                                  ...monSettings.placements,
                                  [slot.key]: { ...currentConfig, network: e.target.value }
                                }
                              };
                              handleSaveMonetization(updated);
                            }}
                            className="w-full p-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg font-bold text-slate-900 dark:text-white"
                          >
                            <option value="adsense">Google AdSense</option>
                            <option value="adsterra">Adsterra SmartLink / Banner</option>
                            <option value="propeller">PropellerAds Push / Zone</option>
                            <option value="monetag">Monetag Direct Link</option>
                            <option value="popads">PopAds Popunder</option>
                            <option value="mgid">MGID Native Feed</option>
                            <option value="taboola">Taboola Feed</option>
                            <option value="outbrain">Outbrain Widget</option>
                            <option value="affiliate">Custom Affiliate Link</option>
                            <option value="sponsored">Sponsored Post Banner</option>
                            <option value="custom_script">Custom HTML / JS Code</option>
                          </select>
                        </div>

                        {currentConfig.network === 'custom_script' && (
                          <div>
                            <label className="block text-[10px] font-bold text-slate-500 mb-1">Custom Ad Script / HTML Snippet</label>
                            <textarea
                              rows={2}
                              value={currentConfig.customScript || ''}
                              onChange={(e) => {
                                const updated = {
                                  ...monSettings,
                                  placements: {
                                    ...monSettings.placements,
                                    [slot.key]: { ...currentConfig, customScript: e.target.value }
                                  }
                                };
                                handleSaveMonetization(updated);
                              }}
                              placeholder="<script>...</script> or <a href='...'>...</a>"
                              className="w-full p-2 bg-slate-900 text-emerald-400 font-mono text-[11px] rounded-lg border border-slate-700"
                            />
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* SUB TAB 2: AD NETWORKS & PUBLISHER IDS */}
            {monSubTab === 'networks' && (
              <div className="space-y-4">
                {/* 1. Google AdSense */}
                <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl space-y-3">
                  <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
                    <span className="font-extrabold text-sm text-blue-600 dark:text-blue-400 flex items-center gap-2">
                      <DollarSign className="w-4 h-4" /> 1. Google AdSense Settings
                    </span>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <span className="font-bold text-xs">{monSettings.googleAdSense.enabled ? 'Enabled' : 'Disabled'}</span>
                      <input
                        type="checkbox"
                        checked={monSettings.googleAdSense.enabled}
                        onChange={(e) => {
                          const updated = {
                            ...monSettings,
                            googleAdSense: { ...monSettings.googleAdSense, enabled: e.target.checked }
                          };
                          handleSaveMonetization(updated);
                        }}
                        className="w-4 h-4 text-blue-600 rounded"
                      />
                    </label>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Publisher ID</label>
                      <input
                        type="text"
                        value={monSettings.googleAdSense.publisherId}
                        onChange={(e) => {
                          const updated = {
                            ...monSettings,
                            googleAdSense: { ...monSettings.googleAdSense, publisherId: e.target.value }
                          };
                          handleSaveMonetization(updated);
                        }}
                        placeholder="ca-pub-9876543210987654"
                        className="w-full p-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg font-mono"
                      />
                    </div>

                    <div>
                      <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Leaderboard Slot ID</label>
                      <input
                        type="text"
                        value={monSettings.googleAdSense.leaderboardSlotId || ''}
                        onChange={(e) => {
                          const updated = {
                            ...monSettings,
                            googleAdSense: { ...monSettings.googleAdSense, leaderboardSlotId: e.target.value }
                          };
                          handleSaveMonetization(updated);
                        }}
                        placeholder="1234567890"
                        className="w-full p-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg font-mono"
                      />
                    </div>
                  </div>
                </div>

                {/* 2. Adsterra */}
                <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl space-y-3">
                  <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
                    <span className="font-extrabold text-sm text-amber-600 dark:text-amber-400 flex items-center gap-2">
                      <Sparkles className="w-4 h-4" /> 2. Adsterra Monetization Engine
                    </span>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <span className="font-bold text-xs">{monSettings.adsterra.enabled ? 'Enabled' : 'Disabled'}</span>
                      <input
                        type="checkbox"
                        checked={monSettings.adsterra.enabled}
                        onChange={(e) => {
                          const updated = {
                            ...monSettings,
                            adsterra: { ...monSettings.adsterra, enabled: e.target.checked }
                          };
                          handleSaveMonetization(updated);
                        }}
                        className="w-4 h-4 text-amber-600 rounded"
                      />
                    </label>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Adsterra Direct Link / Popunder URL</label>
                      <input
                        type="url"
                        value={monSettings.adsterra.popunderUrl || ''}
                        onChange={(e) => {
                          const updated = {
                            ...monSettings,
                            adsterra: { ...monSettings.adsterra, popunderUrl: e.target.value }
                          };
                          handleSaveMonetization(updated);
                        }}
                        placeholder="https://www.adsterra.com/direct-link"
                        className="w-full p-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg font-mono"
                      />
                    </div>

                    <div>
                      <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Script Code Snippet</label>
                      <input
                        type="text"
                        value={monSettings.adsterra.scriptCode || ''}
                        onChange={(e) => {
                          const updated = {
                            ...monSettings,
                            adsterra: { ...monSettings.adsterra, scriptCode: e.target.value }
                          };
                          handleSaveMonetization(updated);
                        }}
                        placeholder="<script src='//pl123456.adsterra.com/...'>"
                        className="w-full p-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg font-mono"
                      />
                    </div>
                  </div>
                </div>

                {/* 3. PropellerAds */}
                <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl space-y-3">
                  <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
                    <span className="font-extrabold text-sm text-rose-600 dark:text-rose-400 flex items-center gap-2">
                      <Megaphone className="w-4 h-4" /> 3. PropellerAds Network
                    </span>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <span className="font-bold text-xs">{monSettings.propellerAds.enabled ? 'Enabled' : 'Disabled'}</span>
                      <input
                        type="checkbox"
                        checked={monSettings.propellerAds.enabled}
                        onChange={(e) => {
                          const updated = {
                            ...monSettings,
                            propellerAds: { ...monSettings.propellerAds, enabled: e.target.checked }
                          };
                          handleSaveMonetization(updated);
                        }}
                        className="w-4 h-4 text-rose-600 rounded"
                      />
                    </label>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Zone ID</label>
                      <input
                        type="text"
                        value={monSettings.propellerAds.zoneId || ''}
                        onChange={(e) => {
                          const updated = {
                            ...monSettings,
                            propellerAds: { ...monSettings.propellerAds, zoneId: e.target.value }
                          };
                          handleSaveMonetization(updated);
                        }}
                        placeholder="zone_789012"
                        className="w-full p-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg font-mono"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">SDK Script Code</label>
                      <input
                        type="text"
                        value={monSettings.propellerAds.scriptCode || ''}
                        onChange={(e) => {
                          const updated = {
                            ...monSettings,
                            propellerAds: { ...monSettings.propellerAds, scriptCode: e.target.value }
                          };
                          handleSaveMonetization(updated);
                        }}
                        placeholder="<script src='https://propellerpush.com/...'>"
                        className="w-full p-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg font-mono"
                      />
                    </div>
                  </div>
                </div>

                {/* 4. Monetag */}
                <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl space-y-3">
                  <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
                    <span className="font-extrabold text-sm text-purple-600 dark:text-purple-400 flex items-center gap-2">
                      <Star className="w-4 h-4" /> 4. Monetag Direct Ads
                    </span>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <span className="font-bold text-xs">{monSettings.monetag.enabled ? 'Enabled' : 'Disabled'}</span>
                      <input
                        type="checkbox"
                        checked={monSettings.monetag.enabled}
                        onChange={(e) => {
                          const updated = {
                            ...monSettings,
                            monetag: { ...monSettings.monetag, enabled: e.target.checked }
                          };
                          handleSaveMonetization(updated);
                        }}
                        className="w-4 h-4 text-purple-600 rounded"
                      />
                    </label>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Direct SmartLink URL</label>
                      <input
                        type="url"
                        value={monSettings.monetag.directLink || ''}
                        onChange={(e) => {
                          const updated = {
                            ...monSettings,
                            monetag: { ...monSettings.monetag, directLink: e.target.value }
                          };
                          handleSaveMonetization(updated);
                        }}
                        placeholder="https://monetag.com/direct-link-demo"
                        className="w-full p-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg font-mono"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Zone ID</label>
                      <input
                        type="text"
                        value={monSettings.monetag.zoneId || ''}
                        onChange={(e) => {
                          const updated = {
                            ...monSettings,
                            monetag: { ...monSettings.monetag, zoneId: e.target.value }
                          };
                          handleSaveMonetization(updated);
                        }}
                        placeholder="monetag_3456"
                        className="w-full p-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg font-mono"
                      />
                    </div>
                  </div>
                </div>

                {/* 5. PopAds */}
                <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl space-y-3">
                  <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
                    <span className="font-extrabold text-sm text-sky-600 dark:text-sky-400">5. PopAds Popunder System</span>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <span className="font-bold text-xs">{monSettings.popAds.enabled ? 'Enabled' : 'Disabled'}</span>
                      <input
                        type="checkbox"
                        checked={monSettings.popAds.enabled}
                        onChange={(e) => {
                          const updated = {
                            ...monSettings,
                            popAds: { ...monSettings.popAds, enabled: e.target.checked }
                          };
                          handleSaveMonetization(updated);
                        }}
                        className="w-4 h-4 text-sky-600 rounded"
                      />
                    </label>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">PopAds Site ID</label>
                      <input
                        type="text"
                        value={monSettings.popAds.siteId || ''}
                        onChange={(e) => {
                          const updated = {
                            ...monSettings,
                            popAds: { ...monSettings.popAds, siteId: e.target.value }
                          };
                          handleSaveMonetization(updated);
                        }}
                        placeholder="pop_998877"
                        className="w-full p-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg font-mono"
                      />
                    </div>
                  </div>
                </div>

                {/* 6. MGID, 7. Taboola, 8. Outbrain */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {/* MGID */}
                  <div className="p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl space-y-2">
                    <div className="flex items-center justify-between border-b pb-1">
                      <span className="font-extrabold text-xs text-emerald-600">6. MGID Native</span>
                      <input
                        type="checkbox"
                        checked={monSettings.mgid.enabled}
                        onChange={(e) => {
                          const updated = {
                            ...monSettings,
                            mgid: { ...monSettings.mgid, enabled: e.target.checked }
                          };
                          handleSaveMonetization(updated);
                        }}
                      />
                    </div>
                    <input
                      type="text"
                      value={monSettings.mgid.widgetId || ''}
                      onChange={(e) => {
                        const updated = {
                          ...monSettings,
                          mgid: { ...monSettings.mgid, widgetId: e.target.value }
                        };
                        handleSaveMonetization(updated);
                      }}
                      placeholder="MGID Widget ID"
                      className="w-full p-1.5 bg-slate-50 dark:bg-slate-800 text-xs rounded border border-slate-300 dark:border-slate-700"
                    />
                  </div>

                  {/* Taboola */}
                  <div className="p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl space-y-2">
                    <div className="flex items-center justify-between border-b pb-1">
                      <span className="font-extrabold text-xs text-indigo-600">7. Taboola</span>
                      <input
                        type="checkbox"
                        checked={monSettings.taboola.enabled}
                        onChange={(e) => {
                          const updated = {
                            ...monSettings,
                            taboola: { ...monSettings.taboola, enabled: e.target.checked }
                          };
                          handleSaveMonetization(updated);
                        }}
                      />
                    </div>
                    <input
                      type="text"
                      value={monSettings.taboola.publisherId || ''}
                      onChange={(e) => {
                        const updated = {
                          ...monSettings,
                          taboola: { ...monSettings.taboola, publisherId: e.target.value }
                        };
                        handleSaveMonetization(updated);
                      }}
                      placeholder="Taboola Publisher ID"
                      className="w-full p-1.5 bg-slate-50 dark:bg-slate-800 text-xs rounded border border-slate-300 dark:border-slate-700"
                    />
                  </div>

                  {/* Outbrain */}
                  <div className="p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl space-y-2">
                    <div className="flex items-center justify-between border-b pb-1">
                      <span className="font-extrabold text-xs text-sky-600">8. Outbrain</span>
                      <input
                        type="checkbox"
                        checked={monSettings.outbrain.enabled}
                        onChange={(e) => {
                          const updated = {
                            ...monSettings,
                            outbrain: { ...monSettings.outbrain, enabled: e.target.checked }
                          };
                          handleSaveMonetization(updated);
                        }}
                      />
                    </div>
                    <input
                      type="text"
                      value={monSettings.outbrain.widgetId || ''}
                      onChange={(e) => {
                        const updated = {
                          ...monSettings,
                          outbrain: { ...monSettings.outbrain, widgetId: e.target.value }
                        };
                        handleSaveMonetization(updated);
                      }}
                      placeholder="Outbrain Widget ID"
                      className="w-full p-1.5 bg-slate-50 dark:bg-slate-800 text-xs rounded border border-slate-300 dark:border-slate-700"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* SUB TAB 3: AFFILIATE ADS MANAGER */}
            {monSubTab === 'affiliate' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="font-extrabold text-xs uppercase text-slate-900 dark:text-white">
                    Custom Affiliate Banners List
                  </h4>
                  <button
                    type="button"
                    onClick={() => {
                      const newAff: AffiliateAdItem = {
                        id: `aff_${Date.now()}`,
                        title: 'New Affiliate Study Material Offer',
                        description: 'Description of mock tests or online course...',
                        badge: 'SPECIAL DEAL',
                        ctaText: 'Buy Now (Discount)',
                        targetUrl: 'https://example.com',
                        categoryTag: 'Books & Courses',
                        enabled: true,
                      };
                      const updated = {
                        ...monSettings,
                        affiliateAds: [newAff, ...(monSettings.affiliateAds || [])]
                      };
                      handleSaveMonetization(updated);
                    }}
                    className="px-3 py-1.5 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 flex items-center gap-1 text-xs"
                  >
                    <PlusCircle className="w-4 h-4" /> Add Affiliate Banner
                  </button>
                </div>

                {(monSettings.affiliateAds || []).map((aff, idx) => (
                  <div key={aff.id} className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl space-y-3">
                    <div className="flex items-center justify-between border-b pb-2">
                      <div className="flex items-center gap-2">
                        <span className="font-extrabold text-xs text-blue-600">Affiliate Banner #{idx + 1}</span>
                        <input
                          type="text"
                          value={aff.badge}
                          onChange={(e) => {
                            const copy = [...monSettings.affiliateAds];
                            copy[idx].badge = e.target.value;
                            handleSaveMonetization({ ...monSettings, affiliateAds: copy });
                          }}
                          className="p-1 bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-300 font-black text-[10px] rounded uppercase border border-amber-300"
                        />
                      </div>

                      <div className="flex items-center gap-3">
                        <label className="flex items-center gap-1 cursor-pointer text-xs font-bold">
                          <span>{aff.enabled ? 'Enabled' : 'Hidden'}</span>
                          <input
                            type="checkbox"
                            checked={aff.enabled}
                            onChange={(e) => {
                              const copy = [...monSettings.affiliateAds];
                              copy[idx].enabled = e.target.checked;
                              handleSaveMonetization({ ...monSettings, affiliateAds: copy });
                            }}
                            className="w-4 h-4 text-emerald-600 rounded"
                          />
                        </label>
                        <button
                          type="button"
                          onClick={() => {
                            const copy = monSettings.affiliateAds.filter((_, i) => i !== idx);
                            handleSaveMonetization({ ...monSettings, affiliateAds: copy });
                          }}
                          className="p-1 text-rose-600 hover:bg-rose-50 rounded"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 mb-0.5">Banner Title</label>
                        <input
                          type="text"
                          value={aff.title}
                          onChange={(e) => {
                            const copy = [...monSettings.affiliateAds];
                            copy[idx].title = e.target.value;
                            handleSaveMonetization({ ...monSettings, affiliateAds: copy });
                          }}
                          className="w-full p-2 bg-slate-50 dark:bg-slate-800 border rounded font-bold text-xs"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 mb-0.5">Target Tracking URL</label>
                        <input
                          type="url"
                          value={aff.targetUrl}
                          onChange={(e) => {
                            const copy = [...monSettings.affiliateAds];
                            copy[idx].targetUrl = e.target.value;
                            handleSaveMonetization({ ...monSettings, affiliateAds: copy });
                          }}
                          className="w-full p-2 bg-slate-50 dark:bg-slate-800 border rounded font-mono text-xs"
                        />
                      </div>
                      <div className="sm:col-span-2">
                        <label className="block text-[10px] font-bold text-slate-500 mb-0.5">Description Text</label>
                        <input
                          type="text"
                          value={aff.description}
                          onChange={(e) => {
                            const copy = [...monSettings.affiliateAds];
                            copy[idx].description = e.target.value;
                            handleSaveMonetization({ ...monSettings, affiliateAds: copy });
                          }}
                          className="w-full p-2 bg-slate-50 dark:bg-slate-800 border rounded text-xs"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* SUB TAB 4: SPONSORED POSTS MANAGER */}
            {monSubTab === 'sponsored' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="font-extrabold text-xs uppercase text-slate-900 dark:text-white">
                    Sponsored Posts & Direct Advertiser Campaigns
                  </h4>
                  <button
                    type="button"
                    onClick={() => {
                      const newSpon: SponsoredPostItem = {
                        id: `spon_${Date.now()}`,
                        sponsorName: 'Direct Client Sponsor',
                        headline: 'Special Sponsored Announcement or Exam Test Series',
                        targetUrl: 'https://example.com',
                        badgeText: 'SPONSORED',
                        enabled: true,
                      };
                      const updated = {
                        ...monSettings,
                        sponsoredPosts: [newSpon, ...(monSettings.sponsoredPosts || [])]
                      };
                      handleSaveMonetization(updated);
                    }}
                    className="px-3 py-1.5 bg-emerald-600 text-white font-bold rounded-lg hover:bg-emerald-700 flex items-center gap-1 text-xs"
                  >
                    <PlusCircle className="w-4 h-4" /> Add Sponsored Post
                  </button>
                </div>

                {(monSettings.sponsoredPosts || []).map((spon, idx) => (
                  <div key={spon.id} className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl space-y-3">
                    <div className="flex items-center justify-between border-b pb-2">
                      <span className="font-extrabold text-xs text-amber-600">Sponsor Campaign #{idx + 1}</span>
                      <div className="flex items-center gap-3">
                        <label className="flex items-center gap-1 cursor-pointer text-xs font-bold">
                          <span>{spon.enabled ? 'Active' : 'Disabled'}</span>
                          <input
                            type="checkbox"
                            checked={spon.enabled}
                            onChange={(e) => {
                              const copy = [...monSettings.sponsoredPosts];
                              copy[idx].enabled = e.target.checked;
                              handleSaveMonetization({ ...monSettings, sponsoredPosts: copy });
                            }}
                            className="w-4 h-4 text-emerald-600 rounded"
                          />
                        </label>
                        <button
                          type="button"
                          onClick={() => {
                            const copy = monSettings.sponsoredPosts.filter((_, i) => i !== idx);
                            handleSaveMonetization({ ...monSettings, sponsoredPosts: copy });
                          }}
                          className="p-1 text-rose-600 hover:bg-rose-50 rounded"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 mb-0.5">Sponsor Brand Name</label>
                        <input
                          type="text"
                          value={spon.sponsorName}
                          onChange={(e) => {
                            const copy = [...monSettings.sponsoredPosts];
                            copy[idx].sponsorName = e.target.value;
                            handleSaveMonetization({ ...monSettings, sponsoredPosts: copy });
                          }}
                          className="w-full p-2 bg-slate-50 dark:bg-slate-800 border rounded font-bold text-xs"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 mb-0.5">Campaign Headline</label>
                        <input
                          type="text"
                          value={spon.headline}
                          onChange={(e) => {
                            const copy = [...monSettings.sponsoredPosts];
                            copy[idx].headline = e.target.value;
                            handleSaveMonetization({ ...monSettings, sponsoredPosts: copy });
                          }}
                          className="w-full p-2 bg-slate-50 dark:bg-slate-800 border rounded font-semibold text-xs"
                        />
                      </div>
                      <div className="sm:col-span-2">
                        <label className="block text-[10px] font-bold text-slate-500 mb-0.5">Sponsor Destination URL</label>
                        <input
                          type="url"
                          value={spon.targetUrl}
                          onChange={(e) => {
                            const copy = [...monSettings.sponsoredPosts];
                            copy[idx].targetUrl = e.target.value;
                            handleSaveMonetization({ ...monSettings, sponsoredPosts: copy });
                          }}
                          className="w-full p-2 bg-slate-50 dark:bg-slate-800 border rounded font-mono text-xs"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab 5: Passcode */}
        {activeTab === 'settings' && (
          <div className="p-6 space-y-6 max-w-md mx-auto text-xs">
            <div className="bg-slate-50 dark:bg-slate-800 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-4">
              <div className="flex items-center gap-2">
                <Key className="w-5 h-5 text-amber-500" />
                <h3 className="font-extrabold text-slate-900 dark:text-white text-sm">Update Admin Security Passcode</h3>
              </div>

              <form onSubmit={handleChangePasscode} className="space-y-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">New Passcode:</label>
                  <input
                    type="password"
                    value={newPasscode}
                    onChange={(e) => setNewPasscode(e.target.value)}
                    placeholder="Enter new passcode..."
                    className="w-full p-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl font-bold text-slate-900 dark:text-white"
                  />
                </div>

                {settingsMsg && (
                  <p className="p-2 bg-emerald-100 text-emerald-800 rounded font-bold">
                    {settingsMsg}
                  </p>
                )}

                <button
                  type="submit"
                  className="w-full py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl shadow-2xs"
                >
                  Save New Passcode
                </button>
              </form>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
