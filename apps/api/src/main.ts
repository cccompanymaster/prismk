import "reflect-metadata";
import { ValidationPipe } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";
import type { NestExpressApplication } from "@nestjs/platform-express";
import helmet from "helmet";
import { AppModule } from "./app.module";
import { initSentry } from "./sentry";

const DEFAULT_PORT = 4000;

function parseAllowedOrigins(): true | string[] {
  const raw = process.env.CORS_ALLOWED_ORIGINS?.trim();
  if (!raw || raw === "*") return true;
  return raw.split(",").map((s) => s.trim()).filter(Boolean);
}

async function bootstrap(): Promise<void> {
  initSentry();
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    bodyParser: true,
  });
  app.set("trust proxy", true);
  app.use(helmet());
  app.enableCors({
    origin: parseAllowedOrigins(),
    credentials: false,
    methods: ["GET", "POST", "OPTIONS"],
  });
  app.setGlobalPrefix("api");
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );
  // Enables onModuleDestroy lifecycle on Prisma + other providers so SIGTERM /
  // SIGINT trigger a graceful disconnect before the process exits. Required
  // for clean rollouts on ECS / Cloudflare / k8s.
  app.enableShutdownHooks();
  const port = Number(process.env.PORT) || DEFAULT_PORT;
  await app.listen(port);

  const stop = async (signal: string): Promise<void> => {
    console.log(`[api] ${signal} received — closing gracefully`);
    await app.close();
    process.exit(0);
  };
  process.on("SIGTERM", () => void stop("SIGTERM"));
  process.on("SIGINT", () => void stop("SIGINT"));
}

void bootstrap();
