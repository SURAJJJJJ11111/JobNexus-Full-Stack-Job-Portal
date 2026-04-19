<div align="center">

# 🚀 JobNexus — Full-Stack Job Portal

**A modern, production-quality job portal connecting job seekers with top employers**

![Tech Stack](https://img.shields.io/badge/Frontend-React%2018%20%2B%20TypeScript-61dafb?style=flat-square&logo=react)
![Backend](https://img.shields.io/badge/Backend-Node.js%20%2B%20Express-339933?style=flat-square&logo=nodedotjs)
![Database](https://img.shields.io/badge/Database-MongoDB-47A248?style=flat-square&logo=mongodb)
![Auth](https://img.shields.io/badge/Auth-JWT-000000?style=flat-square&logo=jsonwebtokens)
![License](https://img.shields.io/badge/License-MIT-blue?style=flat-square)

</div>

---

## 📋 Table of Contents

- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [Getting Started](#-getting-started)
- [API Reference](#-api-reference)
- [Authentication](#-authentication)
- [Environment Variables](#-environment-variables)
- [Contributing](#-contributing)

---

## ✨ Features

### For Job Seekers
- 🔍 **Browse & search** jobs with filters (type, location, category, experience)
- 📝 **Apply** to jobs with a custom cover letter
- 📊 **Application tracking** with real-time status updates
- 🔖 **Save jobs** for later review
- 👤 **Profile management** with skill tags and resume link

### For Employers
- 📋 **Post jobs** with rich details (salary range, requirements, skills)
- 👥 **View applications** with applicant profiles
- ✅ **Update application status** (pending → reviewed → shortlisted → hired/rejected)
- 📈 **Dashboard analytics** (views, applications per job)
- 🏢 **Company profile** management

### General
- 🔐 **JWT authentication** with role-based access control
- 🌙 **Dark / Light mode** toggle
- 📱 **Fully responsive** design
- ⚡ **Framer Motion** animations throughout
- 🔒 **Protected routes** by role

---

## 🛠 Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | React 18, TypeScript, Vite, Framer Motion, React Router v6 |
| **Styling** | Vanilla CSS with custom design system + CSS variables |
| **HTTP Client** | Axios with JWT interceptor |
| **Backend** | Node.js, Express.js |
| **Database** | MongoDB + Mongoose ODM |
| **Authentication** | JWT (JSON Web Tokens) + bcryptjs |
| **Validation** | express-validator |
| **Dev Tools** | Nodemon, dotenv |

---

## 📁 Project Structure

```
job-portal/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   │   └── db.js              # MongoDB connection
│   │   ├── models/
│   │   │   ├── User.js            # User schema (seeker/employer)
│   │   │   ├── Job.js             # Job listing schema
│   │   │   └── Application.js     # Application schema
│   │   ├── routes/
│   │   │   ├── auth.js            # POST /register, POST /login, GET /me
│   │   │   ├── jobs.js            # CRUD for job listings
│   │   │   ├── applications.js    # Apply, view, update status
│   │   │   └── users.js           # Profile, saved jobs
│   │   └── middleware/
│   │       ├── auth.js            # JWT protect + requireRole
│   │       └── errorHandler.js    # Global error handler
│   ├── server.js                  # Express entry point
│   ├── .env.example
│   └── package.json
│
└── frontend/
    ├── src/
    │   ├── context/
    │   │   └── AuthContext.tsx    # Auth state management
    │   ├── services/
    │   │   └── api.ts             # Axios service layer
    │   ├── components/
    │   │   ├── Navbar.tsx
    │   │   ├── Footer.tsx
    │   │   ├── JobCard.tsx
    │   │   └── Spinner.tsx
    │   ├── pages/
    │   │   ├── Home.tsx
    │   │   ├── Login.tsx
    │   │   ├── Register.tsx
    │   │   ├── Jobs.tsx
    │   │   ├── JobDetail.tsx
    │   │   ├── Dashboard.tsx
    │   │   ├── PostJob.tsx
    │   │   ├── Profile.tsx
    │   │   └── Applications.tsx
    │   ├── index.css              # Full design system
    │   ├── App.tsx                # Routes
    │   └── main.tsx               # Entry point
    ├── index.html
    ├── vite.config.ts
    └── package.json
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js v18+
- MongoDB (local or [MongoDB Atlas](https://www.mongodb.com/atlas))

### 1. Clone the repository

```bash
git clone https://github.com/your-username/job-portal.git
cd job-portal
```

### 2. Backend Setup

```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your MongoDB URI and JWT secret
npm run dev
```

Backend will run on **http://localhost:5000**

### 3. Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

Frontend will run on **http://localhost:5173**

---

## 📡 API Reference

### Authentication Endpoints

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| `POST` | `/api/auth/register` | Register new user | Public |
| `POST` | `/api/auth/login` | Login & get JWT | Public |
| `GET` | `/api/auth/me` | Get current user | 🔒 |

**Register Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "role": "seeker"
}
```

**Login Response:**
```json
{
  "success": true,
  "token": "eyJhbGci...",
  "user": { "_id": "...", "name": "John Doe", "role": "seeker" }
}
```

---

### Job Endpoints

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| `GET` | `/api/jobs` | List all jobs (with filters) | Public |
| `GET` | `/api/jobs/:id` | Get single job | Public |
| `POST` | `/api/jobs` | Create job posting | 🔒 Employer |
| `PUT` | `/api/jobs/:id` | Update job | 🔒 Employer (owner) |
| `DELETE` | `/api/jobs/:id` | Delete job | 🔒 Employer (owner) |
| `GET` | `/api/jobs/employer/my-jobs` | My posted jobs | 🔒 Employer |

**Query Parameters for GET /api/jobs:**
```
?search=react&category=Technology&type=full-time&locationType=remote
&experience=senior&location=Mumbai&page=1&limit=10
```

---

### Application Endpoints

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| `POST` | `/api/applications/:jobId` | Apply to a job | 🔒 Seeker |
| `GET` | `/api/applications/my` | My applications | 🔒 Seeker |
| `GET` | `/api/applications/job/:jobId` | Job's applicants | 🔒 Employer |
| `PUT` | `/api/applications/:id/status` | Update status | 🔒 Employer |

**Application Status Values:** `pending` → `reviewed` → `shortlisted` → `hired` / `rejected`

---

### User Endpoints

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| `PUT` | `/api/users/profile` | Update profile | 🔒 |
| `POST` | `/api/users/save-job/:jobId` | Save/unsave job | 🔒 |
| `GET` | `/api/users/saved-jobs` | Get saved jobs | 🔒 |

---

## 🔐 Authentication

JobNexus uses **JWT (Bearer Token)** authentication.

1. Register or Login → receive a `token`
2. Include in all protected requests:
   ```
   Authorization: Bearer <your_token>
   ```

**Roles:**
- `seeker` — can browse/apply to jobs, manage profile
- `employer` — can post/manage jobs, view and update applications

---

## ⚙️ Environment Variables

### Backend (`.env`)
```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/jobportal
# OR for Atlas:
# MONGO_URI=mongodb+srv://user:password@cluster.mongodb.net/jobportal
JWT_SECRET=your_super_secret_jwt_key_change_in_production
NODE_ENV=development
CLIENT_URL=http://localhost:5173
```

### Frontend (`.env`)
```env
VITE_API_URL=http://localhost:5000/api
```

---

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'feat: Add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License.

---

<div align="center">
  Built with ❤️ using React, Node.js & MongoDB
</div>
