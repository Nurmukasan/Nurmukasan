# AGENTS.md

## Project
Smart Campus Room Availability Checker. Vite + TypeScript, no framework.
One fictional room, fictional bookings in `src/data.ts`.

## Scope and constraints (do not change without human approval)
- Exactly one fictional room. No login, no database, no backend, no external APIs.
- Fictional data only: never add real names, emails, student IDs or other personal data.
- No secrets: never create or commit `.env` files, API keys or tokens.
- No deployments or publishing from the agent. A human publishes the demo.

## Acceptance contract (must stay true after every change)
- AC1 Reject invalid times and any time in the past (including earlier today).
- AC2 Enforce duration 30–120 min and opening hours 08:00–20:00.
- AC3 Reject any overlap with an existing booking (partial or enclosing); back-to-back is allowed.
- AC4 Reject requests that overlap a blocked period.
- AC5 Checks never modify stored booking/block data.
- AC6 Clear available / not-available feedback; usable on desktop and mobile (no horizontal scroll).

## Commands (safe to run)
- `npm ci` – install from the lockfile
- `npm test` – unit tests (Vitest)
- `npx tsc --noEmit` – type check
- `npm run build` – type check + production build
- `npm run dev` – local dev server only
- There is no lint script yet; do not claim lint passed.

## Forbidden actions
- `npm audit fix --force`, adding/upgrading dependencies, or editing the lockfile without approval.
- Deleting, skipping (`.skip`/`.only`) or weakening tests to make them pass.
- Pushing to `main`, force-pushing, rewriting history, or deploying.
- Unrelated refactoring outside the requested task.

## Code style
- TypeScript strict mode
- Keep business logic in `src/availability.ts` (pure, no DOM, clock passed in), UI in `src/main.ts`
- Render user input with `textContent`, never `innerHTML`
- Small functions, clear names

## Review gates (before proposing acceptance)
1. Work on a separate branch; keep the diff minimal and within scope.
2. Add or update a test for every behaviour change; tests must not depend on the real clock.
3. Run `npm test` and `npm run build`; paste the real output. Never report a check you did not run.
4. List changed files and which ACs were affected.
5. A human reviews the diff and approves before merge.
