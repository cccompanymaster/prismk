import { NotFoundException } from "@nestjs/common";
import { describe, expect, it, vi } from "vitest";
import type { PrismaService } from "../prisma/prisma.service";
import { MatchService } from "./match.service";

interface MockResult {
  id: string;
  token: string;
  mainPattern: string;
}

function row(token: string, mainPattern: string): MockResult {
  return { id: `id-${token}`, token, mainPattern };
}

function makePrisma(results: MockResult[]): PrismaService {
  return {
    result: {
      findUnique: vi.fn(async ({ where }: { where: { token: string } }) =>
        results.find((r) => r.token === where.token) ?? null,
      ),
    },
    matchRecord: {
      create: vi.fn(async ({ data }: { data: unknown }) => ({ id: "match-1", ...(data as object) })),
    },
  } as unknown as PrismaService;
}

describe("MatchService.match", () => {
  it("returns the relationship entry when DI × SN pair matches a fixture", async () => {
    const prisma = makePrisma([row("token-a", "DI"), row("token-b", "SN")]);
    const service = new MatchService(prisma);
    const out = await service.match({ tokenA: "token-a", tokenB: "token-b", context: "work" });
    expect(out.pair).toBe("DI × SN");
    expect(out.fallback).toBe(false);
    expect(out.contextLabel).toBe("동료");
    expect(out.participants.a.mainPattern).toBe("DI");
    expect(out.participants.b.mainPattern).toBe("SN");
    expect(out.conflict.length).toBeGreaterThan(0);
    expect(out.complement.length).toBeGreaterThan(0);
    expect(out.advice.length).toBeGreaterThan(0);
  });

  it("matches reversed pair (SN × DI) to the DI × SN fixture", async () => {
    const prisma = makePrisma([row("a", "SN"), row("b", "DI")]);
    const service = new MatchService(prisma);
    const out = await service.match({ tokenA: "a", tokenB: "b", context: "work" });
    expect(out.fallback).toBe(false);
    expect(out.pair).toBe("DI × SN");
  });

  it("falls back when pattern combo has no fixture", async () => {
    // FA × HH3? Pick two patterns whose combo isn't in relationships:
    // From data, FA has only FA × GC. So FA × CH should fall back.
    const prisma = makePrisma([row("a", "FA"), row("b", "CH")]);
    const service = new MatchService(prisma);
    const out = await service.match({ tokenA: "a", tokenB: "b", context: "friend" });
    expect(out.fallback).toBe(true);
    expect(out.conflict.length).toBeGreaterThan(0);
    expect(out.advice.length).toBeGreaterThan(0);
  });

  it("throws NotFoundException when tokenA missing", async () => {
    const prisma = makePrisma([row("b", "SN")]);
    const service = new MatchService(prisma);
    await expect(
      service.match({ tokenA: "missing", tokenB: "b", context: "work" }),
    ).rejects.toBeInstanceOf(NotFoundException);
  });

  it("throws NotFoundException when tokenB missing", async () => {
    const prisma = makePrisma([row("a", "DI")]);
    const service = new MatchService(prisma);
    await expect(
      service.match({ tokenA: "a", tokenB: "missing", context: "work" }),
    ).rejects.toBeInstanceOf(NotFoundException);
  });
});
