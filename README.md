# Production-Grade Email Scheduling System

A full-stack email scheduler built with Express, BullMQ, Redis, PostgreSQL, and React.

## 🚀 Features

- **Reliable Scheduling**: Uses BullMQ delayed jobs backed by Redis. No cron jobs are used.
- **Persistence**: Jobs survive server restarts. All states are synced to Postgres.
- **Rate Limiting**: Enforces configurable hourly limits per sender. Automatically reschedules excess emails to the next hour.
- **Concurrency**: Configured worker concurrency for safe parallel execution.
- **Modern UI**: React + Tailwind Dashboard with Google OAuth flow.

## 🛠 Tech Stack

- **Backend**: Node.js, Express, TypeScript
- **Queue**: BullMQ + Redis
- **Database**: PostgreSQL (Prisma ORM)
- **Frontend**: Vite, React, Tailwind CSS
- **Email**: Nodemailer (Ethereal for dev)

## 🏃 How to Run

### 1. Infrastructure
Start Redis and Postgres using Docker:
```bash
docker-compose up -d
```

### 2. Backend
```bash
cd backend
npm install
npx prisma db push
npm run dev
```
Server runs on port 3000.

### 3. Frontend
```bash
cd frontend
npm install
npm run dev
```
UI runs on port 5173.

## 🧠 Core Architecture

### Scheduling
When a user schedules an email:
1.  The API calculates the exact `scheduledAt` time for each recipient (accounting for delays).
2.  A record is created in Postgres with `PENDING` status.
3.  A delayed job is added to the BullMQ wrapper (Redis).
4.  BullMQ holds the job until the time arrives, even if the Node process restarts.

### Restart Persistence
- **Jobs**: Stored in Redis (AOF/RDB persistence recommended for prod). If the worker crashes, BullMQ re-queues processing jobs or keeps delayed jobs waiting.
- **State**: Postgres serves as the source of truth for UI (History/Stats).

### Rate Limiting & Concurrency
**Rate Limiting**:
The system enforces a strict "Emails Per Hour" limit per sender using Redis counters (`rate:limit:senderId:hourTimestamp`).
- Before sending, the worker checks the counter.
- If the limit is hit, the job is **not dropped**. It is rescheduled to the **start of the next hour** using `job.moveToDelayed`.
- This ensures high volume requests spill over logically into future slots.

**Concurrency**:
The worker is configured with `concurrency: 5` (adjustable in `emailWorker.ts`). This allows 5 emails to be processed in parallel while sticking to rate limits.

**Min Delay**:
The worker also checks `rate:last_sent:senderId` to ensure a minimum gap (e.g., 5s) between sends, preventing burst spam even if rate limits allow it.

### Trade-offs
- **Precision**: BullMQ delayed jobs are accurate to within milliseconds usually, but heavy load might introduce slight processing delays.
- **Ethereal Mail**: Used for demonstration. In prod, switch 'transporter' in `emailService.ts` to AWS SES or SendGrid.
- **OAuth**: Frontend simulates Google login. For production, add a valid `GOOGLE_CLIENT_ID` in `App.tsx` and verify the token on the backend.

