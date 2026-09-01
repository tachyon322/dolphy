"use client";

import { useEffect, useMemo, useState } from "react";
import { useConnection } from "@solana/wallet-adapter-react";
import { PublicKey } from "@solana/web3.js";
import { toast } from "sonner";
import { useLocale } from "@/components/providers/LocaleProvider";
import type { GpuType } from "@/lib/mocks/gpus";
import { formatSol, TOKEN_DISCOUNT_PERCENT } from "@/lib/pricing";
import { buildSolTransfer, buildTokenTransfer, getTreasury, getTokenMint, getTokenDecimals, isValidPubkey } from "@/lib/solana";
import { useRentalsStore } from "@/lib/store";
import { useActiveWallet } from "@/lib/useActiveWallet";
import Link from "next/link";

type QuoteResp = {
  quoteId: string;
  gpuId: string;
  gpuName: string;
  hours: number;
  payWith: "SOL" | "TOKEN";
  amount: number;
  amountLamports: string;
  totalSol: number;
  totalToken: number;
  priceSolPerHour: number;
  priceTokenPerHour: number;
  expiresAt: number;
  treasury: string;
  tokenMint: string;
};

export function RentPanel({ gpu }: { gpu: GpuType }) {
  const { t } = useLocale();
  const { publicKey, sendTransaction, connected, address } = useActiveWallet();
  const { connection } = useConnection();
  const addRental = useRentalsStore((s) => s.addRental);

  const [hours, setHours] = useState(1);
  const [payWith, setPayWith] = useState<"SOL" | "TOKEN">("SOL");
  const [quote, setQuote] = useState<QuoteResp | null>(null);
  const [quoteLoading, setQuoteLoading] = useState(false);
  const [paying, setPaying] = useState(false);
  const [expiresLeft, setExpiresLeft] = useState(0);
  const [result, setResult] = useState<{ podId?: string; endpoint?: string; ssh?: string } | null>(null);

  const priceSol = gpu.priceSolPerHour * hours;
  const priceToken = gpu.priceTokenPerHour * hours;

  const treasury = useMemo(() => getTreasury(), []);
  const tokenMint = useMemo(() => getTokenMint(), []);
  const isMockTreasury = !treasury || !isValidPubkey(treasury);

  useEffect(() => {
    if (!quote) return;
    const iv = setInterval(() => {
      const left = Math.max(0, Math.ceil((quote.expiresAt - Date.now()) / 1000));
      setExpiresLeft(left);
      if (left <= 0) {
        setQuote(null);
        toast.error("Quote expired, create a new one");
        clearInterval(iv);
      }
    }, 1000);
    return () => clearInterval(iv);
  }, [quote]);

  const createQuote = async () => {
    if (!gpu.available) return toast.error("GPU not available");
    setQuoteLoading(true);
    setResult(null);
    try {
      const res = await fetch("/api/quote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ gpuId: gpu.id, hours, payWith, wallet: address ?? publicKey?.toBase58() ?? "" }),
      });
      const j = await res.json();
      if (!res.ok) throw new Error(j.error || "Quote failed");
      setQuote(j);
      setExpiresLeft(Math.ceil((j.expiresAt - Date.now()) / 1000));
      toast.success("Quote created — 2 min to pay");
    } catch (e) {
      toast.error(String(e));
    } finally {
      setQuoteLoading(false);
    }
  };

  const handlePay = async () => {
    if (!quote) return toast.error("Create quote first");
    if (!publicKey) return toast.error(t.rent.connectFirst);
    if (!connected) return toast.error(t.rent.connectFirst);
    setPaying(true);
    try {
      let signature: string;

      // Determine if we should mock (treasury missing or invalid, or quote treasury invalid)
      const effectiveTreasury = quote.treasury || treasury;
      const effectiveMint = quote.tokenMint || tokenMint;
      const shouldMock = isMockTreasury || !isValidPubkey(effectiveTreasury);
      if (shouldMock) {
        // Mock mode — no on-chain transfer, just generate fake sig
        if (treasury && !isValidPubkey(treasury)) {
          toast.error(`Treasury address invalid: ${treasury}. Using mock payment. Fix NEXT_PUBLIC_TREASURY_WALLET to enable real payments.`);
        } else {
          toast("Mock mode — skipping on-chain payment", { description: "Using fake signature, treasury not configured" });
        }
        signature = `mock_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 10)}`;
        // small delay to mimic wallet
        await new Promise((r) => setTimeout(r, 600));
      } else {
        // Real mode — build and send transaction
        let toPubkey: PublicKey;
        try {
          toPubkey = new PublicKey(effectiveTreasury);
        } catch {
          throw new Error(`Invalid treasury address: ${effectiveTreasury}. Set NEXT_PUBLIC_TREASURY_WALLET to a valid Solana address or leave empty for mock.`);
        }
        if (payWith === "SOL") {
          const lamports = BigInt(quote.amountLamports);
          const tx = await buildSolTransfer({ from: publicKey, to: toPubkey, lamports });
          signature = await sendTransaction(tx, connection);
          await connection.confirmTransaction(signature, "confirmed");
        } else {
          let mint: PublicKey;
          try {
            mint = new PublicKey(effectiveMint);
          } catch {
            throw new Error(`Invalid token mint: ${effectiveMint}. Set NEXT_PUBLIC_TOKEN_MINT correctly.`);
          }
          const amountAtomic = BigInt(quote.amountLamports);
          const decimals = getTokenDecimals();
          const tx = await buildTokenTransfer({ from: publicKey, to: toPubkey, mint, amountAtomic, decimals });
          signature = await sendTransaction(tx, connection);
          await connection.confirmTransaction(signature, "confirmed");
        }
        toast.success("Transaction sent, verifying...");
      }

      // Verify with backend
      const verifyRes = await fetch("/api/rent/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ quoteId: quote.quoteId, signature, wallet: address ?? publicKey.toBase58(), payWith }),
      });
      const vj = await verifyRes.json();
      if (!verifyRes.ok) throw new Error(vj.error || "Verify failed");

      const rental = vj.rental as { id: string; podId: string; endpoint: string; sshCommand: string; expiresAt: number; createdAt: number };
      addRental({
        id: rental.id,
        quoteId: quote.quoteId,
        gpuId: gpu.id,
        gpuName: gpu.displayName,
        hours: quote.hours,
        payWith,
        amount: quote.amount,
        txSignature: signature,
        status: "active",
        podId: rental.podId,
        endpoint: rental.endpoint,
        sshCommand: rental.sshCommand,
        createdAt: new Date(rental.createdAt).toISOString(),
        expiresAt: new Date(rental.expiresAt).toISOString(),
      });

      setResult({ podId: rental.podId, endpoint: rental.endpoint, ssh: rental.sshCommand });
      toast.success(t.rent.success);
      setQuote(null);
    } catch (e) {
      console.error(e);
      toast.error(`${t.rent.failed}: ${String(e)}`);
    } finally {
      setPaying(false);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Duration */}
      <div className="rounded-[20px] border border-black/[0.07] bg-white p-6">
        <h3 className="font-display text-[15px] font-semibold text-[#0d0d0d]" style={{ fontFamily: "var(--font-display)" }}>
          {t.rent.duration}
        </h3>
        <div className="mt-4 flex flex-wrap items-center gap-2">
          {[1, 3, 8, 24, 72].map((h) => (
            <button
              key={h}
              onClick={() => setHours(h)}
              className={`rounded-full px-4 py-2 text-sm font-medium transition ${hours === h ? "bg-[#0d0d0d] text-white" : "bg-black/5 text-[#0d0d0d] hover:bg-black/10"}`}
              style={{ fontFamily: "var(--font-display)" }}
            >
              {h}h
            </button>
          ))}
          <div className="ml-2 flex items-center gap-2">
            <button onClick={() => setHours((v) => Math.max(1, v - 1))} className="h-8 w-8 rounded-full border border-black/10 bg-white text-sm">−</button>
            <span className="min-w-[48px] text-center font-mono text-sm font-medium">{hours}h</span>
            <button onClick={() => setHours((v) => Math.min(720, v + 1))} className="h-8 w-8 rounded-full border border-black/10 bg-white text-sm">+</button>
          </div>
        </div>
        <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
          <div className="rounded-xl bg-[#fafafa] p-3 border border-black/5">
            <p className="font-mono text-[11px] tracking-[0.06em] text-black/40">SOL / hour</p>
            <p className="font-mono font-semibold">{formatSol(gpu.priceSolPerHour)} SOL</p>
          </div>
          <div className="rounded-xl bg-[#00d084]/5 p-3 border border-[#00d084]/20">
            <p className="font-mono text-[11px] tracking-[0.06em] text-[#00a56a]">TOKEN / hour -{TOKEN_DISCOUNT_PERCENT}%</p>
            <p className="font-mono font-semibold">{formatSol(gpu.priceTokenPerHour)} TOKEN</p>
          </div>
        </div>
      </div>

      {/* Pay with toggle */}
      <div className="rounded-[20px] border border-black/[0.07] bg-white p-6">
        <h3 className="font-display text-[15px] font-semibold text-[#0d0d0d]" style={{ fontFamily: "var(--font-display)" }}>
          {t.rent.paySol} / {t.rent.payToken}
        </h3>
        <div className="mt-4 grid grid-cols-2 gap-3">
          <button
            onClick={() => setPayWith("SOL")}
            className={`relative rounded-[14px] border p-4 text-left transition ${payWith === "SOL" ? "border-[#0d0d0d] bg-[#0d0d0d] text-white" : "border-black/10 bg-white text-[#0d0d0d] hover:border-black/20"}`}
          >
            <p className="font-mono text-[11px] tracking-[0.08em] opacity-60">SOL</p>
            <p className="mt-1 font-mono text-[18px] font-semibold">{formatSol(priceSol)} SOL</p>
            <p className="font-mono text-[12px] opacity-60">{hours}h total</p>
            {payWith === "SOL" && <span className="absolute right-3 top-3 h-2 w-2 rounded-full bg-white" />}
          </button>
          <button
            onClick={() => setPayWith("TOKEN")}
            className={`relative rounded-[14px] border p-4 text-left transition ${payWith === "TOKEN" ? "border-[#00d084] bg-[#00d084] text-white" : "border-black/10 bg-white text-[#0d0d0d] hover:border-[#00d084]/30"}`}
          >
            <p className="font-mono text-[11px] tracking-[0.08em] opacity-70">TOKEN {t.rent.cheaper}</p>
            <p className="mt-1 font-mono text-[18px] font-semibold">{formatSol(priceToken)} TOKEN</p>
            <p className="font-mono text-[12px] opacity-60">{hours}h total • -{TOKEN_DISCOUNT_PERCENT}%</p>
            {payWith === "TOKEN" && <span className="absolute right-3 top-3 h-2 w-2 rounded-full bg-white" />}
            <span className="absolute -right-1 -top-1 rounded-full bg-[#0d0d0d] px-1.5 py-0.5 font-mono text-[10px] font-bold text-white">-{TOKEN_DISCOUNT_PERCENT}%</span>
          </button>
        </div>
        <p className="mt-3 font-mono text-[11px] leading-[1.4] text-black/40">
          {isMockTreasury ? "Mock mode: no TREASURY_WALLET — payment is simulated. Add NEXT_PUBLIC_TREASURY_WALLET to enable real SOL/SPL transfer on devnet." : `Treasury: ${treasury.slice(0, 6)}…${treasury.slice(-4)} • Mint: ${tokenMint.slice(0, 6)}… • Network: devnet — any SPL token for testing`}
        </p>
        <p className="mt-1 font-mono text-[11px] text-black/30">{t.rent.treasuryNote}</p>
      </div>

      {/* Quote / Pay */}
      <div className="rounded-[20px] border border-black/[0.07] bg-[#fafafa] p-6">
        {!quote ? (
          <button
            onClick={createQuote}
            disabled={quoteLoading || !gpu.available}
            className="inline-flex w-full items-center justify-center rounded-full bg-[#0d0d0d] px-6 py-3 text-sm font-medium text-white hover:bg-black disabled:opacity-50"
            style={{ fontFamily: "var(--font-display)" }}
          >
            {quoteLoading ? "Creating..." : t.rent.createQuote} — {formatSol(payWith === "SOL" ? priceSol : priceToken)} {payWith}
          </button>
        ) : (
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <p className="font-mono text-[11px] tracking-[0.08em] text-black/40">{t.rent.quoteExpires}</p>
              <p className={`font-mono text-sm font-semibold ${expiresLeft < 30 ? "text-red-600" : "text-[#0d0d0d]"}`}>{expiresLeft}s</p>
            </div>
            <div className="rounded-xl bg-white border border-black/10 p-4">
              <div className="flex items-center justify-between">
                <span className="font-mono text-sm text-black/60">{gpu.displayName} × {quote.hours}h</span>
                <span className="font-mono text-sm font-semibold">{formatSol(quote.amount)} {quote.payWith}</span>
              </div>
              <div className="mt-2 h-px bg-black/5" />
              <div className="mt-2 flex items-center justify-between">
                <span className="font-mono text-[11px] text-black/40">Quote ID</span>
                <span className="font-mono text-[11px] text-black/60">{quote.quoteId.slice(0, 12)}…</span>
              </div>
            </div>
            {!connected ? (
              <p className="rounded-xl bg-amber-50 border border-amber-200 p-3 font-mono text-sm text-amber-800">{t.rent.connectFirst}</p>
            ) : (
              <button
                onClick={handlePay}
                disabled={paying}
                className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-[#00d084] px-6 py-3 text-sm font-semibold text-white hover:bg-[#00b873] disabled:opacity-50"
                style={{ fontFamily: "var(--font-display)" }}
              >
                {paying ? t.rent.paying : `${t.rent.confirmPay} — ${formatSol(quote.amount)} ${quote.payWith}`}
              </button>
            )}
            <button onClick={() => setQuote(null)} className="text-center font-mono text-xs text-black/40 hover:text-black/60">
              Cancel quote
            </button>
          </div>
        )}

        {result && (
          <div className="mt-6 rounded-xl border border-[#00d084]/20 bg-[#00d084]/5 p-4">
            <p className="font-mono text-sm font-semibold text-[#0d0d0d]">{t.rent.success}</p>
            <div className="mt-3 space-y-2 font-mono text-xs">
              <div className="flex justify-between"><span className="text-black/40">{t.rent.podId}</span><span className="text-black/80">{result.podId}</span></div>
              <div className="flex justify-between"><span className="text-black/40">{t.rent.endpoint}</span><a href={result.endpoint} target="_blank" className="text-[#0d0d0d] underline truncate ml-2 max-w-[180px]">{result.endpoint}</a></div>
              <div className="flex justify-between"><span className="text-black/40">{t.rent.ssh}</span><span className="text-black/80 truncate ml-2 max-w-[180px]">{result.ssh}</span></div>
            </div>
            <Link href="/dashboard" className="mt-4 inline-flex rounded-full bg-[#0d0d0d] px-4 py-2 text-xs font-medium text-white">{t.rent.viewDashboard} →</Link>
          </div>
        )}
      </div>
    </div>
  );
}
