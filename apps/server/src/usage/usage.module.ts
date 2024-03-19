import { Module } from "@nestjs/common";

import { UsageService } from "./usage.service";
import { FirebaseModule } from "../firebase/firebase.module";
import { UsageController } from "./usage.controller";

@Module({
  imports: [FirebaseModule],
  controllers: [UsageController],
  providers: [UsageService],
  exports: [UsageService],
})
export class UsageModule {}
