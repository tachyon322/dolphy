"use client";

import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { useLocale } from "@/components/providers/LocaleProvider";
import { GpuCard } from "@/components/gpu/GpuCard";
import type { GpuType } from "@/lib/mocks/gpus";
import Link from "next/link";

async function fetchGpus(): Promise<{ gpus: GpuType[]; mock: boolean }> {
  const res = await fetch("/api/gpus", { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to fetch GPUs");
  return res.json();
}

export default function MarketplacePage() {
  const { t } = useLocale();
  const [filter, setFilter] = useState<"all" | "available">("all");
  const { data, isLoading, error } = useQuery({
    queryKey: ["gpus"],
    queryFn: fetchGpus,
  });

  const gpus = data?.gpus ?? [];
  const list = filter === "available" ? gpus.filter((g) => g.available) : gpus;

  return (
    <main className="flex flex-1 flex-col bg-[#fafafa]">
      <section className="relative w-full overflow-hidden px-6 pb-10 pt-[calc(var(--nav-height)+32px)] max-[809px]:px-5">
        <div className="pointer-events-none absolute inset-0 opacity-[0.45]" style={{ background: "radial-gradient(800px 400px at 20% 0%, rgba(214,228,232,0.5) 0%, transparent 60%), radial-gradient(600px 300px at 90% 20%, rgba(232,220,200,0.4) 0%, transparent 60%)" }} />
        <div className="relative mx-auto flex w-full max-w-[1280px] flex-col">
          <Link href="/" className="inline-flex w-fit items-center gap-2 rounded-full border border-black/10 bg-white px-3 py-1.5 text-sm text-[#0d0d0d] hover:bg-black/5">
            ← {t.common.backHome}
          </Link>
          <p className="grid-copy mt-8 text-[11px] tracking-[0.14em] text-[#0d0d0d66]" style={{ fontFamily: "var(--font-mono)" }}>
            {t.marketplace.kicker}
          </p>
          <h1 className="river-copy mt-3 text-[44px] font-medium leading-[1.1] tracking-[-0.02em] text-[var(--ink-text)] max-[809px]:text-[30px]" style={{ fontFamily: "var(--font-display)" }}>
            {t.marketplace.title}
            <span className="font-light text-[var(--ink-a40)]">{t.marketplace.titleAccent}</span>
          </h1>
          <p className="river-copy mt-3 max-w-[640px] text-[16px] font-light leading-[1.6] text-[#0d0d0d99]" style={{ fontFamily: "var(--font-display)" }}>
            {t.marketplace.subtitle}
          </p>
          <div className="mt-4 inline-flex items-center gap-2 rounded-full border border-amber-200 bg-amber-50 px-3 py-1 font-mono text-[11px] text-amber-800">
            <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
            {t.marketplace.mockBadge} — {t.marketplace.tokenHint}
          </div>
          <div className="mt-6 flex items-center gap-2 rounded-full bg-black/5 p-1 w-fit">
            <button onClick={() => setFilter("all")} className={`rounded-full px-4 py-1.5 text-sm font-medium transition ${filter === "all" ? "bg-white shadow text-[#0d0d0d]" : "text-[#0d0d0d66]"}`} style={{ fontFamily: "var(--font-display)" }}>
              {t.marketplace.filterAll} ({gpus.length})
            </button>
            <button onClick={() => setFilter("available")} className={`rounded-full px-4 py-1.5 text-sm font-medium transition ${filter === "available" ? "bg-white shadow text-[#0d0d0d]" : "text-[#0d0d0d66]"}`} style={{ fontFamily: "var(--font-display)" }}>
              {t.marketplace.filterAvailable} ({gpus.filter((g) => g.available).length})
            </button>
            {data?.mock && <span className="ml-2 font-mono text-[11px] text-black/40">MOCK</span>}
          </div>
        </div>
      </section>

      <section className="w-full px-6 pb-20 max-[809px]:px-5">
        <div className="mx-auto w-full max-w-[1280px]">
          {isLoading ? (
            <div className="grid grid-cols-3 gap-6 max-[1024px]:grid-cols-2 max-[640px]:grid-cols-1">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="h-[280px] animate-pulse rounded-[20px] bg-black/[0.04]" />
              ))}
            </div>
          ) : error ? (
            <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">Failed to load GPUs: {String(error)}</div>
          ) : (
            <div className="grid grid-cols-3 gap-6 max-[1024px]:grid-cols-2 max-[640px]:grid-cols-1">
              {list.map((gpu, i) => (
                <GpuCard key={gpu.id} gpu={gpu} index={i} />
              ))}
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
