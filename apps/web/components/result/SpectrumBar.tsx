"use client";

import { motion } from "framer-motion";

interface Props {
  label: string;
  tScore: number | null;
  percentile?: number | null;
  ci?: { low: number; high: number } | null;
  color?: string;
}

const MIN_T = 20;
const MAX_T = 80;

function tToPct(t: number): number {
  const clamped = Math.max(MIN_T, Math.min(MAX_T, t));
  return ((clamped - MIN_T) / (MAX_T - MIN_T)) * 100;
}

export function SpectrumBar({
  label,
  tScore,
  percentile,
  ci,
  color = "#7E57C2",
}: Props): JSX.Element {
  if (tScore === null) {
    return (
      <div className="space-y-1.5">
        <div className="flex items-baseline justify-between text-xs">
          <span className="font-medium text-slate-900">{label}</span>
          <span className="text-slate-400">측정 불가</span>
        </div>
        <div className="h-2 rounded-full bg-slate-100" />
      </div>
    );
  }

  const position = tToPct(tScore);
  const ciLeft = ci ? tToPct(ci.low) : null;
  const ciWidth = ci ? tToPct(ci.high) - tToPct(ci.low) : null;

  return (
    <div className="space-y-2">
      <div className="flex items-baseline justify-between gap-3 text-xs">
        <span className="font-semibold text-slate-900">{label}</span>
        <span className="text-slate-500">
          T = {tScore}
          {percentile !== null && percentile !== undefined ? (
            <span className="ml-1.5 text-slate-400">·</span>
          ) : null}
          {percentile !== null && percentile !== undefined ? (
            <span className="ml-1.5 font-medium" style={{ color }}>
              {percentile >= 50 ? `상위 ${100 - percentile}%` : `하위 ${percentile}%`}
            </span>
          ) : null}
        </span>
      </div>
      <div className="relative h-2 overflow-visible rounded-full bg-slate-100">
        {/* tick at 50 (population mean) */}
        <span
          className="absolute top-1/2 h-3 w-px -translate-y-1/2 bg-slate-300"
          style={{ left: "50%" }}
          aria-hidden
        />
        {/* CI band */}
        {ciLeft !== null && ciWidth !== null ? (
          <motion.span
            className="absolute top-1/2 h-2 -translate-y-1/2 rounded-full opacity-25"
            style={{ left: `${ciLeft}%`, width: `${ciWidth}%`, background: color }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.25 }}
            transition={{ duration: 0.5, delay: 0.05 }}
            aria-hidden
          />
        ) : null}
        {/* Position marker */}
        <motion.span
          className="absolute top-1/2 h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white shadow"
          style={{ left: `${position}%`, background: color }}
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.4, delay: 0.1, type: "spring", stiffness: 300, damping: 22 }}
          aria-hidden
        />
      </div>
      <div className="flex items-center justify-between text-[10px] text-slate-400">
        <span>낮음</span>
        <span>평균</span>
        <span>높음</span>
      </div>
    </div>
  );
}
