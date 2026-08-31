"use client";

import { motion } from "framer-motion";
import { useLocale } from "@/components/providers/LocaleProvider";

function ValleyIcon() {
  return (
    <svg width={28} height={28} viewBox="0 0 28 28" fill="none" aria-hidden>
      <path
        d="M4 20C7 12 10 8 14 14C18 20 21 12 24 18"
        stroke="currentColor"
        strokeWidth={1.25}
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity={0.9}
      />
      <path
        d="M4 22C8 18 12 16 14 18C16 20 20 18 24 20"
        stroke="currentColor"
        strokeWidth={1.25}
        strokeLinecap="round"
        opacity={0.35}
      />
      <circle cx={14} cy={7} r={1.5} fill="currentColor" opacity={0.6} />
    </svg>
  );
}
function GridIcon() {
  return (
    <svg width={28} height={28} viewBox="0 0 28 28" fill="none" aria-hidden>
      <rect x={4} y={4} width={20} height={20} stroke="currentColor" strokeWidth={1.25} opacity={0.9} />
      <path d="M4 10H24M4 18H24M10 4V24M18 4V24" stroke="currentColor" strokeWidth={0.9} opacity={0.35} />
      <rect x={11} y={11} width={6} height={6} fill="currentColor" opacity={0.9} />
      <rect x={12.5} y={12.5} width={3} height={3} fill="white" />
    </svg>
  );
}
function PulseIcon() {
  return (
    <svg width={28} height={28} viewBox="0 0 28 28" fill="none" aria-hidden>
      <circle cx={14} cy={14} r={9} stroke="currentColor" strokeWidth={1.25} opacity={0.25} />
      <circle cx={14} cy={14} r={5.5} stroke="currentColor" strokeWidth={1.25} opacity={0.5} />
      <circle cx={14} cy={14} r={2} fill="currentColor" />
      <circle cx={14} cy={14} r={2} fill="currentColor" opacity={0.4} className="animate-ping" style={{ animationDuration: "2.5s" }} />
    </svg>
  );
}

const icons = [ValleyIcon, GridIcon, PulseIcon];

export function Manifest() {
  const { t } = useLocale();
  const pillars = t.manifest.pillars;
  return (
    <section
      id="features"
      aria-label="Manifest — River"
      className="relative w-full overflow-hidden bg-[#fafafa] px-10 py-[120px] max-[1199px]:px-10 max-[1199px]:py-[100px] max-[809px]:px-5 max-[809px]:py-20"
    >
      {/* subtle River wash — like morning mist over hero */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.55]"
        style={{
          background:
            "radial-gradient(900px 500px at 20% 0%, rgba(214,228,232,0.55) 0%, transparent 60%), radial-gradient(700px 400px at 90% 30%, rgba(232,220,200,0.45) 0%, transparent 60%)",
        }}
      />

      <div className="relative mx-auto flex w-full max-w-[1360px] flex-col items-center">
        {/* header — River */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="flex w-full flex-col items-center text-center"
        >
          <p
            className="grid-copy text-[11px] tracking-[0.14em] text-[#0d0d0d66]"
            style={{ fontFamily: "var(--font-mono)" }}
          >
            {t.manifest.kicker}
          </p>
          <h2
            className="river-copy mt-4 max-w-[760px] text-[44px] font-medium leading-[1.15] tracking-[-0.02em] text-[var(--ink-text)] max-[1199px]:text-[36px] max-[809px]:text-[28px]"
            style={{ fontFamily: "var(--font-display)" }}
          >
            <span className="font-light text-[var(--ink-a40)]">{t.manifest.titleA}</span>
            <br />
            {t.manifest.titleB}
          </h2>
          <p
            className="river-copy mt-5 max-w-[560px] text-[16px] font-light leading-[1.7] text-[#0d0d0d99] max-[809px]:text-[15px]"
            style={{ fontFamily: "var(--font-display)" }}
          >
            {t.manifest.intro}
          </p>
        </motion.div>

        {/* pillars */}
        <div className="mt-14 grid w-full max-w-[1180px] grid-cols-3 gap-6 max-[1024px]:grid-cols-1 max-[1024px]:gap-5">
          {pillars.map((p, i) => {
            const Icon = icons[i];
            return (
              <motion.div
                key={p.kicker}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ duration: 0.55, delay: i * 0.08, ease: [0.16, 1, 0.3, 1] }}
                className="group relative flex flex-col rounded-[20px] border-[0.5px] bg-white p-8 shadow-[0_8px_32px_rgba(13,13,13,0.04)] transition-[box-shadow,border-color] hover:shadow-[0_16px_48px_rgba(13,13,13,0.08)] hover:border-[#0d0d0d14] max-[809px]:p-6"
                style={{ borderColor: "rgba(13,13,13,0.07)" }}
              >
                {/* top rule — River = soft valley line, Grid = pixel */}
                <div className="mb-7 flex items-center justify-between">
                  <span className="flex h-10 w-10 items-center justify-center rounded-full border border-black/5 bg-[#fafafa] text-[#0d0d0d99] group-hover:text-[var(--ink-text)]">
                    <Icon />
                  </span>
                  <span
                    className="grid-copy rounded-full bg-[#0d0d0d0f] px-2.5 py-1 text-[10px] tracking-[0.1em] text-[#0d0d0d80]"
                    style={{ fontFamily: "var(--font-mono)" }}
                  >
                    {p.kicker}
                  </span>
                </div>

                <h3
                  className="river-copy whitespace-pre-line text-[22px] font-medium leading-[1.25] tracking-[-0.015em] text-[var(--ink-text)] max-[809px]:text-[20px]"
                  style={{ fontFamily: "var(--font-display)" }}
                >
                  {p.title}
                </h3>
                <p
                  className="river-copy mt-3 text-[14.5px] font-light leading-[1.65] text-[#0d0d0d99]"
                  style={{ fontFamily: "var(--font-display)" }}
                >
                  {p.body}
                </p>

                {/* bottom hint — always River typography, even for Grid pillar (balance) */}
                <div className="mt-auto pt-7">
                  <div className="h-px w-full bg-gradient-to-r from-black/[0.06] via-black/[0.04] to-transparent" />
                  <p
                    className="river-copy mt-3 text-[12px] italic leading-[1.5] text-[#0d0d0d66]"
                    style={{ fontFamily: "var(--font-display)" }}
                  >
                    {p.hint}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* closing line — River */}
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3, duration: 0.6 }}
          className="river-copy mt-10 text-center text-[13px] italic leading-[1.6] tracking-[0.01em] text-[#0d0d0d66] max-[809px]:text-[12px]"
          style={{ fontFamily: "var(--font-display)" }}
        >
          {t.manifest.outro}
        </motion.p>
      </div>
    </section>
  );
}
