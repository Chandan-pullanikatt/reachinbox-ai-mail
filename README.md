# Production-Grade Email Scheduling System

A full-stack email scheduler built with Express, BullMQ, Redis, PostgreSQL, and React. Designed for reliability, persistence, and concurrency.

## 🚀 Features Implemented

### Backend
- **Scheduler**: Uses BullMQ delayed jobs backed by Redis. Zero dependency on runtime memory or cron jobs.
- **Persistence**: 
    - **Database**: All email metadata (status, timestamp, sender) is synced to PostgreSQL.
    - **Job Queue**: Redis persists job data, ensuring schedules survive server crashes/restarts.
- **Rate Limiting**: Custom implementation using Redis counters. Enforces "Emails per Hour" limit per user.
- **Concurrency**: Worker configured to process multiple emails in parallel (default: 5) for throughput.
- **Spill-over Handling**: If rate limit is hit, emails are automatically rescheduled to the next available hour slot.
- **Starring**: Ability to "star" important emails for quick access.

### Frontend
- **Authentication**: Google OAuth 2.0 integration for login.
- **Dashboard**:
    - **Stats**: Real-time counters for Pending, Sent, and Failed emails.
    - **History Table**: paginated view of email history with status badges.
- **Compose**:
    - **Rich Inputs**: Subject, Body, Recipient list parsing.
    - **Configuration**: UI controls for "Delay between emails" and "Hourly Limit".
- **Search & Filter**: Real-time search by subject/recipient and filtering by status/starred.
- **User Dropdown**: Profile management access.

---

## 🛠 Tech Stack

- **Backend**: Node.js, Express, TypeScript
- **Queue**: BullMQ + Redis
- **Database**: PostgreSQL (Prisma ORM)
- **Frontend**: Vite, React, Tailwind CSS
- **Email**: Nodemailer (Ethereal for dev)

---

## 🏃 How to Run

### 1. Infrastructure
Start Redis and Postgres using Docker (or use cloud providers like Render/Upstash):
```bash
docker-compose up -d
```

### 2. Backend Setup
Create a `.env` file in `/backend`:
```env
DATABASE_URL="postgresql://user:password@localhost:5432/scheduler_db"
REDIS_HOST="localhost"
REDIS_PORT="6379"
# Optional: Use REDIS_URL for production (e.g. Upstash)
# REDIS_URL="redis://..."
```

Run the backend:
```bash
cd backend
npm install
npx prisma db push   # Sync Schema
npm run dev
```
_Server runs on port 3000._

**Ethereal Email Setup**: 
The app automatically creates a test Ethereal account on startup if no credentials are provided. Check the server console logs for the Preview URL of sent emails.

### 3. Frontend Setup
Create a `.env` file in `/frontend`:
```env
VITE_API_URL="http://localhost:3000/api"
VITE_GOOGLE_CLIENT_ID="your_google_client_id"
```

Run the frontend:
```bash
cd frontend
npm install
npm run dev
```
_UI runs on port 5173._

---

## 🧠 Architecture Overview

### 1. Scheduling Flow
1.  **Request**: User submits an email with `Scheduled Time`, `Delay`, and `Hourly Limit`.
2.  **Calculation**: Backend calculates the specific `sendTime` for each recipient (Start Time + (Index * Delay)).
3.  **Storage**: 
    - A `ScheduledEmail` record is created in Postgres (Status: `PENDING`).
    - A Job is added to BullMQ with a `delay` parameter matching the target time.
4.  **Wait**: The job sits idle in Redis until the delay expires.

### 2. Persistence & Reliability
- **Server Restart**: Since jobs are stored in Redis (outside Node process) and metadata in Postgres, restarting the backend **does not** lose any schedules. BullMQ will pick up where it left off immediately on boot.
- **Crash Handling**: If a job fails during processing, it is retried 3 times (with exponential backoff) before being marked as `FAILED`.

### 3. Rate Limiting Logic
We handle limits nicely so users don't lose emails:
1.  Worker picks up a job.
2.  Checks Redis key `rate:limit:{senderId}:{hourTimestamp}`.
3.  **If Limit Exceeded**:
    - Calculates the start of the **next hour**.
    - Puts the job back into the delayed queue for that time.
    - Updates Postgres status to `RESCHEDULED`.
4.  **If Allowed**:
    - Increments counter.
    - Sends email via Nodemailer.
    - Updates Postgres status to `SENT`.

---

## ⚠️ Trade-offs & Assumptions

1.  **Authentication**:
    - *Assumption*: We rely on frontend-side Google JWT decoding for the demo. In a strict production env, verify the JWT signature on the backend middleware.
2.  **Timezones**:
    - *Assumption*: All scheduling assumes the server time (UTC ideally). The frontend sends ISO date strings.
3.  **Ethereal Email**:
    - *Trade-off*: We use Ethereal (fake SMTP) to avoid spamming real addresses during dev/testing. It simulates network latency well.
4.  **Deployment**:
    - *Note*: Redis persistence configuration (RDB/AOF) is assumed to be managed by the cloud provider (e.g., Upstash) for production data safety.

