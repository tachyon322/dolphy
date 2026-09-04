// Quote & rental store backed by SQLite (node:sqlite) — server only.
// Same interface as the old in-memory store, so API routes stay unchanged.
// bigint values (lamports/atomic amounts) are stored as TEXT strings.

import { getDb } from "./db";

export type Quote = {
  id: string;
  gpuId: string;
  gpuName: string;
  hours: number;
  payWith: "SOL" | "TOKEN";
  priceSolLamports: bigint;
  priceTokenAtomic: bigint;
  totalSol: number;
  totalToken: number;
  wallet: string; // requester wallet (optional, for binding)
  expiresAt: number; // ms
  createdAt: number;
};

export type Rental = {
  id: string;
  quoteId: string;
  gpuId: string;
  gpuName: string;
  hours: number;
  payWith: "SOL" | "TOKEN";
  amountPaid: string; // bigint string
  txSignature: string;
  wallet: string;
  status: "active" | "failed" | "terminated";
  failureReason?: string; // set when status is "failed"
  podId?: string;
  endpoint?: string;
  sshCommand?: string;
  createdAt: number;
  expiresAt: number;
};

export type User = {
  wallet: string;
  privyUserId?: string; // verified Privy user id — set once server-side auth lands (stage 2)
  firstSeen: number; // ms
  lastSeen: number; // ms
  rentalsCount: number; // successful (active/terminated) rentals
};

// --- row mappers ---

type QuoteRow = {
  id: string;
  gpu_id: string;
  gpu_name: string;
  hours: number;
  pay_with: string;
  price_sol_lamports: string;
  price_token_atomic: string;
  total_sol: number;
  total_token: number;
  wallet: string;
  expires_at: number;
  created_at: number;
};

function rowToQuote(r: QuoteRow): Quote {
  return {
    id: r.id,
    gpuId: r.gpu_id,
    gpuName: r.gpu_name,
    hours: r.hours,
    payWith: r.pay_with as Quote["payWith"],
    priceSolLamports: BigInt(r.price_sol_lamports),
    priceTokenAtomic: BigInt(r.price_token_atomic),
    totalSol: r.total_sol,
    totalToken: r.total_token,
    wallet: r.wallet,
    expiresAt: r.expires_at,
    createdAt: r.created_at,
  };
}

type RentalRow = {
  id: string;
  quote_id: string;
  gpu_id: string;
  gpu_name: string;
  hours: number;
  pay_with: string;
  amount_paid: string;
  tx_signature: string;
  wallet: string;
  status: string;
  failure_reason: string | null;
  pod_id: string | null;
  endpoint: string | null;
  ssh_command: string | null;
  created_at: number;
  expires_at: number;
};

function rowToRental(r: RentalRow): Rental {
  return {
    id: r.id,
    quoteId: r.quote_id,
    gpuId: r.gpu_id,
    gpuName: r.gpu_name,
    hours: r.hours,
    payWith: r.pay_with as Rental["payWith"],
    amountPaid: r.amount_paid,
    txSignature: r.tx_signature,
    wallet: r.wallet,
    status: r.status as Rental["status"],
    failureReason: r.failure_reason ?? undefined,
    podId: r.pod_id ?? undefined,
    endpoint: r.endpoint ?? undefined,
    sshCommand: r.ssh_command ?? undefined,
    createdAt: r.created_at,
    expiresAt: r.expires_at,
  };
}

// --- quotes ---

// Moves expired quotes to expired_quotes (audit log) and deletes them.
// Returns number of quotes swept.
export function sweepExpiredQuotes(): number {
  const db = getDb();
  const now = Date.now();
  db.run(
    `INSERT OR IGNORE INTO expired_quotes
      (id, gpu_id, gpu_name, hours, pay_with, price_sol_lamports, price_token_atomic,
       total_sol, total_token, wallet, expires_at, created_at, expired_logged_at)
     SELECT id, gpu_id, gpu_name, hours, pay_with, price_sol_lamports, price_token_atomic,
       total_sol, total_token, wallet, expires_at, created_at, ?
     FROM quotes WHERE expires_at <= ?`,
    [now, now]
  );
  const res = db.run(`DELETE FROM quotes WHERE expires_at <= ?`, [now]);
  return Number(res.changes);
}

export function createQuote(q: Quote) {
  const db = getDb();
  sweepExpiredQuotes();
  db.run(
    `INSERT INTO quotes
      (id, gpu_id, gpu_name, hours, pay_with, price_sol_lamports, price_token_atomic,
       total_sol, total_token, wallet, expires_at, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      q.id,
      q.gpuId,
      q.gpuName,
      q.hours,
      q.payWith,
      q.priceSolLamports.toString(),
      q.priceTokenAtomic.toString(),
      q.totalSol,
      q.totalToken,
      q.wallet,
      q.expiresAt,
      q.createdAt,
    ]
  );
  return q;
}

export function getQuote(id: string): Quote | undefined {
  sweepExpiredQuotes();
  const row = getDb().query<QuoteRow, [string]>(
    `SELECT * FROM quotes WHERE id = ?`
  ).get(id);
  return row ? rowToQuote(row) : undefined;
}

export function consumeQuote(id: string): Quote | undefined {
  const q = getQuote(id);
  if (q) getDb().run(`DELETE FROM quotes WHERE id = ?`, [id]);
  return q;
}

export type ExpiredQuote = Quote & { expiredLoggedAt: number };

type ExpiredQuoteRow = QuoteRow & { expired_logged_at: number };

export function listExpiredQuotes(wallet?: string): ExpiredQuote[] {
  const db = getDb();
  const rows = wallet
    ? db
        .query<ExpiredQuoteRow, [string]>(
          `SELECT * FROM expired_quotes WHERE wallet = ? ORDER BY expired_logged_at DESC`
        )
        .all(wallet)
    : db
        .query<ExpiredQuoteRow, []>(
          `SELECT * FROM expired_quotes ORDER BY expired_logged_at DESC`
        )
        .all();
  return rows.map((r) => ({ ...rowToQuote(r), expiredLoggedAt: r.expired_logged_at }));
}

// --- tx replay protection ---

export function isTxUsed(sig: string): boolean {
  const row = getDb()
    .query(`SELECT 1 FROM tx_signatures WHERE signature = ?`)
    .get(sig);
  return row !== undefined;
}

export function markTxUsed(sig: string) {
  getDb().run(
    `INSERT OR IGNORE INTO tx_signatures (signature, created_at) VALUES (?, ?)`,
    [sig, Date.now()]
  );
}

// --- rentals ---

export function createRental(r: Rental) {
  const db = getDb();
  // A retry with the same signature supersedes the earlier failed attempt.
  db.run(`DELETE FROM rentals WHERE tx_signature = ? AND status = 'failed'`, [
    r.txSignature,
  ]);
  db.run(
    `INSERT INTO rentals
      (id, quote_id, gpu_id, gpu_name, hours, pay_with, amount_paid, tx_signature,
       wallet, status, failure_reason, pod_id, endpoint, ssh_command, created_at, expires_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      r.id,
      r.quoteId,
      r.gpuId,
      r.gpuName,
      r.hours,
      r.payWith,
      r.amountPaid,
      r.txSignature,
      r.wallet,
      r.status,
      r.failureReason ?? null,
      r.podId ?? null,
      r.endpoint ?? null,
      r.sshCommand ?? null,
      r.createdAt,
      r.expiresAt,
    ]
  );
  markTxUsed(r.txSignature);
  if (r.wallet) {
    upsertUser(r.wallet);
    if (r.status === "active") bumpRentalsCount(r.wallet);
  }
  return r;
}

// Logs a failed payment/provisioning attempt. Does NOT mark the tx signature
// as used, so a 502 (provisioning) failure can be retried with the same sig.
// INSERT OR IGNORE: repeated failures with the same sig keep the first row
// (tx_signature is UNIQUE).
export function logFailedRental(r: Rental): Rental {
  getDb().run(
    `INSERT OR IGNORE INTO rentals
      (id, quote_id, gpu_id, gpu_name, hours, pay_with, amount_paid, tx_signature,
       wallet, status, failure_reason, pod_id, endpoint, ssh_command, created_at, expires_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'failed', ?, ?, ?, ?, ?, ?)`,
    [
      r.id,
      r.quoteId,
      r.gpuId,
      r.gpuName,
      r.hours,
      r.payWith,
      r.amountPaid,
      r.txSignature,
      r.wallet,
      r.failureReason ?? null,
      r.podId ?? null,
      r.endpoint ?? null,
      r.sshCommand ?? null,
      r.createdAt,
      r.expiresAt,
    ]
  );
  if (r.wallet) upsertUser(r.wallet);
  return r;
}

export function getRental(id: string): Rental | undefined {
  const row = getDb()
    .query<RentalRow, [string]>(`SELECT * FROM rentals WHERE id = ?`)
    .get(id);
  return row ? rowToRental(row) : undefined;
}

export function listRentals(): Rental[] {
  const rows = getDb()
    .query<RentalRow, []>(`SELECT * FROM rentals ORDER BY created_at DESC`)
    .all();
  return rows.map(rowToRental);
}

export function listRentalsByWallet(wallet: string): Rental[] {
  const rows = getDb()
    .query<RentalRow, [string]>(
      `SELECT * FROM rentals WHERE wallet = ? ORDER BY created_at DESC`
    )
    .all(wallet);
  return rows.map(rowToRental);
}

export function terminateRental(id: string) {
  const db = getDb();
  const row = db
    .query<RentalRow, [string]>(
      `UPDATE rentals SET status = 'terminated' WHERE id = ? RETURNING *`
    )
    .get(id);
  return row ? rowToRental(row) : undefined;
}

// --- users ---

type UserRow = {
  wallet: string;
  privy_user_id: string | null;
  first_seen: number;
  last_seen: number;
  rentals_count: number;
};

function rowToUser(r: UserRow): User {
  return {
    wallet: r.wallet,
    privyUserId: r.privy_user_id ?? undefined,
    firstSeen: r.first_seen,
    lastSeen: r.last_seen,
    rentalsCount: r.rentals_count,
  };
}

// Inserts the wallet on first sight, refreshes last_seen on every sight.
// privyUserId is accepted for stage 2 (server-side Privy auth); pass
// undefined until then — an existing verified id is never overwritten by it.
export function upsertUser(wallet: string, privyUserId?: string): User | undefined {
  if (!wallet) return undefined;
  const db = getDb();
  const now = Date.now();
  db.run(
    `INSERT INTO users (wallet, privy_user_id, first_seen, last_seen, rentals_count)
     VALUES (?, ?, ?, ?, 0)
     ON CONFLICT(wallet) DO UPDATE SET
       last_seen = excluded.last_seen,
       privy_user_id = COALESCE(excluded.privy_user_id, users.privy_user_id)`,
    [wallet, privyUserId ?? null, now, now]
  );
  return getUser(wallet);
}

function bumpRentalsCount(wallet: string) {
  getDb().run(
    `UPDATE users SET rentals_count = rentals_count + 1 WHERE wallet = ?`,
    [wallet]
  );
}

export function getUser(wallet: string): User | undefined {
  const row = getDb()
    .query<UserRow, [string]>(`SELECT * FROM users WHERE wallet = ?`)
    .get(wallet);
  return row ? rowToUser(row) : undefined;
}

export function listUsers(): User[] {
  const rows = getDb()
    .query<UserRow, []>(`SELECT * FROM users ORDER BY last_seen DESC`)
    .all();
  return rows.map(rowToUser);
}
