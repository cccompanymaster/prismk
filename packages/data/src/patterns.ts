import patternsData from "../data/patterns.json" with { type: "json" };
import type { DimensionCode } from "./items.js";

export type PatternId =
  | "DI"
  | "SN"
  | "BL"
  | "QE"
  | "SS"
  | "SD"
  | "CH"
  | "RA"
  | "SK"
  | "TC"
  | "LE"
  | "CA"
  | "WG"
  | "BC"
  | "FA"
  | "GC";

export interface Signature {
  word: string;
  color: string;
  colorName: string;
  animal: string;
}

export type PrototypeVector = Record<DimensionCode, number>;

export interface PatternStory {
  persona: string;
  scene: string;
}

export interface Pattern {
  id: PatternId;
  name: string;
  nameEn: string;
  slogan: string;
  shortSlogan: string;
  signature: Signature;
  dimensionalKey: string;
  prototype: PrototypeVector;
  description: string[];
  story: PatternStory;
  strengths: string[];
  watchOuts: string[];
  fitsWith: string;
  oftenHeard: string[];
  reframe: string;
}

export interface QualityCheck {
  name: string;
  formula: string;
  warn?: number;
  fail?: number;
  warnMin?: number;
  failMin?: number;
  direction?: "low";
}

export interface ScoringSpec {
  description: string;
  steps: string[];
  consinSimilarity: string;
  liteAdjustment: { description: string };
  qualityChecks: QualityCheck[];
}

export interface AuxiliaryRule {
  threshold: number;
  message: string;
}

export interface AuxiliaryRules {
  V: { high: AuxiliaryRule; low: AuxiliaryRule };
  G: { high: AuxiliaryRule; low: AuxiliaryRule };
  S: { description: string; threshold: number };
}

export interface RiskSignal {
  name: string;
  condition: string;
  message: string;
  resources: string[];
}

export type RelationshipContext =
  | "동료"
  | "연인"
  | "친구"
  | "직장 상사-부하"
  | "직장(동료)"
  | "가족(부부)";

export interface Relationship {
  pair: string;
  pairKor: string;
  context: RelationshipContext | string;
  conflict: string;
  complement: string;
  advice: string;
}

export interface ResultReportSection {
  id: number;
  title: string;
  description: string;
}

export interface PatternsFile {
  version: string;
  description: string;
  patterns: Pattern[];
  scoring: ScoringSpec;
  auxiliaryRules: AuxiliaryRules;
  riskSignals: RiskSignal[];
  relationships: Relationship[];
  resultReportSections: ResultReportSection[];
}

const file = patternsData as PatternsFile;

export const patternsFile: PatternsFile = file;
export const patterns: Pattern[] = file.patterns;
export const scoring = file.scoring;
export const auxiliaryRules = file.auxiliaryRules;
export const riskSignals = file.riskSignals;
export const relationships = file.relationships;
export const resultReportSections = file.resultReportSections;

const patternsById = new Map<PatternId, Pattern>(
  patterns.map((p) => [p.id, p] as const),
);

export function getPattern(id: PatternId): Pattern {
  const found = patternsById.get(id);
  if (!found) throw new Error(`Unknown pattern id: ${id}`);
  return found;
}

export function findPattern(id: string): Pattern | undefined {
  return patternsById.get(id as PatternId);
}
