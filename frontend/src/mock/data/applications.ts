import { ApplicationStatus } from '@/types/enums';
import type { Application } from '@/types/models';

export const mockApplications: Application[] = [
  {
    id: 'a1',
    internshipId: 'i1',
    studentId: 'u1',
    coverLetter:
      'Здравствуйте! Я студентка 3 курса Nazarbayev University по специальности Computer Science. У меня есть опыт работы с React и TypeScript на учебных проектах. Очень хочу применить свои знания в Kaspi.kz.',
    resumeUrl: 'resume_aidana.pdf',
    status: ApplicationStatus.Pending,
    appliedAt: '2026-02-20T10:00:00Z',
  },
  {
    id: 'a2',
    internshipId: 'i2',
    studentId: 'u3',
    coverLetter:
      'Я изучаю Data Science в КазНУ и активно работаю с Python и SQL. Хочу получить практический опыт анализа данных в крупной компании.',
    resumeUrl: 'resume_dana.pdf',
    status: ApplicationStatus.Accepted,
    appliedAt: '2026-02-15T14:00:00Z',
    reviewedAt: '2026-02-25T10:00:00Z',
    feedback: 'Отличный кандидат! Добро пожаловать в команду.',
  },
  {
    id: 'a3',
    internshipId: 'i3',
    studentId: 'u2',
    coverLetter:
      'Я студент КБТУ, специализируюсь на мобильной разработке. Имею опыт создания Android-приложений на Kotlin. Мечтаю стажироваться в Kolesa Group.',
    resumeUrl: 'resume_arman.pdf',
    status: ApplicationStatus.Reviewed,
    appliedAt: '2026-02-18T09:00:00Z',
    reviewedAt: '2026-03-01T11:00:00Z',
  },
  {
    id: 'a4',
    internshipId: 'i4',
    studentId: 'u4',
    coverLetter:
      'Здравствуйте! Я full-stack разработчик из SDU. Имею опыт работы с Node.js и PostgreSQL. Готов к новым вызовам в backend-разработке.',
    resumeUrl: 'resume_nursultan.pdf',
    status: ApplicationStatus.Pending,
    appliedAt: '2026-02-22T16:00:00Z',
  },
  {
    id: 'a5',
    internshipId: 'i1',
    studentId: 'u4',
    coverLetter:
      'Также подаю заявку на фронтенд-стажировку. Имею опыт работы с React и TypeScript, создавал SPA-приложения в рамках университетских проектов.',
    resumeUrl: 'resume_nursultan.pdf',
    status: ApplicationStatus.Rejected,
    appliedAt: '2026-02-21T10:00:00Z',
    reviewedAt: '2026-03-01T09:00:00Z',
    feedback: 'К сожалению, мы выбрали другого кандидата. Рекомендуем подать заявку в следующем семестре.',
  },
  {
    id: 'a6',
    internshipId: 'i9',
    studentId: 'u3',
    coverLetter:
      'Имею опыт работы с PyTorch и TensorFlow, выполняла проекты по NLP в рамках курсовой работы. Очень заинтересована в стажировке по ML.',
    resumeUrl: 'resume_dana.pdf',
    status: ApplicationStatus.Pending,
    appliedAt: '2026-03-01T08:00:00Z',
  },
  {
    id: 'a7',
    internshipId: 'i10',
    studentId: 'u1',
    coverLetter:
      'Хочу расширить свой опыт до full-stack разработки. Знаю React и готова освоить Node.js и PostgreSQL.',
    resumeUrl: 'resume_aidana.pdf',
    status: ApplicationStatus.Pending,
    appliedAt: '2026-03-02T12:00:00Z',
  },
  {
    id: 'a8',
    internshipId: 'i7',
    studentId: 'u4',
    coverLetter:
      'Увлекаюсь DevOps и облачными технологиями. Имею опыт работы с Docker и базовые знания Kubernetes.',
    resumeUrl: 'resume_nursultan.pdf',
    status: ApplicationStatus.Accepted,
    appliedAt: '2026-02-25T11:00:00Z',
    reviewedAt: '2026-03-03T14:00:00Z',
    feedback: 'Поздравляем! Ждём вас на стажировке.',
  },
];
