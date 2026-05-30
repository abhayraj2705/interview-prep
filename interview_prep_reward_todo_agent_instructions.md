# Interview Prep Reward Todo Platform — Agent Build Instructions

## 1. Project Overview

Build a MERN-based interview preparation todo platform for a pre-final year student preparing for placements.

The platform should help the user plan, track, and complete daily interview preparation tasks with a reward-based motivation system. It should also send daily email reminders and performance reports.

This is not a normal todo app. It should feel like a personal placement preparation dashboard with gamification, progress tracking, streaks, rewards, and analytics.

---

## 2. Tech Stack

Use the MERN stack.

### Frontend

- React.js
- React Router
- Axios
- Tailwind CSS or CSS modules
- Chart library for analytics, if needed

### Backend

- Node.js
- Express.js
- MongoDB
- Mongoose
- JWT authentication
- Bcrypt for password hashing

### Email System

Use an email service such as:

- Nodemailer
- SMTP provider
- Gmail SMTP for development
- SendGrid / Resend / Brevo for production if required

### Deployment

- Frontend: Vercel
- Backend: Render
- Database: MongoDB Atlas

---

## 3. Core Purpose

The platform should allow the user to:

1. Add daily interview preparation tasks.
2. Categorize tasks based on preparation areas.
3. Complete tasks and earn points.
4. Track daily and weekly performance.
5. Maintain streaks.
6. Unlock rewards and badges.
7. Receive daily task reminder emails.
8. Receive daily performance report emails.
9. Review preparation progress before placements.

---

## 4. User Role

For the first version, build this as a single-user personal productivity platform.

However, keep the architecture flexible so that multi-user support can be added later.

The authenticated user should have access only to their own tasks, reports, rewards, and profile data.

---

## 5. Main Features

## 5.1 Authentication

Implement user authentication.

Required screens:

- Signup
- Login
- Logout
- Protected dashboard routes

Required backend features:

- Password hashing
- JWT token generation
- JWT middleware
- Protected APIs

User data should include:

```js
{
  name: String,
  email: String,
  password: String,
  targetRole: String,
  preparationStartDate: Date,
  placementTargetDate: Date,
  dailyStudyHoursGoal: Number
}
```

---

## 5.2 Dashboard

The dashboard should be the main page after login.

It should display:

- Today's total tasks
- Completed tasks
- Pending tasks
- Completion percentage
- Current streak
- Total reward points
- Today's earned points
- Weekly progress
- Weakest preparation category
- Motivational status message

Example dashboard cards:

```text
Today's Progress: 75%
Tasks Completed: 6/8
Current Streak: 5 Days
Total XP: 1240
Today's XP: 160
Weak Area: Aptitude
```

---

## 5.3 Task Management

The user should be able to:

- Create a task
- View tasks
- Update task
- Delete task
- Mark task as complete
- Mark task as pending
- Filter tasks by category
- Filter tasks by status
- Filter tasks by priority
- View today's tasks

Task categories:

```text
DSA
MERN Stack
JavaScript
React
Node.js
MongoDB
System Design
Cybersecurity
Aptitude
Resume
HR Preparation
Mock Interview
Other
```

Task priorities:

```text
Low
Medium
High
Critical
```

Task difficulty:

```text
Easy
Medium
Hard
```

Task statuses:

```text
Pending
In Progress
Completed
Skipped
```

Task schema:

```js
{
  userId: ObjectId,
  title: String,
  description: String,
  category: String,
  difficulty: String,
  priority: String,
  estimatedTimeMinutes: Number,
  actualTimeMinutes: Number,
  dueDate: Date,
  status: String,
  points: Number,
  completedAt: Date,
  createdAt: Date,
  updatedAt: Date
}
```

---

## 5.4 Reward System

Add a reward system based on task completion.

Points should be calculated based on task difficulty and priority.

Suggested points:

```text
Easy Task: 10 XP
Medium Task: 20 XP
Hard Task: 40 XP
Critical Priority Bonus: +15 XP
Daily 80% Completion Bonus: +50 XP
Daily 100% Completion Bonus: +100 XP
7-Day Streak Bonus: +150 XP
```

Reward levels:

```text
Level 1: Beginner Candidate
Level 2: Consistent Learner
Level 3: Interview Grinder
Level 4: Placement Warrior
Level 5: Offer Ready
```

Badge examples:

```text
First Task Completed
3-Day Streak
7-Day Streak
DSA Warrior
MERN Master
Resume Ready
Mock Interview Starter
100% Day Completed
```

Reward schema:

```js
{
  userId: ObjectId,
  totalPoints: Number,
  currentLevel: String,
  badges: [
    {
      name: String,
      description: String,
      unlockedAt: Date
    }
  ],
  currentStreak: Number,
  longestStreak: Number,
  lastTaskCompletionDate: Date
}
```

---

## 5.5 Daily Performance Tracking

Generate daily performance data.

Track:

- Total tasks created for the day
- Total completed tasks
- Pending tasks
- Skipped tasks
- Completion percentage
- Total XP earned
- Total study time
- Strongest category
- Weakest category

Daily report schema:

```js
{
  userId: ObjectId,
  date: Date,
  totalTasks: Number,
  completedTasks: Number,
  pendingTasks: Number,
  skippedTasks: Number,
  completionRate: Number,
  totalPointsEarned: Number,
  totalStudyTimeMinutes: Number,
  strongestCategory: String,
  weakestCategory: String,
  generatedAt: Date
}
```

---

## 5.6 Weekly Performance Tracking

Generate weekly analytics.

Track:

- Weekly task completion percentage
- Category-wise completion
- Best preparation day
- Weakest preparation area
- Total XP earned this week
- Streak status
- Improvement suggestion

Weekly report schema:

```js
{
  userId: ObjectId,
  weekStartDate: Date,
  weekEndDate: Date,
  totalTasks: Number,
  completedTasks: Number,
  completionRate: Number,
  totalPointsEarned: Number,
  bestDay: String,
  weakestCategory: String,
  improvementSuggestion: String
}
```

---

## 5.7 Email Reminder System

Implement an automated email reminder system.

There should be two major email flows.

### Morning Task Reminder Email

Send this email at the start of the day.

The email should contain:

- Greeting
- Today's task list
- Priority tasks
- Target completion percentage
- Motivational line

Example:

```text
Good morning Abhayraj,

Here are your interview preparation tasks for today:

1. Solve 5 DSA array problems
2. Revise React hooks
3. Practice 20 aptitude questions
4. Update resume project section

Today's target: Complete at least 80% of your tasks.

Stay consistent. Every completed task takes you closer to placement.
```

### Night Performance Report Email

Send this email at the end of the day.

The email should contain:

- Completed task count
- Pending task count
- Completion percentage
- XP earned
- Current streak
- Weakest category
- Tomorrow's suggested focus

Example:

```text
Today's Interview Prep Report

Tasks Completed: 6/8
Completion Rate: 75%
XP Earned: 160
Current Streak: 5 Days
Weak Area: Aptitude

Tomorrow's Focus:
Practice aptitude and revise one MERN topic.
```

---

## 5.8 Scheduler / Cron Jobs

Add scheduled jobs in the backend.

Required jobs:

```text
Morning Reminder Job
Night Performance Report Job
Weekly Report Job
Streak Update Job
```

Suggested timing:

```text
Morning Reminder: 7:00 AM
Night Report: 10:00 PM
Weekly Report: Sunday 8:00 PM
```

The scheduler should:

1. Fetch the user.
2. Fetch relevant tasks.
3. Generate email content.
4. Send email.
5. Store email logs.
6. Handle errors properly.

Email log schema:

```js
{
  userId: ObjectId,
  emailType: String,
  recipientEmail: String,
  subject: String,
  status: String,
  sentAt: Date,
  errorMessage: String
}
```

---

## 6. System Architecture

```text
Frontend React App
 |
 | API calls using Axios
 v
Express Backend API
 |
 |-----------------------------------|
 |                                   |
 v                                   v
MongoDB Database                Email Service
 |
 v
Task, User, Reward,
DailyReport, WeeklyReport,
EmailLog Collections

Scheduler / Cron Jobs
 |
 |-- Morning reminder email
 |-- Night performance report
 |-- Weekly progress report
 |-- Streak calculation
```

---

## 7. Backend Architecture

Use a layered backend architecture.

```text
backend/
 |
 |-- src/
 |   |-- config/
 |   |   |-- db.js
 |   |   |-- mail.js
 |
 |   |-- controllers/
 |   |   |-- auth.controller.js
 |   |   |-- task.controller.js
 |   |   |-- reward.controller.js
 |   |   |-- report.controller.js
 |
 |   |-- models/
 |   |   |-- user.model.js
 |   |   |-- task.model.js
 |   |   |-- reward.model.js
 |   |   |-- dailyReport.model.js
 |   |   |-- weeklyReport.model.js
 |   |   |-- emailLog.model.js
 |
 |   |-- routes/
 |   |   |-- auth.routes.js
 |   |   |-- task.routes.js
 |   |   |-- reward.routes.js
 |   |   |-- report.routes.js
 |
 |   |-- services/
 |   |   |-- auth.service.js
 |   |   |-- task.service.js
 |   |   |-- reward.service.js
 |   |   |-- report.service.js
 |   |   |-- mail.service.js
 |
 |   |-- jobs/
 |   |   |-- morningReminder.job.js
 |   |   |-- nightReport.job.js
 |   |   |-- weeklyReport.job.js
 |   |   |-- streak.job.js
 |
 |   |-- middleware/
 |   |   |-- auth.middleware.js
 |   |   |-- error.middleware.js
 |
 |   |-- utils/
 |   |   |-- calculatePoints.js
 |   |   |-- calculateStreak.js
 |   |   |-- generateReport.js
 |
 |   |-- server.js
```

---

## 8. Frontend Architecture

```text
frontend/
 |
 |-- src/
 |   |-- components/
 |   |   |-- ui/
 |   |   |-- dashboard/
 |   |   |-- tasks/
 |   |   |-- rewards/
 |   |   |-- reports/
 |
 |   |-- pages/
 |   |   |-- Login.jsx
 |   |   |-- Signup.jsx
 |   |   |-- Dashboard.jsx
 |   |   |-- Tasks.jsx
 |   |   |-- Rewards.jsx
 |   |   |-- Reports.jsx
 |   |   |-- Profile.jsx
 |
 |   |-- context/
 |   |   |-- AuthContext.jsx
 |
 |   |-- services/
 |   |   |-- api.js
 |   |   |-- authApi.js
 |   |   |-- taskApi.js
 |   |   |-- rewardApi.js
 |
 |   |-- routes/
 |   |   |-- AppRoutes.jsx
 |
 |   |-- utils/
 |   |-- App.jsx
 |   |-- main.jsx
```

---

## 9. API Endpoints

## 9.1 Auth APIs

```text
POST /api/auth/register
POST /api/auth/login
GET  /api/auth/me
POST /api/auth/logout
```

---

## 9.2 Task APIs

```text
POST   /api/tasks
GET    /api/tasks
GET    /api/tasks/today
GET    /api/tasks/:id
PUT    /api/tasks/:id
PATCH  /api/tasks/:id/complete
PATCH  /api/tasks/:id/status
DELETE /api/tasks/:id
```

---

## 9.3 Reward APIs

```text
GET /api/rewards
GET /api/rewards/badges
GET /api/rewards/streak
```

---

## 9.4 Report APIs

```text
GET  /api/reports/daily
GET  /api/reports/weekly
POST /api/reports/generate-daily
POST /api/reports/generate-weekly
```

---

## 10. UI Design System

## 10.1 Theme

Use a dark motivational interview-prep theme.

Main colors:

```text
Primary Background: Black
Secondary Background: Very Dark Gray
Primary Accent: Dark Orange
Secondary Accent: Dark Red
Text Primary: Off White
Text Secondary: Light Gray
Border: Dark Orange / Dark Red with low opacity
```

Suggested color values:

```css
--color-bg-main: #050505;
--color-bg-card: #111111;
--color-bg-card-soft: #181818;
--color-orange: #c75b12;
--color-orange-bright: #f97316;
--color-red-dark: #7f1d1d;
--color-red-accent: #991b1b;
--color-text-main: #f5f5f5;
--color-text-muted: #a3a3a3;
--color-border: rgba(249, 115, 22, 0.25);
```

---

## 10.2 Background Style

Use a black background with a subtle light grid.

The grid should be visible but not distracting.

Example CSS:

```css
body {
  background-color: #050505;
  background-image:
    linear-gradient(rgba(255, 255, 255, 0.045) 1px, transparent 1px),
    linear-gradient(90deg, rgba(255, 255, 255, 0.045) 1px, transparent 1px);
  background-size: 32px 32px;
  color: #f5f5f5;
}
```

---

## 10.3 Card / Box Design

All major boxes should be rounded with smooth edges.

Use:

```css
.card {
  background: rgba(17, 17, 17, 0.92);
  border: 1px solid rgba(249, 115, 22, 0.25);
  border-radius: 20px;
  padding: 24px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.45);
}
```

Card rules:

- Use rounded corners.
- Use dark background.
- Use orange/red border accents.
- Use soft shadows.
- Avoid bright neon effects.
- Keep the UI clean and focused.
- Do not use too many colors.

---

## 10.4 Buttons

Primary button:

```css
.btn-primary {
  background: linear-gradient(135deg, #c75b12, #991b1b);
  color: #ffffff;
  border-radius: 14px;
  padding: 12px 18px;
  font-weight: 600;
}
```

Secondary button:

```css
.btn-secondary {
  background: transparent;
  color: #f5f5f5;
  border: 1px solid rgba(249, 115, 22, 0.35);
  border-radius: 14px;
}
```

Hover behavior:

```css
.btn-primary:hover,
.card:hover {
  border-color: rgba(249, 115, 22, 0.65);
  transform: translateY(-2px);
  transition: all 0.2s ease;
}
```

---

## 10.5 Typography

Use clean modern typography.

Suggested:

```text
Headings: Bold, clear, modern
Body Text: Simple and readable
Numbers / Stats: Large and prominent
```

Text hierarchy:

```text
Page Title: 32px to 40px
Section Title: 22px to 28px
Card Title: 18px to 20px
Body Text: 14px to 16px
Small Muted Text: 12px to 14px
```

---

## 11. Important UI Pages

## 11.1 Landing Page

Should explain the platform briefly.

Sections:

- Hero section
- Why this platform exists
- Features
- Reward-based preparation
- Start preparation button

Hero example:

```text
Prepare for placements with discipline, rewards, and daily progress tracking.
```

---

## 11.2 Dashboard Page

Must include:

- Welcome message
- Today's progress
- Streak card
- XP card
- Task completion chart
- Today's tasks preview
- Weak area card
- Reward progress card

---

## 11.3 Tasks Page

Must include:

- Add task button
- Task filters
- Task list
- Task status badge
- Complete button
- Edit button
- Delete button

---

## 11.4 Rewards Page

Must include:

- Total XP
- Current level
- Current streak
- Longest streak
- Unlocked badges
- Locked badges

---

## 11.5 Reports Page

Must include:

- Daily report
- Weekly report
- Category-wise progress
- Completion percentage
- Study time analytics
- Improvement suggestion

---

## 11.6 Profile Page

Must include:

- Name
- Email
- Target role
- Daily study goal
- Placement target date
- Email reminder preferences

---

## 12. Reward Calculation Logic

Use this logic:

```js
function calculateTaskPoints(task) {
  let points = 0;

  if (task.difficulty === "Easy") points += 10;
  if (task.difficulty === "Medium") points += 20;
  if (task.difficulty === "Hard") points += 40;

  if (task.priority === "High") points += 10;
  if (task.priority === "Critical") points += 15;

  return points;
}
```

Daily bonus logic:

```js
if (completionRate >= 80 && completionRate < 100) {
  bonus = 50;
}

if (completionRate === 100) {
  bonus = 100;
}
```

---

## 13. Streak Logic

A streak increases when the user completes at least one task in a day.

A streak continues only if the user completes tasks on consecutive days.

Rules:

```text
If user completed at least one task today -> streak continues
If user missed one full day -> streak resets to 0
If current streak > longest streak -> update longest streak
```

---

## 14. Performance Logic

Completion percentage:

```js
completionRate = (completedTasks / totalTasks) * 100;
```

Strongest category:

```text
Category with highest completion percentage
```

Weakest category:

```text
Category with lowest completion percentage
```

Study time:

```text
Sum of actualTimeMinutes from completed tasks
```

---

## 15. Email Templates

## 15.1 Morning Email Template

Subject:

```text
Today's Interview Prep Tasks
```

Body:

```text
Good morning {{name}},

Here are your tasks for today:

{{taskList}}

Today's target:
Complete at least {{targetCompletion}}% of your tasks.

Current streak: {{currentStreak}} days
Total XP: {{totalPoints}}

Stay consistent. Every task completed today improves your placement preparation.
```

---

## 15.2 Night Report Email Template

Subject:

```text
Your Daily Interview Prep Report
```

Body:

```text
Hello {{name}},

Here is your preparation report for today:

Tasks Completed: {{completedTasks}} / {{totalTasks}}
Completion Rate: {{completionRate}}%
XP Earned Today: {{pointsEarned}}
Current Streak: {{currentStreak}} days
Weakest Category: {{weakestCategory}}

Tomorrow's Suggested Focus:
{{suggestion}}

Keep improving daily. Small progress every day compounds into placement readiness.
```

---

## 16. Error Handling Requirements

The app should handle:

- Invalid login credentials
- Expired JWT token
- Empty task title
- Invalid due date
- Failed email sending
- Database connection error
- Unauthorized access
- Server error

API responses should follow this structure:

```js
{
  success: false,
  message: "Error message here"
}
```

Successful responses should follow:

```js
{
  success: true,
  message: "Success message here",
  data: {}
}
```

---

## 17. Security Requirements

Implement:

- Password hashing using bcrypt
- JWT authentication
- Protected backend routes
- Environment variables for secrets
- Input validation
- CORS configuration
- Rate limiting for auth routes
- Secure email credentials
- No hardcoded passwords or API keys

Environment variables:

```env
PORT=
MONGO_URI=
JWT_SECRET=
JWT_EXPIRES_IN=
CLIENT_URL=
EMAIL_HOST=
EMAIL_PORT=
EMAIL_USER=
EMAIL_PASS=
```

---

## 18. Deployment Requirements

Frontend should be deployable on Vercel.

Backend should be deployable on Render.

Database should use MongoDB Atlas.

Important deployment notes:

- Use environment variables.
- Configure CORS with the deployed frontend URL.
- Do not expose backend secrets.
- Use production email credentials.
- Ensure cron jobs work on deployed backend.
- Keep backend health route available.

Health route:

```text
GET /api/health
```

Response:

```js
{
  success: true,
  message: "Server is running"
}
```

---

## 19. MVP Scope

Build the MVP first.

MVP must include:

- Authentication
- Dashboard
- Task CRUD
- Mark task as complete
- XP calculation
- Basic reward display
- Daily performance calculation
- Morning email reminder
- Night email report
- Dark orange/red UI theme
- Rounded cards
- Light grid background

Do not overbuild in the first version.

---

## 20. Future Features

Keep architecture flexible for these future features:

- AI-based daily task suggestions
- Calendar view
- Pomodoro timer
- Resume tracker
- Mock interview tracker
- Leaderboard
- Multi-user support
- Admin dashboard
- Placement preparation roadmap generator
- PDF weekly progress export

---

## 21. Build Priority

Follow this order:

1. Backend setup
2. Database models
3. Authentication
4. Task APIs
5. Reward logic
6. Daily report logic
7. Email service
8. Scheduler jobs
9. Frontend setup
10. Auth pages
11. Dashboard page
12. Task page
13. Rewards page
14. Reports page
15. Final UI polish
16. Deployment setup

---

## 22. Final Expected Outcome

The final platform should feel like a serious placement preparation dashboard.

It should help the user stay consistent for 2.5 months by combining:

- Task planning
- Progress tracking
- Reward motivation
- Streaks
- Daily emails
- Weekly reports
- Visual analytics

The design should be dark, clean, rounded, modern, and motivational using black, dark orange, dark red, and a subtle light grid background.
