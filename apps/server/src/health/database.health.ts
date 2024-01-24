import { Injectable } from "@nestjs/common";
import { HealthIndicator, HealthIndicatorResult } from "@nestjs/terminus";
import { FirebaseRepository } from "../firebase/firebase.repository";

@Injectable()
export class DatabaseHealthIndicator extends HealthIndicator {
  constructor(private readonly firebaseRepository: FirebaseRepository) {
    super();
  }

  async isHealthy(): Promise<HealthIndicatorResult> {
    try {
      await this.firebaseRepository.areAllCollectionsAvailable();
      return this.getStatus("database", true);
    } catch (error) {
      return this.getStatus("database", false, { message: error.message });
    }
  }
}
