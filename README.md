# Smart Campus – Room Availability Checker

**Live demo:** https://nurmukasan.github.io/nurmukasan/

AI-Driven Software Engineering (KBTU) · Practice #10 – risk review, agent-readiness audit and mitigations.
Student: Markabaev Nurmukasan, 25B030216 · Tuesday 16:00–19:00 · AI tool: Claude Code 2.1.326, model Claude Opus 5.5.

- Report: [docs/practice-10/REPORT.md](docs/practice-10/REPORT.md) (PDF: [submission/](submission/))
- Evidence (raw command outputs): [docs/practice-10/evidence/](docs/practice-10/evidence/)
- Screenshots: [docs/practice-10/screenshots/](docs/practice-10/screenshots/)
- Release decision: **CONDITIONAL GO**

Small web app that checks if **one fictional room** (Room 301) is free for a requested time.
Built in Practice #09 with an AI agent. No login, no database – bookings are hard-coded fictional data.

## Run

```bash
npm install
npm run dev
```

## Test

```bash
npm test
```

## Rules

- 30–120 minutes per booking, room open 08:00–20:00
- No past times, no overlaps, no blocked periods

## Checks

```bash
npm test          # unit tests
npx tsc --noEmit  # type check
npm run build     # type check + production build
```

Agent rules: see [AGENTS.md](AGENTS.md).

CI: `.github/workflows/pages.yml` runs tests, type check and build on every push to `main` and deploys `dist/` to GitHub Pages.
