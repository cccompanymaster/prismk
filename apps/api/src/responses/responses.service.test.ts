import { getItemsByVersion } from "@prism-k/data";
import { describe, expect, it, vi } from "vitest";
import type { PrismaService } from "../prisma/prisma.service";
import { ResponsesService } from "./responses.service";

function buildLiteResponses(value: 1 | 2 | 3 | 4 | 5 | 6 = 4) {
  return getItemsByVersion("lite").map((i) => ({ itemId: i.id, value }));
}

function buildFullResponses(value: 1 | 2 | 3 | 4 | 5 | 6 = 5) {
  return getItemsByVersion("full").map((i) => ({ itemId: i.id, value }));
}

interface CreatedSession { id: string }
interface CreatedResult { id: string; token: string; displayCode: string }

function makeMockPrisma(): {
  service: PrismaService;
  sessions: unknown[];
  results: unknown[];
} {
  const sessions: unknown[] = [];
  const results: unknown[] = [];
  const txClient = {
    responseSession: {
      create: vi.fn(async ({ data }: { data: unknown }) => {
        const row: CreatedSession = { id: `sess-${sessions.length + 1}` };
        sessions.push({ ...row, ...(data as object) });
        return row;
      }),
    },
    result: {
      create: vi.fn(async ({ data }: { data: { token: string; displayCode: string } }) => {
        const row: CreatedResult = {
          id: `res-${results.length + 1}`,
          token: data.token,
          displayCode: data.displayCode,
        };
        results.push({ ...row, ...data });
        return row;
      }),
    },
  };
  const prisma = {
    $transaction: vi.fn(async (fn: (tx: typeof txClient) => Promise<unknown>) => fn(txClient)),
  } as unknown as PrismaService;
  return { service: prisma, sessions, results };
}

describe("ResponsesService.submit", () => {
  it("returns a token and persists session + result for lite responses", async () => {
    const { service, sessions, results } = makeMockPrisma();
    const responses = new ResponsesService(service);
    const { token, result } = await responses.submit({
      version: "lite",
      responses: buildLiteResponses(4),
      elapsedSeconds: 360,
    });
    expect(token).toMatch(/[0-9a-f-]{36}/i);
    expect(sessions).toHaveLength(1);
    expect(results).toHaveLength(1);
    expect(result.token).toBe(token);
    expect(result.displayCode.length).toBeGreaterThan(0);
  });

  it("emits a valid display code for full responses (uniform 5)", async () => {
    const { service } = makeMockPrisma();
    const responses = new ResponsesService(service);
    const { result } = await responses.submit({
      version: "full",
      responses: buildFullResponses(5),
      elapsedSeconds: 1320,
    });
    // Either a single 2-letter code (e.g. "DI") or "MAIN-SUB" (e.g. "DI-SS").
    expect(result.displayCode).toMatch(/^[A-Z]{2}(-[A-Z]{2})?$/);
  });

  it("issues unique tokens across submissions", async () => {
    const { service } = makeMockPrisma();
    const responses = new ResponsesService(service);
    const a = await responses.submit({
      version: "lite",
      responses: buildLiteResponses(),
      elapsedSeconds: 360,
    });
    const b = await responses.submit({
      version: "lite",
      responses: buildLiteResponses(),
      elapsedSeconds: 360,
    });
    expect(a.token).not.toBe(b.token);
  });

  it("uses elapsedSeconds=0 default when not provided", async () => {
    const { service } = makeMockPrisma();
    const responses = new ResponsesService(service);
    const { token } = await responses.submit({
      version: "lite",
      responses: buildLiteResponses(),
    });
    expect(token).toBeDefined();
  });
});
