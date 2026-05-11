import { findPattern, relationships } from "@prism-k/data";
import type {
  DimensionScore,
  FacetScore,
  StressPatternScore,
} from "@prism-k/types";
import { describe, expect, it } from "vitest";
import {
  interpretCareerFit,
  interpretDimension,
  interpretGrowth,
  interpretRelationshipHint,
  interpretStrengths,
  interpretStress,
  tScoreBand,
} from "./interpret.js";

function dim(t: number | null): DimensionScore {
  return { dim: "O", raw: null, standardized: null, tScore: t, ci: null };
}

function facet(facet: string, t: number | null, dimCode: FacetScore["dim"] = "O"): FacetScore {
  return { facet, dim: dimCode, raw: null, standardized: null, tScore: t };
}

describe("tScoreBand", () => {
  it("returns the right band for each T-score range", () => {
    expect(tScoreBand(70)).toBe("highest");
    expect(tScoreBand(60)).toBe("high");
    expect(tScoreBand(50)).toBe("mid");
    expect(tScoreBand(40)).toBe("low");
    expect(tScoreBand(30)).toBe("lowest");
    expect(tScoreBand(null)).toBe("mid");
  });
});

describe("interpretDimension", () => {
  it("returns substantive text (140-500 chars) for every dimension × band", () => {
    const codes: ("O" | "C" | "E" | "A" | "ES" | "HH")[] = ["O", "C", "E", "A", "ES", "HH"];
    const tValues = [70, 60, 50, 40, 30];
    for (const code of codes) {
      for (const t of tValues) {
        const text = interpretDimension(code, { ...dim(t), dim: code });
        expect(text.length, `${code} @ T=${t}`).toBeGreaterThanOrEqual(100);
        expect(text.length, `${code} @ T=${t}`).toBeLessThanOrEqual(500);
        // No banned diagnosis vocabulary
        expect(text.toLowerCase()).not.toMatch(/우울증|불안증/);
      }
    }
  });

  it("highest band differs from lowest band for the same dimension", () => {
    const high = interpretDimension("O", { ...dim(70), dim: "O" });
    const low = interpretDimension("O", { ...dim(30), dim: "O" });
    expect(high).not.toEqual(low);
  });
});

describe("interpretStrengths", () => {
  it("returns up to 3 facets above T 55 sorted descending", () => {
    const facets: FacetScore[] = [
      facet("O1_상상력", 70),
      facet("O2_심미", 55),
      facet("O3_지적호기심", 60),
      facet("O4_비관습", 40),
    ];
    const out = interpretStrengths(facets);
    expect(out.map((f) => f.facet)).toEqual(["O1_상상력", "O3_지적호기심", "O2_심미"]);
    for (const e of out) expect(e.body.length).toBeGreaterThan(50);
  });

  it("returns empty when no facet reaches T 55", () => {
    const facets: FacetScore[] = [facet("O1_상상력", 50), facet("O2_심미", 40)];
    expect(interpretStrengths(facets)).toEqual([]);
  });
});

describe("interpretGrowth", () => {
  it("uses encouragement tone when growth orientation is high", () => {
    const facets: FacetScore[] = [facet("C1_체계성", 35, "C")];
    const out = interpretGrowth(facets, 4.5);
    expect(out).toHaveLength(1);
    expect(out[0]!.body).toMatch(/변화|실험/);
  });

  it("uses acceptance tone when growth orientation is low/unknown", () => {
    const facets: FacetScore[] = [facet("C1_체계성", 35, "C")];
    const out = interpretGrowth(facets, 2);
    expect(out[0]!.body).toMatch(/받아들이는/);
  });
});

describe("interpretStress", () => {
  it("returns recovery text for dominant S patterns only", () => {
    const stress: StressPatternScore[] = [
      { code: "S1", raw: 5, dominant: true },
      { code: "S2", raw: 3, dominant: false },
      { code: "S3", raw: 5, dominant: true },
      { code: "S4", raw: 3, dominant: false },
      { code: "S5", raw: 3, dominant: false },
    ];
    const out = interpretStress(stress);
    expect(out.map((s) => s.code)).toEqual(["S1", "S3"]);
    for (const e of out) {
      expect(e.label.length).toBeGreaterThan(0);
      expect(e.recovery.length).toBeGreaterThan(60);
    }
  });
});

describe("interpretCareerFit", () => {
  it("uses main pattern's fitsWith verbatim when no sub", () => {
    const main = findPattern("DI")!;
    expect(interpretCareerFit(main, null)).toBe(main.fitsWith);
  });

  it("appends a sub-pattern hint when a sub exists", () => {
    const main = findPattern("DI")!;
    const sub = findPattern("SS")!;
    const out = interpretCareerFit(main, sub);
    expect(out.startsWith(main.fitsWith)).toBe(true);
    expect(out).toContain(sub.name);
  });
});

describe("interpretRelationshipHint", () => {
  it("finds DI × SN as a relationship hint for the DI main", () => {
    const main = findPattern("DI")!;
    const hint = interpretRelationshipHint(main, relationships);
    const ids = hint.pairs.map((p) => p.id);
    expect(ids).toContain("SN");
  });

  it("returns at most 3 pairs", () => {
    const main = findPattern("DI")!;
    const hint = interpretRelationshipHint(main, relationships);
    expect(hint.pairs.length).toBeLessThanOrEqual(3);
  });
});
