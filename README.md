# Interview Prep Reward Todo Platform

A MERN placement-preparation dashboard with task tracking, XP rewards, streaks, reports, and scheduled email reminders.

## Structure

- `backend` - Express, MongoDB, JWT, reports, rewards, cron jobs, email
- `frontend` - React, Vite, React Router, Axios, Recharts, dark dashboard UI

## Setup

1. Copy `backend/.env.example` to `backend/.env`.
2. Copy `frontend/.env.example` to `frontend/.env`.
3. Install dependencies:

```bash
npm run install:all
```

4. Run both apps:

```bash
npm run dev
```

Backend defaults to `http://localhost:5000`.
Frontend defaults to `http://localhost:5173`.

## AI Planner

The AI features work in fallback mode without an API key. To enable real Gemini-generated suggestions and roadmaps, set these in `backend/.env`:

```env
GEMINI_API_KEY=your-key
GEMINI_MODEL=gemini-2.5-flash
```

AI endpoints:

- `POST /api/ai/daily-suggestions`
- `POST /api/ai/questionnaire`
- `POST /api/ai/analyze-weakness`
- `POST /api/roadmaps/generate`
- `POST /api/roadmaps/:id/convert-to-tasks`
