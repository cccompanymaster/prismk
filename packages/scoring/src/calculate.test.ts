import { items, getItemsByVersion } from "@prism-k/data";
import type { ItemResponse } from "@prism-k/types";
import { describe, expect, it } from "vitest";
import {
  calculateDimensionScores,
  calculateFacetScores,
  calculateScores,
  confidenceInterval,
  reverseScore,
  standardize,
  toTScore,
} from "./calculate.js";

const fullItems = items;
const liteItems = getItemsByVersion("lite");

function uniformResponses(value: number, source = fullItems): ItemResponse[] {
  return source.map((i) => ({ itemId: i.id, value: value as 1 | 2 | 3 | 4 | 5 | 6 }));
}

describe("reverseScore", () => {
  it("inverts on a 1-6 scale", () => {
    expect(reverseScore(1)).toBe(6);
    expect(reverseScore(3)).toBe(4);
    expect(reverseScore(6)).toBe(1);
  });
});

describe("standardize / toTScore", () => {
  it("maps raw 3.5 to 0 stdz and T 50", () => {
    expect(standardize(3.5)).toBe(0);
    expect(toTScore(0)).toBe(50);
  });

  it("maps raw 4.5 to T 60", () => {
    expect(toTScore(standardize(4.5))).toBe(60);
  });

  it("maps raw 2.5 to T 40", () => {
    expect(toTScore(standardize(2.5))).toBe(40);
  });
});

describe("confidenceInterval", () => {
  it("returns symmetric bounds around the T-score", () => {
    const ci = confidenceInterval(50, 0.8);
    const span = ci.high - ci.low;
    expect(span).toBeGreaterThan(0);
    expect(Math.abs((ci.high + ci.low) / 2 - 50)).toBeLessThanOrEqual(1);
  });

  it("widens when reliability is lower", () => {
    const tight = confidenceInterval(50, 0.9);
    const loose = confidenceInterval(50, 0.5);
    expect(loose.high - loose.low).toBeGreaterThan(tight.high - tight.low);
  });
});

describe("calculateFacetScores (uniform 4 across all items)", () => {
  it("respects reverse-coded items so facet means stay at 3.5", () => {
    const responses = uniformResponses(4);
    const facets = calculateFacetScores(responses, fullItems);
    // For reverse items, value 4 -> 3. So facet with mixed reverse/non-reverse
    // ends up with mean somewhere between 3 and 4 depending on reverse ratio.
    // Pick facet O1_상상력 (5 items, 1 reversed): values = [4,4,3,4,4], mean = 3.8
    const o1 = facets.find((f) => f.facet === "O1_상상력");
    expect(o1?.raw).toBeCloseTo(3.8, 5);
  });

  it("returns null for facet when too many missing responses", () => {
    // Provide only 2 responses for O1_상상력 (5 items, requires >=4)
    const o1Items = fullItems.filter((i) => i.facet === "O1_상상력");
    const responses: ItemResponse[] = o1Items.slice(0, 2).map((i) => ({
      itemId: i.id,
      value: 5,
    }));
    const facets = calculateFacetScores(responses, fullItems);
    expect(facets.find((f) => f.facet === "O1_상상력")?.raw).toBeNull();
  });

  it("allows exactly one missing response per facet", () => {
    const o1Items = fullItems.filter((i) => i.facet === "O1_상상력");
    const responses: ItemResponse[] = o1Items.slice(0, 4).map((i) => ({
      itemId: i.id,
      value: 5,
    }));
    const facets = calculateFacetScores(responses, fullItems);
    expect(facets.find((f) => f.facet === "O1_상상력")?.raw).not.toBeNull();
  });
});

describe("calculateDimensionScores", () => {
  it("returns 6 dimensions with valid raws when all responses present", () => {
    const responses = uniformResponses(5);
    const { dimensions } = calculateScores(responses, fullItems);
    const labelled = dimensions.filter((d) => ["O", "C", "E", "A", "ES", "HH"].includes(d.dim));
    expect(labelled).toHaveLength(6);
    for (const d of labelled) {
      expect(d.raw).not.toBeNull();
      expect(d.tScore).not.toBeNull();
    }
  });

  it("nulls a dimension when fewer than 3 facets resolve", () => {
    // Only respond to one facet of O dimension
    const o1Items = fullItems.filter((i) => i.facet === "O1_상상력");
    const responses = o1Items.map((i) => ({ itemId: i.id, value: 4 as const }));
    const { dimensions } = calculateScores(responses, fullItems);
    const o = dimensions.find((d) => d.dim === "O");
    expect(o?.raw).toBeNull();
    expect(o?.ci).toBeNull();
  });
});

describe("calculateScores on lite items", () => {
  it("produces dimension scores for the 36-item lite version", () => {
    const responses = uniformResponses(4, liteItems);
    const { dimensions } = calculateScores(responses, liteItems);
    const main = dimensions.filter((d) => ["O", "C", "E", "A", "ES", "HH"].includes(d.dim));
    expect(main).toHaveLength(6);
    // All six should be computed (lite has 5 items per main dimension, >=3 facet rule loosely met)
    for (const d of main) {
      expect(d.tScore).not.toBeNull();
    }
  });
});
