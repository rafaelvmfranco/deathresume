import { Injectable, Logger } from "@nestjs/common";
import { HealthIndicator, HealthIndicatorResult } from "@nestjs/terminus";

import { FirebaseService } from "../firebase/firebase.service";

@Injectable()
export class StorageHealthIndicator extends HealthIndicator {
  constructor(
    private readonly firebaseService: FirebaseService,
  ) {
    super();
  }

  async isHealthy(): Promise<HealthIndicatorResult> {
    try {            
      await this.firebaseService.doesBucketExist();
      return this.getStatus("storage", true);
    } catch (error) {
      return this.getStatus("storage", false, { message: error.message });
    }
  }
}
