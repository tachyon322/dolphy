"use client";

import Link from "next/link";
import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useLocale } from "@/components/providers/LocaleProvider";
import { CtaPanel } from "@/components/sections/CtaPanel";

export default function FaqPage() {
  const { t } = useLocale();
  const [open, setOpen] = useState<number | null>(0);

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
            {t.faq.kicker}
          </p>
          <h1
            className="river-copy mt-3 text-[44px] font-medium leading-[1.1] tracking-[-0.02em] text-[var(--ink-text)] max-[809px]:text-[30px]"
            style={{ fontFamily: "var(--font-display)" }}
          >
            {t.faq.pageTitle}
          </h1>
          <p
            className="river-copy mt-3 max-w-[640px] text-[16px] font-light leading-[1.6] text-[#0d0d0d99]"
            style={{ fontFamily: "var(--font-display)" }}
          >
            {t.faq.pageSubtitle}
          </p>
          <p className="mt-4 inline-flex w-fit items-center gap-2 rounded-full border border-amber-200 bg-amber-50 px-3 py-1 font-mono text-[11px] text-amber-800">
            <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
            {t.marketplace.mockBadge} — {t.marketplace.tokenHint}
          </p>
        </div>
      </section>

      {/* accordion */}
      <section className="w-full px-6 pb-20 max-[809px]:px-5">
        <div className="mx-auto flex w-full max-w-[880px] flex-col gap-3">
          {t.faq.items.map((item, i) => {
            const isOpen = open === i;
            return (
              <motion.div
                key={item.q}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{ duration: 0.45, delay: Math.min(i * 0.04, 0.2), ease: [0.16, 1, 0.3, 1] }}
                className="overflow-hidden rounded-[16px] border-[0.5px] bg-white transition-[border-color] hover:border-[#0d0d0d1a]"
                style={{ borderColor: "rgba(13,13,13,0.07)" }}
              >
                <button
                  type="button"
                  onClick={() => setOpen(isOpen ? null : i)}
                  aria-expanded={isOpen}
                  className="flex w-full items-center justify-between gap-4 px-6 py-5 text-left max-[809px]:px-5 max-[809px]:py-4"
                >
                  <span
                    className="river-copy text-[16px] font-medium leading-[1.4] text-[var(--ink-text)] max-[809px]:text-[15px]"
                    style={{ fontFamily: "var(--font-display)" }}
                  >
                    {item.q}
                  </span>
                  <span
                    className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#0d0d0d0f] text-[#0d0d0d99] transition-transform duration-200"
                    style={{ transform: isOpen ? "rotate(45deg)" : "none" }}
                    aria-hidden
                  >
                    <svg
                      width={14}
                      height={14}
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={2}
                      strokeLinecap="round"
                    >
                      <path d="M12 5v14M5 12h14" />
                    </svg>
                  </span>
                </button>
                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      key="content"
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
                      className="overflow-hidden"
                    >
                      <p
                        className="river-copy px-6 pb-5 text-[14px] font-light leading-[1.65] text-[#0d0d0d99] max-[809px]:px-5"
                        style={{ fontFamily: "var(--font-display)" }}
                      >
                        {item.a}
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>
      </section>

      <CtaPanel title={t.faq.ctaTitle} cta={t.faq.cta} href="/marketplace" />
    </main>
  );
}
