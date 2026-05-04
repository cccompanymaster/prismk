import type { Item } from "@prism-k/data";
import type { TestVersion } from "@prism-k/types";

const DEFAULT_API_BASE = "http://localhost:4000/api";

export function apiBase(): string {
  if (typeof process !== "undefined" && process.env.NEXT_PUBLIC_API_BASE) {
    return process.env.NEXT_PUBLIC_API_BASE;
  }
  return DEFAULT_API_BASE;
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${apiBase()}${path}`, {
    ...init,
    headers: { "content-type": "application/json", ...(init?.headers ?? {}) },
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`API ${res.status} ${res.statusText}: ${text}`);
  }
  return (await res.json()) as T;
}

export async function fetchItems(version: TestVersion): Promise<{ version: TestVersion; items: Item[] }> {
  return request(`/items?version=${version}`);
}

export async function submitResponses(payload: {
  version: TestVersion;
  responses: { itemId: number; value: number }[];
  elapsedSeconds?: number;
}): Promise<{ token: string }> {
  return request(`/responses`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export interface ResultDto {
  token: string;
  version: TestVersion;
  code: { main: string; sub: string | null; display: string };
  patterns: {
    main: { id: string; name: string; slogan: string; signature: { color: string; word: string; animal: string } } | null;
    sub: { id: string; name: string; slogan: string; signature: { color: string; word: string; animal: string } } | null;
  };
  matches: unknown;
  facets: unknown;
  dimensions: unknown;
  auxiliary: unknown;
  stressPatterns: unknown;
  quality: unknown;
  riskSignals: { id: string; name: string; message: string; resources: string[] }[];
  createdAt: string;
  expiresAt: string | null;
}

export async function fetchResult(token: string): Promise<ResultDto> {
  return request(`/results/${encodeURIComponent(token)}`);
}

export interface MatchOutcomeDto {
  pair: string;
  pairKor: string;
  context: "work" | "friend" | "love" | "family";
  contextLabel: string;
  conflict: string;
  complement: string;
  advice: string;
  fallback: boolean;
  participants: {
    a: { token: string; mainPattern: string; name: string | null; slogan: string | null };
    b: { token: string; mainPattern: string; name: string | null; slogan: string | null };
  };
}

export async function postMatch(payload: {
  tokenA: string;
  tokenB: string;
  context: "work" | "friend" | "love" | "family";
}): Promise<MatchOutcomeDto> {
  return request(`/match`, { method: "POST", body: JSON.stringify(payload) });
}
