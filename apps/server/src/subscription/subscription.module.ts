import { Module } from "@nestjs/common";

import { SubscriptionService } from "./subscription.service";
import { FirebaseModule } from "../firebase/firebase.module";
import { PlanModule } from "../plan/plan.module";
import { SubscriptionController } from "./subscription.controller";
import { UsageModule } from "../usage/usage.module";
import { ConfigService } from "@nestjs/config";
import { Config } from "../config/schema";
import { StripeModule } from "../stripe/stripe.module";

@Module({
  imports: [
    FirebaseModule,
    PlanModule,
    UsageModule,
    StripeModule.forRootAsync({
      inject: [ConfigService],
      useFactory: async (configService: ConfigService<Config>) => ({
        apiKey: configService.getOrThrow("STRIPE_API_KEY"),
        options: {
          apiVersion: "2024-04-10",
        },
      }),
    }),
  ],
  controllers: [SubscriptionController],
  providers: [SubscriptionService, UsageModule, StripeModule],
  exports: [SubscriptionService],
})
export class SubscriptionModule {}
