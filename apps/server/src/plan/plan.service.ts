import { Injectable } from "@nestjs/common";

import { FirebaseService } from "../firebase/firebase.service";
import { PlanDto } from "@reactive-resume/dto";

@Injectable()
export class PlanService {
  constructor(private readonly firebaseService: FirebaseService) {}

  async getAll() {
    return await this.firebaseService.findMany("planCollection");
  }

  async updateById(planId: string, data: PlanDto) {
    return await this.firebaseService.updateItem(
      "planCollection",
      { condition: { field: "id", value: planId } },
      { dto: data },
    );
  }

  async create(data: PlanDto) {
    return await this.firebaseService.create("planCollection", { dto: data });
  }

  async getFreePlanId() {
    const plan = (await this.firebaseService.findUnique("planCollection", {
      condition: {
        field: "name",
        value: "free",
      },
    })) as PlanDto;

    return plan.id;
  }
}
