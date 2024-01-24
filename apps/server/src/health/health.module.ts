import { Module } from "@nestjs/common";
import { TerminusModule } from "@nestjs/terminus";
import { RedisHealthModule } from "@songkeys/nestjs-redis-health";

import { PrinterModule } from "../printer/printer.module";
import { FirebaseModule } from "../firebase/firebase.module";
import { BrowserHealthIndicator } from "./browser.health";
import { DatabaseHealthIndicator } from "./database.health";
import { HealthController } from "./health.controller";
import { StorageHealthIndicator } from "./storage.health";

@Module({
  imports: [TerminusModule, PrinterModule, FirebaseModule, RedisHealthModule],
  controllers: [HealthController],
  providers: [DatabaseHealthIndicator, BrowserHealthIndicator, StorageHealthIndicator],
})
export class HealthModule {}
