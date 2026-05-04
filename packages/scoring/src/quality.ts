import type { TestVersion } from "@prism-k/types";
import type { ItemResponse } from "@prism-k/types";
import type { QualityFlag, QualityFlags } from "@prism-k/types";

const VERSION_TIME_THRESHOLDS: Record<
  TestVersion,
  { warnMin: number; failMin: number; warnMax: number; failMax: number }
> = {
  // Lite: target 6 min (360s)
  lite: { failMin: 120, warnMin: 240, warnMax: 720, failMax: 1200 },
  // Full: target ~22 min (1320s)
  full: { failMin: 360, warnMin: 720, warnMax: 2400, failMax: 4000 },
};

function classifyMissing(missingRatio: number): QualityFlag {
  if (missingRatio > 0.15) return "fail";
  if (missingRatio > 0.05) return "warn";
  return "normal";
}

function classifyVariance(sd: number): QualityFlag {
  if (sd < 0.6) return "fail";
  if (sd < 1.0) return "warn";
  return "normal";
}

function classifySpeed(elapsedSeconds: number, version: TestVersion): QualityFlag {
  const t = VERSION_TIME_THRESHOLDS[version];
  if (elapsedSeconds < t.failMin || elapsedSeconds > t.failMax) return "fail";
  if (elapsedSeconds < t.warnMin || elapsedSeconds > t.warnMax) return "warn";
  return "normal";
}

function classifyExtreme(extremeRatio: number): QualityFlag {
  if (extremeRatio > 0.7) return "fail";
  if (extremeRatio > 0.6) return "warn";
  return "normal";
}

function standardDeviation(values: number[]): number {
  if (values.length === 0) return 0;
  const m = values.reduce((s, v) => s + v, 0) / values.length;
  const sqSum = values.reduce((s, v) => s + (v - m) ** 2, 0);
  return Math.sqrt(sqSum / values.length);
}

export interface QualityInput {
  version: TestVersion;
  totalItems: number;
  responses: ItemResponse[];
  elapsedSeconds: number;
}

export function checkResponseQuality(input: QualityInput): QualityFlags {
  const { version, totalItems, responses, elapsedSeconds } = input;
  const answered = responses.length;
  const missingRatio = totalItems === 0 ? 0 : (totalItems - answered) / totalItems;
  const values = responses.map((r) => r.value as number);
  const variance = standardDeviation(values);
  const extremeCount = values.filter((v) => v === 1 || v === 6).length;
  const extremeRatio = answered === 0 ? 0 : extremeCount / answered;
  return {
    missing: classifyMissing(missingRatio),
    variance: classifyVariance(variance),
    speed: classifySpeed(elapsedSeconds, version),
    extreme: classifyExtreme(extremeRatio),
  };
}

export function hasFailFlag(flags: QualityFlags): boolean {
  return (
    flags.missing === "fail" ||
    flags.variance === "fail" ||
    flags.speed === "fail" ||
    flags.extreme === "fail"
  );
}

export function hasWarnFlag(flags: QualityFlags): boolean {
  return (
    flags.missing === "warn" ||
    flags.variance === "warn" ||
    flags.speed === "warn" ||
    flags.extreme === "warn"
  );
}
