# HealthTrack

A gamified daily check-in and workout-tracking app. Users log daily activity, build streaks, earn points, climb a leaderboard, and unlock cosmetic app skins — built for **MSA 2026 Phase 2 (Software Stream)**.

## 🔗 Live Deployment

| Service | URL |
|---|---|
| Frontend | https://msa-frontend.icyglacier-3b078f70.australiaeast.azurecontainerapps.io |
| Backend API (Scalar docs) | https://msa-backend.icyglacier-3b078f70.australiaeast.azurecontainerapps.io/scalar/ |

Deployed as Docker containers (backend + frontend) on **Azure Container Apps** (Australia East); the database is a managed **Neon** Postgres instance, not a container.

⏳ **Note:** these are hosted on Azure Container Apps' lowest tier, which scales to zero when idle — the first request after a period of inactivity may take a few seconds to cold-start. Subsequent requests are fast.

## Introduction

HealthTrack turns daily exercise into a habit-forming loop: check in, log a workout, keep your streak alive, and watch your points climb the leaderboard. It's a full-stack app with a C#/.NET 10 backend (EF Core + PostgreSQL) and a React + TypeScript frontend, built around a simple idea — make showing up every day feel rewarding.

## How This Relates to the Theme — Gamification

- **Points & tasks** — users earn points by completing daily check-ins and logging workouts, turning a mundane habit into a small, repeated reward loop.
- **Leaderboard** — a ranked leaderboard encourages healthy competition between users, motivating them to stay active to keep or improve their rank.
- **Streaks & unlockable skins** — maintaining a check-in streak unlocks cosmetic app skins. Making the skins streak-gated (rather than just point-purchasable) gives users a reason to come back *every day* rather than binge-earning points once.

## What Makes This Project Unique

1. **Docker-native deployment** — the full stack (db/backend/frontend) is containerized locally via `docker-compose`; backend and frontend ship to Azure Container Apps using those exact images. The database specifically was deployed as a managed **Neon** Postgres instance instead of its container — a deployment-cost decision, not a Docker limitation (see the Dockerize section below).
2. **HCI-conscious details** — a "what are points?" info tooltip demystifies the points system for new users, and the leaderboard percentile stat on the dashboard is clickable, jumping straight to your position on the Rank page instead of just displaying a number.
3. **Multi-dimensional data visualization** — dashboard charts (bar chart, pie chart, and a check-in frequency/heatmap view) let users understand their activity from several angles at a glance, not just a single number.
4. **Skin system** — users can customize the app's appearance to their taste by unlocking and equipping cosmetic themes, adding a personalization layer that increases day-to-day engagement.
5. **Landing/overview page** — a public landing page explains what the app does and how it works *before* signup, so users know what they're getting into.
6. **Mobile-responsive UI** — layout, navigation, and sidebars were reworked to collapse gracefully on mobile, giving mobile users a experience on par with desktop rather than a cut-down afterthought.

## Advanced Features (3)

> Only the three features below should be marked, per the assessment brief.

### 1. Security Measures
- **Password hashing (BCrypt)** — user passwords are never stored in plaintext. `BCrypt.Net-Next` salts and hashes passwords on registration and verifies via hash comparison on login (`software/backend/Services/AuthService.cs`). This matters because a database leak (backup exposure, misconfigured access, etc.) would otherwise hand attackers plaintext credentials that are very often reused across other sites.
- **Data validation / sanitisation (FluentValidation)** — every request DTO (register, login, username update, workout record, etc.) is validated with FluentValidation rules before it reaches the database layer (`software/backend/Validators/`). This blocks malformed or malicious input early, preventing bad data from corrupting state or being used to probe the backend.

### 2. Dockerize the Project
The full stack — PostgreSQL, backend, and frontend — is containerized via `software/docker-compose.yml`, each service with its own `Dockerfile`, giving a fully reproducible local environment where all three services build and run as containers. Backend and frontend ship to production using those exact images. The Postgres container itself wasn't carried over to production: Azure's own managed Postgres was tried first and priced out impractically even at the smallest tier, so the database was moved to **Neon** (a free managed Postgres service) instead. That's a deployment-cost decision made after the fact, not a limitation of the Docker setup — the database containerizes and runs correctly like everything else locally.

### 3. State Management (Zustand)
Auth/session state, user points, and the equipped skin are managed through a Zustand store (`software/frontend/src/store.ts`) instead of prop-drilling or Context boilerplate — kept intentionally lightweight, and covered by `store.test.ts`.

## Self-Reflection

If I were to do this project again:
1. **Spend more time designing more genuinely fun/engaging gamification mechanics** rather than the fairly standard points/streak/leaderboard set — e.g. badges/achievements for specific milestones, or time-limited challenges, to make the loop more interesting beyond raw repetition.
2. **Close the timezone double check-in edge case properly.** "Today" is currently resolved from the client's local date (clamped to ±1 day of server UTC time to block casual spoofing), but a user who physically changes timezone between two check-ins (e.g. flying across the date line) can still get two different valid `Date` values in the same real-world day, double-paying streak/points. The correct fix is a minimum-elapsed-time cooldown (~18–20h) against `User.LastCheckIn` — a real UTC timestamp immune to timezone spoofing — layered on top of the existing per-calendar-day check. This was identified during development but deliberately deferred in favor of finishing the core feature set before the deadline.
3. **Implement email-based password reset.** There's currently no "forgot password" flow. Because passwords are stored as one-way BCrypt hashes, the server can never recover or email a user's original password — the only correct approach is a *reset*, not a *recovery*: email a single-use, short-lived, high-entropy token (itself stored hashed, so a database leak can't be replayed into an account takeover), let the user set a new password through that link, and hash it the same way as at registration. It would also need to respond identically whether or not the email is registered, to avoid leaking which emails have accounts. This was left out mainly because it requires standing up an actual email-sending service (SMTP/SendGrid/etc.), which was out of scope for the time available.

## Tech Stack

**Backend:** C# / .NET 10 · EF Core · PostgreSQL · JWT auth · BCrypt · FluentValidation · Scalar API docs
**Frontend:** React 19 · TypeScript · Vite · Tailwind CSS v4 · React Router v7 · Zustand

## Local Development

### Prerequisites
- .NET 10 SDK
- Node.js (18+) and npm
- Docker Desktop (for the Docker-Compose option, or if you don't want to install PostgreSQL locally)

### Option A — Docker Compose (full stack, closest to production)
From the `software/` directory:
```bash
cp .env.example .env   # adjust POSTGRES_PASSWORD / JWT_KEY if you like
docker compose up --build
```
- Frontend: http://localhost:5173
- Backend: http://localhost:5000 (Scalar docs at http://localhost:5000/scalar)

### Option B — Run backend and frontend natively

**Backend** (from `software/backend/`):
```bash
dotnet restore
dotnet ef database update   # applies migrations to the local Postgres in appsettings.json
dotnet run
```
Runs at `http://localhost:5000`, Scalar docs at `http://localhost:5000/scalar`. Requires a local PostgreSQL instance matching `ConnectionStrings:DefaultConnection` in `appsettings.json` (defaults to `Host=localhost;Port=5432;Database=healthtracker;Username=postgres;Password=postgres`), or point `docker-compose.yml`'s `db` service at it separately.

**Frontend** (from `software/frontend/`):
```bash
npm install
npm run dev
```
Runs at `http://localhost:5173` and talks to the backend at `http://localhost:5000` by default (override via `VITE_API_URL`).

### Running Tests
```bash
# Backend (from software/backend/Tests/)
dotnet test

# Frontend (from software/frontend/)
npm run test
```

## Assessment Reference

Full requirements, submission instructions, and marking criteria: [`software/2026 Phase 2 - Software Assessment.pdf`](./software/2026%20Phase%202%20-%20Software%20Assessment.pdf).
