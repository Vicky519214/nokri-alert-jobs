import fs from 'fs';
import path from 'path';
import bcrypt from 'bcryptjs';
import { JobPost, JobComment } from '../src/types';
import { INITIAL_JOB_POSTS } from '../src/data/initialPosts';

export interface UserRecord {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  savedAlertsEnabled: boolean;
  createdAt: string;
}

export interface SubscriberRecord {
  id: string;
  email: string;
  createdAt: string;
}

export interface AdSenseConfig {
  enabled: boolean;
  publisherId: string;
  autoAds: boolean;
}

export interface DatabaseSchema {
  posts: JobPost[];
  comments: JobComment[];
  subscribers: SubscriberRecord[];
  users: UserRecord[];
  adminPassHash: string;
  adsenseSettings: AdSenseConfig;
}

const DB_FILE_PATH = path.join(process.cwd(), 'data', 'db.json');

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

const DEFAULT_ADSENSE: AdSenseConfig = {
  enabled: true,
  publisherId: 'ca-pub-9876543210987654',
  autoAds: true,
};

function ensureDataDirectory() {
  const dir = path.dirname(DB_FILE_PATH);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

export function readDB(): DatabaseSchema {
  ensureDataDirectory();
  if (!fs.existsSync(DB_FILE_PATH)) {
    const defaultAdminHash = bcrypt.hashSync('admin123', 10);
    const initialDB: DatabaseSchema = {
      posts: INITIAL_JOB_POSTS,
      comments: DEFAULT_COMMENTS,
      subscribers: [
        { id: 'sub-1', email: 'alert.demo@nokrialert.in', createdAt: new Date().toISOString() },
      ],
      users: [],
      adminPassHash: defaultAdminHash,
      adsenseSettings: DEFAULT_ADSENSE,
    };
    fs.writeFileSync(DB_FILE_PATH, JSON.stringify(initialDB, null, 2), 'utf-8');
    return initialDB;
  }

  try {
    const raw = fs.readFileSync(DB_FILE_PATH, 'utf-8');
    const data = JSON.parse(raw) as DatabaseSchema;
    
    // Ensure fallback properties exist
    if (!data.posts) data.posts = INITIAL_JOB_POSTS;
    if (!data.comments) data.comments = DEFAULT_COMMENTS;
    if (!data.subscribers) data.subscribers = [];
    if (!data.users) data.users = [];
    if (!data.adminPassHash) data.adminPassHash = bcrypt.hashSync('admin123', 10);
    if (!data.adsenseSettings) data.adsenseSettings = DEFAULT_ADSENSE;

    return data;
  } catch (err) {
    console.error('Error reading database file, resetting to fallback structure:', err);
    const defaultAdminHash = bcrypt.hashSync('admin123', 10);
    const fallbackDB: DatabaseSchema = {
      posts: INITIAL_JOB_POSTS,
      comments: DEFAULT_COMMENTS,
      subscribers: [],
      users: [],
      adminPassHash: defaultAdminHash,
      adsenseSettings: DEFAULT_ADSENSE,
    };
    fs.writeFileSync(DB_FILE_PATH, JSON.stringify(fallbackDB, null, 2), 'utf-8');
    return fallbackDB;
  }
}

export function writeDB(data: DatabaseSchema): void {
  ensureDataDirectory();
  try {
    const tempPath = `${DB_FILE_PATH}.tmp`;
    fs.writeFileSync(tempPath, JSON.stringify(data, null, 2), 'utf-8');
    fs.renameSync(tempPath, DB_FILE_PATH);
  } catch (err) {
    console.error('Failed to write database file:', err);
  }
}
