# Getting Started Demo

> **This is NOT submission-worthy.**
> This is a bare-minimum scaffold to show how the pieces fit together. Your real project needs a gamification theme, proper UI design, unit tests, deployment, Scalar docs, and at least 3 advanced features.

---

## What's in Here

```
demo/
├── backend/       .NET 10 Web API — CRUD endpoints, EF Core, SQLite
└── frontend/      React + TypeScript (Vite) — calls the API, React Router
```

The app is a simple leaderboard: add a player name and score, see them ranked, delete entries.

---

## Running the Backend

Requires [.NET 10 SDK](https://dotnet.microsoft.com/download).

```bash
cd backend
dotnet run
```

API is available at `http://localhost:5000`
Scalar API docs at `http://localhost:5000/scalar`

Uses an in-memory database — no setup needed, but data resets every time the backend restarts.

---

## Running the Frontend

Requires [Node.js v20+](https://nodejs.org).

```bash
cd frontend
npm install   # only needed the first time
npm run dev
```

Open `http://localhost:5173` in your browser.

> Make sure the backend is running first, otherwise you'll see an error message on the leaderboard page.

---

## Project Structure

**Backend**

| File | Purpose |
|------|---------|
| `Program.cs` | App setup — DI, CORS, EF Core, Scalar |
| `Models/ScoreEntry.cs` | Data model |
| `Data/AppDbContext.cs` | EF Core database context |
| `Controllers/ScoresController.cs` | REST endpoints (GET, POST, PUT, DELETE) |

**Frontend**

| File | Purpose |
|------|---------|
| `src/types.ts` | Shared TypeScript interfaces |
| `src/api.ts` | All fetch calls to the backend |
| `src/App.tsx` | App shell with React Router and nav |
| `src/pages/Leaderboard.tsx` | Main page — list, add, delete scores |
| `src/pages/About.tsx` | Second route to show React Router works |

---

## What to Do Next (for your real submission)

1. **Pick your gamification idea** — study tracker, habit app, quiz platform, etc.
2. **Design your data models** — users, points, badges, streaks, levels
3. **Build proper CRUD endpoints** for all entities
4. **Build a real UI** — use MUI, Mantine, or Tailwind and design for mobile too
5. **Add unit tests** — both frontend and backend
6. **Pick 3 advanced features** and implement them (list them in your README!)
7. **Deploy** — Render, Railway, Azure, Vercel, Netlify, etc.
8. **Write your `/specs` folder** — document your AI prompts and design decisions as you go

---

## Common Problems

**`dotnet` not found** — install the [.NET 10 SDK](https://dotnet.microsoft.com/download)

**CORS error in browser** — check that `app.UseCors()` is in `Program.cs` before `app.MapControllers()`

**Frontend can't reach backend** — confirm the API URL in `src/api.ts` matches the port in `backend/Properties/launchSettings.json` (default: 5000)

**Port already in use** — change `applicationUrl` in `Properties/launchSettings.json`
