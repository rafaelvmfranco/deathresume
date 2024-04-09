import { Module } from "@nestjs/common";

import { SubscriptionService } from "./subscription.service";
import { FirebaseModule } from "../firebase/firebase.module";
import { PlanModule } from "../plan/plan.module";
import { SubscriptionController } from "./subscription.controller";
import { UsageModule } from "../usage/usage.module";

@Module({
  imports: [FirebaseModule, PlanModule, UsageModule],
  controllers: [SubscriptionController],
  providers: [SubscriptionService, UsageModule],
  exports: [SubscriptionService],
})
export class SubscriptionModule {}
