import 'server-only';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';

// Prevent Next.js rendering pipeline from causing connection limits in dev
const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL is missing in environment variables.");
}

// Disable prepare since Supabase uses pgBouncer usually, which works better with prepare: false
const client = postgres(connectionString, { prepare: false });

export const db = drizzle(client, { schema });
