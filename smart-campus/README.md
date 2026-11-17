# Smart Campus – Room Availability Checker

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

Agent rules: see [AGENTS.md](AGENTS.md). Practice #10 risk review: see [docs/practice-10/REPORT.md](docs/practice-10/REPORT.md).
