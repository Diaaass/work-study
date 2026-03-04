# Work&Study

AI-driven internship matching platform for university students in Kazakhstan.

## Tech Stack

- **Frontend**: React 19 + TypeScript 5.9 + Vite 7
- **Styling**: CSS Modules with design tokens
- **Routing**: react-router-dom v7 (protected + role-based routes)
- **i18n**: react-i18next (Russian, English, Kazakh)
- **API**: Mock data layer (ready to swap for real backend)

## Getting Started

```bash
# Install dependencies
npm install

# Start dev server
npm run dev

# Production build
npm run build

# Preview production build
npm run preview
```

The app will be available at `http://localhost:5173`

## Test Accounts

| Email              | Password      | Role        |
|--------------------|---------------|-------------|
| student@test.com   | password123   | Student     |
| hr@test.com        | password123   | HR Manager  |
| admin@test.com     | password123   | Admin       |

## Project Structure

```
src/
  api/                 # API client + typed modules (auth, internships, applications, users)
  assets/              # Static assets
  components/
    layout/            # AppLayout, Header, Sidebar
    ui/                # Reusable UI kit (Button, Input, Card, Badge, Modal, Skeleton, Toast)
  context/             # AuthContext, ToastContext
  hooks/               # useAuth, useToast
  i18n/                # i18next config + locales (en, ru, kk)
  mock/                # Mock data + API handlers
  pages/
    auth/              # Login, Register
    student/           # Dashboard, Search, InternshipDetail, ApplicationForm, MyApplications, Profile
    hr/                # PostInternship, MyInternships, Applicants
    admin/             # Users, Moderation
  router/              # Route definitions, ProtectedRoute, RoleRoute
  styles/              # Design tokens (variables.css), global styles
  types/               # TypeScript types and enums
  utils/               # Validation, date formatting helpers
```

## Features

### Student
- AI-powered internship recommendations (ranked by match score)
- Search with filters (city, work type, skills)
- Internship detail pages with full info
- Application form with cover letter
- Application tracking with status badges
- Profile management with skills

### HR Manager
- Post internships with requirements and skills
- Manage listings (publish, close)
- Review applicants (accept/reject with feedback)

### Admin
- Users management table (search, filter, block/unblock)
- Internship moderation queue (approve/reject)

## Design System

Inspired by hh.ru (HeadHunter) — clean, professional job board aesthetic.

- **Primary**: #2557A7 | **Hover**: #1A4285
- **Background**: #FFFFFF | **Surface**: #F5F7FA
- **Text**: #0D1B2A | **Secondary text**: #6B7A99
- **Success**: #17A05E | **Error**: #D9360B
- **Font**: Inter, 14-16px
- **Cards**: 8px radius, subtle shadow
- **Mobile-first** responsive design

## API Integration

The frontend uses a mock API layer in `src/mock/handlers.ts`. To connect a real backend:

1. Update `src/api/client.ts` to make real `fetch()` calls instead of importing mock handlers
2. Set the `API_BASE_URL` environment variable
3. All API modules (`src/api/*.ts`) remain unchanged — they use typed interfaces

## i18n

Three languages supported:
- **Russian** (default fallback)
- **English**
- **Kazakh**

Translation files are in `src/i18n/locales/{lang}/`. Namespaces: `common`, `auth`, `student`, `hr`, `admin`.
