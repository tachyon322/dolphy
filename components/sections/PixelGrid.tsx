"use client";

import { motion } from "framer-motion";

// Arrow shape extracted from latest SnipCSS dump _startBtn 50 divs (opacity 1 + 0.865 → active)
// Row y=0: 9,12,15,24,27 | y=3:12,15,18,27 | y=6:15,18,21 | y=9:12,15,18,27 | y=12:9,12,15,24,27
const ARROW = new Set<string>([
  "9:0",
  "12:0",
  "15:0",
  "24:0",
  "27:0",
  "12:3",
  "15:3",
  "18:3",
  "27:3",
  "15:6",
  "18:6",
  "21:6",
  "12:9",
  "15:9",
  "18:9",
  "27:9",
  "9:12",
  "12:12",
  "15:12",
  "24:12",
  "27:12",
]);

export function PixelGrid() {
  return (
    <div aria-hidden className="relative h-[15px] w-[30px] shrink-0">
      {Array.from({ length: 50 }).map((_, i) => {
        const x = (i % 10) * 3;
        const y = Math.floor(i / 10) * 3;
        const isArrow = ARROW.has(`${x}:${y}`);
        return (
          <motion.div
            key={i}
            className="absolute h-[3px] w-[3px] bg-[rgb(31,31,31)]"
            style={{ left: x, top: y }}
            initial={{ opacity: 0 }}
            animate={{ opacity: isArrow ? [0, 1, 1, 0] : 0 }}
            transition={
              isArrow
                ? {
                    duration: 1.2,
                    times: [0, 0.2, 0.8, 1],
                    repeat: Infinity,
                    repeatType: "loop" as const,
                    ease: "easeInOut" as const,
                    delay: (x / 30) * 0.55 + (y / 15) * 0.08,
                    repeatDelay: 0.15,
                  }
                : undefined
            }
          />
        );
      })}
    </div>
  );
}
