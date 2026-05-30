# Interview Prep Reward Todo Platform

A full-stack MERN placement-preparation platform for managing daily interview tasks, AI-generated roadmaps, rewards, reports, email reminders, and admin operations.

The frontend is a Vite React app. The backend is an Express/MongoDB API with JWT auth, Gemini AI planning, Cloudinary profile uploads, Nodemailer email alerts, cron jobs, and an admin control center.

## Features

- User signup/login with JWT authentication
- Task CRUD with status, priority, difficulty, due dates, and source tracking
- AI daily task suggestions
- AI roadmap questionnaire and day-wise roadmap generation
- Convert roadmaps into detailed tasks
- Dashboard with progress, streak, XP, charts, and daily suggestions
- Rewards system with XP, levels, streaks, and badges
- Daily and weekly reports
- Professional HTML emails:
  - Morning task reminder
  - Night performance report
  - Weekly progress review
- Profile editing with Cloudinary profile photo upload
- Admin panel:
  - platform dashboard
  - user management
  - task monitoring
  - roadmap monitoring
  - AI generation logs
  - email logs and retry
  - system health
  - audit logs

## Tech Stack

**Frontend**

- React
- Vite
- React Router
- Axios
- Recharts
- Lucide icons

**Backend**

- Node.js
- Express
- MongoDB + Mongoose
- JWT
- Gemini API
- Cloudinary
- Nodemailer
- node-cron

## Project Structure

```bash
interview-prep/
  backend/
    src/
      config/
      controllers/
      jobs/
      middleware/
      models/
      routes/
      services/
      utils/
      server.js
  frontend/
    src/
      components/
      context/
      pages/
      routes/
      services/
      utils/
      styles.css
  package.json
```

## Local Setup

### 1. Install dependencies

```bash
npm run install:all
```

### 2. Configure backend environment

Copy:

```bash
backend/.env.example
```

to:

```bash
backend/.env
```

Backend env example:

```env
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/interview-prep
JWT_SECRET=replace-with-a-long-random-secret
JWT_EXPIRES_IN=7d
CLIENT_URL=http://localhost:5173

EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=
EMAIL_PASS=
CRON_TIMEZONE=Asia/Kolkata

GEMINI_API_KEY=
GEMINI_MODEL=gemini-2.5-flash

CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=

SYNC_INDEXES=true
```

### 3. Configure frontend environment

Copy:

```bash
frontend/.env.example
```

to:

```bash
frontend/.env
```

Frontend env:

```env
VITE_API_URL=http://localhost:5000/api
```

### 4. Run development servers

```bash
npm run dev
```

Default URLs:

- Frontend: `http://localhost:5173`
- Backend: `http://localhost:5000`
- Health check: `http://localhost:5000/api/health`

## Useful Commands

```bash
npm run install:all
npm run dev
npm run build
npm run start
```

Backend only:

```bash
npm run dev --prefix backend
npm run start --prefix backend
```

Frontend only:

```bash
npm run dev --prefix frontend
npm run build --prefix frontend
npm run preview --prefix frontend
```

## Admin Panel

Admin panel URL:

```bash
http://localhost:5173/admin/dashboard
```

Roles:

- `User`
- `Admin`
- `SuperAdmin`

Local testing accounts created during development:

```text
Admin
Email: testing.admin@rewardtodo.local
Password: Admin@Test123

SuperAdmin
Email: testing.superadmin@rewardtodo.local
Password: SuperAdmin@Test123
```

Do not use these credentials in production. Create production admin accounts with secure emails and passwords, then set their role to `Admin` or `SuperAdmin` in MongoDB.

## Main API Groups

```text
/api/auth
/api/tasks
/api/rewards
/api/reports
/api/ai
/api/roadmaps
/api/admin
```

## Deployment Plan

Deploy the backend on Render and the frontend on Vercel.

Recommended production services:

- MongoDB Atlas for database
- Render for Express backend
- Vercel for React frontend
- Cloudinary for profile uploads
- Gmail app password or SMTP provider for emails
- Gemini API key for AI features

## Backend Deployment on Render

### 1. Create a Render Web Service

In Render:

- New Web Service
- Connect GitHub repository
- Root Directory: `backend`
- Runtime: Node
- Build Command:

```bash
npm install
```

- Start Command:

```bash
npm start
```

### 2. Add Render environment variables

Set these in Render:

```env
NODE_ENV=production
PORT=5000
MONGO_URI=your-mongodb-atlas-uri
JWT_SECRET=your-long-production-secret
JWT_EXPIRES_IN=7d
CLIENT_URL=https://your-frontend-domain.vercel.app

EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email
EMAIL_PASS=your-email-app-password
CRON_TIMEZONE=Asia/Kolkata

GEMINI_API_KEY=your-gemini-key
GEMINI_MODEL=gemini-2.5-flash

CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-cloudinary-api-key
CLOUDINARY_API_SECRET=your-cloudinary-api-secret

SYNC_INDEXES=true
```

After deployment, Render will provide a backend URL like:

```text
https://your-backend-name.onrender.com
```

Backend API base URL:

```text
https://your-backend-name.onrender.com/api
```

Health check:

```text
https://your-backend-name.onrender.com/api/health
```

## Frontend Deployment on Vercel

### 1. Create a Vercel project

In Vercel:

- Import GitHub repository
- Framework Preset: Vite
- Root Directory: `frontend`
- Build Command:

```bash
npm run build
```

- Output Directory:

```bash
dist
```

### 2. Add Vercel environment variable

Set:

```env
VITE_API_URL=https://your-backend-name.onrender.com/api
```

Deploy the frontend.

### 3. SPA refresh routing

The frontend uses React Router. Vercel must rewrite all frontend routes to `index.html`; otherwise refreshing `/dashboard`, `/tasks`, `/admin/dashboard`, etc. can show `404: NOT_FOUND`.

This repo includes:

```bash
frontend/vercel.json
```

with:

```json
{
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```

### 4. Update Render CORS

After Vercel gives the frontend URL, update Render backend env:

```env
CLIENT_URL=https://your-frontend-domain.vercel.app
```

Redeploy/restart the Render backend after changing `CLIENT_URL`.

## Production Checklist

Before final production use:

- Use MongoDB Atlas, not local MongoDB
- Set a strong `JWT_SECRET`
- Set `NODE_ENV=production`
- Configure `CLIENT_URL` with the exact Vercel URL
- Configure `VITE_API_URL` with the exact Render API URL
- Configure Gemini API key
- Configure Cloudinary credentials
- Configure email SMTP credentials
- Disable or remove local testing admin accounts
- Create secure production admin accounts
- Verify `/api/health`
- Verify signup/login
- Verify profile image upload
- Verify AI roadmap generation
- Verify email sending
- Verify admin panel access

## Notes

- Render free instances may sleep after inactivity, so the first API request can be slow.
- Vercel only needs the frontend build output; the backend must stay on Render.
- Any change to `VITE_API_URL` requires a new Vercel frontend deployment.
- Any change to backend env variables requires a Render backend restart/redeploy.
- Keep `.env` files out of Git.
