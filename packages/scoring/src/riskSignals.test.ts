import type {
  DimensionScore,
  FacetScore,
  StressPatternScore,
} from "@prism-k/types";
import { describe, expect, it } from "vitest";
import { detectRiskSignals, type RiskSignalInput } from "./riskSignals.js";

function dim(code: DimensionScore["dim"], standardized: number | null): DimensionScore {
  return { dim: code, raw: null, standardized, tScore: null, ci: null };
}

function facet(name: string, standardized: number | null, dimCode: FacetScore["dim"] = "ES"): FacetScore {
  return { facet: name, dim: dimCode, raw: null, standardized, tScore: null };
}

function stress(code: StressPatternScore["code"], raw: number | null): StressPatternScore {
  return { code, raw, dominant: false };
}

const baseDimensions: DimensionScore[] = [
  dim("O", 0),
  dim("C", 0),
  dim("E", 0),
  dim("A", 0),
  dim("ES", 0),
  dim("HH", 0),
];
const baseFacets: FacetScore[] = [];
const baseStress: StressPatternScore[] = [
  stress("S1", 3),
  stress("S2", 3),
  stress("S3", 3),
  stress("S4", 3),
  stress("S5", 3),
];

function input(overrides: Partial<RiskSignalInput>): RiskSignalInput {
  return {
    facets: overrides.facets ?? baseFacets,
    dimensions: overrides.dimensions ?? baseDimensions,
    stressPatterns: overrides.stressPatterns ?? baseStress,
  };
}

describe("detectRiskSignals", () => {
  it("returns no hits on neutral profile", () => {
    expect(detectRiskSignals(input({}))).toHaveLength(0);
  });

  it("detects depression when ES + ES4 deeply low and S3 >= 5", () => {
    const hits = detectRiskSignals(
      input({
        dimensions: [dim("O", 0), dim("C", 0), dim("E", 0), dim("A", 0), dim("ES", -2), dim("HH", 0)],
        facets: [facet("ES4_자기수용", -2)],
        stressPatterns: [stress("S1", 3), stress("S2", 3), stress("S3", 5), stress("S4", 3), stress("S5", 3)],
      }),
    );
    expect(hits.map((h) => h.id)).toContain("depression");
  });

  it("detects anxiety when ES1 deeply low and S1 >= 5", () => {
    const hits = detectRiskSignals(
      input({
        facets: [facet("ES1_불안조절", -2)],
        stressPatterns: [stress("S1", 5), stress("S2", 3), stress("S3", 3), stress("S4", 3), stress("S5", 3)],
      }),
    );
    expect(hits.map((h) => h.id)).toContain("anxiety");
  });

  it("detects impulse-control risk when ES2 and C4 deeply low", () => {
    const hits = detectRiskSignals(
      input({
        facets: [facet("ES2_충동조절", -2), facet("C4_자기규율", -2, "C")],
      }),
    );
    expect(hits.map((h) => h.id)).toContain("impulse");
  });

  it("detects perfectionism burnout (C high, S4 >=5, ES low)", () => {
    const hits = detectRiskSignals(
      input({
        dimensions: [dim("O", 0), dim("C", 2), dim("E", 0), dim("A", 0), dim("ES", -1.5), dim("HH", 0)],
        stressPatterns: [stress("S1", 3), stress("S2", 3), stress("S3", 3), stress("S4", 5), stress("S5", 3)],
      }),
    );
    expect(hits.map((h) => h.id)).toContain("perfectionism_burnout");
  });

  it("detects social isolation (E deeply low, S2 >= 5, ES low)", () => {
    const hits = detectRiskSignals(
      input({
        dimensions: [dim("O", 0), dim("C", 0), dim("E", -2), dim("A", 0), dim("ES", -1.5), dim("HH", 0)],
        stressPatterns: [stress("S1", 3), stress("S2", 5), stress("S3", 3), stress("S4", 3), stress("S5", 3)],
      }),
    );
    expect(hits.map((h) => h.id)).toContain("social_isolation");
  });

  it("attaches a non-empty message and resources for each hit", () => {
    const hits = detectRiskSignals(
      input({
        facets: [facet("ES1_불안조절", -2)],
        stressPatterns: [stress("S1", 5), stress("S2", 3), stress("S3", 3), stress("S4", 3), stress("S5", 3)],
      }),
    );
    expect(hits.length).toBeGreaterThan(0);
    for (const h of hits) {
      expect(h.message.length).toBeGreaterThan(0);
      expect(h.resources.length).toBeGreaterThan(0);
    }
  });

  it("can detect multiple risk signals simultaneously", () => {
    const hits = detectRiskSignals(
      input({
        dimensions: [dim("O", 0), dim("C", 0), dim("E", -2), dim("A", 0), dim("ES", -2), dim("HH", 0)],
        facets: [
          facet("ES1_불안조절", -2),
          facet("ES4_자기수용", -2),
        ],
        stressPatterns: [
          stress("S1", 5),
          stress("S2", 5),
          stress("S3", 5),
          stress("S4", 3),
          stress("S5", 3),
        ],
      }),
    );
    expect(hits.length).toBeGreaterThanOrEqual(3);
  });
});
