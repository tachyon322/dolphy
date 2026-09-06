"use client";

import Link from "next/link";
import { motion } from "framer-motion";

export function CtaPanel({ title, cta, href }: { title: string; cta: string; href: string }) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      className="w-full px-6 pb-24 max-[809px]:px-5 max-[809px]:pb-16"
    >
      <div className="relative mx-auto w-full max-w-[1280px] overflow-hidden rounded-[24px] bg-[#0d0d0d] px-8 py-14 text-center max-[809px]:rounded-[20px] max-[809px]:px-6 max-[809px]:py-10">
        {/* pixel accents */}
        <div className="absolute right-6 top-6 h-[3px] w-[3px] bg-white/25" aria-hidden />
        <div className="absolute bottom-6 left-6 h-[3px] w-[3px] bg-white/25" aria-hidden />

        <h2
          className="mx-auto max-w-[560px] font-display text-[30px] font-medium leading-[1.2] tracking-[-0.01em] text-white max-[809px]:text-[24px]"
          style={{ fontFamily: "var(--font-display)" }}
        >
          {title}
        </h2>
        <Link
          href={href}
          className="mt-8 inline-flex h-[48px] items-center justify-center gap-2 rounded-full bg-white px-7 text-sm font-medium text-[#0d0d0d] transition hover:bg-[#f0f0f0] max-[809px]:mt-6"
          style={{ fontFamily: "var(--font-display)" }}
        >
          {cta}
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M5 12h14" />
            <path d="m12 5 7 7-7 7" />
          </svg>
        </Link>
      </div>
    </motion.section>
  );
}
