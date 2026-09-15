#!/bin/sh
# Runs once each time the container starts: apply any pending Prisma migrations,
# seed the database if it's empty (prisma/seed.js exits early if data already
# exists — see the check at the top of main()), then start the Next.js server.
set -e

echo "Applying database migrations..."
npx prisma migrate deploy

echo "Seeding database (skipped automatically if data already exists)..."
node prisma/seed.js || echo "Seed step failed or was skipped — continuing."

echo "Starting server..."
exec node server.js
