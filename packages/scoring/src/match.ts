import {
  DIMENSION_CODES,
  patterns,
  type DimensionCode,
  type Pattern,
  type PatternId,
} from "@prism-k/data";
import type { DimensionScore, PatternMatch, ResultCode } from "@prism-k/types";

export const SINGLE_PATTERN_THRESHOLD = 0.05;

export function cosineSimilarity(a: number[], b: number[]): number {
  if (a.length !== b.length) {
    throw new Error(
      `cosineSimilarity: length mismatch (${a.length} vs ${b.length})`,
    );
  }
  let dot = 0;
  let magA = 0;
  let magB = 0;
  for (let i = 0; i < a.length; i++) {
    const ai = a[i]!;
    const bi = b[i]!;
    dot += ai * bi;
    magA += ai * ai;
    magB += bi * bi;
  }
  if (magA === 0 || magB === 0) return 0;
  return dot / (Math.sqrt(magA) * Math.sqrt(magB));
}

function userVectorFromDimensions(dimensions: DimensionScore[]): number[] {
  const lookup = new Map<DimensionCode, number>();
  for (const d of dimensions) {
    if (d.standardized !== null) lookup.set(d.dim, d.standardized);
  }
  return DIMENSION_CODES.map((code) => lookup.get(code) ?? 0);
}

function patternVector(p: Pattern): number[] {
  return DIMENSION_CODES.map((code) => p.prototype[code]);
}

export function matchPatterns(dimensions: DimensionScore[]): PatternMatch[] {
  const userVec = userVectorFromDimensions(dimensions);
  return patterns
    .map((p) => ({
      id: p.id,
      similarity: cosineSimilarity(userVec, patternVector(p)),
    }))
    .sort((a, b) => b.similarity - a.similarity);
}

export function getMainAndSub(
  matches: PatternMatch[],
  threshold: number = SINGLE_PATTERN_THRESHOLD,
): ResultCode {
  if (matches.length === 0) {
    throw new Error("getMainAndSub: matches array is empty");
  }
  const main = matches[0]!;
  const second = matches[1];
  if (!second) {
    return { main: main.id, sub: null, display: main.id };
  }
  const isSingle = main.similarity - second.similarity < threshold;
  if (isSingle) {
    return { main: main.id, sub: null, display: main.id };
  }
  return {
    main: main.id,
    sub: second.id,
    display: `${main.id}-${second.id}` as PatternId | string,
  };
}
