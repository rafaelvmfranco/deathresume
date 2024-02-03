import { Module } from "@nestjs/common";

import { SubcriptionService } from "./subcription.service";
import { FirebaseModule } from "../firebase/firebase.module";
import { PlanModule } from "../plan/plan.module";

@Module({
  imports: [FirebaseModule, PlanModule],
  providers: [SubcriptionService],
  exports: [SubcriptionService],
})
export class SubcriptionModule {}
