"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { useLocale } from "@/components/providers/LocaleProvider";
import type { GpuType } from "@/lib/mocks/gpus";
import { formatSol } from "@/lib/pricing";

export function GpuCard({ gpu, index = 0 }: { gpu: GpuType; index?: number }) {
  const { t } = useLocale();
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.5, delay: index * 0.05, ease: [0.16, 1, 0.3, 1] }}
      className="group relative flex flex-col rounded-[20px] border bg-white p-6 shadow-[0_8px_32px_rgba(13,13,13,0.04)] transition-[box-shadow,border-color] hover:shadow-[0_16px_48px_rgba(13,13,13,0.08)] hover:border-[#0d0d0d14]"
      style={{ borderColor: "rgba(13,13,13,0.07)" }}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-full border border-black/5 bg-[#fafafa] text-[#0d0d0d99]">
            {/* grid icon */}
            <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.25}>
              <rect x={3} y={3} width={18} height={18} rx={2} />
              <path d="M3 9h18M9 21V9" strokeWidth={0.9} opacity={0.4} />
              <rect x={9} y={9} width={6} height={6} fill="currentColor" opacity={0.9} />
            </svg>
          </span>
          <div>
            <h3 className="font-display text-[17px] font-semibold leading-none text-[var(--ink-text)]" style={{ fontFamily: "var(--font-display)" }}>
              {gpu.displayName}
            </h3>
            <p className="mt-1 font-mono text-[11px] tracking-[0.08em] text-[#0d0d0d66]" style={{ fontFamily: "var(--font-mono)" }}>
              {gpu.vram}GB · {gpu.memoryType}
            </p>
          </div>
        </div>
        <span
          className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-medium tracking-[0.04em] ${gpu.available ? "bg-[#00d084]/10 text-[#00a56a] border border-[#00d084]/20" : "bg-black/5 text-black/40 border border-black/10"}`}
        >
          <span className={`h-1.5 w-1.5 rounded-full ${gpu.available ? "bg-[#00d084] shadow-[0_0_6px_rgba(0,208,132,0.6)]" : "bg-black/20"}`} />
          {gpu.available ? t.marketplace.available : t.marketplace.limited}
        </span>
      </div>

      <p className="river-copy mt-3 line-clamp-2 text-[13.5px] leading-[1.5] text-[#0d0d0d99]" style={{ fontFamily: "var(--font-display)" }}>
        {gpu.description}
      </p>

      <div className="mt-5 grid grid-cols-2 gap-3">
        <div className="rounded-[12px] border border-black/[0.06] bg-[#fafafa] p-3">
          <p className="grid-copy text-[10px] tracking-[0.08em] text-black/40" style={{ fontFamily: "var(--font-mono)" }}>
            {t.marketplace.sol} {t.marketplace.perHour}
          </p>
          <p className="mt-1 font-mono text-[16px] font-semibold tracking-[-0.02em] text-[#0d0d0d]" style={{ fontFamily: "var(--font-mono)" }}>
            {formatSol(gpu.priceSolPerHour)}
          </p>
          <p className="font-mono text-[11px] text-black/40" style={{ fontFamily: "var(--font-mono)" }}>
            SOL
          </p>
        </div>
        <div className="relative rounded-[12px] border border-[#00d084]/20 bg-[#00d084]/[0.06] p-3">
          <span className="absolute -right-1 -top-1 rounded-full bg-[#0d0d0d] px-1.5 py-0.5 font-mono text-[10px] font-bold text-white">{t.marketplace.discount}</span>
          <p className="grid-copy text-[10px] tracking-[0.08em] text-[#00a56a]" style={{ fontFamily: "var(--font-mono)" }}>
            {t.marketplace.token} {t.marketplace.perHour}
          </p>
          <p className="mt-1 font-mono text-[16px] font-semibold tracking-[-0.02em] text-[#0d0d0d]" style={{ fontFamily: "var(--font-mono)" }}>
            {formatSol(gpu.priceTokenPerHour)}
          </p>
          <p className="font-mono text-[11px] text-black/40" style={{ fontFamily: "var(--font-mono)" }}>
            TOKEN
          </p>
        </div>
      </div>

      <div className="mt-5 flex items-center gap-2">
        <Link
          href={`/marketplace/${gpu.id}`}
          className={`inline-flex flex-1 items-center justify-center rounded-full px-4 py-2.5 text-sm font-medium transition ${gpu.available ? "bg-[#0d0d0d] text-white hover:bg-black" : "bg-black/5 text-black/30 pointer-events-none"}`}
          style={{ fontFamily: "var(--font-display)" }}
        >
          {t.marketplace.rent} →
        </Link>
        <span className="font-mono text-[11px] text-black/30" style={{ fontFamily: "var(--font-mono)" }}>
          {t.marketplace.startingAt}
        </span>
      </div>
    </motion.div>
  );
}
