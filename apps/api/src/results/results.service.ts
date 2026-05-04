import { Injectable, NotFoundException } from "@nestjs/common";
import type { Result as ResultRow } from "@prisma/client";
import { findPattern } from "@prism-k/data";
import { PrismaService } from "../prisma/prisma.service";

export interface ResultDto {
  token: string;
  version: "lite" | "full";
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
  riskSignals: unknown;
  createdAt: string;
  expiresAt: string | null;
}

function project(row: ResultRow): ResultDto {
  const main = findPattern(row.mainPattern);
  const sub = row.subPattern ? findPattern(row.subPattern) : null;
  return {
    token: row.token,
    version: row.version,
    code: {
      main: row.mainPattern,
      sub: row.subPattern,
      display: row.displayCode,
    },
    patterns: {
      main: main
        ? {
            id: main.id,
            name: main.name,
            slogan: main.shortSlogan,
            signature: {
              color: main.signature.color,
              word: main.signature.word,
              animal: main.signature.animal,
            },
          }
        : null,
      sub: sub
        ? {
            id: sub.id,
            name: sub.name,
            slogan: sub.shortSlogan,
            signature: {
              color: sub.signature.color,
              word: sub.signature.word,
              animal: sub.signature.animal,
            },
          }
        : null,
    },
    matches: row.matches,
    facets: row.facets,
    dimensions: row.dimensions,
    auxiliary: row.auxiliary,
    stressPatterns: row.stressPatterns,
    quality: row.quality,
    riskSignals: row.riskSignals,
    createdAt: row.createdAt.toISOString(),
    expiresAt: row.expiresAt?.toISOString() ?? null,
  };
}

@Injectable()
export class ResultsService {
  constructor(private readonly prisma: PrismaService) {}

  async getByToken(token: string): Promise<ResultDto> {
    const row = await this.prisma.result.findUnique({ where: { token } });
    if (!row) throw new NotFoundException(`Result not found for token`);
    if (row.expiresAt && row.expiresAt.getTime() < Date.now()) {
      throw new NotFoundException(`Result has expired`);
    }
    return project(row);
  }
}
