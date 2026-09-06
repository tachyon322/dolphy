"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { PixelGrid } from "./PixelGrid";
import { CodeCard } from "./CodeCard";
import { LogoWall } from "./LogoWall";
import { useLocale } from "@/components/providers/LocaleProvider";

const container = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.12, delayChildren: 0.2 },
  },
};

const item = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] as const },
  },
};

export function Hero() {
  const { t } = useLocale();
  return (
    <motion.section
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
      className="relative flex min-h-[100vh] min-h-[100svh] flex-col overflow-hidden bg-[var(--bg-app)] lg:min-h-[100dvh] max-[810px]:block max-[810px]:min-h-0"
    >
      {/* hero bg — light hill image */}
      <div className="pointer-events-none absolute inset-0">
        <Image
          src="/img/hero-bg-light.png"
          alt=""
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />
        <div
          aria-hidden
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(to bottom, rgba(255,255,255,0) 0%, rgba(250,250,250,0.6) 60%, #fafafa 100%)",
          }}
        />
      </div>

      {/* content — unified with navbar max 1440px, adaptive vh gaps */}
      <motion.div
        variants={container}
        initial="hidden"
        animate="visible"
        className="relative z-[1] mx-auto flex w-full max-w-[1440px] flex-1 items-center justify-between gap-12 px-10 pt-[calc(var(--nav-height)+var(--hero-gap))] pb-[var(--hero-gap)] max-[1199px]:px-4 max-[810px]:block max-[810px]:flex-none max-[810px]:items-start max-[810px]:gap-10 max-[810px]:px-4 max-[810px]:!pb-8 max-[810px]:!pt-[88px]"
      >
        <div className="flex max-w-[680px] flex-col items-start max-[810px]:w-full max-[810px]:max-w-none">
          {/* badge */}
          <motion.div
            variants={item}
            className="inline-flex items-center gap-2 rounded-full border-[0.5px] bg-[#ffffff8c] px-3.5 py-2 backdrop-blur-[10px]"
            style={{
              borderColor: "rgba(13,13,13,0.1)",
              backdropFilter: "blur(10px)",
              WebkitBackdropFilter: "blur(10px)",
            }}
          >
            <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-[#1a1a1a]" />
            <p
              className="grid-copy text-[11px] leading-none tracking-[0.14em] text-[#0d0d0dd1]"
              style={{ fontFamily: "var(--font-mono)" }}
            >
              {t.hero.badge}
            </p>
          </motion.div>

          {/* title */}
          <motion.h1
            variants={item}
            className="river-copy mt-[22px] max-w-[860px] text-[70px] font-medium leading-[77px] tracking-[-2.8px] text-[var(--ink-text)] max-[810px]:text-[45px] max-[810px]:leading-[49.5px] max-[810px]:tracking-[-1.8px]"
            style={{ fontFamily: "var(--font-display)" }}
          >
            <span className="text-[var(--ink-a40)]">{t.hero.titleDim1}</span>
            {t.hero.title1}
            <br />
            <span className="text-[var(--ink-a40)]">{t.hero.titleDim2}</span>
            {t.hero.title2}
          </motion.h1>

          <motion.p
            variants={item}
            className="river-copy mt-6 max-w-[520px] text-[17px] font-light leading-[1.7] tracking-[0.2px] text-[#0d0d0db3] max-[810px]:text-[16px]"
            style={{ fontFamily: "var(--font-display)" }}
          >
            {t.hero.subtitle1}
            <br className="max-[810px]:hidden" />
            {t.hero.subtitle2}
          </motion.p>

          <motion.div variants={item} className="mt-8 flex flex-wrap items-center gap-3.5">
            <Link
              href="/marketplace"
              aria-label={t.hero.ctaAria}
              className="group inline-flex h-[67px] w-[248px] items-center gap-4 overflow-hidden rounded-[12px] border-[0.5px] bg-[#202020] p-[3px] pr-7 transition-[gap,padding,box-shadow] duration-300 hover:gap-0 hover:p-[3px] hover:shadow-none max-[810px]:gap-0 max-[810px]:p-[3px]"
              style={{ borderColor: "#ffffff1a" }}
            >
              <span className="flex h-[59px] flex-[0_0_65px] items-center justify-center gap-0 overflow-hidden rounded-[8px] bg-white transition-[gap,flex-grow] duration-300 group-hover:flex-grow group-hover:gap-2.5 max-[810px]:flex-grow max-[810px]:gap-2.5 max-[810px]:flex-[1_1_auto]">
                <span
                  className="max-w-0 overflow-hidden whitespace-nowrap font-sans text-[16px] font-medium leading-none text-[#0d0d0d] opacity-0 transition-[max-width,opacity] duration-300 group-hover:max-w-[140px] group-hover:opacity-100 max-[810px]:max-w-[140px] max-[810px]:opacity-100"
                  style={{ fontFamily: "var(--font-sans)" }}
                >
                  {t.hero.cta}
                </span>
                <PixelGrid />
              </span>
              <span
                className="max-w-[132px] flex-1 overflow-hidden whitespace-nowrap text-center font-sans text-[16px] font-medium text-[#f0f0f0] transition-[max-width,opacity] duration-300 group-hover:max-w-0 group-hover:flex-[0_0_auto] group-hover:opacity-0 max-[810px]:max-w-0 max-[810px]:flex-[0_0_auto] max-[810px]:opacity-0"
                style={{ fontFamily: "var(--font-sans)" }}
              >
                {t.hero.cta}
              </span>
            </Link>
          </motion.div>
        </div>

        <motion.div
          variants={{
            hidden: { opacity: 0, y: 28 },
            visible: {
              opacity: 1,
              y: 0,
              transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1] as const, delay: 0.4 },
            },
          }}
        >
          <CodeCard />
        </motion.div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.8 }}
        className="relative z-[1] mx-auto w-full max-w-[1440px] px-10 pb-[var(--hero-gap)] max-[1199px]:px-4 max-[810px]:px-4 max-[810px]:!pb-8"
      >
        <LogoWall />
      </motion.div>
    </motion.section>
  );
}
