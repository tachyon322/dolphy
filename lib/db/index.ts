// SQLite connection via node:sqlite — server only, survives HMR via globalThis.

import { DatabaseSync } from "node:sqlite";
import { mkdirSync } from "node:fs";
import path from "node:path";

const DEFAULT_DB_PATH = path.join(process.cwd(), "data", "dolphy.db");

type SqlValue = string | number | bigint | null;

type Query<T, Params extends SqlValue[]> = {
  get(...params: Params): T | undefined;
  all(...params: Params): T[];
};

// Keep the small Bun-compatible interface so quoteStore's API and callers stay unchanged.
export class Database {
  private readonly database: DatabaseSync;

  constructor(dbPath: string) {
    this.database = new DatabaseSync(dbPath);
  }

  exec(sql: string) {
    this.database.exec(sql);
  }

  run(sql: string, params: SqlValue[] = []) {
    return this.database.prepare(sql).run(...params);
  }

  query<T, Params extends SqlValue[]>(sql: string): Query<T, Params> {
    const statement = this.database.prepare(sql);
    return {
      get: (...params) => statement.get(...params) as T | undefined,
      all: (...params) => statement.all(...params) as T[],
    };
  }
}

export function getDbPath(): string {
  return process.env.DATABASE_PATH || DEFAULT_DB_PATH;
}

function openDb(): Database {
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
