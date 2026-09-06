"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { useLocale } from "@/components/providers/LocaleProvider";

export function HowItWorks() {
  const { t } = useLocale();
  const [step, setStep] = useState(0);
  const current = t.howItWorks.steps[step];

  return (
    <section
      id="how-it-works"
      aria-label="How it works — Grid"
      className="w-full overflow-hidden bg-[#fff] px-10 py-[120px] max-[1199px]:px-10 max-[1199px]:py-[100px] max-[809px]:px-5 max-[809px]:py-20"
    >
      <div className="mx-auto flex w-full max-w-[1360px] flex-col items-center">
        {/* header */}
        <div className="flex w-full flex-col items-center text-center">
          <h2 className="leading-none">
            <span className="flex items-center justify-center gap-3">
              <Image
                src="/img/logo.png"
                alt="dolphy"
                width={36}
                height={36}
                className="h-9 w-9 object-contain pixelated"
                style={{ imageRendering: "pixelated" as const }}
              />
              <span
                className="font-display text-[36px] font-semibold tracking-tight text-[var(--ink-text)] max-[1199px]:text-[32px] max-[809px]:text-[28px]"
                style={{ fontFamily: "var(--font-display)" }}
              >
                dolphy
              </span>
            </span>
          </h2>
          <p
            className="mt-9 max-w-[900px] font-display text-[44px] font-semibold leading-[1.25] tracking-[-0.02em] text-[var(--ink-text)] max-[1199px]:text-[36px] max-[809px]:mt-7 max-[809px]:text-[28px]"
            style={{ fontFamily: "var(--font-display)" }}
          >
            {t.howItWorks.tag}
          </p>
          <div
            role="tablist"
            aria-label="Rental steps"
            className="mt-9 grid max-w-full auto-cols-fr grid-flow-col items-center gap-1.5 rounded-full bg-[#0d0d0d0f] p-1.5 max-[809px]:mt-7 max-[809px]:overflow-x-auto max-[809px]:scrollbar-none max-[380px]:auto-cols-auto"
          >
            {t.howItWorks.steps.map((s, i) => (
              <button
                key={s.num}
                role="tab"
                aria-selected={step === i}
                onClick={() => setStep(i)}
                className={`inline-flex min-w-0 items-center justify-center gap-2 whitespace-nowrap rounded-full px-5 py-2.5 font-display text-sm transition max-[809px]:gap-1 max-[809px]:px-3 max-[809px]:py-2 max-[809px]:text-[13px] max-[380px]:px-2.5 max-[380px]:text-xs ${
                  step === i
                    ? "bg-[#0d0d0d] font-medium text-white"
                    : "bg-transparent font-normal text-[#0d0d0d99] hover:text-[var(--ink-text)]"
                }`}
                style={{ fontFamily: "var(--font-display)" }}
              >
                <span
                  className={`shrink-0 rounded-md px-1.5 py-0.5 font-mono text-[11px] font-semibold leading-[1.4] max-[809px]:px-1 max-[809px]:text-[10px] max-[380px]:text-[9px] ${
                    step === i ? "bg-white text-[#0d0d0d]" : "bg-[#0d0d0d] text-white"
                  }`}
                  style={{ fontFamily: "var(--font-mono)" }}
                >
                  {s.num}
                </span>
                <span className="whitespace-nowrap">{s.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* panel */}
        <div className="mt-12 w-full max-[809px]:mt-[34px]">
          <div className="mx-auto w-full max-w-[1180px] rounded-[24px] border-[0.5px] border-[#0d0d0d1a] bg-[#fafafa] p-12 max-[809px]:rounded-[20px] max-[809px]:p-5 max-[809px]:pt-7">
            <div className="mb-8 max-[809px]:mb-[26px]">
              <h3
                className="font-display text-[19px] font-semibold leading-[1.4] text-[var(--ink-text)]"
                style={{ fontFamily: "var(--font-display)" }}
              >
                {current.title}
              </h3>
              <p
                className="mt-2 max-w-[720px] font-display text-sm leading-[1.6] text-[#0d0d0d99]"
                style={{ fontFamily: "var(--font-display)" }}
              >
                {current.desc}
              </p>
            </div>

            {/* Grid — system status */}
            <div className="mb-4 flex items-center gap-2 font-mono text-[11px] tracking-[0.08em] text-[#0d0d0d66] max-[809px]:text-[10px]">
              <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--grid-accent)] shadow-[0_0_6px_rgba(0,208,132,0.5)]" aria-hidden />
              <span className="grid-copy">{current.status}</span>
            </div>

            <div className="grid min-w-0 grid-cols-[minmax(0,1fr)_auto] overflow-hidden rounded-[14px] border-[0.5px] border-[#0d0d0d1a] bg-white">
              <code
                className="min-w-0 overflow-x-auto whitespace-pre-wrap bg-white p-[17px_20px] font-mono text-sm leading-[1.65] text-[var(--ink-text)] max-[809px]:p-[15px_14px] max-[809px]:text-xs"
                style={{ fontFamily: "var(--font-mono)" }}
              >
                {current.snippet}
              </code>
              <Link
                href="/marketplace"
                aria-label={t.howItWorks.openMarketplace}
                className="inline-flex min-w-24 items-center justify-center gap-1.5 border-l border-[#0d0d0d1a] bg-[#0d0d0d0f] px-[18px] font-display text-sm font-medium text-[#0d0d0db3] transition-colors hover:bg-[#0d0d0d1a] hover:text-[var(--ink-text)] max-[809px]:min-w-[52px] max-[809px]:px-[15px]"
                style={{ fontFamily: "var(--font-display)" }}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="17"
                  height="17"
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
                <span className="max-[809px]:sr-only">{t.howItWorks.openMarketplace}</span>
              </Link>
            </div>

            <Link
              href="/marketplace"
              className="group mx-auto mt-8 flex w-fit items-center gap-1.5 whitespace-nowrap font-display text-sm font-medium italic text-[var(--ink-text)] underline decoration-1 underline-offset-4 max-[809px]:mt-6"
              style={{ fontFamily: "var(--font-display)" }}
            >
              {t.howItWorks.openMarketplace}
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
                className="transition-transform group-hover:translate-x-0.5"
              >
                <path d="M5 12h14" />
                <path d="m12 5 7 7-7 7" />
              </svg>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
