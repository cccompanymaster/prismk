"use client";

import { motion } from "framer-motion";
import type { ResultDto } from "@/lib/api";

const reveal = {
  hidden: { opacity: 0, y: 28, filter: "blur(8px)" },
  visible: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] as const },
  },
};

export function ResultHero({ result }: { result: ResultDto }): JSX.Element {
  const main = result.patterns.main;
  const sub = result.patterns.sub;
  const accent = main?.signature.color ?? "#7E57C2";
  const accentSub = sub?.signature.color ?? accent;

  return (
    <section
      className="relative overflow-hidden text-white"
      style={{
        background: `linear-gradient(135deg, ${accent}, ${accentSub})`,
      }}
    >
      {/* Decorative aura */}
      <div
        className="pointer-events-none absolute inset-0 opacity-50"
        style={{
          backgroundImage:
            "radial-gradient(circle at 25% 15%, rgba(255,255,255,0.35), transparent 45%), radial-gradient(circle at 75% 85%, rgba(255,255,255,0.18), transparent 50%)",
        }}
        aria-hidden
      />
      {/* Watermark of 한 단어 */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 0.08, scale: 1 }}
        transition={{ duration: 1, delay: 0.2 }}
        className="pointer-events-none absolute inset-0 flex items-center justify-center"
        aria-hidden
      >
        <span className="text-[20rem] font-black leading-none tracking-tight sm:text-[28rem]">
          {main?.signature.word ?? ""}
        </span>
      </motion.div>

      <div className="relative mx-auto max-w-3xl px-4 py-20 text-center sm:py-28">
        {result.version === "lite" ? (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.05, duration: 0.4 }}
            className="mx-auto inline-block rounded-full bg-white/15 px-3 py-1 text-xs backdrop-blur"
          >
            라이트판 결과 · 약식 추정 (정밀 결과는 풀 버전)
          </motion.p>
        ) : null}

        <motion.p
          variants={reveal}
          initial="hidden"
          animate="visible"
          transition={{ duration: 0.5, delay: 0.1 }}
          className="mt-6 text-xs uppercase tracking-[0.4em] opacity-80"
        >
          {main?.signature.word}
        </motion.p>

        <motion.h1
          variants={reveal}
          initial="hidden"
          animate="visible"
          transition={{ duration: 0.7, delay: 0.25 }}
          className="mt-3 text-7xl font-black tracking-tight sm:text-8xl"
        >
          {result.code.display}
        </motion.h1>

        <motion.p
          variants={reveal}
          initial="hidden"
          animate="visible"
          transition={{ duration: 0.6, delay: 0.45 }}
          className="mt-5 text-xl font-semibold sm:text-2xl"
        >
          {main ? main.name : ""}
          {sub ? <span className="opacity-80"> × {sub.name}</span> : null}
        </motion.p>

        {main ? (
          <motion.p
            variants={reveal}
            initial="hidden"
            animate="visible"
            transition={{ duration: 0.6, delay: 0.6 }}
            className="mt-4 text-base opacity-90"
          >
            “{main.slogan}”
          </motion.p>
        ) : null}

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.85 }}
          className="mt-10 flex flex-wrap items-center justify-center gap-2 text-xs"
        >
          {main ? (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 backdrop-blur">
              <span className="h-1.5 w-1.5 rounded-full bg-white" />
              시그니처 동물 · {main.signature.animal}
            </span>
          ) : null}
          {sub ? (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 backdrop-blur">
              <span
                className="h-1.5 w-1.5 rounded-full"
                style={{ backgroundColor: sub.signature.color }}
              />
              서브 — {sub.id}
            </span>
          ) : null}
        </motion.div>
      </div>
    </section>
  );
}
