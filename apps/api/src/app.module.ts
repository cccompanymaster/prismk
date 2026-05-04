import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { HealthController } from "./health/health.controller";
import { ItemsModule } from "./items/items.module";
import { PrismaModule } from "./prisma/prisma.module";
import { ResponsesModule } from "./responses/responses.module";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    PrismaModule,
    ItemsModule,
    ResponsesModule,
  ],
  controllers: [HealthController],
  providers: [],
})
export class AppModule {}
