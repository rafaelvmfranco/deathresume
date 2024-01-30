import { Module } from "@nestjs/common";

import { FirebaseModule } from "../firebase/firebase.module";
import { PlanController } from "./plan.controller";
import { PlanService } from "./plan.service";

@Module({
  imports: [FirebaseModule],
  controllers: [PlanController],
  providers: [PlanService],
  exports: [PlanService],
})
export class PlanModule {}
