# AI Prompt Log — Implementation (Claude Code / VS Code)

**Tool:** Claude Code (VS Code extension), primarily Claude Sonnet 5.
**Period:** 2026-07-21 → 2026-08-07.
**Continues from:** `03-ai-prompt-log-web.md` (P-01–P-07). Numbering picks up at P-08.

This is a curated set of the decision points from ~400 real development prompts across 13 Claude Code sessions — the ones where a real judgment call got made, not the full raw transcript. Routine feature requests, one-word acknowledgements, and other administrative back-and-forth are left out; the ones kept below either changed the implementation, fixed a non-obvious bug, or reflect the developer pushing back on / redirecting an AI suggestion. Prompts are real and meaning-preserving, lightly copyedited for spelling and grammar throughout for clarity and rigor.

---

### P-08 — Check-in "today" resolution across timezones

- **Date:** 2026-07-21
- **Stage:** Debugging / architecture
- **Prompt:**

  > Help check whether the time is in the right UTC — what if the user is in a different region?

**Why this prompt:** a check-in made at 11:47pm local time had been stored under the *previous* calendar date — the backend was computing "today" from server UTC only.

**Outcome:** the client now sends its own local date; the server clamps it to within ±1 day of UTC to block trivial spoofing. A follow-up question in the same session — *"So what if someone using this app travels to a different country in a short time — will they be able to check in twice in one day?"* — surfaced a real remaining edge case (rapid timezone travel can still double-pay a streak). The decision, made explicitly in-session (*"Nah, just remember it — I'll put this disadvantage into the docs later."*), was to document this as a known limitation rather than build a full fix under time pressure. See `05-design-decisions.md`, decision 1, for the state diagram.

**Artifacts affected:** `backend/Controllers/CheckInController.cs` (`ResolveToday`), root `README.md` self-reflection section.

---

### P-09 — Points are claimed, not granted automatically

- **Date:** 2026-07-23
- **Stage:** UX design
- **Prompt:**

  > I want to put the mission text on the left of the dropdown menu name, like 'Daily Tasks' with an icon — hovering over it shows the task text (remove the previous version of this). The user won't gain points immediately when they check in or record a workout; they'll need to click a reward button instead.

**Why this prompt:** completing a check-in or workout record originally granted points immediately — a single, passive step.

**Outcome:** a "Daily Tasks" menu was added showing claimable rewards, with points only credited once the user explicitly claims them — turning a passive side effect into a deliberate second action in the gamification loop.

**Artifacts affected:** `frontend/src/components/DailyTasksMenu.tsx`.

---

### P-10 — Streak-gated skin unlock

- **Date:** 2026-07-29
- **Stage:** Feature design
- **Prompt:**

  > Create a dark skin that's good to use at night. On the right of the Rank page, add a frame with a line of dots that records the user's streak days. When the user reaches 7 days, reward them with the dark skin. When they get a new skin, show a red dot on the user icon and in the store to notify them.

**Why this prompt:** the store already sold skins for points; this introduced a second, non-purchasable path to a skin, gated on consistency rather than accumulation.

**Outcome:** a dark skin unlocks specifically at a 7-day check-in streak, visualized as a dot/line tracker beside the leaderboard, with a red notification dot surfacing the unlock in both the user menu and the Store. See `05-design-decisions.md`, decision 3, for the state diagram.

**Artifacts affected:** Rank page sidebar, Store page, `Skin`/`UserSkin` unlock logic.

---

### P-11 — Rank page gets its own sidebar, not Home's

- **Date:** 2026-07-29
- **Stage:** Information architecture
- **Prompt:**

  > No, I mean add a different sidebar for Rank instead of reusing Home's sidebar; the new sidebar should include calorie burn / points / daily check-in time.

**Why this prompt:** the first attempt reused the Home page's sidebar for Rank navigation, which didn't fit — Rank needed its own set of dimensions (daily check-in time, calorie burn, points, streak), not Home's set of pages.

**Outcome:** a dedicated `RankSidebar` was built with its own four leaderboard dimensions, later also fixed to resolve to its own route per tab (see P-16).

**Artifacts affected:** `frontend/src/components/RankSidebar.tsx`, `frontend/src/pages/Rank.tsx`.

---

### P-12 — Requirements gap-check before starting tests

- **Date:** 2026-07-30
- **Stage:** Planning
- **Prompt:**

  > [assessment PDF] Look back at the file: in the basic requirements, do we meet all of them for frontend and backend?

**Why this prompt:** before investing time in unit tests, the developer wanted to re-verify the current state against the actual assessment document rather than working from memory of what was required.

**Outcome:** confirmed remaining basic requirements and set the priority order that led directly into the backend/frontend test work in P-13.

**Artifacts affected:** none directly — this was a planning checkpoint, repeated several more times later in the project (2026-08-03, 08-04, 08-06, 08-07) as a running check against the spec.

---

### P-13 — Backend unit test scope

- **Date:** 2026-07-30
- **Stage:** Testing (planning)
- **Prompt:**

  > How many dimensions are included in the backend tests?

**Why this prompt:** asked while scoping out testing work ahead of time — rather than testing everything uniformly, the question was which parts of the backend actually needed coverage.

**Outcome:** the actual test suite was written a few days later (2026-08-03) and ended up scoped to the security- and business-logic-critical surfaces: request validators (register/login/username/workout), `AuthService` (password hashing/verification), and `CheckInController`'s date-resolution logic — directly covering the bug fixed in P-08.

**Artifacts affected:** `backend.Tests/Validators/`, `backend.Tests/Services/AuthServiceTests.cs`, `backend.Tests/Controllers/CheckInControllerTests.cs`.

---

### P-14 — Docker container topology

- **Date:** 2026-08-04
- **Stage:** Architecture
- **Prompt:**

  > Should I put frontend, backend, and the database into one container, or three separate containers?

**Why this prompt:** a single combined container would have been simpler to write, but doesn't match how the pieces actually scale or restart independently.

**Outcome:** three separate containers (db / backend / frontend) via `docker-compose`, each with its own `Dockerfile` — the same images later shipped to production.

**Artifacts affected:** `docker-compose.yml`, `backend/Dockerfile`, `frontend/Dockerfile`.

---

### P-15 — Deployment platform: Azure Container Apps, not App Service

- **Date:** 2026-08-04
- **Stage:** Deployment
- **Prompt:**

  > Is it really this expensive? ... I still want to combine Docker with Azure.

**Why this prompt:** the first deployment attempt (Azure App Service + a GitHub Actions workflow) didn't line up with the project already being Dockerized for local dev, and looked expensive for what it offered.

**Outcome:** the App Service attempt and its GitHub Actions workflow were removed; Azure Container Apps was used instead, running the *same* container images built for local `docker-compose`, so local dev and production stayed identical.

**Artifacts affected:** removed `.github/workflows/main_msa-2026-phase2.yml`; live deployment on Azure Container Apps.

---

### P-16 — Leaderboard duplicate-podium bug: route-per-tab fix

- **Date:** 2026-08-05
- **Stage:** Debugging
- **Prompt:**

  > Could each page be given its own dedicated route — would that avoid this problem?

**Why this prompt:** the Rank page's podium/list was duplicating when switching tabs with more than 3 leaderboard entries. Rather than accept a proposed patch to the symptom, the developer proposed a structural fix and asked whether it would actually solve the root cause.

**Outcome:** each leaderboard tab (daily check-in / calorie burn / streak) got its own route, so React fully remounts the relevant component on tab switch instead of mutating shared state in place — confirmed fixed for any leaderboard size.

**Artifacts affected:** `frontend/src/pages/Rank.tsx` routing.

---

### P-17 — Auth flow polish bundle

- **Date:** 2026-08-06
- **Stage:** UX polish
- **Prompt:**

  > After registration succeeds, navigate to the login page instead of going directly to the user page. Add success toasts for both registration and login. Add a clickable eye icon on the password field to show or hide the password.

**Why this prompt:** three related auth-flow gaps identified together from the developer's own refinement notes (see `02-planning-refinement-notes.md`).

**Outcome:** registration now routes to the login page (not straight into the app) with a success toast bridging the steps; login success also toasts; a password-visibility eye icon was added, corrected in the same session to show the *current* state rather than the state-after-click (*"The eye icon should show the current state, not the state after clicking."*).

**Artifacts affected:** `frontend/src/pages/Register.tsx`, `frontend/src/pages/Login.tsx`.

---

### P-18 — Responsive sidebar: continuous offset instead of a hard breakpoint

- **Date:** 2026-08-06
- **Stage:** UX polish
- **Prompt:**

  > When the viewport becomes narrow, the sidebar and the 'HealthTrack' logo suddenly jump to the left — could that be smoothed out a little?

**Why this prompt:** an initial responsive fix worked but visibly snapped the sidebar to a new position at one specific viewport width during a resize.

**Outcome:** replaced the hard breakpoint with an inline `clamp()` tied to the actual leftover page-gutter width, so the offset eases in continuously with viewport width instead of jumping. See `05-design-decisions.md`, decision 6.

**Artifacts affected:** `frontend/src/components/Sidebar.tsx`, `RankSidebar.tsx`.

---

### P-19 — Frontend test folder restructured to mirror the backend

- **Date:** 2026-08-06
- **Stage:** Project structure
- **Prompt:**

  > I want it to have the same folder hierarchy as the backend test folder.

**Why this prompt:** frontend tests were colocated with their components (a common React convention), but the backend keeps tests in a fully separate `backend.Tests/` project — the developer prioritized cross-stack structural consistency over the React convention.

**Outcome:** frontend tests were moved into their own `frontend/tests/` folder, mirroring `backend.Tests/`.

**Artifacts affected:** `frontend/tests/` (moved from colocated `*.test.tsx` files).

---

### P-20 — Touch-device dropdown bug: proposing candidate solutions

- **Date:** 2026-08-07
- **Stage:** Debugging / design
- **Prompt:**

  > I'm wondering if there's a solution where the hover-dropdown and click-dropdown can coexist. Here are my two ideas: 1. Detect desktop vs. mobile and automatically switch behavior. 2. Let both work at the same time, but watch out for bugs from them triggering together. What do you think?

**Why this prompt:** the user icon and daily-tasks dropdown menus opened on hover, which doesn't exist as an input on touch devices — the menus were effectively unusable on phones. Rather than asking for a fix outright, the developer proposed two concrete approaches and asked for an evaluation.

**Outcome:** fixed the dropdowns to work correctly on touch devices.

**Artifacts affected:** `frontend/src/components/UserMenu.tsx`, `DailyTasksMenu.tsx`.

---

### P-21 — Dashboard charts: calorie bar chart, weekly goal donut, check-in heatmap

- **Date:** 2026-07-28
- **Stage:** Feature development / UX polish

- **Prompt:**

  > keep the checkin component size still after checkin and dont hide button but change it into unclickable grey; make the dropdown of user to the right symmetry with the pill

**Why this prompt:** one of many interaction-polish rounds within a much larger session that started with "I want to put current content in dashboard to right side, and add a bar chart shows the calories in a week/month/year, and a pie chart shows the percentage of calories completed in the week, which can be set" — three new dashboard visualizations (calorie bar chart, weekly-goal donut, check-in frequency heatmap) got built first, and this was one of the follow-up fixes once the basic charts existed: the check-in button was disappearing instead of just going disabled after a check-in, and the user dropdown wasn't centered under its trigger.

**Outcome:** the check-in card now keeps a fixed size and shows the button as disabled/greyed-out rather than hiding it, and the user dropdown menu re-centers under its trigger pill. This was one of dozens of rounds of similar polish in the same session — others included hover-tooltip behavior, month/year chart layout, and entry-animation timing verified with a DOM-identity probe so charts only replay their animation on scale change, not on every hover.

**Artifacts affected:** `frontend/src/components/CalorieBarChart.tsx`, `WeeklyGoalDonut.tsx`, `CheckInHeatmap.tsx`, `Dashboard.tsx`, `UserMenu.tsx`.

---

### P-22 — Database: Neon over Azure's managed Postgres

- **Date:** 2026-08-04
- **Stage:** Deployment

- **Prompt:**

  > Even with everything set to the minimum, it's still $50 a month?

**Why this prompt:** Azure Database for PostgreSQL – Flexible Server was tried first as the production database, since it's Azure's own managed offering. Tuning it down to the cheapest workload tier, smallest burstable SKU, and disabled high availability still priced out around $50/month, after a first pass at default settings had priced it in the hundreds.

**Outcome:** dropped Azure's managed Postgres entirely in favor of Neon, a genuinely free (no credit card, no time limit) managed Postgres service, decoupling the database from whichever cloud hosts the backend/frontend. This is also why the backend/frontend containers and the database aren't actually identical between "fully Dockerized locally" and "what's deployed" — see the note in README's Live Deployment section.

**Artifacts affected:** backend's `ConnectionStrings__DefaultConnection` (Neon connection string), root `README.md` Live Deployment section.

---

### P-23 — Image distribution: Docker Hub over Azure Container Registry

- **Date:** 2026-08-04
- **Stage:** Deployment

- **Prompt:**

  > Does Azure have a service that can run Docker directly?

**Why this prompt:** Container Apps needed somewhere to pull the backend/frontend images from. Azure's own Container Registry is the default pairing, but isn't part of the free tier (roughly $5/month minimum) — which mattered right after the Postgres pricing surprise earlier in the same session (P-22).

**Outcome:** images are built locally from the existing Dockerfiles, pushed to a public Docker Hub repository, and Container Apps is configured to pull directly from Docker Hub instead of Azure Container Registry — avoiding the only paid piece left in the stack.

**Artifacts affected:** deployment process (not a repo file) — local `docker build`/`docker push` commands, Container Apps image-source configuration.
