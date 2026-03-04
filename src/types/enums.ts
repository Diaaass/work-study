export const UserRole = {
  Student: 'student',
  HR: 'hr',
  Admin: 'admin',
} as const;
export type UserRole = (typeof UserRole)[keyof typeof UserRole];

export const ApplicationStatus = {
  Pending: 'pending',
  Reviewed: 'reviewed',
  Accepted: 'accepted',
  Rejected: 'rejected',
} as const;
export type ApplicationStatus = (typeof ApplicationStatus)[keyof typeof ApplicationStatus];

export const InternshipStatus = {
  Draft: 'draft',
  Published: 'published',
  Closed: 'closed',
} as const;
export type InternshipStatus = (typeof InternshipStatus)[keyof typeof InternshipStatus];

export const InternshipType = {
  Remote: 'remote',
  Onsite: 'onsite',
  Hybrid: 'hybrid',
} as const;
export type InternshipType = (typeof InternshipType)[keyof typeof InternshipType];
