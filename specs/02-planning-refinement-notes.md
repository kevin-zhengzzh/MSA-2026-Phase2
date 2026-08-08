# Later Refinement & Polish Notes

Translated from the developer's own working notes file (`MSA1.txt`) — a short punch-list written during the later cleanup/polish pass, ahead of drafting the actual prompts for that work. Every item on this list maps directly onto real commits.

## Code quality
- *"Simplify code files, make them readable."* → reflected in the repo-structure cleanup, commit `035988f`.
- *"Code comments."* → ongoing practice throughout.
- *"Delete empty files."* → done as part of `035988f`.
- *"Code review."* → ongoing practice; also the origin of this project's `/code-review` habit.

## Test structure
- *"List frontend tests in their own folder, separately [from source]."* → done: frontend tests were moved out of being colocated with components into their own `frontend/tests/` folder, mirroring the backend's separate `backend.Tests/` project. See `04-ai-prompt-log-vscode.md`, P-19, and `05-design-decisions.md`, decision 7.

## Repo cleanup
- *"Delete the demo [folder]."* → done as part of `035988f` — an unused demo folder and other dead files were removed once confirmed nothing referenced them.

## UI / auth flow polish
- *"UI auto-adapts / adjusts position [responsive]."* → done — the mobile-responsive layout overhaul, commit `c4be27a`.
- *"Registration-success toast."* → done — a toast confirms successful registration.
- *"Password-visibility option."* → done — a clickable eye icon toggles the password field between hidden and visible, showing the *current* state rather than the state-after-click.
- *"Register first, then log in [not auto-login after registering]."* → done — after successful registration the user now lands on the login page rather than being taken straight into the app, with a success toast bridging the two steps.

All four items in this final group were implemented together in one session on 2026-08-06 (`c4be27a`); see `04-ai-prompt-log-vscode.md`, P-17 for the actual prompt.
