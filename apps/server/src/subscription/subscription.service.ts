import { Injectable, Logger } from "@nestjs/common";

import { FirebaseService } from "../firebase/firebase.service";
import { SubscriptionDto, SubscriptionWithPlan, PlanDto } from "@reactive-resume/dto";
import { PlanService } from "../plan/plan.service";

@Injectable()
export class SubscriptionService {
  constructor(
    private readonly firebaseService: FirebaseService,
    private readonly planService: PlanService,
  ) {}

  async getByUserId(userId: string): Promise<SubscriptionWithPlan> {
    const subscription = (await this.firebaseService.findUnique("subscriptionCollection", {
      condition: {
        field: "userId",
        value: "d380omau47j3ts06h3fo6qda",
      },
    })) as SubscriptionDto;

    const planId = subscription.planId;

    const plan = (await this.firebaseService.findUniqueById("planCollection", planId)) as PlanDto;

    return {
      ...subscription,
      plan,
    };
  }

  async setDefaultSubscription(userId: string) {
    const freePlanId = await this.planService.getFreePlanId();

    return await this.firebaseService.create("subscriptionCollection", {
      dto: {
        planId: freePlanId,
        userId,
        period: { name: "year", monthlyPayments: 12 },
        payments: [],
        startPaymentAt: null,
        lastPaymentAt: null,
        activeUntil: Infinity,
        createdAt: new Date().toISOString(),
      },
    });
  }

  async stopSubscription(userId: string) {
    // stop payment

    return await this.firebaseService.deleteByField("subscriptionCollection", {
      condition: { field: "userId", value: userId },
    });
  }

  async successPayment(userId: string, planId: string, period: string, payment: any) {}

  async failedPayment(userId: string, planId: string, period: string, payment: any) {}
}
