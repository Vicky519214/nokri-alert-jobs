export type CategoryType =
  | 'govt_jobs'
  | 'private_jobs'
  | 'admit_card'
  | 'results'
  | 'syllabus'
  | 'admission'
  | 'scholarship'
  | 'job_news'
  | 'upcoming_exams';

export type LanguageType = 'en' | 'hi' | 'bn';

export interface ImportantDates {
  startDate: string;
  lastDate: string;
  feeLastDate?: string;
  examDate?: string;
  admitCardDate?: string;
  resultDate?: string;
}

export interface ApplicationFee {
  generalObcEws: string;
  scStPwd: string;
  female: string;
  paymentMode: string;
}

export interface AgeLimit {
  minAge: string;
  maxAge: string;
  asOnDate?: string;
  relaxationDetails?: string;
}

export interface VacancyBreakdown {
  postName: string;
  totalPosts: number;
  eligibility: string;
}

export interface JobPost {
  id: string;
  title: string;
  organization: string;
  category: CategoryType;
  department?: string;
  location: string;
  totalVacancies: number;
  salary: string;
  qualification: string; // e.g. '10th', '12th', 'Graduate', 'Post Graduate', 'Diploma', 'Engineering'
  summary: string;
  details: string; // Detailed description / Markdown
  importantDates: ImportantDates;
  applicationFee?: ApplicationFee;
  ageLimit?: AgeLimit;
  vacancies?: VacancyBreakdown[];
  
  // Action Links
  applyUrl: string;
  notificationPdfUrl: string;
  officialWebsiteUrl: string;
  syllabusPdfUrl?: string;
  admitCardDownloadUrl?: string;
  resultLinkUrl?: string;
  meritListPdfUrl?: string;
  
  // Specific Details for Jobs, Admit Cards, and Results
  selectionProcess?: string;
  cutOffInfo?: string;
  syllabusDetails?: string;
  faqs?: Array<{ question: string; answer: string }>;
  
  // Status & Meta
  isFeatured?: boolean;
  status: 'Active' | 'Closing Soon' | 'Expired';
  postedDate: string;
  updatedDate?: string;
  viewsCount?: number;
}

export interface FilterOptions {
  searchQuery: string;
  category: CategoryType | 'all';
  qualification: string;
  location: string;
  status: string;
  sortBy: 'newest' | 'closing_soon' | 'vacancies' | 'popular';
}

export type StaticPageType =
  | 'about'
  | 'contact'
  | 'privacy'
  | 'terms'
  | 'disclaimer'
  | 'cookie'
  | 'dmca';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  phone?: string;
  qualification?: string;
  targetCategory?: string;
  isLoggedIn: boolean;
  savedAlertsEnabled: boolean;
  role?: 'admin' | 'user';
  isAdmin?: boolean;
}

export interface JobComment {
  id: string;
  jobId: string;
  userName: string;
  userEmail?: string;
  content: string;
  createdAt: string;
  isApproved: boolean;
  likes: number;
}

export interface MockTestQuestion {
  id: string;
  question: string;
  options: string[];
  correctOptionIndex: number;
  explanation: string;
}

export interface MockTest {
  id: string;
  title: string;
  examType: string; // e.g., 'SSC CGL', 'UPSC CSE', 'RRB NTPC', 'SBI PO'
  totalQuestions: number;
  timeMinutes: number;
  questions: MockTestQuestion[];
}

export interface CurrentAffairArticle {
  id: string;
  title: string;
  date: string;
  category: 'National' | 'International' | 'Economy' | 'Science & Tech' | 'Sports';
  summary: string;
  keyPoints: string[];
}

export interface PdfNoteItem {
  id: string;
  title: string;
  examCategory: string;
  subject: string;
  fileSize: string;
  downloadUrl: string;
  year?: string;
  type: 'Note' | 'Previous Paper' | 'Syllabus';
}

export interface ExamCalendarItem {
  id: string;
  title: string;
  organization: string;
  category: CategoryType;
  examDate: string;
  admitCardDate?: string;
  lastDateToApply: string;
  officialLink: string;
}

export interface ResumeData {
  fullName: string;
  email: string;
  phone: string;
  address: string;
  dob: string;
  category: string;
  gender: string;
  education: Array<{
    degree: string;
    boardUniversity: string;
    passingYear: string;
    percentageMarks: string;
  }>;
  experience: Array<{
    organization: string;
    designation: string;
    duration: string;
    description: string;
  }>;
  skills: string;
  languages: string;
  declaration: string;
}
