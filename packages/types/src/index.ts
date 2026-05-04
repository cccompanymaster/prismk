import type {
  AnyDimensionCode,
  DimensionCode,
  PatternId,
} from "@prism-k/data";

export type TestVersion = "lite" | "full";

export type RelationshipContextKey = "work" | "friend" | "love" | "family";

export interface ItemResponse {
  itemId: number;
  value: 1 | 2 | 3 | 4 | 5 | 6;
}

export interface ResponseSession {
  id: string;
  version: TestVersion;
  responses: ItemResponse[];
  startedAt: string;
  completedAt: string | null;
}

export interface FacetScore {
  facet: string;
  dim: AnyDimensionCode;
  raw: number | null;
  standardized: number | null;
  tScore: number | null;
}

export interface ConfidenceInterval {
  low: number;
  high: number;
}

export interface DimensionScore {
  dim: DimensionCode;
  raw: number | null;
  standardized: number | null;
  tScore: number | null;
  ci: ConfidenceInterval | null;
}

export interface AuxiliaryScore {
  code: "V" | "G";
  raw: number | null;
  message: string | null;
}

export type StressPatternCode = "S1" | "S2" | "S3" | "S4" | "S5";

export interface StressPatternScore {
  code: StressPatternCode;
  raw: number | null;
  dominant: boolean;
}

export interface PatternMatch {
  id: PatternId;
  similarity: number;
}

export type QualityFlag = "normal" | "warn" | "fail";

export interface QualityFlags {
  missing: QualityFlag;
  variance: QualityFlag;
  speed: QualityFlag;
  extreme: QualityFlag;
}

export interface RiskSignalHit {
  id: string;
  name: string;
  message: string;
  resources: string[];
}

export interface ResultCode {
  main: PatternId;
  sub: PatternId | null;
  display: string;
}

export interface Result {
  id: string;
  token: string;
  version: TestVersion;
  code: ResultCode;
  matches: PatternMatch[];
  facets: FacetScore[];
  dimensions: DimensionScore[];
  auxiliary: AuxiliaryScore[];
  stressPatterns: StressPatternScore[];
  quality: QualityFlags;
  riskSignals: RiskSignalHit[];
  createdAt: string;
}

export interface MatchRequest {
  tokenA: string;
  tokenB: string;
  context: RelationshipContextKey;
}

export interface MatchOutcome {
  pair: string;
  conflict: string;
  complement: string;
  advice: string;
  fallback: boolean;
}

export type {
  AnyDimensionCode,
  DimensionCode,
  PatternId,
} from "@prism-k/data";
