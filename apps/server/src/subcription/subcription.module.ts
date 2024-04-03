import { Module } from "@nestjs/common";

import { SubcriptionService } from "./subcription.service";
import { FirebaseModule } from "../firebase/firebase.module";
import { PlanModule } from "../plan/plan.module";
import { SubcriptionController } from "./subcription.controller";

@Module({
  imports: [FirebaseModule, PlanModule],
  controllers: [SubcriptionController],
  providers: [SubcriptionService],
  exports: [SubcriptionService],
})
export class SubcriptionModule {}
