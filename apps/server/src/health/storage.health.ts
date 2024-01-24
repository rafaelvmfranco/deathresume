import { Injectable, Logger } from "@nestjs/common";
import { HealthIndicator, HealthIndicatorResult } from "@nestjs/terminus";

import { FirebaseRepository } from "../firebase/firebase.repository";

@Injectable()
export class StorageHealthIndicator extends HealthIndicator {
  constructor(
    private readonly firebaseRepository: FirebaseRepository,
  ) {
    super();
  }

  async isHealthy(): Promise<HealthIndicatorResult> {
    try {            
      await this.firebaseRepository.doesBucketExist();
      return this.getStatus("storage", true);
    } catch (error) {
      return this.getStatus("storage", false, { message: error.message });
    }
  }
}
