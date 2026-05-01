<div align="center">

# JobNexus

### A full-stack job portal built for modern hiring — fast, clean, and production-ready.

[![Live Demo](https://img.shields.io/badge/Live-job--nexus--full--stack--job--portal.vercel.app-0070f3?style=flat-square)](https://job-nexus-full-stack-job-portal.vercel.app/)
[![Backend](https://img.shields.io/badge/API-jobnexus--full--stack--job--portal.onrender.com-46E3B7?style=flat-square)](https://jobnexus-full-stack-job-portal.onrender.com/api/health)
[![Stack](https://img.shields.io/badge/Stack-React%20%2B%20Node.js%20%2B%20PostgreSQL-informational?style=flat-square)](https://github.com/SURAJJJJJ11111/JobNexus-Full-Stack-Job-Portal)
[![License](https://img.shields.io/badge/License-MIT-lightgrey?style=flat-square)](LICENSE)

</div>

---

JobNexus is a production-deployed job portal that handles the complete hiring workflow — from job seeker registration through employer posting, applicant tracking, and admin oversight. It is not a CRUD demo. It is built with the same patterns you would use in a real product: role-based auth, paginated search, optimistic UI, code splitting, and a proper deployment pipeline across Vercel, Render, and Supabase.

---

## Table of Contents

- [Live Deployment](#live-deployment)
- [What It Does](#what-it-does)
- [Architecture](#architecture)
- [Tech Stack](#tech-stack)
- [Getting Started](#getting-started)
- [API Reference](#api-reference)
- [Environment Variables](#environment-variables)
- [Deployment](#deployment)
- [Performance](#performance)
- [Project Structure](#project-structure)

---

## Live Deployment

| Service | URL | Platform |
|---|---|---|
| Frontend | https://job-nexus-full-stack-job-portal.vercel.app | Vercel |
| Backend API | https://jobnexus-full-stack-job-portal.onrender.com/api | Render |
| Database | Supabase PostgreSQL (ap-southeast-1) | Supabase |

> The Render free tier suspends instances after inactivity. The first request after a sleep period may take up to 30 seconds.

---

## What It Does

**For job seekers**

Register, build a profile with skill tags and resume link, browse and filter hundreds of listings, apply with a cover letter, and track every application through its full lifecycle — pending, reviewed, shortlisted, rejected, or hired. Jobs can be saved with one click. The bookmark state updates instantly in the UI and syncs with the server in the background, reverting silently if the request fails.

**For employers**

Post jobs with salary ranges in INR, location type, skill requirements, and deadlines. The employer dashboard surfaces per-job analytics: how many candidates have seen the listing, how many have applied, and which post is generating the most interest. Application status can be updated at the individual level with optional employer notes.

**For admins**

A separate admin control panel provides platform-wide visibility: total user counts broken down by role, jobs posted per day over the last seven days, a top-companies leaderboard, application status funnel, and full user/job management with deletion.

**Forgot password**

Full token-based reset flow. A SHA-256 hashed token is stored in the database with a one-hour expiry. When SMTP credentials are configured (Gmail App Password), a branded HTML email is sent. Without SMTP, the reset link is returned directly in the API response for local development.

---

## Architecture

```
Browser (React + Vite)
     |
     | HTTPS / JSON
     v
Express REST API (Node.js)
     |
     |-- JWT authentication middleware
     |-- Role guard (seeker / employer / admin)
     |
     v
Prisma ORM
     |
     v
PostgreSQL (Supabase)
```

The frontend and backend are fully decoupled. CORS is configured to accept comma-separated origins from the `CLIENT_URL` environment variable, with `localhost` always permitted for local development. This means you can add a staging frontend without touching the backend code.

---

## Tech Stack

**Frontend**

| Technology | Version | Purpose |
|---|---|---|
| React | 18 | Component model and rendering |
| TypeScript | 5 | Type safety across the frontend |
| Vite | 5 | Build tool, dev server, code splitting |
| React Router | 6 | Client-side routing with lazy loading |
| Framer Motion | 11 | Page transitions and micro-animations |
| Axios | 1.6 | HTTP client with request interceptors |
| Lucide React | — | Icon library |
| React Hot Toast | — | Non-blocking notifications |
| CSS Variables | — | Design token system and theming |

**Backend**

| Technology | Version | Purpose |
|---|---|---|
| Node.js | 20+ | Runtime |
| Express | 5 | HTTP framework |
| Prisma | 5.22 | Type-safe database access layer |
| PostgreSQL | 15 | Relational database |
| jsonwebtoken | — | Stateless auth tokens |
| bcryptjs | — | Password hashing (10 rounds) |
| express-validator | — | Request body validation |
| Nodemailer | — | Transactional email (password reset) |
| cors | — | Configurable cross-origin policy |

---

## Getting Started

### Prerequisites

- Node.js 18 or later
- A PostgreSQL database (Supabase free tier works, connection string required)

### Clone and install

```bash
git clone https://github.com/SURAJJJJJ11111/JobNexus-Full-Stack-Job-Portal.git
cd JobNexus-Full-Stack-Job-Portal
```

### Backend setup

```bash
cd backend
npm install
```

Create `backend/.env`:

```env
PORT=5000
DATABASE_URL="postgresql://user:password@host:5432/postgres"
JWT_SECRET=replace_with_a_long_random_string
NODE_ENV=development
CLIENT_URL=http://localhost:5173

# Optional — enables real password reset emails via Gmail
SMTP_USER=your.address@gmail.com
SMTP_PASS=your_gmail_app_password
```

Push the schema and seed an admin account:

```bash
npx prisma db push
node prisma/seed-admin.js
```

Start the API server:

```bash
npm run dev
```

### Frontend setup

```bash
cd frontend
npm install
```

Create `frontend/.env`:

```env
VITE_API_URL=http://localhost:5000/api
```

Start the dev server:

```bash
npm run dev
```

Open `http://localhost:5173`. Login with `admin@demo.com` / `admin123` (seeded above).

---

## API Reference

### Authentication

| Method | Endpoint | Access | Description |
|---|---|---|---|
| POST | `/api/auth/register` | Public | Create a new account (seeker or employer) |
| POST | `/api/auth/login` | Public | Authenticate and receive a JWT |
| GET | `/api/auth/me` | Protected | Return the authenticated user |
| POST | `/api/auth/forgot-password` | Public | Generate a reset token and send email |
| POST | `/api/auth/reset-password/:token` | Public | Validate token and update password |

### Jobs

| Method | Endpoint | Access | Description |
|---|---|---|---|
| GET | `/api/jobs` | Public | Search and filter jobs with pagination |
| GET | `/api/jobs/:id` | Public | Single job detail (increments view count) |
| POST | `/api/jobs` | Employer | Create a job listing |
| PUT | `/api/jobs/:id` | Employer | Update your own listing |
| DELETE | `/api/jobs/:id` | Employer | Delete your own listing |
| GET | `/api/jobs/employer/my-jobs` | Employer | All listings posted by the caller |

### Applications

| Method | Endpoint | Access | Description |
|---|---|---|---|
| POST | `/api/applications/:jobId` | Seeker | Submit an application |
| GET | `/api/applications/my` | Seeker | All applications by the caller |
| GET | `/api/applications/job/:jobId` | Employer | All applications for a specific job |
| PUT | `/api/applications/:id/status` | Employer | Update status and add employer note |

### Users

| Method | Endpoint | Access | Description |
|---|---|---|---|
| PUT | `/api/users/profile` | Protected | Update profile, skills, or company info |
| POST | `/api/users/save-job/:jobId` | Protected | Toggle saved/unsaved state for a job |
| GET | `/api/users/saved-jobs` | Protected | Return all saved jobs for the caller |

### Admin

| Method | Endpoint | Access | Description |
|---|---|---|---|
| GET | `/api/admin/stats` | Admin | Platform stats, 7-day job trend, top companies, funnel |
| GET | `/api/admin/users` | Admin | All registered users |
| DELETE | `/api/admin/users/:id` | Admin | Delete a user and cascade their data |
| GET | `/api/admin/jobs` | Admin | All job listings |
| DELETE | `/api/admin/jobs/:id` | Admin | Delete a listing and cascade applications |

---

## Environment Variables

### Backend

| Variable | Required | Description |
|---|---|---|
| `DATABASE_URL` | Yes | Prisma connection string to your PostgreSQL instance |
| `JWT_SECRET` | Yes | Random string used to sign tokens — keep it secret |
| `CLIENT_URL` | Yes (hosted) | Frontend origin(s) for CORS. Comma-separated for multiple. |
| `PORT` | No | Server port, defaults to 5000 |
| `NODE_ENV` | No | Set to `production` on Render |
| `SMTP_USER` | No | Gmail address for password reset emails |
| `SMTP_PASS` | No | Gmail App Password — generate at myaccount.google.com/apppasswords |

### Frontend

| Variable | Required | Description |
|---|---|---|
| `VITE_API_URL` | Yes (hosted) | Full backend URL including `/api` — e.g. `https://your-api.onrender.com/api` |

---

## Deployment

### Frontend on Vercel

1. Import the repo at vercel.com
2. Set root directory to `frontend`
3. Framework: Vite (auto-detected)
4. Add environment variable: `VITE_API_URL=https://your-backend.onrender.com/api`
5. Deploy. After adding env vars, trigger a fresh redeploy — Vite bakes them into the build at compile time, not at runtime.

### Backend on Render

1. Create a Web Service, point it at the repo
2. Set root directory to `backend`
3. Build command: `npm install && npx prisma generate`
4. Start command: `npm start`
5. Add environment variables from the table above
6. Render auto-deploys on every push to `main`

### Database on Supabase

1. Create a project at supabase.com
2. Copy the connection string from Settings > Database > Connection String > URI
3. Set it as `DATABASE_URL` in both local `.env` and Render
4. Run `npx prisma db push` once to create the tables

---

## Performance

Several deliberate decisions were made to keep the perceived performance high:

**Code splitting** — Every page except Home, Login, and Register is loaded lazily via `React.lazy()` and `Suspense`. Vite splits these into separate chunks automatically, so a user browsing job listings never downloads the admin dashboard bundle.

**Debounced search** — Search and location inputs wait 400ms after the last keystroke before firing an API request. This eliminates the burst of redundant requests that fires on every character in a naive implementation.

**Infinite scroll** — An `IntersectionObserver` watches a sentinel element below the job grid. When it enters the viewport, the next page loads automatically. No pagination buttons.

**Skeleton loaders** — While data is in flight, the layout shows shimmer placeholders that match the dimensions of the real content. There is no blank white flash between navigation and content appearing.

**Optimistic UI** — The save/bookmark action on a job card updates the UI immediately. The API call runs in the background. If it fails, the state reverts and a toast explains why. The user never waits for a round trip.

---

## Project Structure

```
job-portalhosted/
├── backend/
│   ├── prisma/
│   │   ├── schema.prisma          # User, Job, Application models
│   │   └── seed-admin.js          # Creates the default admin account
│   ├── src/
│   │   ├── config/
│   │   │   └── prisma.js          # Singleton Prisma client
│   │   ├── middleware/
│   │   │   ├── auth.js            # JWT verification + role guards
│   │   │   └── errorHandler.js    # Centralized error handling
│   │   └── routes/
│   │       ├── auth.js            # Register, login, forgot/reset password
│   │       ├── jobs.js            # Listings with search, filter, pagination
│   │       ├── applications.js    # Apply and manage applications
│   │       ├── users.js           # Profile updates, saved jobs
│   │       └── admin.js           # Stats aggregation, user/job management
│   └── server.js                  # Express app entry point
│
└── frontend/
    └── src/
        ├── components/
        │   ├── Navbar.tsx
        │   ├── Footer.tsx          # All links point to real routes
        │   ├── JobCard.tsx         # With optimistic save bookmark
        │   ├── JobCardSkeleton.tsx # Shimmer placeholder
        │   └── Spinner.tsx
        ├── context/
        │   └── AuthContext.tsx     # Auth state, token management
        ├── hooks/
        │   └── useDebounce.ts     # 400ms search debounce
        ├── pages/
        │   ├── Home.tsx
        │   ├── Jobs.tsx            # Infinite scroll, debounce, skeleton
        │   ├── JobDetail.tsx
        │   ├── Login.tsx           # With forgot password link
        │   ├── Register.tsx        # Role toggle: seeker / employer
        │   ├── ForgotPassword.tsx
        │   ├── ResetPassword.tsx   # Password strength meter
        │   ├── Dashboard.tsx       # Employer analytics + seeker tracker
        │   ├── Profile.tsx
        │   ├── PostJob.tsx
        │   ├── Applications.tsx
        │   ├── EmployerJobDetails.tsx
        │   └── AdminDashboard.tsx  # Charts, funnel, company leaderboard
        ├── services/
        │   └── api.ts              # All API calls via Axios
        └── App.tsx                 # Routing with React.lazy code splitting
```

---

## License

MIT. Use it, fork it, ship it.
