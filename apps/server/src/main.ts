import { Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { NestFactory } from "@nestjs/core";
import { NestExpressApplication } from "@nestjs/platform-express";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import * as Sentry from "@sentry/node";
import cookieParser from "cookie-parser";
import helmet from "helmet";
import { patchNestJsSwagger } from "nestjs-zod";

import { AppModule } from "./app.module";
import { Config } from "./config/schema";

patchNestJsSwagger();

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    rawBody: true,
    logger: process.env.NODE_ENV === "development" ? ["debug"] : ["error", "warn", "log"],
  });
  const configService = app.get(ConfigService<Config>);

  // Sentry
  // Error Reporting and Performance Monitoring
  const sentryDsn = configService.get("VITE_SENTRY_DSN");

  if (sentryDsn) {
    const express = app.getHttpAdapter().getInstance();

    Sentry.init({
      dsn: sentryDsn,
      tracesSampleRate: 1.0,
      profilesSampleRate: 1.0,
      integrations: [
        new Sentry.Integrations.Http({ tracing: true }),
        new Sentry.Integrations.Express({ app: express }),
        ...Sentry.autoDiscoverNodePerformanceMonitoringIntegrations(),
      ],
    });
  }

  // Cookie Parser
  app.use(cookieParser());

  // CORS
  app.enableCors({
    credentials: true,
    origin: [configService.get("CLIENT_URL")!],
  });

  // Helmet - enabled only in production
  if (process.env.NODE_ENV === "production") {
    app.use(helmet({ contentSecurityPolicy: false }));
  }

  // Global Prefix
  const globalPrefix = "api";
  app.setGlobalPrefix(globalPrefix);

  // Enable Shutdown Hooks
  app.enableShutdownHooks();

  // Swagger (OpenAPI Docs)
  // This can be accessed by visiting {SERVER_URL}/api/docs
  const config = new DocumentBuilder()
    .setTitle("Death Resume")
    .setDescription(
      "Death Resume is a resume builder that's built to make the mundane tasks of creating, updating and sharing your resume as easy as 1, 2, 3.",
    )
    .addCookieAuth("Authentication", { type: "http", in: "cookie", scheme: "Bearer" })
    .setVersion("4.0.0")
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup("docs", app, document);

  // Port
  const port = configService.get<number>("PORT") || 3000;

  await app.listen(port);

  Logger.log(`🚀 Server is up and running on port ${port}`, "Bootstrap");
}

bootstrap();
