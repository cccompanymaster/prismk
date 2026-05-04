import { randomUUID } from "node:crypto";
import { Injectable } from "@nestjs/common";
import { Prisma, type Result as ResultRow } from "@prisma/client";
import { PrismaService } from "../prisma/prisma.service";
import type { SubmitResponsesDto } from "./dto/submit-responses.dto";
import { scoreResponses, type ScoringPayload } from "./scoring-orchestrator";

const RESULT_TTL_DAYS = 365;

@Injectable()
export class ResponsesService {
  constructor(private readonly prisma: PrismaService) {}

  async submit(dto: SubmitResponsesDto): Promise<{ token: string; result: ResultRow }> {
    const elapsedSeconds = dto.elapsedSeconds ?? 0;
    const payload = scoreResponses({
      version: dto.version,
      responses: dto.responses,
      elapsedSeconds,
    });
    const token = randomUUID();
    const expiresAt = new Date(Date.now() + RESULT_TTL_DAYS * 24 * 60 * 60 * 1000);

    const result = await this.persist(dto, payload, token, expiresAt);
    return { token, result };
  }

  private persist(
    dto: SubmitResponsesDto,
    payload: ScoringPayload,
    token: string,
    expiresAt: Date,
  ): Promise<ResultRow> {
    return this.prisma.$transaction(async (tx) => {
      const session = await tx.responseSession.create({
        data: {
          version: dto.version,
          responses: dto.responses as unknown as Prisma.InputJsonValue,
          completedAt: new Date(),
        },
      });

      return tx.result.create({
        data: {
          token,
          version: dto.version,
          mainPattern: payload.code.main,
          subPattern: payload.code.sub,
          displayCode: payload.code.display,
          matches: payload.matches as unknown as Prisma.InputJsonValue,
          facets: payload.facets as unknown as Prisma.InputJsonValue,
          dimensions: payload.dimensions as unknown as Prisma.InputJsonValue,
          auxiliary: payload.auxiliary as unknown as Prisma.InputJsonValue,
          stressPatterns: payload.stressPatterns as unknown as Prisma.InputJsonValue,
          quality: payload.quality as unknown as Prisma.InputJsonValue,
          riskSignals: payload.riskSignals as unknown as Prisma.InputJsonValue,
          expiresAt,
          sessionId: session.id,
        },
      });
    });
  }
}
