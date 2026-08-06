import { JobPost, UserProfile, JobComment } from '../types';
import { AdSenseSettings } from './storage';

const API_BASE = '/api';

export const api = {
  // --- Admin Auth ---
  async loginAdmin(passcode: string): Promise<{ success: boolean; token?: string; message?: string }> {
    try {
      const res = await fetch(`${API_BASE}/auth/admin-login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ passcode }),
      });
      const data = await res.json();
      if (data.success && data.token) {
        localStorage.setItem('nokri_admin_token', data.token);
      }
      return data;
    } catch (err) {
      console.error('API admin login error:', err);
      return { success: false, message: 'Server connection failed' };
    }
  },

  async verifyAdminToken(): Promise<boolean> {
    const token = localStorage.getItem('nokri_admin_token');
    if (!token) return false;
    try {
      const res = await fetch(`${API_BASE}/auth/verify-admin`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      return data.success;
    } catch {
      return false;
    }
  },

  async changeAdminPasscode(newPasscode: string): Promise<{ success: boolean; message?: string }> {
    const token = localStorage.getItem('nokri_admin_token');
    try {
      const res = await fetch(`${API_BASE}/auth/admin-change-passcode`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ newPasscode }),
      });
      return await res.json();
    } catch (err) {
      return { success: false, message: 'Failed to update passcode' };
    }
  },

  // --- User Auth ---
  async registerUser(name: string, email: string, password: string): Promise<{ success: boolean; user?: UserProfile; token?: string; message?: string }> {
    try {
      const res = await fetch(`${API_BASE}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
      });
      const data = await res.json();
      if (data.success && data.token) {
        localStorage.setItem('nokri_user_token', data.token);
      }
      return data;
    } catch {
      return { success: false, message: 'Registration failed. Server unreachable.' };
    }
  },

  async loginUser(email: string, password: string): Promise<{ success: boolean; user?: UserProfile; token?: string; message?: string }> {
    try {
      const res = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (data.success && data.token) {
        localStorage.setItem('nokri_user_token', data.token);
      }
      return data;
    } catch {
      return { success: false, message: 'Login failed. Server unreachable.' };
    }
  },

  async deleteUserAccount(email?: string, password?: string): Promise<{ success: boolean; message?: string }> {
    const token = localStorage.getItem('nokri_user_token');
    try {
      const res = await fetch(`${API_BASE}/auth/delete-account`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ email, password }),
      });
      return await res.json();
    } catch (err) {
      console.error('API delete account error:', err);
      return { success: false, message: 'Failed to reach server. Please check your network connection.' };
    }
  },

  // --- Posts CRUD ---
  async fetchPosts(category?: string, search?: string): Promise<JobPost[]> {
    try {
      const params = new URLSearchParams();
      if (category && category !== 'all') params.append('category', category);
      if (search) params.append('search', search);

      const res = await fetch(`${API_BASE}/jobs?${params.toString()}`);
      const data = await res.json();
      if (data.success && Array.isArray(data.posts)) {
        return data.posts;
      }
    } catch (err) {
      console.warn('API fetch posts fallback to localStorage:', err);
    }
    return [];
  },

  async createPost(post: Partial<JobPost>): Promise<{ success: boolean; post?: JobPost; message?: string }> {
    const token = localStorage.getItem('nokri_admin_token');
    try {
      const res = await fetch(`${API_BASE}/jobs`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(post),
      });
      return await res.json();
    } catch (err) {
      return { success: false, message: 'Failed to create post' };
    }
  },

  async updatePost(id: string, post: Partial<JobPost>): Promise<{ success: boolean; post?: JobPost; message?: string }> {
    const token = localStorage.getItem('nokri_admin_token');
    try {
      const res = await fetch(`${API_BASE}/jobs/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(post),
      });
      return await res.json();
    } catch (err) {
      return { success: false, message: 'Failed to update post' };
    }
  },

  async deletePost(id: string): Promise<{ success: boolean; message?: string }> {
    const token = localStorage.getItem('nokri_admin_token');
    try {
      const res = await fetch(`${API_BASE}/jobs/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      return await res.json();
    } catch (err) {
      return { success: false, message: 'Failed to delete post' };
    }
  },

  async resetPosts(): Promise<{ success: boolean; posts?: JobPost[]; message?: string }> {
    const token = localStorage.getItem('nokri_admin_token');
    try {
      const res = await fetch(`${API_BASE}/jobs/reset`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
      return await res.json();
    } catch (err) {
      return { success: false, message: 'Failed to reset posts' };
    }
  },

  async incrementViews(id: string): Promise<void> {
    try {
      await fetch(`${API_BASE}/jobs/${id}`);
    } catch {
      // ignore
    }
  },

  // --- Comments ---
  async fetchComments(jobId?: string): Promise<JobComment[]> {
    try {
      const url = jobId ? `${API_BASE}/comments?jobId=${jobId}` : `${API_BASE}/comments`;
      const res = await fetch(url);
      const data = await res.json();
      if (data.success && Array.isArray(data.comments)) {
        return data.comments;
      }
    } catch (err) {
      console.warn('API fetch comments error:', err);
    }
    return [];
  },

  async addComment(comment: { jobId: string; userName: string; userEmail?: string; content: string }): Promise<JobComment | null> {
    try {
      const res = await fetch(`${API_BASE}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(comment),
      });
      const data = await res.json();
      if (data.success && data.comment) {
        return data.comment;
      }
    } catch (err) {
      console.error('API add comment error:', err);
    }
    return null;
  },

  async deleteComment(commentId: string): Promise<boolean> {
    const token = localStorage.getItem('nokri_admin_token');
    try {
      const res = await fetch(`${API_BASE}/comments/${commentId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      return !!data.success;
    } catch {
      return false;
    }
  },

  // --- Subscribers ---
  async subscribe(email: string): Promise<{ success: boolean; message: string }> {
    try {
      const res = await fetch(`${API_BASE}/subscribers`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      return await res.json();
    } catch {
      return { success: false, message: 'Network error. Try again.' };
    }
  },

  async getSubscribers(): Promise<Array<{ id: string; email: string; createdAt: string }>> {
    const token = localStorage.getItem('nokri_admin_token');
    try {
      const res = await fetch(`${API_BASE}/subscribers`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      return data.subscribers || [];
    } catch {
      return [];
    }
  },

  // --- AdSense ---
  async getAdSense(): Promise<AdSenseSettings> {
    try {
      const res = await fetch(`${API_BASE}/adsense`);
      const data = await res.json();
      if (data.success && data.settings) {
        return data.settings;
      }
    } catch {
      // fallback
    }
    return { enabled: true, publisherId: 'ca-pub-9876543210987654', autoAds: true };
  },

  async updateAdSense(settings: Partial<AdSenseSettings>): Promise<boolean> {
    const token = localStorage.getItem('nokri_admin_token');
    try {
      const res = await fetch(`${API_BASE}/adsense`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(settings),
      });
      const data = await res.json();
      return !!data.success;
    } catch {
      return false;
    }
  },
};
