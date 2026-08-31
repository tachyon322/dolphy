"use client";

import Image from "next/image";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";
import { useLocale } from "@/components/providers/LocaleProvider";

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [devOpen, setDevOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [langOpen, setLangOpen] = useState(false);
  const { locale, setLocale, t } = useLocale();

  const LINKS = [
    { label: t.nav.docs, href: "/docs" },
    { label: t.nav.cli, href: "#cli" },
    { label: t.nav.features, href: "#features" },
    { label: t.nav.models, href: "#models" },
    { label: t.nav.useCases, href: "#use-cases" },
    { label: t.nav.infra, href: "#introduction" },
    { label: t.nav.pricing, href: "#pricing" },
    { label: t.nav.faq, href: "#faq" },
  ];

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setMobileOpen(false);
        setDevOpen(false);
        setLangOpen(false);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    const onClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest("[data-lang-dropdown]")) setLangOpen(false);
    };
    if (langOpen) document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, [langOpen]);

  return (
    <motion.nav
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      className="fixed inset-x-0 top-0 z-[100] py-3 max-[1199px]:py-2.5"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 transition-opacity duration-300"
        style={{
          background: scrolled ? "rgba(255,255,255,0.7)" : "rgba(255,255,255,0)",
          backdropFilter: scrolled ? "blur(12px)" : undefined,
          WebkitBackdropFilter: scrolled ? "blur(12px)" : undefined,
          opacity: scrolled ? 1 : 0,
        } as React.CSSProperties}
      />
      <div className="relative z-[1] mx-auto flex max-w-[1440px] flex-col gap-2 px-10 max-[1199px]:px-4">
        <div className="flex items-center gap-4">
          {/* capsule pill */}
          <div
            className="flex items-center gap-2 rounded-full border-[0.5px] bg-[var(--nav-pill-surface)] px-4 py-2 pl-5 max-[1199px]:px-3 max-[1199px]:py-1.5"
            style={{ borderColor: "var(--nav-pill-border)" }}
          >
            <Link href="/" aria-label="dolphy" className="flex shrink-0 items-center">
              <Image
                src="/img/logo.png"
                alt="dolphy"
                width={28}
                height={28}
                priority
                className="h-[22px] w-auto origin-center object-contain transition-transform duration-200 hover:scale-[1.04] pixelated"
                style={{ imageRendering: "pixelated" } as React.CSSProperties}
              />
            </Link>

            <div className="ml-4 hidden items-center gap-0 max-[1199px]:hidden lg:flex">
              {LINKS.map((l) => (
                <a
                  key={l.href}
                  href={l.href}
                  className="inline-flex h-[34px] items-center justify-center whitespace-nowrap px-3.5 py-[7px] font-sans text-[14px] font-normal leading-[1.4] tracking-[0.02em] text-[var(--text-inverse-muted)] transition-colors hover:text-[var(--text-inverse)]"
                  style={{ fontFamily: "var(--font-sans)" }}
                >
                  {l.label}
                </a>
              ))}
              <span className="mx-2 h-4 w-px shrink-0 bg-white/20" aria-hidden />
              <div className="relative inline-flex items-center">
                <button
                  type="button"
                  className="inline-flex h-[34px] items-center gap-1.5 whitespace-nowrap px-3.5 font-sans text-[14px] font-normal tracking-[0.02em] text-[var(--text-inverse-muted)] transition-colors hover:text-[var(--text-inverse)]"
                  style={{ fontFamily: "var(--font-sans)" }}
                  aria-haspopup={true}
                  aria-expanded={devOpen}
                  onMouseEnter={() => setDevOpen(true)}
                  onMouseLeave={() => setDevOpen(false)}
                  onClick={() => setDevOpen((v) => !v)}
                >
                  <span>{t.nav.developers}</span>
                  <svg
                    width={12}
                    height={12}
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={2}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="shrink-0 opacity-50 transition-transform duration-200"
                    style={{ transform: devOpen ? "rotate(180deg)" : "none" }}
                  >
                    <path d="M6 9l6 6 6-6" />
                  </svg>
                </button>
                {devOpen && (
                  <div
                    className="absolute left-0 top-full mt-2 min-w-[160px] rounded-xl border border-black/10 bg-white p-1 shadow-[0_12px_32px_rgba(0,0,0,0.12)]"
                    onMouseEnter={() => setDevOpen(true)}
                    onMouseLeave={() => setDevOpen(false)}
                  >
                    <a href="#docs" className="block rounded-lg px-3 py-2 text-sm text-[#0d0d0d] hover:bg-black/5">
                      {t.nav.docsItem}
                    </a>
                    <a href="#api" className="block rounded-lg px-3 py-2 text-sm text-[#0d0d0d] hover:bg-black/5">
                      {t.nav.api}
                    </a>
                    <a href="#community" className="block rounded-lg px-3 py-2 text-sm text-[#0d0d0d] hover:bg-black/5">
                      {t.nav.community}
                    </a>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="ml-auto flex items-center gap-2">
            <button
              type="button"
              aria-label="Switch to dark mode"
              className="flex h-8 w-8 items-center justify-center rounded-full border-0 bg-transparent text-[var(--ink-a60)] transition-colors hover:bg-white/10 hover:text-[var(--ink-text)] lg:hover:bg-black/5"
            >
              <svg
                width={18}
                height={18}
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
              </svg>
            </button>

            <div className="relative hidden lg:block" data-lang-dropdown>
              <button
                type="button"
                onClick={() => setLangOpen((v) => !v)}
                aria-haspopup="true"
                aria-expanded={langOpen}
                className="flex w-[88px] items-center justify-center gap-1 rounded-[8px] border-[0.5px] bg-transparent px-3 py-1.5 font-sans text-[14px] font-normal text-[var(--ink-text)] transition-colors hover:border-black/30"
                style={{
                  fontFamily: "var(--font-sans)",
                  borderColor: "rgba(13,13,13,0.15)",
                }}
              >
                <span>{locale === "en" ? "EN" : "中文"}</span>
                <svg
                  width={12}
                  height={12}
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="transition-transform"
                  style={{ transform: langOpen ? "rotate(180deg)" : "none", transition: "transform 0.2s" }}
                >
                  <path d="M6 9l6 6 6-6" />
                </svg>
              </button>
              {langOpen && (
                <div className="absolute right-0 top-full z-10 mt-2 w-36 rounded-xl border border-black/10 bg-white p-1 shadow-[0_12px_32px_rgba(0,0,0,0.12)]">
                  <button
                    onClick={() => {
                      setLocale("en");
                      setLangOpen(false);
                    }}
                    className={`flex w-full items-center rounded-lg px-3 py-2 text-left text-sm transition ${locale === "en" ? "bg-black/5 font-medium text-[#0d0d0d]" : "text-[#0d0d0d] hover:bg-black/5"}`}
                  >
                    EN — English
                  </button>
                  <button
                    onClick={() => {
                      setLocale("zh");
                      setLangOpen(false);
                    }}
                    className={`flex w-full items-center rounded-lg px-3 py-2 text-left text-sm transition ${locale === "zh" ? "bg-black/5 font-medium text-[#0d0d0d]" : "text-[#0d0d0d] hover:bg-black/5"}`}
                  >
                    中文 — 中文
                  </button>
                </div>
              )}
            </div>

            {/* mobile burger */}
            <button
              type="button"
              className="flex h-8 w-8 items-center justify-center rounded-full border border-black/10 lg:hidden"
              aria-label={mobileOpen ? "Close menu" : "Open menu"}
              aria-expanded={mobileOpen}
              aria-controls="mobile-menu"
              onClick={() => setMobileOpen((v) => !v)}
            >
              {mobileOpen ? (
                <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                  <path d="M18 6L6 18M6 6l12 12" />
                </svg>
              ) : (
                <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                  <path d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>
        </div>

        {/* mobile menu */}
        <AnimatePresence>
          {mobileOpen && (
            <>
              <motion.div
                key="overlay"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                onClick={() => setMobileOpen(false)}
                className="fixed inset-0 z-[99] bg-black/40 backdrop-blur-sm lg:hidden"
                aria-hidden="true"
              />
              <motion.div
                id="mobile-menu"
                key="panel"
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
                className="absolute inset-x-0 top-full z-[100] mt-2 rounded-[20px] border border-black/10 bg-white p-4 shadow-[0_12px_32px_rgba(0,0,0,0.12)] lg:hidden"
                role="navigation"
                aria-label="Mobile navigation"
              >
                <nav className="flex flex-col gap-1">
                  {LINKS.map((l) => (
                    <a
                      key={l.href}
                      href={l.href}
                      onClick={() => setMobileOpen(false)}
                      className="rounded-xl px-4 py-3 font-display text-sm font-medium text-[#0d0d0d] transition-colors hover:bg-black/5"
                      style={{ fontFamily: "var(--font-display)" }}
                    >
                      {l.label}
                    </a>
                  ))}
                  <div className="my-2 h-px bg-black/10" />
                  <button
                    type="button"
                    onClick={() => setDevOpen((v) => !v)}
                    className="flex w-full items-center justify-between rounded-xl px-4 py-3 font-display text-sm font-medium text-[#0d0d0d] hover:bg-black/5"
                    style={{ fontFamily: "var(--font-display)" }}
                    aria-expanded={devOpen}
                  >
                    {t.nav.developers}
                    <svg
                      width={12}
                      height={12}
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={2}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="opacity-50 transition-transform"
                      style={{ transform: devOpen ? "rotate(180deg)" : "none" }}
                    >
                      <path d="M6 9l6 6 6-6" />
                    </svg>
                  </button>
                  {devOpen && (
                    <div className="ml-4 flex flex-col gap-1 border-l border-black/10 pl-4">
                      <a
                        href="#docs"
                        onClick={() => setMobileOpen(false)}
                        className="rounded-lg px-3 py-2 text-sm text-[#0d0d0d] hover:bg-black/5"
                      >
                        {t.nav.docsItem}
                      </a>
                      <a
                        href="#api"
                        onClick={() => setMobileOpen(false)}
                        className="rounded-lg px-3 py-2 text-sm text-[#0d0d0d] hover:bg-black/5"
                      >
                        {t.nav.api}
                      </a>
                      <a
                        href="#community"
                        onClick={() => setMobileOpen(false)}
                        className="rounded-lg px-3 py-2 text-sm text-[#0d0d0d] hover:bg-black/5"
                      >
                        {t.nav.community}
                      </a>
                    </div>
                  )}
                  <div className="my-2 h-px bg-black/10" />
                  <div className="flex items-center justify-between px-4 py-2">
                    <span
                      className="font-display text-sm text-[#0d0d0d99]"
                      style={{ fontFamily: "var(--font-display)" }}
                    >
                      {t.nav.language}
                    </span>
                    <div className="flex items-center gap-1 rounded-full bg-black/5 p-1">
                      <button
                        onClick={() => setLocale("en")}
                        className={`rounded-full px-3 py-1 text-xs font-medium transition ${locale === "en" ? "bg-white shadow text-[#0d0d0d]" : "text-[#0d0d0d99]"}`}
                      >
                        EN
                      </button>
                      <button
                        onClick={() => setLocale("zh")}
                        className={`rounded-full px-3 py-1 text-xs font-medium transition ${locale === "zh" ? "bg-white shadow text-[#0d0d0d]" : "text-[#0d0d0d99]"}`}
                      >
                        中文
                      </button>
                    </div>
                  </div>
                </nav>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>
    </motion.nav>
  );
}
