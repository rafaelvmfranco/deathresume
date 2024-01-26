import { Module } from "@nestjs/common";

import { AuthModule } from "@/server/auth/auth.module";
import { PrinterModule } from "@/server/printer/printer.module";

import { FirebaseModule } from "../firebase/firebase.module";
import { ResumeController } from "./resume.controller";
import { ResumeService } from "./resume.service";

@Module({
  imports: [AuthModule, PrinterModule, FirebaseModule],
  controllers: [ResumeController],
  providers: [ResumeService],
  exports: [ResumeService],
})
export class ResumeModule {}
