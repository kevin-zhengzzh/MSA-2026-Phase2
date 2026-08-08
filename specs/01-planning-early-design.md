# Early Design Notes

Translated from the developer's own working notes file (`msa.txt`, kept on the local desktop throughout the project as a running idea/bug backlog — not AI-generated). Original wording was informal shorthand; translated to English here, organized by topic, and each item annotated with what actually happened to it. This is the developer's own planning record, distinct from the AI conversation logs in `03-ai-prompt-log-web.md` and `04-ai-prompt-log-vscode.md`.

## Home page / streak display
- *"Home page: streak shown continuously on the leaderboard, with a dotted line showing how long until a skin can be earned."*
  → **Built**, but ended up on the **Rank page**, not Home: a streak-day dot/line tracker sits beside the leaderboard, and reaching a 7-day streak unlocks a dark skin (see `05-design-decisions.md`, decision 3).
- *"Distinguish users by username/account."*
  → **Built.** Username is unique and user-editable.

## Leaderboard
- *"Users ranked with badges shown; multiple ranking dimensions?"*
  - Earliest daily check-in, show where the user is from → **partially built**: a "daily check-in time" leaderboard exists; showing the user's location does not.
  - Calories burned, split into daily/monthly/yearly boards → **partially built**: a single calorie-burn leaderboard exists; it isn't split by time range.
  - Longest consecutive streak → **built** ("Streak Days" leaderboard).
  - Per-user badges on the leaderboard → **not built** — no badge/achievement system was implemented; see below.

## Store
- *"Store: badges (highlight the ones already owned)."*
  → **Changed in scope.** No separate badge system was built; the idea was absorbed into the cosmetic **skin** system instead (skins are what's bought/unlocked/highlighted-as-owned in the Store).

## Backlog / polish tips
- Points planning — daily reward + streak reward → **built**.
- Page transition effects → **built** (dashboard chart load-in animations, landing page scroll-reveal effects).
- Login screen polish → **built** (auth flow polish, loading states, password-visibility toggle — see `02-planning-refinement-notes.md`).
- Points/currency shown in the page heading → **built**.
- Check-in visual polish → **built** (checkmark icon tinted by the active skin, toast confirmation).
- "Refreshing leaves stale UI behind" bug → **fixed** (an avatar briefly flashing to its default image on page refresh).
- Jump/level system, earn medals or titles → **not built** — dropped in favor of keeping the loop to points + streaks + skins.

## Forum
- *"Forum"* (listed as a page alongside Home/Rank in an early nav sketch) → **not built** — dropped as out of scope for a habit-tracking app; the final nav is Home/Rank/Store only.

## Known bugs / todos noted early
- *"Email password reset"* → **still not built.** This is the same gap called out as a self-reflection item in the root README — it was identified as a to-do from the very start of the project and never got prioritized over core features.
- *"Sign out — fold the Store into the top-right user dropdown, then add a skin-change feature"* → **built** (user icon dropdown menu redesign; skins are equipped from the Store).
- *"Pagination for records; how will last year's records display?"* → **built** (pagination on check-in/workout history).
- Nav sketch `home / rank / forum` → **partially built** (Home + Rank; Forum dropped, see above).

## Layout
- *"Sidebar + project name + user icon spread toward both edges; does it adapt to a normal screen?"*
  → **Built**, and revisited twice: first as a floating sidebar layout, then reworked for mobile responsiveness, and finally smoothed from a hard breakpoint into a continuous `clamp()`-based offset (see `05-design-decisions.md`, decision 6).
