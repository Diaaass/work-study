import type { UserRole, ApplicationStatus, InternshipStatus, InternshipType } from './enums';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  avatar?: string;
  university?: string;
  major?: string;
  graduationYear?: number;
  company?: string;
  phone?: string;
  telegramId?: string;
  bio?: string;
  skills?: string[];
  resumeUrl?: string;
  isBlocked?: boolean;
  createdAt: string;
}

export interface Internship {
  id: string;
  title: string;
  company: string;
  companyLogo?: string;
  location: string;
  type: InternshipType;
  description: string;
  requirements: string[];
  skills: string[];
  salary?: string;
  duration: string;
  deadline: string;
  postedBy: string;
  status: InternshipStatus;
  isApproved: boolean;
  applicantsCount: number;
  createdAt: string;
  matchScore?: number;
}

export interface Application {
  id: string;
  internshipId: string;
  internship?: Internship;
  studentId: string;
  student?: User;
  coverLetter: string;
  resumeUrl: string;
  status: ApplicationStatus;
  feedback?: string;
  appliedAt: string;
  reviewedAt?: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface ApiError {
  status: number;
  message: string;
  fieldErrors?: Record<string, string>;
}
