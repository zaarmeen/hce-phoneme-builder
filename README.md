# HCE Phoneme Activity Builder

A Next.js app for building phoneme-based Wordle and Word Search classroom activities for
Speech Pathology students. Assessment 1 covered frontend design and usability. Assessment 2
added a Prisma backend, CRUD APIs, validation, a `/health` endpoint, and Docker. Assessment 3
added the observability dashboard and testing. The latest changes (below) act on the
Assessment 2 feedback.

## What changed after Assessment 2 feedback

| Feedback | Change |
|---|---|
| Reusable word-list modelling | Words now belong to a **WordList**. Activities point at a list, so one list can back several Wordle and Word Search activities. |
| Clearer separation of Docker services | The app and a **PostgreSQL** database now run as two services in `docker-compose.yml`, each with its own lifecycle; the database has its own volume and healthcheck. |
| Fuller save/load workflows in the builders | Both builders can open a saved activity, change it, and **save changes** or **save as new** without leaving the page. Manage links straight into the builder. |
| More incremental Git development | Work is now committed in small steps, one change per commit (see `git log`). |

## Getting started (Docker, recommended)

```bash
docker compose up --build
```

This starts two services:

* **db**: PostgreSQL 16, data kept in the `pgdata` volume
* **app**: the Next.js app on http://localhost:3000, started once the database is healthy

On startup the app container applies migrations and seeds starter data (see
`docker-entrypoint.sh`). Check it's healthy:
`curl http://localhost:3000/health` → `{"status":"ok","db":"connected"}`.

Stop with `docker compose down` (data is kept) or `docker compose down -v` (wipes the database).

## Getting started (local development)

Run only the database in Docker, and the app on your machine:

```bash
docker compose up -d db          # PostgreSQL on localhost:5433
cp .env.example .env             # DATABASE_URL pointing at that database
npm install                      # also runs `prisma generate` via postinstall
npx prisma migrate deploy
npx prisma db seed               # optional: starter word lists and activities
npm run dev
```

## Tests

```bash
docker compose up -d --build
npx playwright test
```

* `e2e/builder-crud.spec.js`: word list and activity CRUD on the Manage page
* `e2e/builder-save-load.spec.js`: save, reload, update and reopen an activity in the Wordle builder
* `e2e/generate-activity.spec.js`: generate a downloadable Wordle activity

## Pages

* `/` Home, project intro and links
* `/about` Project description, scope note, student number, video placeholder
* `/wordle` Wordle builder: open or start an activity, choose a word list, hints and
  guesses, live preview, **save / save as new**, generate HTML
* `/wordsearch` Word Search builder: same save/load controls, grid size, live preview,
  generate HTML
* `/manage` Two views: **Word lists** (create, rename, delete lists; add, rename, delete
  words) and **Activities** (create an activity from any list, switch its list, toggle hints,
  delete, open in builder)
* `/dashboard` Usage metrics, alerts and health status
* `/settings` Light/dark theme (cookie) and layout density (cookie)
* `/health` Returns 200 OK with a database connectivity check

## Backend API

| Method | Route | Purpose |
|---|---|---|
| GET | `/api/word-lists` | List word lists with words, phonemes and how many activities use each |
| POST | `/api/word-lists` | Create a word list (optionally with words) |
| GET | `/api/word-lists/:id` | Get one word list |
| PUT | `/api/word-lists/:id` | Rename a word list |
| DELETE | `/api/word-lists/:id` | Delete a list and its words (activities using it are kept) |
| POST | `/api/word-lists/:id/words` | Add a word to a list |
| PUT | `/api/words/:id` | Update a word's text/hint/phonemes |
| DELETE | `/api/words/:id` | Delete a word |
| GET | `/api/activity-sets` | List activities, each with its word list's words |
| POST | `/api/activity-sets` | Create an activity (`wordListId` links it to a list) |
| GET | `/api/activity-sets/:id` | Get one activity |
| PUT | `/api/activity-sets/:id` | Update settings, title, or which word list it uses |
| DELETE | `/api/activity-sets/:id` | Delete an activity (its word list is kept) |
| POST | `/api/activity-sets/:id/words` | Older endpoint, kept for compatibility: adds to the activity's list |
| POST | `/api/events` | Record a usage event for the dashboard |
| GET | `/api/dashboard` | Aggregated dashboard metrics and alerts |
| GET | `/health` | Health check (verifies database connectivity) |

All write routes validate input in `lib/validation.js` and return `400` with a
`details` array of human-readable messages on invalid input.

## Database schema

PostgreSQL via Prisma (`prisma/schema.prisma`):

* **WordList**: a reusable, named list of words
* **Word**: belongs to a WordList; the English word, an optional hint, and order
* **Phoneme**: belongs to a Word; **one row per phoneme unit**, stored as its own
  `symbol` string so multi-character IPA symbols (e.g. `tʃ`, `ɜː`) are never mis-split
* **ActivitySet**: one Wordle or Word Search configuration (title, type, difficulty,
  hints, theme, `maxGuesses` or `rows`/`cols`) that points at a WordList. Deleting a list
  leaves its activities in place without a list rather than deleting them.
* **Event**: usage log behind the dashboard

The `20261008000000_add_word_lists` migration moves existing words into a list per
activity, so upgrading keeps all data.

## Structure

```
app/            Next.js app-router pages + API routes (app/api/..., app/health/...)
components/     Header, NavBar, Footer, PhonemeKeyboard, WordlePreview,
                WordSearchPreview, ThemeInit, BuilderSaveControls (builder save/load UI)
lib/            phonemeData.js, generateWordleHtml.js, generateWordSearchHtml.js,
                wordSearchEngine.js, themeCookie.js, prisma.js, validation.js,
                serialize.js, wordData.js, apiClient.js, trackEvent.js,
                useActivityBuilder.js (shared builder save/load logic)
prisma/         schema.prisma, migrations/, seed.js
e2e/            Playwright tests
Dockerfile, docker-entrypoint.sh   App image: multi-stage build, migrate/seed/start on startup
docker-compose.yml                 app + db services
```
