# 🚀 JobNexus Full-Stack Deployment Guide

Congratulations! You have a fully working, offline-capable Job Portal utilizing Prisma, React (Vite), and Node.js. 

When you are ready to host your project on the Live Internet to show off in your portfolio, follow these exact steps. **It is 100% free.**

## Option 1: Vercel (Easiest & Fastest for Portfolios)

Vercel is incredible for hosting React applications, but it doesn't host backend Node.js apps well out-of-the-box unless you use serverless functions.
For the absolute easiest deployment, we will host the **Frontend** on Vercel, and the **Backend** on Render.

---

### Step 1: Upgrading your Database (Production)
Right now, you are using **SQLite** (`dev.db`). This is amazing for local development, but in the cloud, files get deleted when servers restart! You need a real database service for production.

1. Create a free **PostgreSQL** database at [Supabase](https://supabase.com) or [Neon.tech](https://neon.tech).
2. Get your connection string (it looks like `postgresql://user:password@aws-0-eu-central-1.pooler.supabase.com...`).
3. Open `backend/prisma/schema.prisma` and change `provider = "sqlite"` to:
   ```prisma
   provider = "postgresql"
   ```
4. In your `.env` file, set `DATABASE_URL="your_new_postgres_connection_string"`.
5. Run `npx prisma db push` to push your tables to the live internet database!

---

### Step 2: Hosting the Backend (Render)
[Render](https://render.com) provides free hosting for Node.js backends.

1. Push your entire code to a GitHub repository.
2. Go to Render.com, click **New > Web Service**.
3. Connect your GitHub account and select your `job-portal` repository.
4. **Important Settings**:
   - **Root Directory**: `backend` (Because your backend code is in the backend folder).
   - **Build Command**: `npm install && npx prisma generate`
   - **Start Command**: `npm start`
5. **Environment Variables**: Add your `JWT_SECRET` (e.g. `super_secret_key`) and your `DATABASE_URL`!
6. Click **Deploy**. Render will give you a live URL like `https://job-portal-backend.onrender.com`.

---

### Step 3: Hosting the Frontend (Vercel)
[Vercel](https://vercel.com) provides the best React/Vite hosting.

1. Go to Vercel.com, click **Add New > Project**.
2. Select your `job-portal` GitHub repository.
3. **Important Settings**:
   - **Root Directory**: `frontend` (Click edit and select the frontend folder).
   - **Framework Preset**: Vite.
4. **Environment Variables**: You MUST tell your frontend where your backend lives! Add:
   - Key: `VITE_API_URL`
   - Value: `https://job-portal-backend.onrender.com/api` (Replace with your actual Render URL).
5. Click **Deploy**. Vercel will give you a live URL like `https://job-portal.vercel.app`.

---

### 🎉 All Done!
Your application is incredibly complex and beautifully built using Prisma ORM. By following the separation of Frontend (Vercel) and Backend (Render), it will be extremely fast, professional, and free!
