import { HttpModule } from "@nestjs/axios";
import { Module } from "@nestjs/common";

import { FirebaseModule } from "../firebase/firebase.module";
import { PrinterService } from "./printer.service";

@Module({
  imports: [HttpModule, FirebaseModule],
  providers: [PrinterService],
  exports: [PrinterService],
})
export class PrinterModule {}
