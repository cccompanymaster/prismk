import {
  AUXILIARY_CODES,
  getItemsByVersion,
  type Item,
} from "@prism-k/data";
import {
  calculateScores,
  checkResponseQuality,
  detectRiskSignals,
  getMainAndSub,
  matchPatterns,
} from "@prism-k/scoring";
import type {
  AuxiliaryScore,
  ItemResponse,
  Result,
  StressPatternCode,
  StressPatternScore,
  TestVersion,
} from "@prism-k/types";

const STRESS_PATTERN_CODES: StressPatternCode[] = ["S1", "S2", "S3", "S4", "S5"];
const STRESS_DOMINANT_THRESHOLD = 4;

export interface BuildResultInput {
  version: TestVersion;
  responses: ItemResponse[];
  elapsedSeconds: number;
}

export type ScoringPayload = Omit<Result, "id" | "token" | "createdAt">;

function computeAuxiliaryScores(
  responses: ItemResponse[],
  items: Item[],
): AuxiliaryScore[] {
  const responseMap = new Map<number, number>();
  for (const r of responses) responseMap.set(r.itemId, r.value);

  return AUXILIARY_CODES.filter((code) => code === "V" || code === "G").map(
    (code) => {
      const facetItems = items.filter((i) => i.dim === code);
      const values: number[] = [];
      for (const item of facetItems) {
        const v = responseMap.get(item.id);
        if (v === undefined) continue;
        values.push(item.reverse ? 7 - v : v);
      }
      if (values.length === 0) {
        return { code: code as "V" | "G", raw: null, message: null };
      }
      const raw = values.reduce((s, v) => s + v, 0) / values.length;
      return { code: code as "V" | "G", raw, message: null };
    },
  );
}

function computeStressPatterns(
  responses: ItemResponse[],
  items: Item[],
): StressPatternScore[] {
  const responseMap = new Map<number, number>();
  for (const r of responses) responseMap.set(r.itemId, r.value);

  return STRESS_PATTERN_CODES.map((code) => {
    const facetItems = items.filter((i) => i.dim === "S" && i.facet.startsWith(code));
    const values: number[] = [];
    for (const item of facetItems) {
      const v = responseMap.get(item.id);
      if (v === undefined) continue;
      values.push(item.reverse ? 7 - v : v);
    }
    if (values.length === 0) return { code, raw: null, dominant: false };
    const raw = values.reduce((s, v) => s + v, 0) / values.length;
    return { code, raw, dominant: raw >= STRESS_DOMINANT_THRESHOLD };
  });
}

export function scoreResponses(input: BuildResultInput): ScoringPayload {
  const items = getItemsByVersion(input.version);
  const { facets, dimensions } = calculateScores(input.responses, items);
  const matches = matchPatterns(dimensions);
  const code = getMainAndSub(matches);
  const auxiliary = computeAuxiliaryScores(input.responses, items);
  const stressPatterns = computeStressPatterns(input.responses, items);
  const quality = checkResponseQuality({
    version: input.version,
    totalItems: items.length,
    responses: input.responses,
    elapsedSeconds: input.elapsedSeconds,
  });
  const riskSignals = detectRiskSignals({ facets, dimensions, stressPatterns });

  return {
    version: input.version,
    code,
    matches,
    facets,
    dimensions,
    auxiliary,
    stressPatterns,
    quality,
    riskSignals,
  };
}
