"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useLocale } from "@/components/providers/LocaleProvider";
import { gpuTypes } from "@/lib/mocks/gpus";
import { GpuCard } from "@/components/gpu/GpuCard";
import Link from "next/link";

export function GpuMarketplace() {
  const { t } = useLocale();
  const [filter, setFilter] = useState<"all" | "available">("all");
  const list = filter === "available" ? gpuTypes.filter((g) => g.available) : gpuTypes;

  return (
    <section
      id="marketplace"
      aria-label="GPU Marketplace"
      className="relative w-full overflow-hidden bg-white px-6 py-[100px] max-[809px]:px-5 max-[809px]:py-16"
    >
      <div className="pointer-events-none absolute inset-0 opacity-[0.45]" style={{ background: "radial-gradient(800px 400px at 20% 0%, rgba(214,228,232,0.5) 0%, transparent 60%), radial-gradient(600px 300px at 90% 20%, rgba(232,220,200,0.4) 0%, transparent 60%)" }} />
      <div className="relative mx-auto flex w-full max-w-[1280px] flex-col items-center">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="flex w-full flex-col items-center text-center"
        >
          <p className="grid-copy text-[11px] tracking-[0.14em] text-[#0d0d0d66]" style={{ fontFamily: "var(--font-mono)" }}>
            {t.marketplace.kicker}
          </p>
          <h2 className="river-copy mt-4 max-w-[760px] text-[44px] font-medium leading-[1.15] tracking-[-0.02em] text-[var(--ink-text)] max-[809px]:text-[28px]" style={{ fontFamily: "var(--font-display)" }}>
            <span>{t.marketplace.title}</span>
            <span className="font-light text-[var(--ink-a40)]">{t.marketplace.titleAccent}</span>
          </h2>
          <p className="river-copy mt-4 max-w-[640px] text-[16px] font-light leading-[1.6] text-[#0d0d0d99] max-[809px]:text-[15px]" style={{ fontFamily: "var(--font-display)" }}>
            {t.marketplace.subtitle}
          </p>
          <p className="mt-3 inline-flex items-center gap-2 rounded-full border border-amber-200 bg-amber-50 px-3 py-1 font-mono text-[11px] text-amber-800">
            <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
            {t.marketplace.mockBadge} — {t.marketplace.tokenHint}
          </p>
        </motion.div>

        <div className="mt-8 flex items-center gap-2 rounded-full bg-black/5 p-1">
          <button
            onClick={() => setFilter("all")}
            className={`rounded-full px-4 py-1.5 text-sm font-medium transition ${filter === "all" ? "bg-white shadow text-[#0d0d0d]" : "text-[#0d0d0d66]"}`}
            style={{ fontFamily: "var(--font-display)" }}
          >
            {t.marketplace.filterAll} ({gpuTypes.length})
          </button>
          <button
            onClick={() => setFilter("available")}
            className={`rounded-full px-4 py-1.5 text-sm font-medium transition ${filter === "available" ? "bg-white shadow text-[#0d0d0d]" : "text-[#0d0d0d66]"}`}
            style={{ fontFamily: "var(--font-display)" }}
          >
            {t.marketplace.filterAvailable} ({gpuTypes.filter((g) => g.available).length})
          </button>
        </div>

        <div className="mt-10 grid w-full grid-cols-3 gap-6 max-[1024px]:grid-cols-2 max-[640px]:grid-cols-1">
          {list.map((gpu, i) => (
            <GpuCard key={gpu.id} gpu={gpu} index={i} />
          ))}
        </div>

        <Link
          href="/marketplace"
          className="mt-8 inline-flex items-center gap-2 rounded-full border border-black/10 bg-white px-5 py-2.5 text-sm font-medium text-[#0d0d0d] hover:bg-black/5"
          style={{ fontFamily: "var(--font-display)" }}
        >
          View full marketplace →
        </Link>
      </div>
    </section>
  );
}
