# HCE Phoneme Activity Builder — Assessment 1 + Assessment 2

A Next.js app for building phoneme-based Wordle and Word Search classroom activities for
Speech Pathology students. Assessment 1 covered frontend design and usability only. Assessment 2
adds a Prisma/SQLite backend, CRUD APIs, validation, a `/health` endpoint, and Docker.

## Getting started (local, no Docker)

```bash
npm install                # also runs `prisma generate` via postinstall
npx prisma migrate deploy  # creates prisma/dev.db from prisma/migrations/
npx prisma db seed         # optional: adds two starter activity sets
npm run dev
```

Then open http://localhost:3000. `.env` already sets `DATABASE_URL="file:./dev.db"`.

## Getting started (Docker)

```bash
docker build -t hce-phoneme-builder .
docker run -p 3000:3000 -v hce-data:/app/data hce-phoneme-builder
```

The container runs migrations and seeds the database automatically on startup
(see `docker-entrypoint.sh`), then serves on port 3000. The named volume keeps the
SQLite file (`/app/data/dev.db`) across container restarts.

Check it's healthy: `curl http://localhost:3000/health` → `{"status":"ok","db":"connected"}`.

## Pages

* `/` — Home, project intro and links
* `/about` — Project description, scope note, student number, video placeholder
* `/wordle` — Wordle builder: pick a saved word list (or the built-in demo bank),
  hints, guesses, live preview, generate HTML
* `/wordsearch` — Word Search builder: pick a saved word list (or the built-in demo
  list), grid size, live preview, generate HTML
* `/manage` — **New in Assessment 2.** Full CRUD UI: create/delete activity sets,
  add/rename/delete words and their phoneme sequences
* `/settings` — Light/dark theme (cookie) and layout density (cookie)
* `/health` — **New in Assessment 2.** Returns 200 OK with a DB connectivity check

## Backend API (new in Assessment 2)

| Method | Route | Purpose |
|---|---|---|
| GET | `/api/activity-sets` | List all activity sets with words + phonemes |
| POST | `/api/activity-sets` | Create an activity set (optionally with words) |
| GET | `/api/activity-sets/:id` | Get one activity set |
| PUT | `/api/activity-sets/:id` | Update activity-level settings |
| DELETE | `/api/activity-sets/:id` | Delete an activity set (cascades to its words) |
| POST | `/api/activity-sets/:id/words` | Add a word to an activity set |
| PUT | `/api/words/:id` | Update a word's text/hint/phonemes |
| DELETE | `/api/words/:id` | Delete a word |
| GET | `/health` | Health check (verifies DB connectivity) |

All write routes validate input in `lib/validation.js` and return `400` with a
`details` array of human-readable messages on invalid input.

## Database schema

SQLite via Prisma (`prisma/schema.prisma`), three normalised tables:

* **ActivitySet** — one Wordle or Word Search configuration (title, type, difficulty,
  hints, theme, and type-specific settings like `maxGuesses` or `rows`/`cols`)
* **Word** — belongs to an ActivitySet; the English word, an optional hint, and order
* **Phoneme** — belongs to a Word; **one row per phoneme unit**, stored as its own
  `symbol` string rather than packed into Word.text, so multi-character IPA symbols
  (e.g. `tʃ`, `ɜː`) are never truncated or mis-split

## Structure

```
app/            Next.js app-router pages + API routes (app/api/..., app/health/...)
components/     Header, NavBar (hamburger menu), Footer, PhonemeKeyboard,
                WordlePreview, WordSearchPreview, ThemeInit
lib/            phonemeData.js (corpus/reference data), generateWordleHtml.js,
                generateWordSearchHtml.js (standalone HTML exporters), wordSearchEngine.js,
                themeCookie.js, prisma.js (client singleton), validation.js, serialize.js,
                apiClient.js (frontend fetch wrapper)
prisma/         schema.prisma, migrations/, seed.js
Dockerfile, docker-entrypoint.sh   Multi-stage build + migrate/seed/start on container startup
```

