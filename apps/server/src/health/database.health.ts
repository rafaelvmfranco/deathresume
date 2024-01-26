import { Injectable } from "@nestjs/common";
import { HealthIndicator, HealthIndicatorResult } from "@nestjs/terminus";
import { FirebaseService } from "../firebase/firebase.service";

@Injectable()
export class DatabaseHealthIndicator extends HealthIndicator {
  constructor(private readonly firebaseService: FirebaseService) {
    super();
  }

  async isHealthy(): Promise<HealthIndicatorResult> {
    try {
      await this.firebaseService.areAllCollectionsAvailable();
      return this.getStatus("database", true);
    } catch (error) {
      return this.getStatus("database", false, { message: error.message });
    }
  }
}
