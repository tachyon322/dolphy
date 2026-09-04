"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useLocale } from "@/components/providers/LocaleProvider";
import { useRentalsStore } from "@/lib/store";
import { useActiveWallet } from "@/lib/useActiveWallet";

type ApiRental = {
  id: string;
  gpuName: string;
  gpuId: string;
  hours: number;
  payWith: "SOL" | "TOKEN";
  amountPaid: string;
  txSignature: string;
  status: string;
  failureReason?: string;
  podId?: string;
  endpoint?: string;
  sshCommand?: string;
  createdAt: number;
  expiresAt: number;
};

export default function DashboardPage() {
  const { t } = useLocale();
  const { address } = useActiveWallet();
  const localRentals = useRentalsStore((s) => s.rentals);
  const clear = useRentalsStore((s) => s.clearRentals);
  const [apiRentals, setApiRentals] = useState<ApiRental[]>([]);
  const [loading, setLoading] = useState(false);
  const [terminating, setTerminating] = useState<string | null>(null);

  const wallet = address ?? "";

  const reload = (w: string) => {
    queueMicrotask(() => setLoading(true));
    fetch(w ? `/api/rentals?wallet=${w}` : `/api/rentals`, { cache: "no-store" })
      .then((r) => r.json())
      .then((j) => setApiRentals(j.rentals ?? []))
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    if (!wallet) return;
    reload(wallet);
  }, [wallet]);

  // Also fetch all when no wallet (show server memory for demo)
  useEffect(() => {
    if (wallet) return;
    reload("");
  }, [wallet, localRentals.length]);

  const terminate = async (id: string) => {
    if (!wallet || terminating) return;
    setTerminating(id);
    try {
      const r = await fetch(`/api/rentals/${id}/terminate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ wallet }),
      });
      if (r.ok) reload(wallet);
    } finally {
      setTerminating(null);
    }
  };

  const display = wallet ? (apiRentals.length ? apiRentals : localRentals.filter((r) => r.txSignature)) : apiRentals.length ? apiRentals : localRentals;

  return (
    <main className="flex flex-1 flex-col bg-[#fafafa]">
      <div className="mx-auto flex w-full max-w-[1280px] flex-col gap-6 px-6 pb-16 pt-[calc(var(--nav-height)+24px)] max-[809px]:px-5">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="river-copy text-[32px] font-semibold tracking-[-0.02em] text-[#0d0d0d]" style={{ fontFamily: "var(--font-display)" }}>
              {t.dashboard.title}
            </h1>
            <p className="river-copy mt-2 max-w-[640px] text-[15px] font-light leading-[1.6] text-[#0d0d0d99]" style={{ fontFamily: "var(--font-display)" }}>
              {t.dashboard.subtitle}
            </p>
            {wallet && <p className="mt-2 font-mono text-xs text-black/40">Wallet: {wallet.slice(0, 6)}…{wallet.slice(-4)}</p>}
          </div>
          <div className="flex items-center gap-2">
            <Link href="/marketplace" className="rounded-full bg-[#0d0d0d] px-4 py-2 text-sm font-medium text-white">
              {t.dashboard.goMarketplace}
            </Link>
            <button onClick={clear} className="rounded-full border border-black/10 bg-white px-4 py-2 text-sm font-medium text-[#0d0d0d]">
              {t.dashboard.clear}
            </button>
          </div>
        </div>

        <div className="rounded-[20px] border border-black/[0.07] bg-white p-6">
          {loading ? (
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="h-16 animate-pulse rounded-xl bg-black/[0.04]" />
              ))}
            </div>
          ) : display.length === 0 ? (
            <div className="flex flex-col items-center gap-4 py-12 text-center">
              <p className="font-display text-sm text-[#0d0d0d99]" style={{ fontFamily: "var(--font-display)" }}>
                {t.dashboard.empty}
              </p>
              <Link href="/marketplace" className="rounded-full bg-[#0d0d0d] px-5 py-2.5 text-sm font-medium text-white">
                {t.dashboard.goMarketplace} →
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="border-b border-black/10 text-left font-mono text-[11px] tracking-[0.08em] text-black/40">
                    <th className="py-3 pr-4">{t.dashboard.gpu}</th>
                    <th className="py-3 pr-4">{t.dashboard.duration}</th>
                    <th className="py-3 pr-4">{t.dashboard.amount}</th>
                    <th className="py-3 pr-4">{t.dashboard.status}</th>
                    <th className="py-3 pr-4">{t.dashboard.tx}</th>
                    <th className="py-3 pr-4">{t.dashboard.pod}</th>
                    <th className="py-3 pr-4">{t.dashboard.created}</th>
                    <th className="py-3 pr-4">{t.dashboard.action}</th>
                  </tr>
                </thead>
                <tbody>
                  {display.map((r) => {
                    // normalize both shapes
                    const isApi = "amountPaid" in r;
                    const amount = isApi ? (r as ApiRental).amountPaid : String((r as unknown as { amount: number }).amount);
                    const gpuName = (r as unknown as { gpuName: string }).gpuName;
                    const hours = (r as unknown as { hours: number }).hours;
                    const payWith = (r as unknown as { payWith: string }).payWith;
                    const status = (r as unknown as { status: string }).status;
                    const tx = (r as unknown as { txSignature: string }).txSignature;
                    const podId = (r as unknown as { podId?: string }).podId;
                    const endpoint = (r as unknown as { endpoint?: string }).endpoint;
                    const ssh = (r as unknown as { sshCommand?: string }).sshCommand;
                    const createdAt = isApi ? new Date((r as ApiRental).createdAt).toLocaleString() : (r as unknown as { createdAt: string }).createdAt;
                    const id = (r as unknown as { id: string }).id;
                    const failureReason = (r as ApiRental).failureReason;
                    return (
                      <tr key={id} className="border-b border-black/[0.04] hover:bg-black/[0.02]">
                        <td className="py-3 pr-4 font-medium">{gpuName}</td>
                        <td className="py-3 pr-4 font-mono text-xs">{hours}h • {payWith}</td>
                        <td className="py-3 pr-4 font-mono text-xs">{isApi ? `${Number(amount) / 1e9} lamports` : `${amount} ${payWith}`}</td>
                        <td className="py-3 pr-4">
                          <span title={failureReason ?? status} className={`rounded-full px-2 py-1 font-mono text-[11px] ${status === "active" ? "bg-[#00d084]/10 text-[#00a56a]" : status === "failed" ? "bg-[#ff4d4f]/10 text-[#d92d20]" : "bg-black/5 text-black/40"}`}>{status}</span>
                        </td>
                        <td className="py-3 pr-4 font-mono text-[11px] text-black/60">
                          <a href={tx.startsWith("mock") ? "#" : `https://explorer.solana.com/tx/${tx}?cluster=devnet`} target="_blank" className="underline decoration-black/20 hover:decoration-black/40">
                            {tx.slice(0, 8)}…{tx.slice(-6)}
                          </a>
                        </td>
                        <td className="py-3 pr-4 font-mono text-[11px] text-black/60">
                          {podId ? (
                            <span title={ssh ?? endpoint}>{podId.slice(0, 12)}…</span>
                          ) : (
                            "—"
                          )}
                        </td>
                        <td className="py-3 pr-4 font-mono text-[11px] text-black/40">{createdAt}</td>
                        <td className="py-3 pr-4">
                          {isApi && status === "active" && wallet ? (
                            <button
                              onClick={() => terminate(id)}
                              disabled={terminating === id}
                              className="rounded-full border border-black/10 bg-white px-3 py-1 text-xs font-medium text-[#0d0d0d] disabled:opacity-50"
                            >
                              {terminating === id ? t.dashboard.terminating : t.dashboard.terminate}
                            </button>
                          ) : (
                            <span className="text-black/20">—</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
          <p className="mt-4 font-mono text-[11px] text-black/30">Showing {display.length} rentals — persisted in SQLite, incl. failed attempts. Failed reason on status hover.</p>
        </div>
      </div>
    </main>
  );
}
