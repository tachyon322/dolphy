"use client";

import { motion } from "framer-motion";
import { useLocale } from "@/components/providers/LocaleProvider";

export function Metrics() {
  const { t } = useLocale();
  const metrics = t.metrics.items as unknown as Array<{ label: string; value: string; sub: string; unit?: string }>;
  return (
    <section
      id="infrastructure"
      aria-label="Network metrics — Grid"
      className="w-full border-y border-black/[0.06] bg-[#0d0d0d] px-10 py-10 max-[1199px]:px-4 max-[809px]:px-5 max-[809px]:py-8"
    >
      <div className="mx-auto flex w-full max-w-[1360px] flex-col gap-8">
        {/* header — Grid log */}
        <div className="flex flex-wrap items-center justify-between gap-4">
        </div>

        {/* metrics grid — pure Grid */}
        <div className="grid grid-cols-4 gap-[1px] overflow-hidden rounded-[16px] border border-white/10 bg-white/10 max-[1024px]:grid-cols-2 max-[560px]:grid-cols-1">
          {metrics.map((m, i) => (
            <motion.div
              key={m.label}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.45, delay: i * 0.06, ease: [0.16, 1, 0.3, 1] }}
              className="relative bg-[#141414] p-7 max-[809px]:p-5"
            >
              {/* corner pixel accent */}
              <div className="absolute right-3 top-3 h-[3px] w-[3px] bg-white/20" aria-hidden />
              <div className="absolute right-3 top-3 h-[3px] w-[3px] bg-white/0 group-hover:bg-white/20" aria-hidden />

              <p
                className="grid-copy text-[11px] tracking-[0.1em] text-white/45"
                style={{ fontFamily: "var(--font-mono)" }}
              >
                {m.label}
              </p>
              <p className="mt-3 flex items-baseline gap-1.5">
                <span
                  className="font-mono text-[34px] font-medium leading-none tracking-[-0.02em] text-white max-[809px]:text-[28px]"
                  style={{ fontFamily: "var(--font-mono)" }}
                >
                  {m.value}
                </span>
                {m.unit && (
                  <span
                    className="font-mono text-[14px] font-normal tracking-[0.06em] text-white/60"
                    style={{ fontFamily: "var(--font-mono)" }}
                  >
                    {m.unit}
                  </span>
                )}
                <span className="ml-2 inline-flex h-1.5 w-1.5 rounded-full bg-[#00d084] shadow-[0_0_6px_rgba(0,208,132,0.8)]" aria-hidden />
              </p>
              <p
                className="grid-copy mt-2 text-[11px] tracking-[0.06em] text-white/35"
                style={{ fontFamily: "var(--font-mono)" }}
              >
                {m.sub}
              </p>
            </motion.div>
          ))}
        </div>

        {/* footnote — Grid dry */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p
            className="font-mono text-[12px] leading-[1.5] text-white/35 max-[809px]:text-[11px]"
            style={{ fontFamily: "var(--font-mono)" }}
          >
            {t.metrics.footnote}
          </p>
          <a
            href="/docs"
            className="grid-copy inline-flex items-center gap-1.5 text-[11px] tracking-[0.08em] text-white/60 underline decoration-white/20 underline-offset-4 hover:text-white hover:decoration-white/40"
            style={{ fontFamily: "var(--font-mono)" }}
          >
            {t.metrics.log}
          </a>
        </div>
      </div>
    </section>
  );
}
