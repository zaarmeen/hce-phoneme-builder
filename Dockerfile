# syntax=docker/dockerfile:1

##################
# 1. deps: install node_modules (cached separately from source changes)
##################
FROM node:20-slim AS deps
WORKDIR /app
RUN apt-get update -y && apt-get install -y --no-install-recommends openssl ca-certificates \
  && rm -rf /var/lib/apt/lists/*
# package.json's "postinstall" script runs `prisma generate`, which needs the schema
# file to exist at install time, so it's copied here alongside the package files.
COPY package.json package-lock.json* ./
COPY prisma ./prisma
RUN npm install

##################
# 2. builder: build the Next.js app (standalone output)
##################
FROM node:20-slim AS builder
WORKDIR /app
RUN apt-get update -y && apt-get install -y --no-install-recommends openssl \
  && rm -rf /var/lib/apt/lists/*
COPY --from=deps /app/node_modules ./node_modules
COPY . .
# DATABASE_URL only needs to be a syntactically valid PostgreSQL URL at build time.
# `next build` never opens a real connection, it just needs Prisma Client generated.
# The real URL is supplied at runtime by docker-compose.yml.
ENV DATABASE_URL="postgresql://build:build@localhost:5432/build"
RUN npx prisma generate
RUN npm run build

##################
# 3. runner: minimal production image
##################
FROM node:20-slim AS runner
WORKDIR /app
RUN apt-get update -y && apt-get install -y --no-install-recommends openssl ca-certificates curl \
  && rm -rf /var/lib/apt/lists/*

ENV NODE_ENV=production
ENV PORT=3000
# Listen on every network interface. Without this, Next.js binds to the container's
# hostname only, so Docker's HEALTHCHECK (which calls localhost) can't reach it and
# the container is reported "unhealthy" even though the app works.
ENV HOSTNAME=0.0.0.0
# DATABASE_URL is not baked into the image: the database is a separate service, so
# its address comes from the environment at runtime (see docker-compose.yml).

# Next.js standalone server + the static assets and public files it expects next to it.
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public

# The standalone output only bundles what next server.js needs to *run* the app —
# it does not include the Prisma CLI. We add that back so `prisma migrate deploy`
# and `prisma db seed` can run at container startup.
COPY --from=builder /app/node_modules/.bin ./node_modules/.bin
COPY --from=builder /app/node_modules/prisma ./node_modules/prisma
COPY --from=builder /app/node_modules/@prisma ./node_modules/@prisma
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/package.json ./package.json

COPY docker-entrypoint.sh ./docker-entrypoint.sh
RUN sed -i 's/\r$//' ./docker-entrypoint.sh && chmod +x ./docker-entrypoint.sh

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD curl -f http://localhost:3000/health || exit 1

ENTRYPOINT ["./docker-entrypoint.sh"]
