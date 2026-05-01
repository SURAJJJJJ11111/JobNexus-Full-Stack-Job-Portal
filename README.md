<div align="center">

# 🚀 JobNexus — Full-Stack Job Portal

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

## 📋 Table of Contents

- [Live Demo](#-live-demo)
- [Features](#-features)
- [Performance Optimizations](#-performance-optimizations)
- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [Getting Started](#-getting-started)
- [API Reference](#-api-reference)
- [Authentication & Password Reset](#-authentication--password-reset)
- [Environment Variables](#-environment-variables)
- [Deployment](#-deployment)
- [Contributing](#-contributing)

---

## 🌐 Live Demo

| Service | URL |
|---|---|
| **Frontend (Vercel)** | https://job-nexus-full-stack-job-portal.vercel.app/ |
| **Backend API (Render)** | https://jobnexus-full-stack-job-portal.onrender.com/api/health |
| **Database** | Supabase PostgreSQL (Production) |

> ⚠️ The Render free tier spins down after inactivity — first request may take ~30s to wake up.

---

## ✨ Features

### 👨‍💻 For Job Seekers
- 🔍 **Smart Search** — debounced search by title, keyword, or company (400ms delay)
- 🎛️ **Advanced Filters** — filter by job type, location type, category & experience level
- 📝 **Apply to Jobs** — submit cover letter + resume link per application
- 📊 **Application Tracker** — real-time status: pending → reviewed → shortlisted → hired/rejected
- 🔖 **Save Jobs** — optimistic bookmark with instant UI feedback, no loading delay
- 👤 **Profile Management** — skill tags, bio, location, and resume URL
- 🔐 **Forgot Password** — secure email token reset with 1-hour expiry

### 🏢 For Employers
- 📋 **Post Jobs** — rich listing with salary range (INR), requirements, skills, deadline
- 👥 **Manage Applications** — view applicants, update status with notes
- 📈 **Dashboard Analytics** — job views, applicant counts per listing
- 🏢 **Company Profile** — company name, description, and website

### ⚙️ Admin Panel
- 👤 **User Management** — view and delete users
- 📌 **Job Management** — moderate all job listings
- 📊 **Platform Stats** — total users, jobs, applications at a glance

### 🎨 General
- 🌙 **Dark / Light Mode** toggle
- 📱 **Fully Responsive** — mobile-first design
- ⚡ **Framer Motion** animations throughout
- 🏎️ **Lazy Loading** — pages load only when needed (code-splitting)
- 💀 **Skeleton Loaders** — shimmer cards while data loads (no blank screens)
- ♾️ **Infinite Scroll** — LinkedIn-style continuous job loading
- 🎯 **Rich Empty States** — illustrated empty states with CTA buttons

---

## 🚀 Performance Optimizations

| Optimization | Implementation | Benefit |
|---|---|---|
| **Skeleton Loaders** | `JobCardSkeleton.tsx` + CSS shimmer | Perceived faster load, no blank screens |
| **Debounced Search** | `useDebounce` hook (400ms) | 80%+ fewer API calls while typing |
| **Lazy Loading** | `React.lazy()` + `Suspense` | ~40% smaller initial JS bundle |
| **Infinite Scroll** | `IntersectionObserver` API | No pagination clicks, LinkedIn-feel |
| **Optimistic UI** | Save job updates instantly, reverts on error | Instant perceived response |
| **Code Splitting** | Vite automatic per-route chunks | Faster first contentful paint |

---

## 🛠️ Tech Stack

### Frontend
| Technology | Purpose |
|---|---|
| **React 18 + TypeScript** | UI framework |
| **Vite** | Build tool & dev server |
| **React Router v6** | Client-side routing |
| **Framer Motion** | Animations & transitions |
| **Axios** | HTTP client |
| **Lucide React** | Icon library |
| **React Hot Toast** | Toast notifications |
| **CSS Variables** | Design system / theming |

### Backend
| Technology | Purpose |
|---|---|
| **Node.js + Express 5** | REST API server |
| **Prisma ORM** | Database access layer |
| **PostgreSQL (Supabase)** | Production database |
| **JWT (jsonwebtoken)** | Authentication tokens |
| **bcryptjs** | Password hashing |
| **express-validator** | Request validation |
| **Nodemailer** | Password reset emails (optional) |
| **CORS** | Cross-origin request handling |

---

## 📁 Project Structure

```
job-portalhosted/
├── backend/
│   ├── prisma/
│   │   ├── schema.prisma          # Database schema (User, Job, Application)
│   │   └── seed-admin.js          # Admin account seeder
│   ├── src/
│   │   ├── config/
│   │   │   └── prisma.js          # Prisma client singleton
│   │   ├── middleware/
│   │   │   ├── auth.js            # JWT protect middleware
│   │   │   └── errorHandler.js    # Global error handler
│   │   └── routes/
│   │       ├── auth.js            # Register, Login, Me, Forgot/Reset Password
│   │       ├── jobs.js            # CRUD + search/filter
│   │       ├── applications.js    # Apply, status update
│   │       ├── users.js           # Profile, save jobs
│   │       └── admin.js           # Admin stats, user/job management
│   ├── server.js                  # Express app + CORS + routes
│   └── .env                       # Environment variables
│
└── frontend/
    ├── src/
    │   ├── components/
    │   │   ├── Navbar.tsx
    │   │   ├── Footer.tsx
    │   │   ├── JobCard.tsx         # Optimistic save bookmark
    │   │   ├── JobCardSkeleton.tsx # Shimmer skeleton loader
    │   │   └── Spinner.tsx
    │   ├── context/
    │   │   └── AuthContext.tsx     # Global auth state
    │   ├── hooks/
    │   │   └── useDebounce.ts     # Debounce hook for search
    │   ├── pages/
    │   │   ├── Home.tsx
    │   │   ├── Jobs.tsx            # Infinite scroll + debounce + skeleton
    │   │   ├── JobDetail.tsx
    │   │   ├── Login.tsx           # + Forgot password link
    │   │   ├── Register.tsx
    │   │   ├── ForgotPassword.tsx  # Email reset flow
    │   │   ├── ResetPassword.tsx   # Token-based password reset
    │   │   ├── Dashboard.tsx
    │   │   ├── Profile.tsx
    │   │   ├── PostJob.tsx
    │   │   ├── Applications.tsx
    │   │   ├── EmployerJobDetails.tsx
    │   │   └── AdminDashboard.tsx
    │   ├── services/
    │   │   └── api.ts              # All API calls (axios)
    │   ├── App.tsx                 # Routes + React.lazy code splitting
    │   └── index.css              # Full design system
    └── vite.config.ts
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn
- PostgreSQL database (or Supabase free tier)

### 1. Clone the repository
```bash
git clone https://github.com/SURAJJJJJ11111/JobNexus-Full-Stack-Job-Portal.git
cd JobNexus-Full-Stack-Job-Portal
```

### 2. Set up the Backend

```bash
cd backend
npm install
```

Create `.env` file:
```env
PORT=5000
DATABASE_URL="postgresql://user:password@host:5432/dbname"
JWT_SECRET=your_super_secret_jwt_key
NODE_ENV=development
CLIENT_URL=http://localhost:5173

# Optional — enables real password reset emails
SMTP_USER=your.gmail@gmail.com
SMTP_PASS=your_gmail_app_password
```

Push the schema to your database:
```bash
npx prisma db push
```

Seed an admin account:
```bash
node prisma/seed-admin.js
```

Start the backend:
```bash
npm run dev
```

### 3. Set up the Frontend

```bash
cd frontend
npm install
```

Create `.env` file:
```env
VITE_API_URL=http://localhost:5000/api
```

Start the frontend:
```bash
npm run dev
```

Open **http://localhost:5173**

---

## 📡 API Reference

### Authentication
| Method | Endpoint | Description | Auth |
|---|---|---|---|
| POST | `/api/auth/register` | Register new user | Public |
| POST | `/api/auth/login` | Login & get JWT | Public |
| GET | `/api/auth/me` | Get current user | 🔒 |
| POST | `/api/auth/forgot-password` | Send password reset link | Public |
| POST | `/api/auth/reset-password/:token` | Reset password with token | Public |

### Jobs
| Method | Endpoint | Description | Auth |
|---|---|---|---|
| GET | `/api/jobs` | List/search jobs (pagination, filters) | Public |
| GET | `/api/jobs/:id` | Get single job | Public |
| POST | `/api/jobs` | Create job listing | 🔒 Employer |
| PUT | `/api/jobs/:id` | Update job | 🔒 Employer |
| DELETE | `/api/jobs/:id` | Delete job | 🔒 Employer |
| GET | `/api/jobs/employer/my-jobs` | Employer's own jobs | 🔒 Employer |

### Applications
| Method | Endpoint | Description | Auth |
|---|---|---|---|
| POST | `/api/applications/:jobId` | Apply to a job | 🔒 Seeker |
| GET | `/api/applications/my` | My applications | 🔒 Seeker |
| GET | `/api/applications/job/:jobId` | Job's applications | 🔒 Employer |
| PUT | `/api/applications/:id/status` | Update status | 🔒 Employer |

### Users
| Method | Endpoint | Description | Auth |
|---|---|---|---|
| PUT | `/api/users/profile` | Update profile | 🔒 |
| POST | `/api/users/save-job/:jobId` | Toggle save/unsave job | 🔒 |
| GET | `/api/users/saved-jobs` | Get saved jobs | 🔒 |

### Admin
| Method | Endpoint | Description | Auth |
|---|---|---|---|
| GET | `/api/admin/stats` | Platform statistics | 🔒 Admin |
| GET | `/api/admin/users` | All users | 🔒 Admin |
| GET | `/api/admin/jobs` | All jobs | 🔒 Admin |
| DELETE | `/api/admin/users/:id` | Delete user | 🔒 Admin |
| DELETE | `/api/admin/jobs/:id` | Delete job | 🔒 Admin |

---

## 🔐 Authentication & Password Reset

### JWT Flow
1. User registers/logs in → server returns a signed JWT
2. JWT stored in `localStorage` as `jp_token`
3. Axios interceptor automatically attaches `Authorization: Bearer <token>` to every request

### Password Reset Flow
1. User clicks **"Forgot password?"** on the login page
2. Enters email → `POST /api/auth/forgot-password`
3. Server generates a secure random token, stores SHA-256 hash in DB (expires in 1 hour)
4. If `SMTP_USER`/`SMTP_PASS` env vars are set → sends a branded email
5. User clicks the link → navigates to `/reset-password/:token`
6. Enters new password with strength meter → `POST /api/auth/reset-password/:token`
7. Server validates token hash + expiry → updates password → clears token

---

## 🔑 Environment Variables

### Backend (`backend/.env`)

| Variable | Required | Description |
|---|---|---|
| `DATABASE_URL` | ✅ | PostgreSQL connection string |
| `JWT_SECRET` | ✅ | Secret for signing JWT tokens |
| `PORT` | Optional | Server port (default: 5000) |
| `CLIENT_URL` | ✅ Hosted | Frontend URL(s) for CORS — comma-separated |
| `NODE_ENV` | Optional | `development` or `production` |
| `SMTP_USER` | Optional | Gmail address for password reset emails |
| `SMTP_PASS` | Optional | Gmail App Password (not your real password) |

### Frontend (`frontend/.env`)

| Variable | Required | Description |
|---|---|---|
| `VITE_API_URL` | ✅ Hosted | Backend API base URL (e.g. `https://your-backend.onrender.com/api`) |

---

## 🚢 Deployment

### Frontend → Vercel
1. Push code to GitHub
2. Import project on [vercel.com](https://vercel.com)
3. **Root directory:** `frontend`
4. **Framework preset:** Vite
5. **Environment Variables:** Add `VITE_API_URL=https://your-backend.onrender.com/api`
6. Deploy → **Redeploy after adding env vars**

### Backend → Render
1. Create a **Web Service** on [render.com](https://render.com)
2. **Root Directory:** `backend`
3. **Build Command:** `npm install && npx prisma generate`
4. **Start Command:** `npm start`
5. **Environment Variables:**
   - `DATABASE_URL` — Supabase/Neon PostgreSQL URL
   - `JWT_SECRET` — strong random string
   - `CLIENT_URL` — your Vercel frontend URL
   - `NODE_ENV=production`

### Database → Supabase (Free)
1. Create project at [supabase.com](https://supabase.com)
2. Copy the **Connection string** from Settings → Database
3. Run `npx prisma db push` locally with your production `DATABASE_URL`

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'feat: Add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License.

---

<div align="center">
  Built with ❤️ using React, Node.js, Prisma & PostgreSQL
</div>
