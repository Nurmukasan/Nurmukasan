# Smart Campus – Room Availability Checker

Small web app that checks if **one fictional room** (Room 301) is free for a requested time.
Built in Practice #09 with an AI agent. No login, no database – bookings are hard-coded fictional data.

## Run

```bash
npm install
npm start
```

## Test

```bash
npm test
```

## Rules

- 30–120 minutes per booking, room open 08:00–20:00
- No past times, no overlaps, no blocked periods
