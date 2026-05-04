import { Injectable, NotFoundException } from "@nestjs/common";
import type { Result as ResultRow } from "@prisma/client";
import { findPattern, relationships, type Relationship } from "@prism-k/data";
import { PrismaService } from "../prisma/prisma.service";
import type { MatchContextKey, MatchRequestDto } from "./dto/match-request.dto";

const CONTEXT_LABEL: Record<MatchContextKey, string> = {
  work: "동료",
  friend: "친구",
  love: "연인",
  family: "가족(부부)",
};

export interface MatchOutcomeDto {
  pair: string;
  pairKor: string;
  context: MatchContextKey;
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

function buildPairKey(a: string, b: string): string {
  return `${a} × ${b}`;
}

function findRelationship(
  patternA: string,
  patternB: string,
): { entry: Relationship | undefined; reversed: boolean } {
  const direct = relationships.find((r) => r.pair === buildPairKey(patternA, patternB));
  if (direct) return { entry: direct, reversed: false };
  const reversed = relationships.find((r) => r.pair === buildPairKey(patternB, patternA));
  if (reversed) return { entry: reversed, reversed: true };
  return { entry: undefined, reversed: false };
}

function buildFallback(patternA: string, patternB: string): {
  entry: Pick<Relationship, "pair" | "pairKor" | "conflict" | "complement" | "advice">;
  fallback: true;
} {
  const a = findPattern(patternA);
  const b = findPattern(patternB);
  return {
    fallback: true,
    entry: {
      pair: buildPairKey(patternA, patternB),
      pairKor: a && b ? `${a.name} × ${b.name}` : buildPairKey(patternA, patternB),
      conflict: "두 패턴은 정해진 관계 매트릭스에 직접 대응되는 사례가 없어, 차이가 두드러지는 영역과 보완하는 영역을 일반 원리에서 추정합니다.",
      complement: "각 패턴의 강점을 서로 인정하고, 상대의 표현 방식이 자신의 문법과 다를 수 있음을 받아들이는 것이 시작점이 됩니다.",
      advice: "먼저 한 가지 영역에서 서로의 의도를 묻는 대화를 시도해 보세요. 가정으로 단정하지 않고 ‘어떻게 느꼈어?’의 한 문장으로 충분합니다.",
    },
  };
}

@Injectable()
export class MatchService {
  constructor(private readonly prisma: PrismaService) {}

  async match(dto: MatchRequestDto): Promise<MatchOutcomeDto> {
    const [a, b] = await Promise.all([
      this.loadResult(dto.tokenA, "tokenA"),
      this.loadResult(dto.tokenB, "tokenB"),
    ]);
    const { entry, reversed } = findRelationship(a.mainPattern, b.mainPattern);
    const fallback = !entry;
    const source = entry ?? buildFallback(a.mainPattern, b.mainPattern).entry;

    const outcome = await this.persist(dto, a, b, source, fallback);
    return {
      pair: source.pair,
      pairKor: source.pairKor,
      context: dto.context,
      contextLabel: CONTEXT_LABEL[dto.context],
      conflict: source.conflict,
      complement: source.complement,
      advice: source.advice,
      fallback,
      participants: {
        a: {
          token: a.token,
          mainPattern: reversed ? b.mainPattern : a.mainPattern,
          name: this.patternName(a.mainPattern),
          slogan: this.patternSlogan(a.mainPattern),
        },
        b: {
          token: b.token,
          mainPattern: reversed ? a.mainPattern : b.mainPattern,
          name: this.patternName(b.mainPattern),
          slogan: this.patternSlogan(b.mainPattern),
        },
      },
      ...{ outcome },
    };
  }

  private patternName(id: string): string | null {
    return findPattern(id)?.name ?? null;
  }

  private patternSlogan(id: string): string | null {
    return findPattern(id)?.shortSlogan ?? null;
  }

  private async loadResult(token: string, label: string): Promise<ResultRow> {
    const row = await this.prisma.result.findUnique({ where: { token } });
    if (!row) throw new NotFoundException(`Result not found for ${label}`);
    return row;
  }

  private persist(
    dto: MatchRequestDto,
    a: ResultRow,
    b: ResultRow,
    source: Pick<Relationship, "pair" | "pairKor" | "conflict" | "complement" | "advice">,
    fallback: boolean,
  ): Promise<unknown> {
    const expiresAt = new Date(Date.now() + 90 * 24 * 60 * 60 * 1000);
    return this.prisma.matchRecord.create({
      data: {
        tokenAId: a.id,
        tokenBId: b.id,
        context: dto.context,
        outcome: {
          pair: source.pair,
          pairKor: source.pairKor,
          conflict: source.conflict,
          complement: source.complement,
          advice: source.advice,
          fallback,
        } as unknown as never,
        expiresAt,
      },
    });
  }
}
