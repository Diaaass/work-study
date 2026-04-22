import type { UserRole, ApplicationStatus, InternshipStatus, InternshipType } from './enums';

export interface WorkExperience {
  id: string;
  company: string;
  position: string;
  description: string;
  startDate: string;   // "YYYY-MM"
  endDate: string;     // "YYYY-MM" или "" если current
  current: boolean;
}

export interface CvLanguage {
  id: string;
  name: string;   // "English"
  level: string;  // "C1 — Advanced"
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  avatarUrl?: string;
  // Общие поля
  telegramId?: string;
  phone?: string;
  bio?: string;
  skills?: string[];
  // Студент
  university?: string;
  major?: string;
  graduationYear?: number;
  gpa?: number;
  resumeUrl?: string;
  cvExperience?: WorkExperience[];
  cvLanguages?: CvLanguage[];
  // HR
  company?: string;
  isBlocked?: boolean;
  isVerified?: boolean;
  createdAt: string;
}

export interface Internship {
  id: string;
  title: string;
  company: string;
  companyLogo?: string;
  city: string;             // поле в БД — city (не location)
  workType: InternshipType; // поле в БД — workType (не type)
  description: string;
  requirements: string[];
  skills: string[];
  salary?: number;          // Float в БД (не строка)
  duration?: string;
  deadline?: string;        // DateTime? → ISO string
  status: InternshipStatus;
  rejectionReason?: string;
  viewsCount?: number;
  applicantsCount?: number;
  matchScore?: number;      // вычисляемое, нет в БД
  postedById?: number;
  postedBy?: { id: number; name: string; email: string };
  _count?: { applications: number };
  createdAt: string;
  updatedAt?: string;
}

export interface InternshipStats {
  viewsCount: number;
  totalApplications: number;
  byStatus: { pending: number; accepted: number; rejected: number };
  applicationsByDay: { date: string; count: number }[];
}

export interface Application {
  id: string;
  internshipId: number;     // Int в БД
  internship?: Internship;
  studentId: number;        // Int в БД
  student?: User;
  coverLetter: string;
  resumeUrl?: string;
  status: ApplicationStatus;
  feedback?: string;
  createdAt: string;        // реальное поле в БД (не appliedAt)
  updatedAt?: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface SupportTicket {
  id: number;
  userId: number;
  user?: { id: number; name: string; email: string; role: string };
  subject: string;
  message: string;
  status: 'open' | 'resolved';
  adminReply?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ApiError {
  status: number;
  message: string;
  code?: string;
  email?: string;
  fieldErrors?: Record<string, string>;
}
