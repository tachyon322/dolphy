"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { useLocale } from "@/components/providers/LocaleProvider";
import { CtaPanel } from "@/components/sections/CtaPanel";

export default function HowItWorksPage() {
  const { t } = useLocale();
  const steps = t.howItWorks.steps;

  return (
    <main className="flex flex-1 flex-col bg-[#fafafa]">
      {/* header */}
      <section className="relative w-full overflow-hidden px-6 pb-10 pt-[calc(var(--nav-height)+32px)] max-[809px]:px-5">
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.45]"
          style={{
            background:
              "radial-gradient(800px 400px at 20% 0%, rgba(214,228,232,0.5) 0%, transparent 60%), radial-gradient(600px 300px at 90% 20%, rgba(232,220,200,0.4) 0%, transparent 60%)",
          }}
        />
        <div className="relative mx-auto flex w-full max-w-[1280px] flex-col">
          <Link
            href="/"
            className="inline-flex w-fit items-center gap-2 rounded-full border border-black/10 bg-white px-3 py-1.5 text-sm text-[#0d0d0d] hover:bg-black/5"
          >
            ← {t.common.backHome}
          </Link>
          <p
            className="grid-copy mt-8 text-[11px] tracking-[0.14em] text-[#0d0d0d66]"
            style={{ fontFamily: "var(--font-mono)" }}
          >
            {t.howItWorks.kicker}
          </p>
          <h1
            className="river-copy mt-3 text-[44px] font-medium leading-[1.1] tracking-[-0.02em] text-[var(--ink-text)] max-[809px]:text-[30px]"
            style={{ fontFamily: "var(--font-display)" }}
          >
            {t.howItWorks.pageTitle}
          </h1>
          <p
            className="river-copy mt-3 max-w-[640px] text-[16px] font-light leading-[1.6] text-[#0d0d0d99]"
            style={{ fontFamily: "var(--font-display)" }}
          >
            {t.howItWorks.pageSubtitle}
          </p>
        </div>
      </section>

      {/* steps */}
      <section className="w-full px-6 pb-24 max-[809px]:px-5">
        <div className="mx-auto flex w-full max-w-[1280px] flex-col gap-6">
          {steps.map((s, i) => (
            <motion.div
              key={s.num}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.55, delay: i * 0.06, ease: [0.16, 1, 0.3, 1] }}
              className="relative grid gap-8 rounded-[24px] border-[0.5px] bg-white p-10 shadow-[0_8px_32px_rgba(13,13,13,0.04)] grid-cols-[auto_minmax(0,1fr)_minmax(0,420px)] max-[1024px]:grid-cols-1 max-[809px]:gap-6 max-[809px]:rounded-[20px] max-[809px]:p-6"
              style={{ borderColor: "rgba(13,13,13,0.07)" }}
            >
              {/* step number */}
              <div className="flex items-start">
                <span
                  className="grid-copy flex h-12 w-12 items-center justify-center rounded-[12px] bg-[#0d0d0d] text-[13px] font-medium text-white"
                  style={{ fontFamily: "var(--font-mono)" }}
                >
                  {s.num}
                </span>
              </div>

              {/* text */}
              <div>
                <h3
                  className="river-copy text-[22px] font-medium leading-[1.25] tracking-[-0.015em] text-[var(--ink-text)] max-[809px]:text-[20px]"
                  style={{ fontFamily: "var(--font-display)" }}
                >
                  {s.title}
                </h3>
                <p
                  className="river-copy mt-3 max-w-[560px] text-[14.5px] font-light leading-[1.65] text-[#0d0d0d99]"
                  style={{ fontFamily: "var(--font-display)" }}
                >
                  {s.desc}
                </p>

                {/* status — Grid system line */}
                <div className="mt-6 flex items-center gap-2 font-mono text-[11px] tracking-[0.08em] text-[#0d0d0d66] max-[809px]:mt-4 max-[809px]:text-[10px]">
                  <span
                    className="h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--grid-accent)] shadow-[0_0_6px_rgba(0,208,132,0.5)]"
                    aria-hidden
                  />
                  <span className="grid-copy">{s.status}</span>
                </div>
              </div>

              {/* snippet */}
              <div className="flex items-start">
                <div className="w-full overflow-hidden rounded-[14px] border-[0.5px] border-[#0d0d0d1a] bg-white">
                  <code
                    className="block overflow-x-auto whitespace-pre-wrap p-[17px_20px] font-mono text-sm leading-[1.65] text-[var(--ink-text)] max-[809px]:p-[15px_14px] max-[809px]:text-xs"
                    style={{ fontFamily: "var(--font-mono)" }}
                  >
                    {s.snippet}
                  </code>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      <CtaPanel title={t.howItWorks.ctaTitle} cta={t.howItWorks.openMarketplace} href="/marketplace" />
    </main>
  );
}
