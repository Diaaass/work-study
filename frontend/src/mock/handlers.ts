import { mockUsers } from './data/users';
import { mockInternships } from './data/internships';
import { mockApplications } from './data/applications';
import type { User, Internship, Application, ApiError } from '@/types/models';
import { ApplicationStatus, InternshipStatus, UserRole } from '@/types/enums';

// Mutable copies so changes persist during session
let users = [...mockUsers];
let internships = [...mockInternships];
let applications = [...mockApplications];

interface RequestOptions {
  method?: string;
  body?: unknown;
  headers?: Record<string, string>;
}

function throwError(status: number, message: string, fieldErrors?: Record<string, string>): never {
  const err: ApiError = { status, message, fieldErrors };
  throw err;
}

function getAuthUser(headers?: Record<string, string>): User {
  const authHeader = headers?.Authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throwError(401, 'Unauthorized');
  }
  const token = authHeader.replace('Bearer ', '');
  const userId = token.replace('mock-token-', '');
  const user = users.find((u) => u.id === userId);
  if (!user) {
    throwError(401, 'Invalid token');
  }
  return user;
}

function parseBody<T>(body: unknown): T {
  return body as T;
}

function populateApplication(app: Application): Application {
  return {
    ...app,
    internship: internships.find((i) => i.id === String((app as unknown as Record<string, unknown>).internshipId)),
    student: users.find((u) => u.id === String((app as unknown as Record<string, unknown>).studentId)),
  };
}

export async function handleRequest<T>(
  endpoint: string,
  options: RequestOptions = {},
): Promise<T> {
  const method = options.method || 'GET';
  const body = options.body;
  const headers = options.headers;

  // ===== AUTH =====
  if (endpoint === '/auth/login' && method === 'POST') {
    const { email, password } = parseBody<{ email: string; password: string }>(body);
    const user = users.find((u) => u.email === email);
    if (!user || password !== 'password123') {
      throwError(401, 'Неверный email или пароль');
    }
    const token = `mock-token-${user.id}`;
    return { token, user } as T;
  }

  if (endpoint === '/auth/register' && method === 'POST') {
    const data = parseBody<{ email: string; password: string; name: string; role: string; university?: string; major?: string; company?: string }>(body);
    if (users.find((u) => u.email === data.email)) {
      throwError(409, 'Пользователь с таким email уже существует', { email: 'Email уже занят' });
    }
    const newUser: User = {
      id: `u${users.length + 1}`,
      email: data.email,
      name: data.name,
      role: data.role as UserRole,
      university: data.university,
      major: data.major,
      company: data.company,
      skills: [],
      createdAt: new Date().toISOString(),
    };
    users.push(newUser);
    return { email: newUser.email, autoVerified: true } as T;
  }

  if (endpoint === '/auth/me' && method === 'GET') {
    const user = getAuthUser(headers);
    return user as T;
  }

  // ===== INTERNSHIPS =====
  if (endpoint === '/internships' && method === 'GET') {
    const published = internships.filter(
      (i) => i.status === InternshipStatus.Published,
    );
    return published as T;
  }

  if (endpoint === '/internships/recommended' && method === 'GET') {
    getAuthUser(headers);
    const published = internships
      .filter((i) => i.status === InternshipStatus.Published)
      .sort((a, b) => (b.matchScore || 0) - (a.matchScore || 0));
    return published as T;
  }

  if (endpoint === '/internships/my' && method === 'GET') {
    const user = getAuthUser(headers);
    if (user.role !== UserRole.HR) throwError(403, 'Доступ запрещён');
    const myInternships = internships.filter(
      (i) => String((i as unknown as Record<string, unknown>).postedById) === user.id,
    );
    return myInternships as T;
  }

  const internshipMatch = endpoint.match(/^\/internships\/([^/]+)$/);
  if (internshipMatch && method === 'GET') {
    const id = internshipMatch[1];
    const internship = internships.find((i) => i.id === id);
    if (!internship) throwError(404, 'Стажировка не найдена');
    return internship as T;
  }

  if (endpoint === '/internships' && method === 'POST') {
    const user = getAuthUser(headers);
    if (user.role !== UserRole.HR) throwError(403, 'Доступ запрещён');
    const data = parseBody<Record<string, unknown>>(body);
    const newInternship = {
      id: `i${internships.length + 1}`,
      title: String(data.title || ''),
      company: user.company || String(data.company || ''),
      city: String(data.city || data.location || ''),
      workType: String(data.workType || data.type || 'remote'),
      description: String(data.description || ''),
      requirements: (data.requirements as string[]) || [],
      skills: (data.skills as string[]) || [],
      salary: data.salary ? Number(data.salary) : undefined,
      duration: String(data.duration || ''),
      deadline: String(data.deadline || ''),
      postedById: Number(user.id.replace('u', '')) || 0,
      postedBy: { id: 0, name: user.name, email: user.email },
      status: InternshipStatus.Pending,
      applicantsCount: 0,
      createdAt: new Date().toISOString(),
    } as unknown as Internship;
    internships.push(newInternship);
    return newInternship as T;
  }

  const internshipUpdateMatch = endpoint.match(/^\/internships\/([^/]+)$/);
  if (internshipUpdateMatch && method === 'PUT') {
    getAuthUser(headers);
    const id = internshipUpdateMatch[1];
    const idx = internships.findIndex((i) => i.id === id);
    if (idx === -1) throwError(404, 'Стажировка не найдена');
    const data = parseBody<Partial<Internship>>(body);
    internships[idx] = { ...internships[idx], ...data };
    return internships[idx] as T;
  }

  // ===== APPLICATIONS =====
  if (endpoint === '/applications' && method === 'POST') {
    const user = getAuthUser(headers);
    if (user.role !== UserRole.Student) throwError(403, 'Доступ запрещён');
    const data = parseBody<{ internshipId: string; coverLetter: string; resumeUrl: string }>(body);

    const existing = applications.find(
      (a) =>
        String((a as unknown as Record<string, unknown>).internshipId) === String(data.internshipId) &&
        String((a as unknown as Record<string, unknown>).studentId) === user.id,
    );
    if (existing) throwError(409, 'Вы уже подали заявку на эту стажировку');

    const newApp = {
      id: `a${applications.length + 1}`,
      internshipId: data.internshipId,
      studentId: user.id,
      coverLetter: data.coverLetter,
      resumeUrl: data.resumeUrl,
      status: ApplicationStatus.Pending,
      createdAt: new Date().toISOString(),
    } as unknown as Application;
    applications.push(newApp);

    const intIdx = internships.findIndex((i) => i.id === String(data.internshipId));
    if (intIdx !== -1) internships[intIdx].applicantsCount = (internships[intIdx].applicantsCount || 0) + 1;

    return populateApplication(newApp) as T;
  }

  if (endpoint === '/applications/my' && method === 'GET') {
    const user = getAuthUser(headers);
    const myApps = applications
      .filter((a) => String((a as unknown as Record<string, unknown>).studentId) === user.id)
      .map(populateApplication);
    return myApps as T;
  }

  const applicantsMatch = endpoint.match(/^\/internships\/([^/]+)\/applicants$/);
  if (applicantsMatch && method === 'GET') {
    const user = getAuthUser(headers);
    if (user.role !== UserRole.HR && user.role !== UserRole.Admin) throwError(403, 'Доступ запрещён');
    const internshipId = applicantsMatch[1];
    const apps = applications
      .filter((a) => String((a as unknown as Record<string, unknown>).internshipId) === internshipId)
      .map(populateApplication);
    return apps as T;
  }

  const applicationUpdateMatch = endpoint.match(/^\/applications\/([^/]+)$/);
  if (applicationUpdateMatch && method === 'PUT') {
    const user = getAuthUser(headers);
    if (user.role !== UserRole.HR && user.role !== UserRole.Admin) throwError(403, 'Доступ запрещён');
    const id = applicationUpdateMatch[1];
    const idx = applications.findIndex((a) => a.id === id);
    if (idx === -1) throwError(404, 'Заявка не найдена');
    const data = parseBody<{ status: ApplicationStatus; feedback?: string }>(body);
    applications[idx] = {
      ...applications[idx],
      status: data.status,
      feedback: data.feedback,
      updatedAt: new Date().toISOString(),
    };
    return populateApplication(applications[idx]) as T;
  }

  // ===== USERS (Admin) =====
  if (endpoint === '/users' && method === 'GET') {
    const user = getAuthUser(headers);
    if (user.role !== UserRole.Admin) throwError(403, 'Доступ запрещён');
    return users as T;
  }

  const userUpdateMatch = endpoint.match(/^\/users\/([^/]+)$/);
  if (userUpdateMatch && method === 'PUT') {
    const adminUser = getAuthUser(headers);
    if (adminUser.role !== UserRole.Admin) throwError(403, 'Доступ запрещён');
    const id = userUpdateMatch[1];
    const idx = users.findIndex((u) => u.id === id);
    if (idx === -1) throwError(404, 'Пользователь не найден');
    const data = parseBody<Partial<User>>(body);
    users[idx] = { ...users[idx], ...data };
    return users[idx] as T;
  }

  // ===== PROFILE =====
  if (endpoint === '/profile' && method === 'PUT') {
    const user = getAuthUser(headers);
    const idx = users.findIndex((u) => u.id === user.id);
    const data = parseBody<Partial<User>>(body);
    users[idx] = { ...users[idx], ...data };
    return users[idx] as T;
  }

  // ===== MODERATION (Admin) =====
  if (endpoint === '/moderation/pending' && method === 'GET') {
    const user = getAuthUser(headers);
    if (user.role !== UserRole.Admin) throwError(403, 'Доступ запрещён');
    const pending = internships.filter((i) => i.status === InternshipStatus.Pending);
    return pending as T;
  }

  const moderationMatch = endpoint.match(/^\/moderation\/([^/]+)$/);
  if (moderationMatch && method === 'PUT') {
    const user = getAuthUser(headers);
    if (user.role !== UserRole.Admin) throwError(403, 'Доступ запрещён');
    const id = moderationMatch[1];
    const idx = internships.findIndex((i) => i.id === id);
    if (idx === -1) throwError(404, 'Стажировка не найдена');
    const data = parseBody<{ approved: boolean; status?: InternshipStatus; rejectionReason?: string }>(body);
    internships[idx] = {
      ...internships[idx],
      status: data.status || (data.approved ? InternshipStatus.Published : InternshipStatus.Rejected),
      rejectionReason: data.rejectionReason,
    };
    return internships[idx] as T;
  }

  throwError(404, `Endpoint not found: ${method} ${endpoint}`);
}
