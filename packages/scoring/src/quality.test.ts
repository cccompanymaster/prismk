import type { ItemResponse } from "@prism-k/types";
import { describe, expect, it } from "vitest";
import {
  checkResponseQuality,
  hasFailFlag,
  hasWarnFlag,
} from "./quality.js";

function mkResponses(values: number[]): ItemResponse[] {
  return values.map((v, i) => ({ itemId: i + 1, value: v as 1 | 2 | 3 | 4 | 5 | 6 }));
}

function variedResponses(count: number): ItemResponse[] {
  // Cycle 1..6 to keep SD high
  const values = Array.from({ length: count }, (_, i) => ((i % 6) + 1));
  return mkResponses(values);
}

describe("checkResponseQuality — missing ratio", () => {
  it("flags normal when no missing", () => {
    const flags = checkResponseQuality({
      version: "lite",
      totalItems: 36,
      responses: variedResponses(36),
      elapsedSeconds: 360,
    });
    expect(flags.missing).toBe("normal");
  });

  it("flags warn when 5-15% missing", () => {
    const flags = checkResponseQuality({
      version: "lite",
      totalItems: 36,
      responses: variedResponses(33), // ~8% missing
      elapsedSeconds: 360,
    });
    expect(flags.missing).toBe("warn");
  });

  it("flags fail when >15% missing", () => {
    const flags = checkResponseQuality({
      version: "lite",
      totalItems: 36,
      responses: variedResponses(28), // ~22% missing
      elapsedSeconds: 360,
    });
    expect(flags.missing).toBe("fail");
  });
});

describe("checkResponseQuality — variance", () => {
  it("flags fail when all responses are identical (SD=0)", () => {
    const flags = checkResponseQuality({
      version: "lite",
      totalItems: 36,
      responses: mkResponses(Array(36).fill(4)),
      elapsedSeconds: 360,
    });
    expect(flags.variance).toBe("fail");
  });

  it("flags normal for varied responses", () => {
    const flags = checkResponseQuality({
      version: "lite",
      totalItems: 36,
      responses: variedResponses(36),
      elapsedSeconds: 360,
    });
    expect(flags.variance).toBe("normal");
  });
});

describe("checkResponseQuality — speed", () => {
  it("flags fail when far too fast (lite)", () => {
    const flags = checkResponseQuality({
      version: "lite",
      totalItems: 36,
      responses: variedResponses(36),
      elapsedSeconds: 60,
    });
    expect(flags.speed).toBe("fail");
  });

  it("flags warn when somewhat fast (lite)", () => {
    const flags = checkResponseQuality({
      version: "lite",
      totalItems: 36,
      responses: variedResponses(36),
      elapsedSeconds: 200,
    });
    expect(flags.speed).toBe("warn");
  });

  it("flags normal at target time (lite 360s, full 1320s)", () => {
    const lite = checkResponseQuality({
      version: "lite",
      totalItems: 36,
      responses: variedResponses(36),
      elapsedSeconds: 360,
    });
    expect(lite.speed).toBe("normal");
    const full = checkResponseQuality({
      version: "full",
      totalItems: 136,
      responses: variedResponses(136),
      elapsedSeconds: 1320,
    });
    expect(full.speed).toBe("normal");
  });

  it("uses full thresholds for full version", () => {
    const flags = checkResponseQuality({
      version: "full",
      totalItems: 136,
      responses: variedResponses(136),
      elapsedSeconds: 200, // would be lite-fail; full-fail too since <360
    });
    expect(flags.speed).toBe("fail");
  });
});

describe("checkResponseQuality — extreme bias", () => {
  it("flags fail when >70% are 1s and 6s", () => {
    const values = Array(36).fill(0).map((_, i) => (i % 2 === 0 ? 1 : 6));
    const flags = checkResponseQuality({
      version: "lite",
      totalItems: 36,
      responses: mkResponses(values),
      elapsedSeconds: 360,
    });
    expect(flags.extreme).toBe("fail");
  });

  it("flags normal for mixed responses", () => {
    const flags = checkResponseQuality({
      version: "lite",
      totalItems: 36,
      responses: variedResponses(36),
      elapsedSeconds: 360,
    });
    expect(flags.extreme).toBe("normal");
  });
});

describe("hasFailFlag / hasWarnFlag helpers", () => {
  it("hasFailFlag returns true when any axis fails", () => {
    expect(
      hasFailFlag({ missing: "normal", variance: "fail", speed: "normal", extreme: "normal" }),
    ).toBe(true);
  });

  it("hasWarnFlag returns true when any axis warns and none fail", () => {
    expect(
      hasWarnFlag({ missing: "warn", variance: "normal", speed: "normal", extreme: "normal" }),
    ).toBe(true);
  });

  it("returns false when all normal", () => {
    const flags = {
      missing: "normal" as const,
      variance: "normal" as const,
      speed: "normal" as const,
      extreme: "normal" as const,
    };
    expect(hasFailFlag(flags)).toBe(false);
    expect(hasWarnFlag(flags)).toBe(false);
  });
});
