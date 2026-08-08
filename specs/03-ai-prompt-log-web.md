# AI Prompt Log — Early Architecture Planning (Web Chat)

**Tool:** Claude (claude.ai web chat) — separate from the Claude Code / VS Code sessions in `04-ai-prompt-log-vscode.md`, used before any code existed.
**Period:** 2026-06-23 → 2026-07-06.

## A note on completeness and editing

This phase happened in a web chat, not Claude Code, so there is no local session transcript to mine the way `04-ai-prompt-log-vscode.md` was built. For **P-01 through P-04**, the original prompt wording was not saved and could not be recovered — only the decisions that came out of them are recorded, sourced from the developer's own notes. **P-05 through P-07** are the developer's own record of those specific prompts, kept from the original chat. Prompts quoted below are lightly copyedited for spelling and grammar for clarity and rigor — meaning and intent are unchanged from the original.

It's also worth being upfront that this early phase planned a **larger app than what shipped**: a dual-backend setup (C# + Node.js), full food/calorie logging with a price-snapshot-style schema, and a real-time SignalR leaderboard. That scope was cut down around 2026-07-22 to the simpler check-in/streak/skin-shop app that's actually in this repo (see `01-planning-early-design.md` for the working notes from that transition, and `05-design-decisions.md` for what shipped instead). The entries below are left as an accurate record of what was actually decided *at the time*, not edited to match the final scope.

---

### P-01 — Requirement analysis and project concept

- **Date:** 2026-06-23
- **Stage:** Planning
- **Prompt:**

  > *(not retained — see note above)*

**Why this came up:** the assessment brief mixes mandatory requirements, a menu of optional advanced features, and submission logistics in one document; separating "must build" from "choose three of these" before writing code avoids building the wrong thing.

**Outcome:**
- Project concept: a gamified health app — streak tracking, points, and a leaderboard layered over daily logging.
- Positioned to double as both the MSA submission and a portfolio piece.
- Mandatory stack confirmed: .NET 10, EF Core, React, TypeScript.

**Artifacts affected:** initial `README.md`, project scaffold.

---

### P-02 — Backend language feasibility

- **Date:** 2026-06-23
- **Stage:** Architecture
- **Prompt:**

  > *(not retained — see note above)*

**Why this came up:** the assessment mandates C#/.NET for grading, but a second Node.js implementation was considered as an extra portfolio piece, so the question was one of build order and risk.

**Outcome:**
- Build the C# backend first.
- A Node.js/Express backend was considered as a bonus, sharing one frontend and one API contract — this was **later dropped entirely**; the shipped project has a single .NET backend.

**Artifacts affected:** repository layout planning (superseded).

---

### P-03 — Scope cut and advanced feature selection

- **Date:** 2026-06-23
- **Stage:** Scope
- **Prompt:**

  > *(not retained — see note above)*

**Why this came up:** the initial feature wishlist was larger than the timeline allowed; picking the three formal advanced features is a scoring decision under the assessment's rules ("we will only mark three"), so it needed to be locked in deliberately rather than left implicit.

**Outcome:**
- Three advanced features locked in: **state management (Zustand)**, **security measures** (password hashing + input validation, meeting the assessment's "minimum two, with justification" bar), and **Docker**.
- A real-time leaderboard (SignalR) was discussed as a stretch upgrade beyond the three counted features — **later dropped** along with the rest of the larger original scope.

**Artifacts affected:** `docker-compose.yml` (later), root `README.md` advanced-features checklist.

---

### P-04 — Consolidating planning into a spec file

- **Date:** 2026-06-23
- **Stage:** Process
- **Prompt:**

  > *(not retained — see note above)*

**Why this came up:** planning that only lives in chat history is unusable while actually coding, and unusable as submission evidence later.

**Outcome:**
- Decided to keep planning notes in a plain-text working file instead (this became `msa.txt`, translated in `01-planning-early-design.md`) rather than trying to export the full chat.
- Established that project planning material should end up in the repository (`/specs`) for both coding reference and submission evidence — the reasoning behind this document's existence.

**Artifacts affected:** `msa.txt` (desktop notes file, later folded into `/specs`).

---

### P-05 — Database schema design

- **Date:** 2026-07-06
- **Stage:** Data model
- **Prompt:**

  > Any suggestions about the database?

**Why this prompt:** deliberately open-ended — with the general concept already fixed, the goal was to surface schema problems not yet anticipated rather than confirm assumptions already made.

**Outcome (as decided at the time):**
- Core tables planned: users, foods, food logs, weight records, plus gamification tables for stats/badges.
- A price-snapshot-style pattern for food logs (freeze nutrition values at log time) was planned.
- Store timestamps in UTC, resolve the "day" boundary using the user's local time — flagged even at this planning stage as the most common bug class in streak systems. **This exact issue was later hit for real** on 2026-07-21 and fixed differently than originally planned here (see `04-ai-prompt-log-vscode.md`, P-08) — the eventual fix uses a client-supplied local date clamped against server UTC, rather than a stored per-user timezone column.
- `decimal`, never `float`, for any logged numeric health value.

**Artifacts affected:** this schema was for the original food-logging concept and was **not built** in this form — the shipped schema (`User`, `CheckIn`, `Skin`, `UserSkin`) is much smaller, reflecting the 2026-07-22 scope cut.

---

### P-06 — Hosted database requirement check

- **Date:** 2026-07-06
- **Stage:** Deployment
- **Prompt:**

  > Even according to the requirements?

**Why this prompt:** a direct follow-up challenging the previous answer — whether a hosted database was really required needed to be checked against the actual assessment PDF rather than accepted as general best practice.

**Outcome:**
- Confirmed a hosted database is effectively mandatory for a deployed app — `localhost` in a deployed connection string resolves to the server, not the dev machine.
- Confirmed only **one** GitHub repository is permitted, containing both frontend and backend.
- Deployment was planned to happen well before the final week, so deployment problems wouldn't collide with documentation/video work at the deadline. **This held up**: the app was deployed to Azure Container Apps on 2026-08-04, five days before the (extended) deadline.

**Artifacts affected:** deployment planning; realized later as `docker-compose.yml` + Azure Container Apps deployment (see `04-ai-prompt-log-vscode.md`, P-15).

---

### P-07 — Page structure and leaderboard placement

- **Date:** 2026-07-06
- **Stage:** UX / information architecture
- **Prompt:**

  > Homepage: check-in, exercise type selection, display exercise time earlier than % of users after check-in.
  > Dashboard: index display.
  > Shop: purchase appearances, badges (highlighting owned items), point details.
  > These are three pages and their features — where should I place the ranking part? Should I create another page, or put it into one of the three?

**Why this prompt:** three pages were already planned and the leaderboard didn't obviously belong to any of them — folding it into the Dashboard was the tempting default, and the prompt was really asking whether that default was right.

**Outcome:**
- The leaderboard got its own dedicated page rather than being folded into the Dashboard, on the reasoning that "my own stats over time" and "how I compare to others" are different jobs that would blur together if combined.
- **This decision held all the way through**, and was later strengthened rather than reversed: the shipped Rank page eventually got its *own* sidebar with four separate leaderboard dimensions (daily check-in time, calories burned, streak length — see `04-ai-prompt-log-vscode.md`, P-11), going further in the direction this prompt first set than the original three-page plan anticipated.

**Artifacts affected:** `frontend/src/pages/Rank.tsx`, `RankSidebar.tsx`.
