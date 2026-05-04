import {
  DIMENSION_CODES,
  type AnyDimensionCode,
  type DimensionCode,
  type Item,
} from "@prism-k/data";
import type {
  ConfidenceInterval,
  DimensionScore,
  FacetScore,
  ItemResponse,
} from "@prism-k/types";

export const RAW_MEAN = 3.5;
export const RAW_SD = 1.0;
export const T_SCORE_MEAN = 50;
export const T_SCORE_SD = 10;
export const DEFAULT_RELIABILITY = 0.8;

const DIMENSION_CODE_SET: ReadonlySet<DimensionCode> = new Set(DIMENSION_CODES);

export function reverseScore(value: number): number {
  return 7 - value;
}

function mean(values: number[]): number {
  return values.reduce((sum, v) => sum + v, 0) / values.length;
}

function applyReverse(item: Item, value: number): number {
  return item.reverse ? reverseScore(value) : value;
}

function indexResponses(responses: ItemResponse[]): Map<number, number> {
  const map = new Map<number, number>();
  for (const r of responses) map.set(r.itemId, r.value);
  return map;
}

function groupItemsByFacet(items: Item[]): Map<string, Item[]> {
  const map = new Map<string, Item[]>();
  for (const item of items) {
    const arr = map.get(item.facet);
    if (arr) arr.push(item);
    else map.set(item.facet, [item]);
  }
  return map;
}

export function standardize(raw: number): number {
  return (raw - RAW_MEAN) / RAW_SD;
}

export function toTScore(standardized: number): number {
  return Math.round(T_SCORE_MEAN + standardized * T_SCORE_SD);
}

export function confidenceInterval(
  tScore: number,
  reliability: number = DEFAULT_RELIABILITY,
): ConfidenceInterval {
  const sem = T_SCORE_SD * Math.sqrt(1 - reliability);
  return {
    low: Math.round(tScore - 1.96 * sem),
    high: Math.round(tScore + 1.96 * sem),
  };
}

export function calculateFacetScore(
  facetItems: Item[],
  responseMap: Map<number, number>,
): number | null {
  const scored: number[] = [];
  for (const item of facetItems) {
    const raw = responseMap.get(item.id);
    if (raw === undefined) continue;
    scored.push(applyReverse(item, raw));
  }
  const requiredMin = Math.max(1, facetItems.length - 1);
  if (scored.length < requiredMin) return null;
  return mean(scored);
}

export function calculateFacetScores(
  responses: ItemResponse[],
  items: Item[],
): FacetScore[] {
  const responseMap = indexResponses(responses);
  const facetGroups = groupItemsByFacet(items);
  const result: FacetScore[] = [];
  for (const [facet, facetItems] of facetGroups) {
    const dim = facetItems[0]!.dim as AnyDimensionCode;
    const raw = calculateFacetScore(facetItems, responseMap);
    const stdz = raw === null ? null : standardize(raw);
    const tScore = stdz === null ? null : toTScore(stdz);
    result.push({ facet, dim, raw, standardized: stdz, tScore });
  }
  return result;
}

export function calculateDimensionScores(
  facets: FacetScore[],
): DimensionScore[] {
  const grouped = new Map<DimensionCode, FacetScore[]>();
  for (const f of facets) {
    if (!DIMENSION_CODE_SET.has(f.dim as DimensionCode)) continue;
    const code = f.dim as DimensionCode;
    const arr = grouped.get(code);
    if (arr) arr.push(f);
    else grouped.set(code, [f]);
  }
  const result: DimensionScore[] = [];
  for (const dim of DIMENSION_CODES) {
    const facetScores = grouped.get(dim) ?? [];
    const validRaws = facetScores
      .map((f) => f.raw)
      .filter((v): v is number => v !== null);
    if (validRaws.length < 3) {
      result.push({
        dim,
        raw: null,
        standardized: null,
        tScore: null,
        ci: null,
      });
      continue;
    }
    const raw = mean(validRaws);
    const stdz = standardize(raw);
    const tScore = toTScore(stdz);
    const ci = confidenceInterval(tScore);
    result.push({ dim, raw, standardized: stdz, tScore, ci });
  }
  return result;
}

export interface CalculatedScores {
  facets: FacetScore[];
  dimensions: DimensionScore[];
}

export function calculateScores(
  responses: ItemResponse[],
  items: Item[],
): CalculatedScores {
  const facets = calculateFacetScores(responses, items);
  const dimensions = calculateDimensionScores(facets);
  return { facets, dimensions };
}
