<div align="center">

# JobNexus — Full-Stack Job Portal

**A modern, production-quality job portal connecting job seekers with top employers**

[![Live Demo](https://img.shields.io/badge/Live%20Demo-Vercel-000000?style=for-the-badge&logo=vercel)](https://job-nexus-full-stack-job-portal.vercel.app/)
[![Backend](https://img.shields.io/badge/Backend-Render-46E3B7?style=for-the-badge&logo=render)](https://jobnexus-full-stack-job-portal.onrender.com/api/health)

![Tech Stack](https://img.shields.io/badge/Frontend-React%2018%20%2B%20TypeScript-61dafb?style=flat-square&logo=react)
![Backend](https://img.shields.io/badge/Backend-Node.js%20%2B%20Express-339933?style=flat-square&logo=nodedotjs)
![Database](https://img.shields.io/badge/Database-PostgreSQL%20%2B%20Prisma-4169E1?style=flat-square&logo=postgresql)
![Auth](https://img.shields.io/badge/Auth-JWT-000000?style=flat-square&logo=jsonwebtokens)
![License](https://img.shields.io/badge/License-MIT-blue?style=flat-square)

</div>

---

## Table of Contents

- [Live Demo](#live-demo)
- [Features](#features)
- [Performance Optimizations](#performance-optimizations)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [API Reference](#api-reference)
- [Authentication & Password Reset](#authentication--password-reset)
- [Environment Variables](#environment-variables)
- [Deployment](#deployment)
- [Contributing](#contributing)

---

## Live Demo

| Service | URL |
|---|---|
| Frontend (Vercel) | https://job-nexus-full-stack-job-portal.vercel.app/ |
| Backend API (Render) | https://jobnexus-full-stack-job-portal.onrender.com/api/health |
| Database | Supabase PostgreSQL (Production) |

> The Render free tier spins down after inactivity — the first request may take up to 30 seconds to wake up.

---

## Features

### For Job Seekers
- Smart search with 400ms debounce — by title, keyword, or company
- Advanced filters — job type, location type, category, experience level
- Apply to jobs with a cover letter and resume link per application
- Real-time application tracker — pending, reviewed, shortlisted, hired, rejected
- Optimistic bookmark — save jobs instantly with no loading delay, reverts silently on error
- Profile management — skill tags, bio, location, resume URL
- Forgot password — secure email token reset with 1-hour expiry

### For Employers
- Post jobs with salary range (INR), requirements, skills, and deadline
- Per-job analytics — applicants count, view count, top-performing listing
- Application management — view applicants, update status with employer notes
- Dashboard analytics — applicants per job bar chart, views per job, star listing highlight
- Company profile — name, description, website

### Admin Panel
- Platform-wide stats — users, seekers, employers, jobs, applications, new this week
- 7-day jobs-posted bar chart (pure CSS, no charting library)
- Application status funnel with animated progress bars
- Most active companies leaderboard
- Full user and job management with deletion

### General
- Dark / Light mode toggle with system preference support
- Fully responsive — mobile-first layout
- Framer Motion animations and micro-interactions throughout
- Lazy loading — pages load only when navigated to
- Skeleton loaders — shimmer cards while data fetches
- Infinite scroll — LinkedIn-style continuous job loading
- Rich empty states — illustrated with CTA buttons

---

## Performance Optimizations

| Optimization | Implementation | Benefit |
|---|---|---|
| Skeleton Loaders | `JobCardSkeleton.tsx` + CSS shimmer animation | No blank screens, perceived faster load |
| Debounced Search | `useDebounce` hook (400ms delay) | ~80% fewer API calls while typing |
| Lazy Loading | `React.lazy()` + `Suspense` per route | Smaller initial JS bundle |
| Infinite Scroll | `IntersectionObserver` API | No pagination clicks needed |
| Optimistic UI | Save job updates instantly, reverts on error | Instant perceived response |
| Code Splitting | Vite automatic per-route chunks | Faster first contentful paint |

---

## Tech Stack

### Frontend

| Technology | Purpose |
|---|---|
| React 18 + TypeScript | UI framework |
| Vite | Build tool and dev server |
| React Router v6 | Client-side routing |
| Framer Motion | Animations and transitions |
| Axios | HTTP client with interceptors |
| Lucide React | Icon library |
| React Hot Toast | Toast notifications |
| CSS Variables | Design system and theming |

### Backend

| Technology | Purpose |
|---|---|
| Node.js + Express 5 | REST API server |
| Prisma ORM | Database access layer |
| PostgreSQL (Supabase) | Production database |
| JWT | Stateless authentication tokens |
| bcryptjs | Password hashing (10 rounds) |
| express-validator | Request body validation |
| Nodemailer | Password reset emails (optional) |
| CORS | Configurable cross-origin policy |

---

## Project Structure

```
job-portalhosted/
├── backend/
│   ├── prisma/
│   │   ├── schema.prisma          # User, Job, Application models + reset token fields
│   │   └── seed-admin.js          # Seeds the default admin account
│   ├── src/
│   │   ├── config/
│   │   │   └── prisma.js          # Prisma client singleton
│   │   ├── middleware/
│   │   │   ├── auth.js            # JWT protect + role guard middleware
│   │   │   └── errorHandler.js    # Centralized error handling
│   │   └── routes/
│   │       ├── auth.js            # Register, login, me, forgot/reset password
│   │       ├── jobs.js            # CRUD + search, filter, pagination
│   │       ├── applications.js    # Apply, status updates
│   │       ├── users.js           # Profile, save jobs
│   │       └── admin.js           # Aggregated stats, user/job management
│   └── server.js                  # Express app, CORS, route mounting
│
└── frontend/
    └── src/
        ├── components/
        │   ├── Navbar.tsx
        │   ├── Footer.tsx          # All links map to real routes
        │   ├── JobCard.tsx         # Optimistic save bookmark
        │   ├── JobCardSkeleton.tsx # Shimmer placeholder card
        │   └── Spinner.tsx
        ├── context/
        │   └── AuthContext.tsx     # Global auth state, token management
        ├── hooks/
        │   └── useDebounce.ts     # 400ms search debounce
        ├── pages/
        │   ├── Home.tsx
        │   ├── Jobs.tsx            # Infinite scroll, debounce, skeleton loaders
        │   ├── JobDetail.tsx
        │   ├── Login.tsx           # Forgot password link
        │   ├── Register.tsx        # Role toggle: seeker / employer
        │   ├── ForgotPassword.tsx
        │   ├── ResetPassword.tsx   # Password strength meter, match validation
        │   ├── Dashboard.tsx       # Employer analytics + seeker application tracker
        │   ├── Profile.tsx         # Hero card, live resume/website preview links
        │   ├── PostJob.tsx
        │   ├── Applications.tsx
        │   ├── EmployerJobDetails.tsx
        │   └── AdminDashboard.tsx  # Charts, funnel, company leaderboard, rich tables
        ├── services/
        │   └── api.ts              # All API calls via Axios
        └── App.tsx                 # Route config with React.lazy code splitting
```

---

## Getting Started

### Prerequisites

- Node.js 18+
- A PostgreSQL database (Supabase free tier is sufficient)

### 1. Clone the repository

```bash
git clone https://github.com/SURAJJJJJ11111/JobNexus-Full-Stack-Job-Portal.git
cd JobNexus-Full-Stack-Job-Portal
```

### 2. Backend setup

```bash
cd backend
npm install
```

Create `backend/.env`:

```env
PORT=5000
DATABASE_URL="postgresql://user:password@host:5432/dbname"
JWT_SECRET=your_super_secret_jwt_key
NODE_ENV=development
CLIENT_URL=http://localhost:5173

# Optional — enables real password reset emails via Gmail
SMTP_USER=your.gmail@gmail.com
SMTP_PASS=your_gmail_app_password
```

Push the schema and seed the admin account:

```bash
npx prisma db push
node prisma/seed-admin.js
```

Start the backend:

```bash
npm run dev
```

### 3. Frontend setup

```bash
cd frontend
npm install
```

Create `frontend/.env`:

```env
VITE_API_URL=http://localhost:5000/api
```

Start the frontend:

```bash
npm run dev
```

Open **http://localhost:5173** — login with `admin@demo.com` / `admin123`.

---

## API Reference

### Authentication

| Method | Endpoint | Description | Auth |
|---|---|---|---|
| POST | `/api/auth/register` | Register new user (seeker or employer) | Public |
| POST | `/api/auth/login` | Login and receive JWT | Public |
| GET | `/api/auth/me` | Get current authenticated user | Protected |
| POST | `/api/auth/forgot-password` | Generate and send password reset link | Public |
| POST | `/api/auth/reset-password/:token` | Validate token and update password | Public |

### Jobs

| Method | Endpoint | Description | Auth |
|---|---|---|---|
| GET | `/api/jobs` | List/search/filter jobs (paginated) | Public |
| GET | `/api/jobs/:id` | Get single job (increments views) | Public |
| POST | `/api/jobs` | Create a job listing | Employer |
| PUT | `/api/jobs/:id` | Update own listing | Employer |
| DELETE | `/api/jobs/:id` | Delete own listing | Employer |
| GET | `/api/jobs/employer/my-jobs` | All listings by the authenticated employer | Employer |

### Applications

| Method | Endpoint | Description | Auth |
|---|---|---|---|
| POST | `/api/applications/:jobId` | Apply to a job | Seeker |
| GET | `/api/applications/my` | All applications by caller | Seeker |
| GET | `/api/applications/job/:jobId` | All applications for a job | Employer |
| PUT | `/api/applications/:id/status` | Update status + employer note | Employer |

### Users

| Method | Endpoint | Description | Auth |
|---|---|---|---|
| PUT | `/api/users/profile` | Update profile, skills, company info | Protected |
| POST | `/api/users/save-job/:jobId` | Toggle save/unsave a job | Protected |
| GET | `/api/users/saved-jobs` | Get saved jobs list | Protected |

### Admin

| Method | Endpoint | Description | Auth |
|---|---|---|---|
| GET | `/api/admin/stats` | Full platform stats, trends, funnel, top companies | Admin |
| GET | `/api/admin/users` | All users | Admin |
| DELETE | `/api/admin/users/:id` | Delete user and cascade data | Admin |
| GET | `/api/admin/jobs` | All job listings | Admin |
| DELETE | `/api/admin/jobs/:id` | Delete listing and cascade applications | Admin |

---

## Authentication & Password Reset

### JWT Flow

1. User registers or logs in — server returns a signed JWT
2. Token stored in `localStorage` as `jp_token`
3. Axios interceptor attaches `Authorization: Bearer <token>` to every request automatically

### Password Reset Flow

1. User clicks **"Forgot password?"** on the login page
2. Enters email → `POST /api/auth/forgot-password`
3. Server generates a cryptographically random token, stores its SHA-256 hash in the database with a 1-hour expiry
4. If `SMTP_USER` and `SMTP_PASS` are set → sends a branded HTML email
5. In development (no SMTP configured) → the reset URL is returned directly in the API response
6. User follows the link → `/reset-password/:token`
7. Enters new password — strength meter and match validation run client-side
8. `POST /api/auth/reset-password/:token` → server validates hash + expiry, updates password, clears the token

---

## Environment Variables

### Backend (`backend/.env`)

| Variable | Required | Description |
|---|---|---|
| `DATABASE_URL` | Yes | PostgreSQL connection string |
| `JWT_SECRET` | Yes | Secret for signing JWT tokens |
| `PORT` | No | Server port (default: 5000) |
| `CLIENT_URL` | Yes (hosted) | Frontend URL(s) for CORS — comma-separated for multiple origins |
| `NODE_ENV` | No | `development` or `production` |
| `SMTP_USER` | No | Gmail address for password reset emails |
| `SMTP_PASS` | No | Gmail App Password (not your account password) |

### Frontend (`frontend/.env`)

| Variable | Required | Description |
|---|---|---|
| `VITE_API_URL` | Yes (hosted) | Backend API base URL — e.g. `https://your-backend.onrender.com/api` |

---

## Deployment

### Frontend on Vercel

1. Push code to GitHub
2. Import the project at [vercel.com](https://vercel.com)
3. Set root directory to `frontend`
4. Framework preset: Vite (auto-detected)
5. Add environment variable: `VITE_API_URL=https://your-backend.onrender.com/api`
6. Deploy — then **trigger a redeploy** after adding env vars (Vite bakes them in at build time)

### Backend on Render

1. Create a Web Service at [render.com](https://render.com)
2. Set root directory to `backend`
3. Build command: `npm install && npx prisma generate`
4. Start command: `npm start`
5. Add all required environment variables
6. Render auto-deploys on every push to `main`

### Database on Supabase

1. Create a project at [supabase.com](https://supabase.com)
2. Copy the connection string from Settings > Database
3. Set it as `DATABASE_URL` in both local `.env` and Render
4. Run `npx prisma db push` to create the schema

---

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature`
3. Commit your changes: `git commit -m 'feat: add your feature'`
4. Push to the branch: `git push origin feature/your-feature`
5. Open a Pull Request

---

## License

MIT — use it, fork it, ship it.

---

<div align="center">
  Built with React, Node.js, Prisma, and PostgreSQL
</div>
