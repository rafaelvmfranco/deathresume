import { Injectable } from "@nestjs/common";

import { FirebaseService } from "../firebase/firebase.service";
import { PlanDto } from "@reactive-resume/dto";

@Injectable()
export class PlanService {
  constructor(private readonly firebaseService: FirebaseService) {}

  async getAll() {
    return await this.firebaseService.findMany("planCollection");
  }

  async createOne(data: PlanDto) {
    return await this.firebaseService.create("planCollection", { dto: data });
  }

  async getFreePlanId(): Promise<string> {
    const planId = await this.firebaseService.findDocId("planCollection", {
      condition: { field: "name", value: "free" },
    });

    return planId;
  }
}
