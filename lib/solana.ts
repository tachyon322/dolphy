import { Connection, PublicKey, SystemProgram, Transaction } from "@solana/web3.js";
import { createTransferInstruction, getAssociatedTokenAddress, getAccount, createAssociatedTokenAccountInstruction } from "@solana/spl-token";

// Env helpers — works on client and server
export function getRpcUrl(): string {
  return (
    process.env.NEXT_PUBLIC_RPC_URL ||
    process.env.NEXT_PUBLIC_SOLANA_RPC_URL ||
    (process.env.NEXT_PUBLIC_SOLANA_NETWORK === "devnet" ? "https://api.devnet.solana.com" : "https://api.mainnet-beta.solana.com")
  );
}
export function getNetwork(): "devnet" | "mainnet-beta" {
  return (process.env.NEXT_PUBLIC_SOLANA_NETWORK as "devnet" | "mainnet-beta") || "devnet";
}
export function isValidPubkey(s: string): boolean {
  if (!s) return false;
  try {
    new PublicKey(s);
    return true;
  } catch {
    return false;
  }
}
export function getTreasury(): string {
  const v = process.env.NEXT_PUBLIC_TREASURY_WALLET || process.env.TREASURY_WALLET || "";
  if (!v) return "";
  return isValidPubkey(v) ? v : "";
}
export function getTokenMint(): string {
  // Any SPL token for testing — default devnet USDC or fallback
  const fallback = "4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU";
  const v = process.env.NEXT_PUBLIC_TOKEN_MINT || process.env.TOKEN_MINT || fallback;
  return isValidPubkey(v) ? v : fallback;
}
export function getTokenDecimals(): number {
  return Number(process.env.NEXT_PUBLIC_TOKEN_DECIMALS ?? 6);
}

export function getConnection(): Connection {
  return new Connection(getRpcUrl(), "confirmed");
}

export async function verifySolPayment(params: {
  signature: string;
  expectedWallet: string;
  expectedTreasury: string;
  minLamports: bigint;
}): Promise<{ ok: boolean; error?: string; tx?: unknown }> {
  const { signature, expectedWallet, expectedTreasury, minLamports } = params;
  const conn = getConnection();
  // retry 5x
  for (let i = 0; i < 5; i++) {
    const tx = await conn.getParsedTransaction(signature, { commitment: "confirmed", maxSupportedTransactionVersion: 0 });
    if (tx) {
      if (tx.meta?.err) return { ok: false, error: `Transaction failed: ${JSON.stringify(tx.meta.err)}` };
      // find treasury balance increase
      const keys = tx.transaction.message.accountKeys.map((k: { pubkey: PublicKey }) => k.pubkey.toBase58());
      const treasuryIdx = keys.indexOf(expectedTreasury);
      const walletIdx = keys.indexOf(expectedWallet);
      if (treasuryIdx === -1) return { ok: false, error: "Treasury not found in transaction" };
      if (walletIdx === -1) return { ok: false, error: "Wallet not found in transaction" };
      const pre = tx.meta?.preBalances?.[treasuryIdx] ?? 0;
      const post = tx.meta?.postBalances?.[treasuryIdx] ?? 0;
      const delta = BigInt(post) - BigInt(pre);
      if (delta < minLamports) {
        return { ok: false, error: `Insufficient amount: got ${delta} lamports, expected >= ${minLamports}` };
      }
      return { ok: true, tx };
    }
    await new Promise((r) => setTimeout(r, 1200 * (i + 1)));
  }
  return { ok: false, error: "Transaction not found after retries" };
}

export async function verifyTokenPayment(params: {
  signature: string;
  expectedWallet: string;
  minAtomic: bigint;
  mint: string;
}): Promise<{ ok: boolean; error?: string; tx?: unknown }> {
  const { signature, expectedWallet, minAtomic, mint } = params;
  const conn = getConnection();
  for (let i = 0; i < 5; i++) {
    const tx = await conn.getParsedTransaction(signature, { commitment: "confirmed", maxSupportedTransactionVersion: 0 });
    if (tx) {
      if (tx.meta?.err) return { ok: false, error: `Transaction failed: ${JSON.stringify(tx.meta.err)}` };
      // Look into inner instructions / pre/post token balances
      const pre = tx.meta?.preTokenBalances ?? [];
      const post = tx.meta?.postTokenBalances ?? [];
      // Find treasury token account delta for mint
      // Treasury may have ATA: derive
      // Simpler: check transfer instruction parsed
      const instructions = tx.transaction.message.instructions as unknown as Array<{
        parsed?: { type: string; info: { mint: string; source: string; destination: string; amount: string; authority: string } };
        program?: string;
      }>;
      let found = false;
      for (const ix of instructions) {
        if (ix.parsed?.type === "transfer" && ix.parsed.info.mint === mint) {
          if (BigInt(ix.parsed.info.amount) >= minAtomic) {
            // authority should be wallet
            if (ix.parsed.info.authority === expectedWallet) found = true;
          }
        }
      }
      // Also check innerInstructions
      const inner = (tx.meta as unknown as { innerInstructions?: Array<{ instructions: typeof instructions }> })?.innerInstructions;
      if (inner) {
        for (const g of inner) {
          for (const ix of g.instructions) {
            if (ix.parsed?.type === "transfer" && ix.parsed.info.mint === mint) {
              if (BigInt(ix.parsed.info.amount) >= minAtomic && ix.parsed.info.authority === expectedWallet) found = true;
            }
          }
        }
      }
      // Fallback to token balance delta if not found via instruction parsing
      if (!found) {
        for (const b of post) {
          if (b.mint === mint) {
            const preB = pre.find((p) => p.accountIndex === b.accountIndex);
            const preAmt = preB ? BigInt(preB.uiTokenAmount.amount) : BigInt(0);
            const postAmt = BigInt(b.uiTokenAmount.amount);
            const delta = postAmt - preAmt;
            if (delta >= minAtomic) found = true;
          }
        }
      }
      if (!found) return { ok: false, error: `Token transfer not found or insufficient: expected >= ${minAtomic} atomic of ${mint}` };
      return { ok: true, tx };
    }
    await new Promise((r) => setTimeout(r, 1200 * (i + 1)));
  }
  return { ok: false, error: "Transaction not found after retries" };
}

// Client-side helpers to build transactions
export async function buildSolTransfer(params: { from: PublicKey; to: PublicKey; lamports: bigint }): Promise<Transaction> {
  const tx = new Transaction().add(
    SystemProgram.transfer({
      fromPubkey: params.from,
      toPubkey: params.to,
      lamports: Number(params.lamports), // safe for small amounts ( < 2^53 ), else use BigInt via web3.js 1.98 supports bigint?
    })
  );
  tx.feePayer = params.from;
  const conn = getConnection();
  const { blockhash } = await conn.getLatestBlockhash();
  tx.recentBlockhash = blockhash;
  return tx;
}

export async function buildTokenTransfer(params: {
  from: PublicKey;
  to: PublicKey; // treasury wallet pubkey
  mint: PublicKey;
  amountAtomic: bigint;
  decimals: number;
}): Promise<Transaction> {
  const conn = getConnection();
  const fromAta = await getAssociatedTokenAddress(params.mint, params.from);
  const toAta = await getAssociatedTokenAddress(params.mint, params.to);
  const tx = new Transaction();
  // ensure toAta exists — check
  try {
    await getAccount(conn, toAta);
  } catch {
    tx.add(createAssociatedTokenAccountInstruction(params.from, toAta, params.to, params.mint));
  }
  tx.add(createTransferInstruction(fromAta, toAta, params.from, params.amountAtomic));
  tx.feePayer = params.from;
  const { blockhash } = await conn.getLatestBlockhash();
  tx.recentBlockhash = blockhash;
  return tx;
}
