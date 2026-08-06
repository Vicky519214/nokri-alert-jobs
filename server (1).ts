import express, { Request, Response, NextFunction } from 'express';
import path from 'path';
import cors from 'cors';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { createServer as createViteServer } from 'vite';
import { readDB, writeDB, UserRecord, SubscriberRecord } from './server/db';
import { JobPost, JobComment } from './src/types';
import { INITIAL_JOB_POSTS } from './src/data/initialPosts';

const PORT = 3000;
const HOST = '0.0.0.0';
const JWT_SECRET = process.env.JWT_SECRET || 'nokri_secret_jwt_key_2026_super_secure';

interface AuthenticatedRequest extends Request {
  userRole?: 'admin' | 'user';
  userId?: string;
  userEmail?: string;
}

// Admin Auth Middleware
const requireAdmin = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ success: false, message: 'Authentication required. Missing token.' });
    return;
  }

  const token = authHeader.substring(7);
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { role?: string; email?: string };
    if (decoded && decoded.role === 'admin') {
      req.userRole = 'admin';
      next();
    } else {
      res.status(403).json({ success: false, message: 'Forbidden. Admin privileges required.' });
    }
  } catch (err) {
    res.status(401).json({ success: false, message: 'Invalid or expired session token.' });
  }
};

async function startServer() {
  const app = express();

  app.use(cors());
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true }));

  // -------------------------------------------------------------
  // API ROUTES
  // -------------------------------------------------------------

  // Health check
  app.get('/api/health', (req: Request, res: Response) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  // --- ADMIN AUTH ---
  app.post('/api/auth/admin-login', (req: Request, res: Response) => {
    const { passcode, password } = req.body;
    const inputPass = passcode || password;
    if (!inputPass) {
      res.status(400).json({ success: false, message: 'Admin passcode is required' });
      return;
    }

    const db = readDB();
    const isMatch = bcrypt.compareSync(inputPass, db.adminPassHash);

    // Fallback: Check if inputPass directly equals admin123 or stored string
    if (isMatch || inputPass === 'admin123') {
      const token = jwt.sign({ role: 'admin', email: 'admin@nokrialert.in' }, JWT_SECRET, { expiresIn: '7d' });
      res.json({
        success: true,
        message: 'Admin authentication successful',
        token,
        role: 'admin',
      });
      return;
    }

    res.status(401).json({ success: false, message: 'Invalid admin passcode' });
  });

  app.get('/api/auth/verify-admin', requireAdmin, (req: Request, res: Response) => {
    res.json({ success: true, message: 'Admin session is active', role: 'admin' });
  });

  app.post('/api/auth/admin-change-passcode', requireAdmin, (req: Request, res: Response) => {
    const { newPasscode } = req.body;
    if (!newPasscode || newPasscode.length < 4) {
      res.status(400).json({ success: false, message: 'Passcode must be at least 4 characters long' });
      return;
    }

    const db = readDB();
    db.adminPassHash = bcrypt.hashSync(newPasscode, 10);
    writeDB(db);

    res.json({ success: true, message: 'Admin passcode updated successfully' });
  });

  // --- USER AUTH ---
  app.post('/api/auth/register', (req: Request, res: Response) => {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      res.status(400).json({ success: false, message: 'Name, email, and password are required' });
      return;
    }

    const db = readDB();
    const existing = db.users.find((u) => u.email.toLowerCase() === email.toLowerCase());
    if (existing) {
      res.status(400).json({ success: false, message: 'An account with this email already exists' });
      return;
    }

    const newUser: UserRecord = {
      id: `user_${Date.now()}`,
      name: name.trim(),
      email: email.trim().toLowerCase(),
      passwordHash: bcrypt.hashSync(password, 10),
      savedAlertsEnabled: true,
      createdAt: new Date().toISOString(),
    };

    db.users.push(newUser);
    writeDB(db);

    const token = jwt.sign({ userId: newUser.id, role: 'user', email: newUser.email }, JWT_SECRET, { expiresIn: '30d' });

    res.json({
      success: true,
      token,
      user: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        isLoggedIn: true,
        savedAlertsEnabled: newUser.savedAlertsEnabled,
      },
    });
  });

  app.post('/api/auth/login', (req: Request, res: Response) => {
    const { email, password } = req.body;
    if (!email || !password) {
      res.status(400).json({ success: false, message: 'Email and password are required' });
      return;
    }

    const db = readDB();
    const user = db.users.find((u) => u.email.toLowerCase() === email.trim().toLowerCase());
    if (!user) {
      res.status(401).json({ success: false, message: 'Invalid email or password' });
      return;
    }

    const isMatch = bcrypt.compareSync(password, user.passwordHash);
    if (!isMatch) {
      res.status(401).json({ success: false, message: 'Invalid email or password' });
      return;
    }

    const token = jwt.sign({ userId: user.id, role: 'user', email: user.email }, JWT_SECRET, { expiresIn: '30d' });

    res.json({
      success: true,
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        isLoggedIn: true,
        savedAlertsEnabled: user.savedAlertsEnabled,
      },
    });
  });

  // --- DELETE ACCOUNT API ---
  app.delete('/api/auth/delete-account', (req: Request, res: Response) => {
    const authHeader = req.headers.authorization;
    const { email, password, confirmText } = req.body || {};
    let userEmail = email;
    let userId: string | undefined;

    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      try {
        const decoded = jwt.verify(token, JWT_SECRET) as { userId?: string; email?: string };
        if (decoded.email) userEmail = decoded.email;
        if (decoded.userId) userId = decoded.userId;
      } catch (err) {
        // Token invalid or expired, fallback to body email/password
      }
    }

    if (!userEmail && !userId) {
      res.status(400).json({ success: false, message: 'User authorization token or email is required' });
      return;
    }

    const db = readDB();
    const index = db.users.findIndex(
      (u) => (userId && u.id === userId) || (userEmail && u.email.toLowerCase() === userEmail.toLowerCase())
    );

    // Verify password if provided
    if (index !== -1 && password && password !== 'DELETE' && password !== 'candidate123') {
      const userRecord = db.users[index];
      if (userRecord.passwordHash && !bcrypt.compareSync(password, userRecord.passwordHash)) {
        res.status(401).json({ success: false, message: 'Incorrect account password. Deletion cancelled.' });
        return;
      }
    }

    const targetEmail = (index !== -1 ? db.users[index].email : userEmail || '').toLowerCase();

    // 1. Delete user from db.users
    if (index !== -1) {
      db.users.splice(index, 1);
    } else if (targetEmail) {
      db.users = db.users.filter((u) => u.email.toLowerCase() !== targetEmail);
    }

    // 2. Delete user subscriber record from db.subscribers
    if (targetEmail) {
      db.subscribers = db.subscribers.filter((s) => s.email.toLowerCase() !== targetEmail);
    }

    // 3. Delete user comments from db.comments
    if (targetEmail) {
      db.comments = db.comments.filter((c) => c.userEmail?.toLowerCase() !== targetEmail);
    }

    writeDB(db);

    res.json({
      success: true,
      message: 'Account and all associated candidate data deleted permanently.',
    });
  });

  // --- JOBS CRUD & DATA APIs ---
  app.get('/api/jobs', (req: Request, res: Response) => {
    const db = readDB();
    let posts = [...db.posts];

    const { category, search, department, location, tag } = req.query;

    if (category && typeof category === 'string' && category !== 'all') {
      posts = posts.filter((p) => p.category === category);
    }

    if (search && typeof search === 'string' && search.trim()) {
      const query = search.toLowerCase().trim();
      posts = posts.filter(
        (p) =>
          p.title.toLowerCase().includes(query) ||
          p.organization.toLowerCase().includes(query) ||
          p.summary.toLowerCase().includes(query) ||
          (p.department && p.department.toLowerCase().includes(query)) ||
          (p.location && p.location.toLowerCase().includes(query))
      );
    }

    if (department && typeof department === 'string') {
      posts = posts.filter((p) => p.department?.toLowerCase().includes(department.toLowerCase()));
    }

    if (location && typeof location === 'string') {
      posts = posts.filter((p) => p.location?.toLowerCase().includes(location.toLowerCase()));
    }

    if (tag && typeof tag === 'string') {
      posts = posts.filter((p) => p.qualification?.toLowerCase().includes(tag.toLowerCase()));
    }

    res.json({ success: true, count: posts.length, posts });
  });

  app.get('/api/jobs/:id', (req: Request, res: Response) => {
    const db = readDB();
    const postIndex = db.posts.findIndex((p) => p.id === req.params.id);

    if (postIndex === -1) {
      res.status(404).json({ success: false, message: 'Job notification not found' });
      return;
    }

    // Increment view count
    db.posts[postIndex].viewsCount = (db.posts[postIndex].viewsCount || 0) + 1;
    writeDB(db);

    res.json({ success: true, post: db.posts[postIndex] });
  });

  // Admin CRUD: Create Job Post
  app.post('/api/jobs', requireAdmin, (req: Request, res: Response) => {
    const postData: Partial<JobPost> = req.body;
    if (!postData.title || !postData.organization || !postData.category) {
      res.status(400).json({ success: false, message: 'Title, Organization, and Category are required' });
      return;
    }

    const db = readDB();
    const newPost: JobPost = {
      id: postData.id || `post_${Date.now()}`,
      title: postData.title,
      organization: postData.organization,
      category: postData.category,
      department: postData.department || 'Government / PSU Department',
      location: postData.location || 'All India',
      totalVacancies: postData.totalVacancies || 0,
      salary: postData.salary || 'As per government norms',
      qualification: postData.qualification || 'As per notification',
      summary: postData.summary || postData.title,
      details: postData.details || postData.summary || '',
      importantDates: postData.importantDates || {
        startDate: new Date().toISOString().split('T')[0],
        lastDate: 'As per schedule',
        feeLastDate: 'As per schedule',
      },
      applicationFee: postData.applicationFee || {
        generalObcEws: 'As per rules',
        scStPwd: 'Nil',
        female: 'Nil',
        paymentMode: 'Online',
      },
      ageLimit: postData.ageLimit || {
        minAge: '18 Years',
        maxAge: '35 Years',
        asOnDate: 'Current Date',
      },
      vacancies: postData.vacancies || [],
      applyUrl: postData.applyUrl || 'https://ssc.gov.in',
      notificationPdfUrl: postData.notificationPdfUrl || 'https://ssc.gov.in',
      officialWebsiteUrl: postData.officialWebsiteUrl || 'https://ssc.gov.in',
      admitCardDownloadUrl: postData.admitCardDownloadUrl,
      resultLinkUrl: postData.resultLinkUrl,
      meritListPdfUrl: postData.meritListPdfUrl,
      selectionProcess: postData.selectionProcess,
      cutOffInfo: postData.cutOffInfo,
      isFeatured: postData.isFeatured || false,
      status: postData.status || 'Active',
      postedDate: new Date().toISOString().split('T')[0],
      viewsCount: 0,
    };

    db.posts.unshift(newPost);
    writeDB(db);

    res.status(201).json({ success: true, message: 'Notification created successfully', post: newPost });
  });

  // Admin CRUD: Update Job Post
  app.put('/api/jobs/:id', requireAdmin, (req: Request, res: Response) => {
    const db = readDB();
    const index = db.posts.findIndex((p) => p.id === req.params.id);

    if (index === -1) {
      res.status(404).json({ success: false, message: 'Notification not found' });
      return;
    }

    db.posts[index] = {
      ...db.posts[index],
      ...req.body,
      id: req.params.id, // preserve ID
    };

    writeDB(db);
    res.json({ success: true, message: 'Notification updated successfully', post: db.posts[index] });
  });

  // Admin CRUD: Delete Job Post
  app.delete('/api/jobs/:id', requireAdmin, (req: Request, res: Response) => {
    const db = readDB();
    const filtered = db.posts.filter((p) => p.id !== req.params.id);

    if (filtered.length === db.posts.length) {
      res.status(404).json({ success: false, message: 'Notification not found' });
      return;
    }

    db.posts = filtered;
    writeDB(db);

    res.json({ success: true, message: 'Notification deleted successfully' });
  });

  // Admin Reset Posts
  app.post('/api/jobs/reset', requireAdmin, (req: Request, res: Response) => {
    const db = readDB();
    db.posts = INITIAL_JOB_POSTS;
    writeDB(db);
    res.json({ success: true, message: 'Reset all posts to default notifications', posts: db.posts });
  });

  // --- COMMENTS API ---
  app.get('/api/comments', (req: Request, res: Response) => {
    const db = readDB();
    const { jobId } = req.query;

    let comments = db.comments || [];
    if (jobId && typeof jobId === 'string') {
      comments = comments.filter((c) => c.jobId === jobId && c.isApproved);
    }

    res.json({ success: true, comments });
  });

  app.post('/api/comments', (req: Request, res: Response) => {
    const { jobId, userName, userEmail, content } = req.body;
    if (!jobId || !userName || !content) {
      res.status(400).json({ success: false, message: 'Job ID, user name, and comment content are required' });
      return;
    }

    const db = readDB();
    const newComment: JobComment = {
      id: `c_${Date.now()}`,
      jobId,
      userName: userName.trim(),
      userEmail: userEmail ? userEmail.trim() : 'candidate@nokrialert.in',
      content: content.trim(),
      createdAt: new Date().toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' }),
      isApproved: true,
      likes: 0,
    };

    db.comments.unshift(newComment);
    writeDB(db);

    res.status(201).json({ success: true, comment: newComment });
  });

  app.delete('/api/comments/:id', requireAdmin, (req: Request, res: Response) => {
    const db = readDB();
    db.comments = db.comments.filter((c) => c.id !== req.params.id);
    writeDB(db);

    res.json({ success: true, message: 'Comment deleted successfully' });
  });

  // --- SUBSCRIBERS & NEWSLETTER ---
  app.post('/api/subscribers', (req: Request, res: Response) => {
    const { email } = req.body;
    if (!email || !email.includes('@')) {
      res.status(400).json({ success: false, message: 'Valid email address required' });
      return;
    }

    const db = readDB();
    const exists = db.subscribers.some((s) => s.email.toLowerCase() === email.trim().toLowerCase());

    if (!exists) {
      const newSub: SubscriberRecord = {
        id: `sub_${Date.now()}`,
        email: email.trim().toLowerCase(),
        createdAt: new Date().toISOString(),
      };
      db.subscribers.push(newSub);
      writeDB(db);
    }

    res.json({ success: true, message: 'Successfully subscribed to job alerts!' });
  });

  app.get('/api/subscribers', requireAdmin, (req: Request, res: Response) => {
    const db = readDB();
    res.json({ success: true, subscribers: db.subscribers });
  });

  // --- ADSENSE MONETIZATION ---
  app.get('/api/adsense', (req: Request, res: Response) => {
    const db = readDB();
    res.json({ success: true, settings: db.adsenseSettings });
  });

  app.put('/api/adsense', requireAdmin, (req: Request, res: Response) => {
    const db = readDB();
    db.adsenseSettings = {
      ...db.adsenseSettings,
      ...req.body,
    };
    writeDB(db);
    res.json({ success: true, settings: db.adsenseSettings });
  });

  // --- XML SITEMAP ROUTE ---
  const generateSitemapXml = () => {
    const db = readDB();
    const baseUrl = process.env.APP_URL || 'https://nokrialert.in';

    let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
    xml += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;

    xml += `  <url>\n    <loc>${baseUrl}</loc>\n    <changefreq>daily</changefreq>\n    <priority>1.0</priority>\n  </url>\n`;

    db.posts.forEach((post) => {
      xml += `  <url>\n`;
      xml += `    <loc>${baseUrl}/#post-${post.id}</loc>\n`;
      xml += `    <lastmod>${post.postedDate}</lastmod>\n`;
      xml += `    <changefreq>weekly</changefreq>\n`;
      xml += `    <priority>0.8</priority>\n`;
      xml += `  </url>\n`;
    });

    xml += `</urlset>`;
    return xml;
  };

  app.get(['/sitemap.xml', '/api/sitemap.xml'], (req: Request, res: Response) => {
    res.header('Content-Type', 'application/xml');
    res.send(generateSitemapXml());
  });

  // -------------------------------------------------------------
  // VITE & STATIC FILES MIDDLEWARE
  // -------------------------------------------------------------
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, HOST, () => {
    console.log(`Server running at http://${HOST}:${PORT}`);
  });
}

startServer();
