import { riskSignals as RISK_SIGNAL_SPECS } from "@prism-k/data";
import type {
  DimensionScore,
  FacetScore,
  RiskSignalHit,
  StressPatternCode,
  StressPatternScore,
} from "@prism-k/types";

export interface RiskSignalInput {
  facets: FacetScore[];
  dimensions: DimensionScore[];
  stressPatterns: StressPatternScore[];
}

function dimStdz(
  dimensions: DimensionScore[],
  code: "O" | "C" | "E" | "A" | "ES" | "HH",
): number | null {
  return dimensions.find((d) => d.dim === code)?.standardized ?? null;
}

function facetStdz(facets: FacetScore[], facet: string): number | null {
  return facets.find((f) => f.facet === facet)?.standardized ?? null;
}

function stressRaw(
  patterns: StressPatternScore[],
  code: StressPatternCode,
): number | null {
  return patterns.find((p) => p.code === code)?.raw ?? null;
}

interface Predicate {
  id: string;
  test: (input: RiskSignalInput) => boolean;
}

const PREDICATES: Predicate[] = [
  {
    id: "depression",
    test: ({ facets, dimensions, stressPatterns }) => {
      const es = dimStdz(dimensions, "ES");
      const es4 = facetStdz(facets, "ES4_자기수용");
      const s3 = stressRaw(stressPatterns, "S3");
      return es !== null && es < -1.5 && es4 !== null && es4 < -1.5 && s3 !== null && s3 >= 5;
    },
  },
  {
    id: "anxiety",
    test: ({ facets, stressPatterns }) => {
      const es1 = facetStdz(facets, "ES1_불안조절");
      const s1 = stressRaw(stressPatterns, "S1");
      return es1 !== null && es1 < -1.5 && s1 !== null && s1 >= 5;
    },
  },
  {
    id: "impulse",
    test: ({ facets }) => {
      const es2 = facetStdz(facets, "ES2_충동조절");
      const c4 = facetStdz(facets, "C4_자기규율");
      return es2 !== null && es2 < -1.5 && c4 !== null && c4 < -1.5;
    },
  },
  {
    id: "perfectionism_burnout",
    test: ({ dimensions, stressPatterns }) => {
      const c = dimStdz(dimensions, "C");
      const es = dimStdz(dimensions, "ES");
      const s4 = stressRaw(stressPatterns, "S4");
      return c !== null && c > 1.5 && s4 !== null && s4 >= 5 && es !== null && es < -1.0;
    },
  },
  {
    id: "social_isolation",
    test: ({ dimensions, stressPatterns }) => {
      const e = dimStdz(dimensions, "E");
      const es = dimStdz(dimensions, "ES");
      const s2 = stressRaw(stressPatterns, "S2");
      return e !== null && e < -1.5 && s2 !== null && s2 >= 5 && es !== null && es < -1.0;
    },
  },
];

const SPEC_BY_INDEX = RISK_SIGNAL_SPECS;

export function detectRiskSignals(input: RiskSignalInput): RiskSignalHit[] {
  const hits: RiskSignalHit[] = [];
  for (let i = 0; i < PREDICATES.length; i++) {
    const predicate = PREDICATES[i]!;
    const spec = SPEC_BY_INDEX[i];
    if (!spec) continue;
    if (predicate.test(input)) {
      hits.push({
        id: predicate.id,
        name: spec.name,
        message: spec.message,
        resources: [...spec.resources],
      });
    }
  }
  return hits;
}
