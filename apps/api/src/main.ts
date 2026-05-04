import "reflect-metadata";
import { ValidationPipe } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";
import type { NestExpressApplication } from "@nestjs/platform-express";
import helmet from "helmet";
import { AppModule } from "./app.module";

const DEFAULT_PORT = 4000;

function parseAllowedOrigins(): true | string[] {
  const raw = process.env.CORS_ALLOWED_ORIGINS?.trim();
  if (!raw || raw === "*") return true;
  return raw.split(",").map((s) => s.trim()).filter(Boolean);
}

async function bootstrap(): Promise<void> {
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
  const port = Number(process.env.PORT) || DEFAULT_PORT;
  await app.listen(port);
}

void bootstrap();
