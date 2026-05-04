import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { HealthController } from "./health/health.controller";
import { ItemsModule } from "./items/items.module";
import { MatchModule } from "./match/match.module";
import { PrismaModule } from "./prisma/prisma.module";
import { ResponsesModule } from "./responses/responses.module";
import { ResultsModule } from "./results/results.module";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    PrismaModule,
    ItemsModule,
    ResponsesModule,
    ResultsModule,
    MatchModule,
  ],
  controllers: [HealthController],
  providers: [],
})
export class AppModule {}
