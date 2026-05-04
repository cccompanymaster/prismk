import { NotFoundException } from "@nestjs/common";
import { describe, expect, it, vi } from "vitest";
import type { PrismaService } from "../prisma/prisma.service";
import { ResultsService } from "./results.service";

function makeRow(overrides: Partial<Record<string, unknown>> = {}) {
  return {
    id: "res-1",
    token: "t-abc",
    version: "lite" as const,
    mainPattern: "DI",
    subPattern: "SS",
    displayCode: "DI-SS",
    matches: [],
    facets: [],
    dimensions: [],
    auxiliary: [],
    stressPatterns: [],
    quality: { missing: "normal", variance: "normal", speed: "normal", extreme: "normal" },
    riskSignals: [],
    createdAt: new Date("2026-01-01T00:00:00Z"),
    expiresAt: new Date(Date.now() + 86400000),
    sessionId: "sess-1",
    userId: null,
    ...overrides,
  } as unknown as Parameters<typeof Object>[0];
}

function makePrisma(findResult: unknown): PrismaService {
  return {
    result: {
      findUnique: vi.fn(async () => findResult),
    },
  } as unknown as PrismaService;
}

describe("ResultsService.getByToken", () => {
  it("returns the projected result with pattern signatures resolved", async () => {
    const row = makeRow();
    const service = new ResultsService(makePrisma(row));
    const dto = await service.getByToken("t-abc");
    expect(dto.token).toBe("t-abc");
    expect(dto.code.display).toBe("DI-SS");
    expect(dto.patterns.main?.id).toBe("DI");
    expect(dto.patterns.main?.signature.color).toMatch(/^#/);
    expect(dto.patterns.sub?.id).toBe("SS");
  });

  it("returns sub=null when subPattern is null", async () => {
    const row = makeRow({ subPattern: null, displayCode: "DI" });
    const service = new ResultsService(makePrisma(row));
    const dto = await service.getByToken("t-abc");
    expect(dto.patterns.sub).toBeNull();
    expect(dto.code.display).toBe("DI");
  });

  it("throws NotFoundException for missing token", async () => {
    const service = new ResultsService(makePrisma(null));
    await expect(service.getByToken("missing")).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });

  it("throws NotFoundException for expired result", async () => {
    const row = makeRow({ expiresAt: new Date(Date.now() - 86400000) });
    const service = new ResultsService(makePrisma(row));
    await expect(service.getByToken("t-abc")).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });
});
