// In-memory quote & rental store — server only, survives HMR via globalThis
// For MVP without DB. Swap to Drizzle later by keeping same interface.

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
  podId?: string;
  endpoint?: string;
  sshCommand?: string;
  createdAt: number;
  expiresAt: number;
};

type GlobalStore = {
  quotes: Map<string, Quote>;
  rentals: Map<string, Rental>;
  txSet: Set<string>; // replay protection
};

function getGlobal(): GlobalStore {
  const g = globalThis as unknown as { __dolphyStore?: GlobalStore };
  if (!g.__dolphyStore) {
    g.__dolphyStore = {
      quotes: new Map(),
      rentals: new Map(),
      txSet: new Set(),
    };
  }
  return g.__dolphyStore;
}

export function createQuote(q: Quote) {
  const s = getGlobal();
  s.quotes.set(q.id, q);
  return q;
}
export function getQuote(id: string): Quote | undefined {
  const s = getGlobal();
  const q = s.quotes.get(id);
  if (!q) return undefined;
  if (Date.now() > q.expiresAt) {
    s.quotes.delete(id);
    return undefined;
  }
  return q;
}
export function consumeQuote(id: string): Quote | undefined {
  const s = getGlobal();
  const q = getQuote(id);
  if (q) s.quotes.delete(id);
  return q;
}

export function isTxUsed(sig: string): boolean {
  return getGlobal().txSet.has(sig);
}
export function markTxUsed(sig: string) {
  getGlobal().txSet.add(sig);
}

export function createRental(r: Rental) {
  const s = getGlobal();
  s.rentals.set(r.id, r);
  s.txSet.add(r.txSignature);
  return r;
}
export function getRental(id: string): Rental | undefined {
  return getGlobal().rentals.get(id);
}
export function listRentals(): Rental[] {
  return Array.from(getGlobal().rentals.values()).sort((a, b) => b.createdAt - a.createdAt);
}
export function listRentalsByWallet(wallet: string): Rental[] {
  return listRentals().filter((r) => r.wallet === wallet);
}
export function terminateRental(id: string) {
  const s = getGlobal();
  const r = s.rentals.get(id);
  if (r) {
    r.status = "terminated";
    s.rentals.set(id, r);
  }
  return r;
}
