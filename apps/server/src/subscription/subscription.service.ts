import { Injectable, Logger, NotFoundException } from "@nestjs/common";

import { FirebaseService } from "../firebase/firebase.service";
import { SubscriptionDto, SubscriptionWithPlan, PlanDto } from "@reactive-resume/dto";
import { PlanService } from "../plan/plan.service";
import { ErrorMessage } from "@reactive-resume/utils";
import { UsageService } from "../usage/usage.service";

@Injectable()
export class SubscriptionService {
  constructor(
    private readonly firebaseService: FirebaseService,
    private readonly planService: PlanService,
    private readonly usageService: UsageService,
  ) {}

  async getByUserId(userId: string): Promise<SubscriptionWithPlan> {
    const subscription = (await this.firebaseService.findUnique("subscriptionCollection", {
      condition: {
        field: "userId",
        value: userId,
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

  async isSubscriptionPaid(userId: string) {
    const subscription = await this.getByUserId(userId);
    return Boolean(subscription.activeUntil > new Date().getTime());
  }

  async isPlanedIsNotExceeded(userId: string) {
    const usage = await this.usageService.findOneByUserId(userId);
    const subscription = await this.getByUserId(userId);

    const period = subscription.period.name;

    const plan = subscription.plan[period].max;

    let usageErrorText = "";

    if (!plan || !usage) return false;

    if ((plan as any)?.views < usage.views) {
      usageErrorText += "views ";
    }
    if ((plan as any)?.resumes < usage.resumes) {
      usageErrorText += "resumes ";
    }
    if ((plan as any)?.alWords < usage.alWords) {
      usageErrorText += "Al Words ";
    }
    if ((plan as any)?.downloads < usage.downloads) {
      usageErrorText += "downloads";
    }

    if (usageErrorText.length > 0) {
      throw new Error(ErrorMessage.UsageLimitExceeded + usageErrorText);
    }

    return true;
  }

  async ifShowResume(userId: string) {
    const isPaid = await this.isSubscriptionPaid(userId);

    let errorText = isPaid ? "" : ErrorMessage.PaymentPeriodEnded + ". ";

    try {
      await this.isPlanedIsNotExceeded(userId);
    } catch (error) {
      errorText += error + ". ";
    }

    return errorText.length > 0 ?  { success: false, errorText } : { success: true } ;
  }

  async successPayment(userId: string, planId: string, period: string, payment: any) {}

  async failedPayment(userId: string, planId: string, period: string, payment: any) {}
}
