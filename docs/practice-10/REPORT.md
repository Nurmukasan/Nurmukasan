# Practice #10 – Risk Review of the Smart Campus Room Availability Checker

**Course:** AI-Driven Software Engineering (KBTU) · Lesson #10 Practice
**Student:** Markabaev Nurmukasan (Маркабаев Нурмукасан) · **ID:** 25B030216 · **Class:** Tuesday, 16:00–19:00
**AI tool:** Claude Code 2.1.326 (cloud session, claude.ai/code) · **Model:** Claude Opus 5.5 (`claude-opus-5-5`)
**Date:** 2026-11-17
**Project:** repository root (Vite 6 + TypeScript 5.9 + Vitest 3, no framework, no backend)

> Note: the Practice #09 project was not in this repository, so it was rebuilt to the Practice #09 spec
> (one fictional room, fictional bookings, no login/DB, acceptance contract AC1–AC6) and saved as the
> baseline checkpoint **before** any review work (git tag `practice-09-baseline`, commit `403abf2`).

## Acceptance contract (AC1–AC6)

| ID | Rule |
|---|---|
| AC1 | Reject invalid or past times |
| AC2 | Enforce allowed duration (30–120 min) and opening hours (08:00–20:00) |
| AC3 | Reject overlap with an existing booking |
| AC4 | Reject blocked-room requests |
| AC5 | Keep stored fictional booking data unchanged during checks |
| AC6 | Clear availability feedback; usable desktop/mobile behaviour |

---

## Task 01 – Baseline

- Checkpoint: commit `403abf2`, tag `practice-09-baseline` (created before any change).
- Located: `README.md`, `AGENTS.md`, `tests/availability.test.ts` (6 tests), `package.json` scripts `dev`, `build`, `preview`, `test`.

| Command | Result | Evidence |
|---|---|---|
| `npm test` | PASS – 6/6 | `evidence/01-baseline-test.txt` |
| `npm run build` (tsc + vite) | PASS | `evidence/01-baseline-build.txt` |
| `npm start` (documented in README) | **MISSING** – "Missing script: start" | `evidence/01-baseline-start.txt` |
| `npm run lint` (documented in AGENTS.md) | **MISSING** | `evidence/01-baseline-lint.txt` |
| `npm run typecheck` | **MISSING** (only runs inside `build`) | `evidence/01-baseline-typecheck.txt` |
| `npm audit` | FAIL – 3 vulnerabilities (1 moderate, 2 critical) | `evidence/01-baseline-audit.txt` |

## Task 02 – Read-only risk review (AI)

Prompt used (from the slide):
> Act as a cautious software reviewer. Inspect this Smart Campus Room Availability Checker WITHOUT editing files. Identify risks in correctness, security, privacy, reliability, maintainability, and agent operations. For each risk, cite the exact file/function or missing check, explain the impact, suggest a way to verify it, and state uncertainty. Do not invent test results.

The review was read-only: `git diff practice-09-baseline 1cb3fc1 -- src tests package.json` is empty, so the review commit changed no app code.

| # | Category | AI finding (as proposed) | Cited location | Proposed verification | AI uncertainty |
|---|---|---|---|---|---|
| F1 | Correctness | Overlap only checks if the *start* is inside a booking; misses requests that end inside or enclose a booking | `src/availability.ts` › `checkAvailability`, bookings loop | Unit test 08:30–09:30 and 12:30–14:30 on 2026-11-18 | Low |
| F2 | Correctness | Past check compares dates only, so an earlier time *today* is accepted | `checkAvailability`, `req.date < today` | Fake clock 15:00, request 09:00 the same day | Low |
| F3 | Reliability | "Today" uses `toISOString()` (UTC), so in UTC+5 between 00:00–05:00 yesterday is not treated as past | same line | Run with `TZ=Asia/Almaty`, clock at 02:00 | Medium (depends on the time zone) |
| F4 | Reliability | Tests depend on the real clock and fixed November dates, so they will start failing after 2026-11-20 | `tests/availability.test.ts` "accepts a free slot" | Fake clock 2026-12-01 | Low |
| F5 | Security | User "purpose" text is put into `innerHTML`, allowing HTML/script injection | `src/main.ts` submit handler | Enter `<img src=x onerror=...>` in the browser | Medium (impact limited to self) |
| F6 | Security | Vulnerable dev dependencies | `package-lock.json` (vitest → tinypool) | `npm audit`, `npm audit --omit=dev` | Low |
| F7 | Maintainability / agent ops | Docs reference commands that do not exist (`npm start`, `npm run lint`) | `README.md`, `AGENTS.md` | Run the commands | Low |
| F8 | Agent ops | AGENTS.md has no constraints, AC list, forbidden actions or review gates | `AGENTS.md` | Compare with the Task 06 constraints | Low |
| F9 | Reliability | No tests for boundaries (30/120 min, 08:00/20:00, back-to-back) | `tests/` | Probe tests | Medium |
| F10 | Privacy | Bookings may be stored in `localStorage` and leak personal data | (not cited) | grep for storage APIs | High |
| F11 | Correctness | `new Date("YYYY-MM-DDTHH:mm")` may be parsed as UTC in some browsers | `toDate()` | Cross-browser test | High |
| F12 | Correctness | `checkAvailability` may mutate the stored bookings array | `checkAvailability` | Frozen-object test | High |
| F13 | Reliability | Demo data has fixed dates (18–20 Nov 2026), so the demo shows only "past" soon | `src/data.ts` | Reasoning + F4 probe | Low |
| F14 | Agent readiness | No linter, no CI, no pre-commit hooks | repo root | `ls`, `package.json` | Low |

## Task 03 – Challenging the AI findings

I checked each claim myself with probe tests (`probes/risk-probes.probe.ts`, separate config so they never run in `npm test`), code search and a real browser. A **failing probe = confirmed defect**, because each probe asserts the correct behaviour.

| # | Verdict | Evidence I checked myself |
|---|---|---|
| F1 | **Confirmed** | 2 probes fail on the baseline (`03-probes-baseline.txt`); the UI shows "Available" for 12:30–14:30 while 13:00–14:00 is booked (`screenshots/before-*-conflict-enclosing-F1.png`) |
| F2 | **Confirmed** | Probe fails; the UI accepts 08:00–08:45 today at 09:00 (`before-*-past-earlier-today-F2.png`) |
| F3 | **Confirmed** (time-zone dependent) | Probe fails with `TZ=Asia/Almaty`, passes with `TZ=UTC` (`03-probe-F3-utc-control.txt`) |
| F4 | **Confirmed** | Probe with clock 2026-12-01 fails |
| F5 | **Confirmed** | Playwright: injected `<img>` rendered, `document.title` changed to `INJECTED` (`07-ui-check-before.txt`, `before-*-F5-injection.png`) |
| F6 | **Confirmed**, dev-only | `npm audit`: 3 vulnerabilities; `npm audit --omit=dev`: 0 (`03-code-evidence.txt`). Not shipped in `dist/` |
| F7 | **Confirmed** | Exit code 1 for `npm start` and `npm run lint` |
| F8 | **Confirmed** | Original AGENTS.md (in `06-agents-md-patch.diff`) has none of these sections |
| F9 | **Plausible gap, no defect** | 6 boundary probes pass, so the behaviour is correct but was untested |
| F10 | **Unsupported** | No storage or network APIs in `src/` (grep exit 1); all data is fictional and hard-coded |
| F11 | **Plausible / unverified** | ES spec parses date-time without an offset as local; only Chromium was tested, WebKit/Firefox **not run** |
| F12 | **Unsupported** | Frozen-input probe passes; no `sort`, `splice`, `push` or `delete` in `availability.ts` |
| F13 | **Confirmed** by reasoning | Fixed dates in `src/data.ts`; no runtime test was run for this |
| F14 | **Confirmed** | No lint script, no `.github/workflows`, no hooks |

No test was reported as passed unless it was actually run; all outputs are in `evidence/`.

## Task 04 – Risk register

Score = Likelihood (1–3) × Impact (1–3).

| ID | Category | Cause → Event → Consequence | Component | Evidence | L | I | Score | Mitigation | Owner | Verification | Residual (L×I) |
|---|---|---|---|---|---|---|---|---|---|---|---|
| **R1** | Correctness | Loop tests only `start` in booking → request ending inside or enclosing a booking passes → **double booking** (AC3) | `availability.ts` › `checkAvailability` | F1 probes, UI screenshot | 3 | 3 | **9** | **M1:** standard interval test `start < bEnd && end > bStart` | Student (dev) | 3 regression tests + UI re-check | 1×3 = **3** |
| **R2** | Correctness | Date-only past check → slot earlier today accepted → booking a time that already passed (AC1) | `checkAvailability` | F2 probe, UI screenshot | 3 | 2 | **6** | **M2:** compare full start time with an injectable `now` | Student (dev) | 4 regression tests | 1×2 = **2** |
| R3 | Reliability | UTC "today" → between 00:00–05:00 in UTC+5 yesterday is accepted | `checkAvailability` | F3 probe (Almaty fails, UTC passes) | 2 | 2 | 4 | Resolved by M2 (no UTC string) | Student | "yesterday after midnight" test, run in both TZs | 1×2 = 2 |
| R4 | Reliability | Tests use the real clock → suite fails after 2026-11-20 → false alarms or tests deleted | `tests/availability.test.ts` | F4 probe | 3 | 2 | 6 | Fixed `NOW` passed to every test (Task 07) | Student | Suite passes under `TZ=UTC` and `Asia/Almaty` | 1×1 = 1 |
| R5 | Security | `innerHTML` with user input → HTML/script injection | `main.ts` submit handler and `renderDay` | F5 Playwright | 1 | 2 | 2 | Render with `textContent`; rule added to AGENTS.md | Student | Repeat the F5 UI check | **Open** – 1×2 = 2 |
| R6 | Security | Vulnerable vitest/tinypool (dev) → risk only on dev machines/CI | `package-lock.json` | `npm audit` | 1 | 2 | 2 | Upgrade vitest in a separate approved change (breaking major) | Student | `npm audit` = 0 | **Open** – 1×2 = 2 |
| R7 | Agent ops | Wrong commands and no rules in AGENTS.md/README → agent runs missing commands, violates scope or claims fake checks | `AGENTS.md`, `README.md` | Exit codes, original file | 3 | 2 | 6 | Task 06 playbook patch | Student | Every documented command run | 1×2 = 2 |
| R8 | Reliability | Fixed demo dates → after 20 Nov the demo shows only "past" | `src/data.ts` | Code + R4 | 3 | 1 | 3 | Generate demo dates relative to today | Student | UI check on a later date | **Open** – 3 |
| R9 | Agent readiness | No lint, CI or hooks → agent changes not verified automatically | repo | F14 | 2 | 2 | 4 | Add ESLint, `typecheck` script and a CI workflow | Student | CI green on a PR | **Open** – 4 |

**Top two for action:** **R1 (9)** and **R2 (6)**. R2 ranks above R4 (also 6) because it breaks an acceptance criterion; R4 is a test-quality issue.

## Task 05 – Agent-readiness audit (Lecture #10 rubric)

| Check | Baseline | After Practice #10 |
|---|---|---|
| README accuracy | ✗ `npm start` does not exist | ✓ fixed, checks section added |
| Folder layout | ✓ `src/` (logic / UI / data split), `tests/` | ✓ |
| Documented setup | ~ `npm install` only | ✓ `npm ci`, test/typecheck/build documented |
| Automated tests | ~ 6 tests, clock-dependent, no boundary cases | ✓ 13 tests, fixed clock, TZ-independent |
| Formatter / linter | ✗ none (documented lint is missing) | ✗ still none (honestly documented) |
| Type check | ~ only inside `build` | ~ `npx tsc --noEmit` documented |
| Pinned dependencies | ✓ `package-lock.json` (caret ranges in `package.json`) | ✓ |
| Build reproducibility | ✓ `npm run build` passes | ✓ |
| `.env.example` | n/a – no config or secrets by design | n/a |
| AGENTS.md: scope / safe commands / forbidden actions / review gates | ✗ / ~ (wrong lint) / ✗ / ✗ | ✓ / ✓ / ✓ / ✓ |
| CI, pre-commit hooks, integration/E2E checks | ✗ | ✗ (the Playwright check is a manual script, not in CI) |
| Security checks | ✗ | ~ `npm audit` run manually |

**Level assigned**
- Baseline: **below Level 1 (partial).** Tests and lockfile exist, but there is no formatter or linter and the docs were wrong.
- After: **Level 1 partially met + Level 2 documentation met.** AGENTS.md now has scope, ACs, rules and gates, and the README is accurate. Level 1 is still not complete because there is no linter or formatter, and Level 3 is not reached (no CI or hooks).

**Missing evidence for the next level:** ESLint + Prettier scripts, a `typecheck` script, a GitHub Actions workflow running test + build + audit, a pre-commit hook, and an automated E2E test (Playwright) for AC6.

## Task 06 – Agent playbook audit

Prompt used:
> Review AGENTS.md and project documentation only. Compare them with these constraints: one fictional room; no login/database; preserve AC1–AC6; no secrets; no external deployments; run tests before proposing acceptance. Report missing or conflicting rules. Draft a minimal patch to AGENTS.md, but wait for my approval before applying it.

| Constraint | Original AGENTS.md | Status |
|---|---|---|
| One fictional room | Mentioned in the overview | OK, but not stated as a rule |
| No login / database | Only "Do not add a backend" | **Missing** login/DB |
| Preserve AC1–AC6 | Not listed | **Missing** |
| No secrets | Not mentioned | **Missing** |
| No external deployments | Not mentioned | **Missing** |
| Run tests before acceptance | Not mentioned | **Missing** |
| Commands | Lists `npm run lint`, which does not exist | **Conflict** |
| README vs AGENTS | README says `npm start`, AGENTS says `npm run dev` | **Conflict** |

The patch was drafted, the diff was reviewed and approved by me, and then it was applied in commit `c255c2e` (`evidence/06-agents-md-patch.diff`). It adds: scope/constraints, AC1–AC6, safe commands, forbidden actions (`audit fix --force`, skipping tests, pushing to main or deploying, unrelated refactors), the `textContent` rule and 5 review gates. The file is still about 50 lines (under the 300-line guideline).

## Task 07 – Safe verification

| Check | Before (baseline) | After (M1+M2) | Evidence |
|---|---|---|---|
| `npm test` | 6/6 pass (but clock-dependent) | **13/13 pass** in `TZ=Asia/Almaty` and `TZ=UTC` | `08-after-M2-test*.txt` |
| New regression tests vs. unfixed code | – | 5 failed (red, as expected) | `07-regression-tests-red.txt` |
| `npx tsc --noEmit` | not available as a script | pass | `08-after-typecheck.txt` |
| `npm run build` | pass | pass | `08-after-build.txt` |
| Probe suite | 5 fail / 8 pass | 1 fail / 12 pass (see below) | `03-probes-baseline.txt`, `08-probes-after.txt` |
| UI check desktop 1280 px + iPhone 13 (Playwright, Chromium) | F1 and F2 show "Available"; no horizontal scroll | F1 and F2 show "Not available" with a clear reason; no horizontal scroll | `07-ui-check-*.txt`, `screenshots/` |
| `npm audit` | 3 vulnerabilities | 3 vulnerabilities (unchanged, R6 open) | `08-after-audit.txt` |

The probe that still fails after the fixes is F4. It calls the function **without** `now` while the clock is set to 2026-12-01, so it shows that any caller using the real clock is time-dependent. The project's own tests now pass a fixed clock, which closes R4. The probe is kept as documentation and is not a regression.

**Not run:** WebKit/Firefox browsers (F11), ESLint (not configured), CI (none), a real-device mobile test (Playwright emulation only), screen-reader or accessibility audit.

## Task 08 – Two mitigations

Both patches were requested as minimal changes, and I reviewed each diff before committing it. No refactoring and no dependency changes were made.

**M1 – R1 overlap (commit `c68455d`, `evidence/08-M1.diff`) – 1 line**
```diff
-    if (start >= bStart && start < bEnd) {
+    if (start < bEnd && end > bStart) {
```
Result: 2 overlap regression tests turn green, the back-to-back test stays green, and the UI rejects 12:30–14:30. Residual R1: 9 → **3** (impact is still serious if a new bug appears, but likelihood is low because tests now cover it).

**M2 – R2 past time, also closes R3 (commit `9c9d02c`, `evidence/08-M2.diff`) – 3 lines**
```diff
   blocks: readonly Block[],
+  now: Date = new Date(),
 ): CheckResult {
 ...
-  const today = new Date().toISOString().slice(0, 10);
-  if (req.date < today) {
+  if (start < now) {
```
Result: 4 past-time tests turn green in both time zones, and the UI rejects 08:00 today at 09:00. Residual R2: 6 → **2**, R3: 4 → **2**.

**Rejected or out of scope:** fixing R5 (`innerHTML`), upgrading vitest (R6, breaking major), relative demo dates (R8) and adding ESLint/CI (R9). Each one is valid, but the task allowed two mitigations, so these are logged in the register with owners.

## Task 09 – Background agent thought experiment

Scenario: a cloud agent fixes R5 (`innerHTML` → `textContent`) asynchronously while I am in class.

- **Isolation:** its own branch `agent/r5-textcontent` (or `git worktree add -b agent/r5-textcontent ../sc-r5`), in a sandboxed container with no production credentials. Each agent uses its own dev-server port (for example `--port 5180`) to avoid shared-port conflicts, and there is no shared database.
- **Permitted files:** `src/main.ts`, `tests/**`, `docs/practice-10/**`. Read-only access to everything else.
- **Permitted commands:** `npm ci`, `npm test`, `npx tsc --noEmit`, `npm run build`, `npx vite preview --port 5180`, `git add`/`git commit` on its branch, and `git push` to **its own branch only**.
- **Prohibited:** push/merge to `main`, force-push, deploy/publish, `npm audit fix --force`, adding dependencies, editing `package-lock.json`, `.env` or secrets, editing `src/availability.ts` or `src/data.ts`, skipping or deleting tests, and any network calls except the npm registry.
- **Required evidence:** (1) the full `git diff main...agent/r5-textcontent` with a list of changed files; (2) raw `npm test` output including a new test showing that an injected `<img>` is rendered as text; (3) `npm run build` and `tsc` output; (4) a review note listing affected ACs, risks updated in the register, and anything not run.
- **Before merging or deploying:** a human reads the diff and checks that the scope matches the permitted files, re-runs the tests locally (agent output is not proof on its own), repeats the F5 UI check on desktop and mobile, updates R5's residual score, and approves the PR. Only after the merge does a human publish the demo. **No auto-merge.**

## Optional – Agent review checklist

Prompt used:
> Design a read-only review checklist for a background coding agent working on Smart Campus. Include: isolated branch/worktree; no credentials; no deployment; test and build commands; risk register updates; evidence for each claim; a summary of changed files; and an explicit human approval gate before merge. Do not claim the agent ran unless a real tool execution is recorded.

- [ ] Work happened on an isolated branch or worktree (branch name recorded)
- [ ] No credentials, `.env` files or tokens were created, read or committed
- [ ] No deployment or publish command appears in the execution log
- [ ] `npm ci`, `npm test`, `npx tsc --noEmit` and `npm run build` were run, with **real output attached** (command, timestamp, exit code)
- [ ] Every claim in the summary links to evidence (test name, file:line, log)
- [ ] Changed-files summary matches `git diff --stat`, and no files outside the permitted scope were changed
- [ ] No tests were deleted, skipped or weakened (`git diff` on `tests/` reviewed)
- [ ] AC1–AC6 impact stated; risk register updated (new/closed risks, residual scores)
- [ ] Anything not run is listed explicitly as **not run**
- [ ] **Human approval gate:** a named reviewer approves before merge, and nobody merges on the agent's word alone

## Release decision: **CONDITIONAL GO**

- **For GO:** all key checks pass (13/13 tests in two time zones, typecheck, build, desktop and mobile UI check). The two highest risks that broke acceptance criteria (R1 double booking, R2 past booking) are fixed and covered by regression tests. AC1–AC6 now hold in the checked scenarios.
- **Why not plain GO:** known limitations remain open, with owners and controls:
  - R5 `innerHTML` injection (score 2). It is self-only today because there is no shared or stored user data. **Condition:** fix before any shared or persisted data is added.
  - R6 dev-dependency vulnerabilities (2). They are not shipped (`npm audit --omit=dev` = 0). **Condition:** upgrade vitest in a separate PR.
  - R8 fixed demo dates (3). **Condition:** refresh the demo data before 2026-11-20 or make the dates relative.
  - R9 no lint/CI (4). Agent changes still need manual verification.
  - Not run: WebKit/Firefox, a real mobile device, accessibility.
- **What would change it to NO-GO:** any failing AC test, evidence that R5 can be triggered by another user (for example via a URL parameter or shared data), or an unexplained build failure.

## Discussion answers

- **What makes an AI finding trustworthy?** It cites a specific file or function, it can be reproduced by a check I run myself, and it was verified independently. In this review, 3 of the 14 AI claims were not confirmed: F10 and F12 were unsupported, and F11 is unverified.
- **Which missing check most weakens agent readiness?** The missing CI/automated gate. Without it, an agent's "tests pass" claim cannot be checked automatically. Wrong commands in AGENTS.md were a close second.
- **Would I allow a background agent to auto-merge?** No. The agent should do the work on a branch with evidence, and a human should approve the merge, at least until Level 3 (CI + hooks) is in place.
- **What evidence would change the decision?** A green CI run including E2E and lint, and an R5 fix with a test, would move it to GO. A failing AC test or an exploitable R5 would move it to NO-GO.

## Post-review update (after submission prep)

The project was moved to the repository root and a GitHub Actions workflow (`.github/workflows/pages.yml`) was added. It runs `npm ci`, `npm test`, `tsc --noEmit` and `npm run build` on every push to `main`, then deploys to GitHub Pages: **https://nurmukasan.github.io/nurmukasan/**. This partly addresses R9 (CI now exists; a linter and hooks are still missing). The audit table above describes the state at review time.

## Commit trail

| Commit | Content |
|---|---|
| `403abf2` (tag `practice-09-baseline`) | Baseline checkpoint |
| `1cb3fc1` | Read-only review evidence, probes, UI check (no app code changed) |
| `c255c2e` | Task 06 AGENTS.md / README patch |
| `9ce778d` | Task 07 regression tests (red) |
| `c68455d` | M1 overlap fix |
| `9c9d02c` | M2 past-time fix |
