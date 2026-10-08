// Singleton Prisma client. In Next.js dev mode, modules can be re-evaluated on every
// hot reload, which would otherwise open a new pool of PostgreSQL connections each
// time. Caching the client on `global` avoids exhausting connections during development.

import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis;

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["warn", "error"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
