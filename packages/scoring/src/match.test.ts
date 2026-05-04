import { DIMENSION_CODES, patterns } from "@prism-k/data";
import type { DimensionScore } from "@prism-k/types";
import { describe, expect, it } from "vitest";
import {
  cosineSimilarity,
  getMainAndSub,
  matchPatterns,
  SINGLE_PATTERN_THRESHOLD,
} from "./match.js";

function dimensionsFromVector(vec: number[]): DimensionScore[] {
  return DIMENSION_CODES.map((code, i) => ({
    dim: code,
    raw: null,
    standardized: vec[i] ?? 0,
    tScore: null,
    ci: null,
  }));
}

describe("cosineSimilarity", () => {
  it("returns 1 for identical vectors", () => {
    expect(cosineSimilarity([1, 2, 3], [1, 2, 3])).toBeCloseTo(1, 10);
  });

  it("returns 1 for proportional vectors", () => {
    expect(cosineSimilarity([1, 2, 3], [2, 4, 6])).toBeCloseTo(1, 10);
  });

  it("returns 0 for orthogonal vectors", () => {
    expect(cosineSimilarity([1, 0, 0], [0, 1, 0])).toBeCloseTo(0, 10);
  });

  it("returns -1 for opposite vectors", () => {
    expect(cosineSimilarity([1, 2, 3], [-1, -2, -3])).toBeCloseTo(-1, 10);
  });

  it("returns 0 when one vector is zero", () => {
    expect(cosineSimilarity([0, 0, 0], [1, 2, 3])).toBe(0);
  });

  it("throws on length mismatch", () => {
    expect(() => cosineSimilarity([1, 2], [1, 2, 3])).toThrow(/length mismatch/);
  });
});

describe("matchPatterns", () => {
  it("returns 16 sorted matches", () => {
    const dims = dimensionsFromVector([1, 1, 1, 1, 1, 1]);
    const matches = matchPatterns(dims);
    expect(matches).toHaveLength(16);
    for (let i = 0; i < matches.length - 1; i++) {
      expect(matches[i]!.similarity).toBeGreaterThanOrEqual(
        matches[i + 1]!.similarity,
      );
    }
  });

  it("each pattern's prototype matches itself with similarity 1.0", () => {
    for (const p of patterns) {
      const dims = DIMENSION_CODES.map((code) => ({
        dim: code,
        raw: null,
        standardized: p.prototype[code],
        tScore: null,
        ci: null,
      })) as DimensionScore[];
      const matches = matchPatterns(dims);
      const top = matches[0]!;
      expect(top.id).toBe(p.id);
      expect(top.similarity).toBeCloseTo(1.0, 5);
    }
  });

  it("treats null standardized values as 0", () => {
    const dims: DimensionScore[] = DIMENSION_CODES.map((code) => ({
      dim: code,
      raw: null,
      standardized: null,
      tScore: null,
      ci: null,
    }));
    const matches = matchPatterns(dims);
    expect(matches).toHaveLength(16);
    // All similarities should be 0 since user vector is all zero
    for (const m of matches) expect(m.similarity).toBe(0);
  });
});

describe("getMainAndSub", () => {
  it("returns main + sub when similarity gap exceeds threshold", () => {
    const code = getMainAndSub([
      { id: "DI", similarity: 0.9 },
      { id: "SS", similarity: 0.6 },
      { id: "BL", similarity: 0.5 },
    ]);
    expect(code.main).toBe("DI");
    expect(code.sub).toBe("SS");
    expect(code.display).toBe("DI-SS");
  });

  it("collapses to single code when sub is within threshold", () => {
    const code = getMainAndSub(
      [
        { id: "DI", similarity: 0.91 },
        { id: "SS", similarity: 0.9 },
      ],
      SINGLE_PATTERN_THRESHOLD,
    );
    expect(code.sub).toBeNull();
    expect(code.display).toBe("DI");
  });

  it("throws when matches is empty", () => {
    expect(() => getMainAndSub([])).toThrow();
  });
});
