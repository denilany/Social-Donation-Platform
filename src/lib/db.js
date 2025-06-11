import { PrismaClient } from '@prisma/client';
import { dev } from '$app/environment';

/**
 * Global Prisma client instance
 * In development, we store the client on globalThis to prevent
 * multiple instances during hot reloading
 */
const globalForPrisma = globalThis;

export const db = globalForPrisma.prisma || new PrismaClient({
  log: dev ? ['query', 'error', 'warn'] : ['error'],
});

if (dev) globalForPrisma.prisma = db;
