import { Module } from "@nestjs/common";

import { AuthModule } from "@/server/auth/auth.module";
import { PrinterModule } from "@/server/printer/printer.module";

import { FirebaseModule } from "../firebase/firebase.module";
import { ResumeController } from "./resume.controller";
import { ResumeService } from "./resume.service";
import { UsageModule } from "../usage/usage.module";
import { UsageService } from "../usage/usage.service";

@Module({
  imports: [AuthModule, PrinterModule, FirebaseModule, UsageModule],
  controllers: [ResumeController],
  providers: [ResumeService, UsageService],
  exports: [ResumeService],
})
export class ResumeModule {}
