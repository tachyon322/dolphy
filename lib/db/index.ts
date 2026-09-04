// SQLite connection via bun:sqlite — server only, survives HMR via globalThis.
// Runtime must be Bun; package.json scripts force it with `bun --bun next ...`.
// `require("bun:sqlite")` is lazy so `next build` under Node never loads it
// (route handlers are dynamic — module is evaluated only at request time).

import type { Database } from "bun:sqlite";
import { mkdirSync } from "node:fs";
import path from "node:path";

const DEFAULT_DB_PATH = path.join(process.cwd(), "data", "dolphy.db");

export function getDbPath(): string {
  return process.env.DATABASE_PATH || DEFAULT_DB_PATH;
}

function openDb(): Database {
  if (typeof Bun === "undefined") {
    throw new Error(
      "Database requires the Bun runtime (bun:sqlite). Run with `bun --bun next dev` / `bun --bun next start`."
    );
  }
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { Database } = require("bun:sqlite") as typeof import("bun:sqlite");
  const dbPath = getDbPath();
  mkdirSync(path.dirname(dbPath), { recursive: true });
  return new Database(dbPath);
}

function initSchema(db: Database) {
  db.exec("PRAGMA journal_mode = WAL;");
  db.exec(`
    CREATE TABLE IF NOT EXISTS quotes (
      id TEXT PRIMARY KEY,
      gpu_id TEXT NOT NULL,
      gpu_name TEXT NOT NULL,
      hours INTEGER NOT NULL,
      pay_with TEXT NOT NULL,
      price_sol_lamports TEXT NOT NULL,
      price_token_atomic TEXT NOT NULL,
      total_sol REAL NOT NULL,
      total_token REAL NOT NULL,
      wallet TEXT NOT NULL DEFAULT '',
      expires_at INTEGER NOT NULL,
      created_at INTEGER NOT NULL
    );
    CREATE INDEX IF NOT EXISTS idx_quotes_expires_at ON quotes(expires_at);

    CREATE TABLE IF NOT EXISTS rentals (
      id TEXT PRIMARY KEY,
      quote_id TEXT NOT NULL,
      gpu_id TEXT NOT NULL,
      gpu_name TEXT NOT NULL,
      hours INTEGER NOT NULL,
      pay_with TEXT NOT NULL,
      amount_paid TEXT NOT NULL,
      tx_signature TEXT NOT NULL UNIQUE,
      wallet TEXT NOT NULL,
      status TEXT NOT NULL,
      pod_id TEXT,
      endpoint TEXT,
      ssh_command TEXT,
      created_at INTEGER NOT NULL,
      expires_at INTEGER NOT NULL
    );
    CREATE INDEX IF NOT EXISTS idx_rentals_wallet ON rentals(wallet);

    CREATE TABLE IF NOT EXISTS tx_signatures (
      signature TEXT PRIMARY KEY,
      created_at INTEGER NOT NULL
    );

    CREATE TABLE IF NOT EXISTS users (
      wallet TEXT PRIMARY KEY,
      privy_user_id TEXT,
      first_seen INTEGER NOT NULL,
      last_seen INTEGER NOT NULL,
      rentals_count INTEGER NOT NULL DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS expired_quotes (
      id TEXT PRIMARY KEY,
      gpu_id TEXT NOT NULL,
      gpu_name TEXT NOT NULL,
      hours INTEGER NOT NULL,
      pay_with TEXT NOT NULL,
      price_sol_lamports TEXT NOT NULL,
      price_token_atomic TEXT NOT NULL,
      total_sol REAL NOT NULL,
      total_token REAL NOT NULL,
      wallet TEXT NOT NULL DEFAULT '',
      expires_at INTEGER NOT NULL,
      created_at INTEGER NOT NULL,
      expired_logged_at INTEGER NOT NULL
    );
    CREATE INDEX IF NOT EXISTS idx_expired_quotes_wallet ON expired_quotes(wallet);
  `);
}

// Migrations for DB files created before a column/table existed.
function migrate(db: Database) {
  const cols = db
    .query<{ name: string }, []>(`PRAGMA table_info(rentals)`)
    .all();
  if (!cols.some((c) => c.name === "failure_reason")) {
    db.exec(`ALTER TABLE rentals ADD COLUMN failure_reason TEXT`);
  }
}

type DbGlobal = typeof globalThis & { __dolphyDb?: Database };

export function getDb(): Database {
  const g = globalThis as DbGlobal;
  if (!g.__dolphyDb) {
    const db = openDb();
    initSchema(db);
    migrate(db);
    g.__dolphyDb = db;
  }
  return g.__dolphyDb;
}
