import { Injectable } from "@nestjs/common";

import { FirebaseService } from "../firebase/firebase.service";
import { SubcriptionDto, SubcriptionWithPlan, PlanDto } from "@reactive-resume/dto";
import { PlanService } from "../plan/plan.service";

@Injectable()
export class SubcriptionService {
  constructor(
    private readonly firebaseService: FirebaseService,
    private readonly planService: PlanService,
  ) {}

  async getByUserId(userId: string): Promise<SubcriptionWithPlan> {
    const subcription = (await this.firebaseService.findUnique("subcriptionCollection", {
      condition: {
        field: "userId",
        value: userId,
      },
    })) as SubcriptionDto;

    const planId = subcription.planId;

    const plan = (await this.firebaseService.findUnique("planCollection", {
      condition: {
        field: "id",
        value: planId,
      },
    })) as PlanDto;

    return {
      ...subcription,
      plan,
    };
  }

  async setDefaultSubcription(userId: string) {
    const freePlanId = await this.planService.getFreePlanId();

    return await this.firebaseService.create("subcriptionCollection", {
      dto: {
        planId: freePlanId,
        userId,
        period: "year",
        payments: [],
        isPaidPlanActive: false,
      },

    });
  }

  async stopSubcription(userId: string) {
    // stop payment

    return await this.firebaseService.deleteByField("subcriptionCollection", {
      condition: { field: "userId", value: userId },
    });
  }

  async successPayment(userId: string, planId: string, period: string, payment: any) {}

  async failedPayment(userId: string, planId: string, period: string, payment: any) {}
}
