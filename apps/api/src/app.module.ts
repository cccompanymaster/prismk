import { Module, type MiddlewareConsumer, type NestModule } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { APP_GUARD } from "@nestjs/core";
import { ThrottlerGuard, ThrottlerModule } from "@nestjs/throttler";
import { IpMaskMiddleware } from "./common/ip-mask.middleware";
import { HealthController } from "./health/health.controller";
import { ItemsModule } from "./items/items.module";
import { MatchModule } from "./match/match.module";
import { PrismaModule } from "./prisma/prisma.module";
import { ResponsesModule } from "./responses/responses.module";
import { ResultsModule } from "./results/results.module";

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ThrottlerModule.forRoot([
      {
        name: "default",
        ttl: 60_000,
        limit: 30,
      },
    ]),
    PrismaModule,
    ItemsModule,
    ResponsesModule,
    ResultsModule,
    MatchModule,
  ],
  controllers: [HealthController],
  providers: [{ provide: APP_GUARD, useClass: ThrottlerGuard }],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer): void {
    consumer.apply(IpMaskMiddleware).forRoutes("*");
  }
}
