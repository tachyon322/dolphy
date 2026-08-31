"use client";

import Image from "next/image";
import { useState } from "react";
import { useLocale } from "@/components/providers/LocaleProvider";

export function CliSection() {
  const { t } = useLocale();
  const [tab, setTab] = useState<"ai" | "manual">("ai");
  const [copied, setCopied] = useState(false);

  const code = tab === "ai" ? t.cli.codeAi : t.cli.codeManual;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
    } catch {
      // fallback
      const el = document.createElement("textarea");
      el.value = code;
      document.body.appendChild(el);
      el.select();
      document.execCommand("copy");
      document.body.removeChild(el);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <section
      id="cli"
      aria-label="Dolphy CLI — Grid"
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
                dolphy CLI
              </span>
            </span>
          </h2>
          <p
            className="mt-9 max-w-[900px] font-display text-[44px] font-semibold leading-[1.25] tracking-[-0.02em] text-[var(--ink-text)] max-[1199px]:text-[36px] max-[809px]:mt-7 max-[809px]:text-[28px]"
            style={{ fontFamily: "var(--font-display)" }}
          >
            {t.cli.tag}
          </p>
          <div
            role="tablist"
            aria-label="Install method"
            className="mt-9 grid max-w-full auto-cols-fr grid-flow-col items-center gap-1.5 rounded-full bg-[#0d0d0d0f] p-1.5 max-[809px]:mt-7 max-[809px]:overflow-x-auto max-[809px]:scrollbar-none max-[380px]:auto-cols-auto"
          >
            <button
              role="tab"
              aria-selected={tab === "ai"}
              onClick={() => setTab("ai")}
              className={`inline-flex min-w-0 flex-wrap items-center justify-center gap-2 whitespace-normal rounded-full px-5 py-2.5 font-display text-sm transition max-[809px]:gap-1 max-[809px]:px-3 max-[809px]:py-2 max-[809px]:text-[13px] max-[380px]:px-2.5 max-[380px]:text-xs ${
                tab === "ai"
                  ? "bg-[#0d0d0d] font-medium text-[#f0f0f0]"
                  : "bg-transparent font-normal text-[#0d0d0d99] hover:text-[var(--ink-text)]"
              }`}
              style={{ fontFamily: "var(--font-display)" }}
            >
              <span className="whitespace-nowrap">{t.cli.tabAi}</span>
              <span
                className={`shrink-0 rounded-md px-1.5 py-0.5 text-[11px] font-semibold leading-[1.4] max-[809px]:px-1 max-[809px]:text-[10px] max-[380px]:text-[9px] ${
                  tab === "ai" ? "bg-white text-[#0d0d0d]" : "bg-[#0d0d0d] text-white"
                }`}
              >
                {t.cli.rec}
              </span>
            </button>
            <button
              role="tab"
              aria-selected={tab === "manual"}
              onClick={() => setTab("manual")}
              className={`inline-flex min-w-0 items-center justify-center gap-2 whitespace-nowrap rounded-full px-5 py-2.5 font-display text-sm transition max-[809px]:px-3.5 max-[809px]:py-2 max-[809px]:text-[13px] max-[380px]:px-2.5 max-[380px]:text-xs ${
                tab === "manual"
                  ? "bg-[#0d0d0d] font-medium text-white"
                  : "bg-transparent font-normal text-[#0d0d0d99] hover:text-[var(--ink-text)]"
              }`}
              style={{ fontFamily: "var(--font-display)" }}
            >
              {t.cli.tabManual}
            </button>
          </div>
        </div>

        {/* panel */}
        <div className="mt-12 w-full max-[809px]:mt-[34px]">
          <div className="mx-auto w-full max-w-[1180px] rounded-[24px] border-[0.5px] border-[#0d0d0d1a] bg-[#fafafa] p-12 max-[809px]:rounded-[20px] max-[809px]:p-5 max-[809px]:pt-7">
            {tab === "ai" ? (
              <div className="mb-8 max-[809px]:mb-[26px]">
                <h3
                  className="font-display text-[19px] font-semibold leading-[1.4] text-[var(--ink-text)]"
                  style={{ fontFamily: "var(--font-display)" }}
                >
                  {t.cli.aiTitle}
                </h3>
                <p
                  className="mt-2 font-display text-sm leading-[1.6] text-[#0d0d0d99]"
                  style={{ fontFamily: "var(--font-display)" }}
                >
                  {t.cli.aiDesc}
                </p>
              </div>
            ) : (
              <div className="mb-8 max-[809px]:mb-[26px]">
                <h3
                  className="font-display text-[19px] font-semibold leading-[1.4] text-[var(--ink-text)]"
                  style={{ fontFamily: "var(--font-display)" }}
                >
                  {t.cli.manualTitle}
                </h3>
                <p
                  className="mt-2 font-display text-sm leading-[1.6] text-[#0d0d0d99]"
                  style={{ fontFamily: "var(--font-display)" }}
                >
                  {t.cli.manualDesc}
                </p>
              </div>
            )}

            {/* Grid — system status: idle → alive */}
            <div className="mb-4 flex items-center gap-2 font-mono text-[11px] tracking-[0.08em] text-[#0d0d0d66] max-[809px]:text-[10px]">
              <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--grid-accent)] shadow-[0_0_6px_rgba(0,208,132,0.5)]" aria-hidden />
              <span className="grid-copy">FLOW ACTIVE — 1,204 NODES LISTENING — IDLE → ALIVE</span>
            </div>

            <div className="grid min-w-0 grid-cols-[minmax(0,1fr)_auto] overflow-hidden rounded-[14px] border-[0.5px] border-[#0d0d0d1a] bg-white">
              <code
                className="min-w-0 overflow-x-auto whitespace-pre-wrap bg-white p-[17px_20px] font-mono text-sm leading-[1.65] text-[var(--ink-text)] max-[809px]:p-[15px_14px] max-[809px]:text-xs"
                style={{ fontFamily: "var(--font-mono)" }}
              >
                {code}
              </code>
              <button
                type="button"
                onClick={handleCopy}
                className="inline-flex min-w-24 items-center justify-center gap-1.5 border-l border-[#0d0d0d1a] bg-[#0d0d0d0f] px-[18px] font-display text-sm font-medium text-[#0d0d0db3] transition-colors hover:bg-[#0d0d0d1a] hover:text-[var(--ink-text)] max-[809px]:min-w-[52px] max-[809px]:px-[15px]"
                style={{ fontFamily: "var(--font-display)" }}
                aria-label={copied ? t.cli.copied : t.cli.copy}
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
                  <rect width="14" height="14" x="8" y="8" rx="2" ry="2" />
                  <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
                </svg>
                <span className="max-[809px]:sr-only">{copied ? t.cli.copied : t.cli.copy}</span>
              </button>
            </div>

            <a
              href="/docs/cli"
              className="group mx-auto mt-8 flex w-fit items-center gap-1.5 whitespace-nowrap font-display text-sm font-medium italic text-[var(--ink-text)] underline decoration-1 underline-offset-4 max-[809px]:mt-6"
              style={{ fontFamily: "var(--font-display)" }}
            >
              {t.cli.docs}
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
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
