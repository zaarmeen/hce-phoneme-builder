#!/bin/sh
# Runs once each time the app container starts: apply any pending Prisma migrations,
# seed the database if it's empty (prisma/seed.js exits early if data already
# exists, see the check at the top of main()), then start the Next.js server.
#
# The database is a separate service. docker-compose.yml already waits for its
# healthcheck, but migrations are retried a few times anyway in case it is still
# finishing startup (or the image is run without compose).
set -e

echo "Applying database migrations..."
attempt=1
until npx prisma migrate deploy; do
  if [ "$attempt" -ge 10 ]; then
    echo "Database still unreachable after $attempt attempts. Is DATABASE_URL correct?"
    exit 1
  fi
  echo "Database not ready yet (attempt $attempt). Retrying in 3 seconds..."
  attempt=$((attempt + 1))
  sleep 3
done

echo "Seeding database (skipped automatically if data already exists)..."
node prisma/seed.js || echo "Seed step failed or was skipped. Continuing."

echo "Starting server..."
exec node server.js
