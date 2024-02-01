import { Module } from "@nestjs/common";

import { UsageService } from "./usage.service";
import { FirebaseModule } from "../firebase/firebase.module";

@Module({
  imports: [FirebaseModule],
  providers: [UsageService],
  exports: [UsageService],
})
export class UsageModule {}
