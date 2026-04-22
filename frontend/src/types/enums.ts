export const UserRole = {
  Student: 'student',
  HR: 'hr',
  Admin: 'admin',
} as const;
export type UserRole = (typeof UserRole)[keyof typeof UserRole];

// БД: pending | accepted | rejected  (нет 'reviewed')
export const ApplicationStatus = {
  Pending:  'pending',
  Accepted: 'accepted',
  Rejected: 'rejected',
} as const;
export type ApplicationStatus = (typeof ApplicationStatus)[keyof typeof ApplicationStatus];

// БД: pending | published | closed | rejected  (нет 'draft')
export const InternshipStatus = {
  Pending:   'pending',
  Published: 'published',
  Closed:    'closed',
  Rejected:  'rejected',
} as const;
export type InternshipStatus = (typeof InternshipStatus)[keyof typeof InternshipStatus];

// БД: remote | office | hybrid  (нет 'onsite')
export const InternshipType = {
  Remote: 'remote',
  Office: 'office',
  Hybrid: 'hybrid',
} as const;
export type InternshipType = (typeof InternshipType)[keyof typeof InternshipType];
