import { Controller, Get, Header } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";

@Controller("health")
export class HealthController {
  constructor(private readonly prisma: PrismaService) {}

  @Get()
  @Header("Cache-Control", "no-store")
  async check(): Promise<{
    status: "ok" | "degraded";
    timestamp: string;
    checks: { db: "ok" | "fail" };
  }> {
    let db: "ok" | "fail" = "ok";
    try {
      await this.prisma.$queryRaw`SELECT 1`;
    } catch {
      db = "fail";
    }
    return {
      status: db === "ok" ? "ok" : "degraded",
      timestamp: new Date().toISOString(),
      checks: { db },
    };
  }
}
