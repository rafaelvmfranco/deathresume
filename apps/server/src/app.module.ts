import { HttpException, Module } from "@nestjs/common";
import { APP_INTERCEPTOR, APP_PIPE } from "@nestjs/core";
import { ServeStaticModule } from "@nestjs/serve-static";
import { RavenInterceptor, RavenModule } from "nest-raven";
import { ZodValidationPipe } from "nestjs-zod";
import { join } from "path";

import { AuthModule } from "./auth/auth.module";
import { CacheModule } from "./cache/cache.module";
import { ConfigModule } from "./config/config.module";
import { ContributorsModule } from "./contributors/contributors.module";
import { FirebaseModule } from "./firebase/firebase.module";
import { HealthModule } from "./health/health.module";
import { MailModule } from "./mail/mail.module";
import { PrinterModule } from "./printer/printer.module";
import { ResumeModule } from "./resume/resume.module";
import { TranslationModule } from "./translation/translation.module";
import { UserModule } from "./user/user.module";
import { UtilsModule } from "./utils/utils.module";
import { PlanModule } from "./plan/plan.module";
import { UsageModule } from "./usage/usage.module";
import { SubscriptionModule } from "./subscription/subscription.module";
import { StripeModule } from "./stripe/stripe.module";
import { ConfigService } from "@nestjs/config";
import { Config } from "./config/schema";

@Module({
  imports: [
    // Core Modules
    ConfigModule,
    FirebaseModule,
    MailModule,
    RavenModule,
    CacheModule,
    UtilsModule,
    HealthModule,

    // Feature Modules
    AuthModule.register(),
    UserModule,
    ResumeModule,
    PrinterModule,
    TranslationModule,
    ContributorsModule,
    PlanModule,
    UsageModule,
    SubscriptionModule,
    StripeModule.forRootAsync({
      inject: [ConfigService],
      useFactory: async (configService: ConfigService<Config>) => ({
        apiKey: configService.getOrThrow("STRIPE_API_KEY"),
        options: {
          apiVersion: "2024-04-10",
        },
      }),
    }),

    // Static Assets
    ServeStaticModule.forRoot({
      serveRoot: "/artboard",
      rootPath: join(__dirname, "..", "artboard"),
    }),
    ServeStaticModule.forRoot({
      renderPath: "/*",
      rootPath: join(__dirname, "..", "client"),
    }),
  ],
  providers: [
    {
      provide: APP_PIPE,
      useClass: ZodValidationPipe,
    },
    {
      provide: APP_INTERCEPTOR,
      useValue: new RavenInterceptor({
        filters: [
          // Filter all HttpException with status code <= 500
          {
            type: HttpException,
            filter: (exception: HttpException) => exception.getStatus() < 500,
          },
        ],
      }),
    },
  ],
})
export class AppModule {}
