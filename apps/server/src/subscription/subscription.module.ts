import { Module } from "@nestjs/common";

import { SubscriptionService } from "./subscription.service";
import { FirebaseModule } from "../firebase/firebase.module";
import { PlanModule } from "../plan/plan.module";
import { SubscriptionController } from "./subscription.controller";

@Module({
  imports: [FirebaseModule, PlanModule],
  controllers: [SubscriptionController],
  providers: [SubscriptionService],
  exports: [SubscriptionService],
})
export class SubscriptionModule {}
