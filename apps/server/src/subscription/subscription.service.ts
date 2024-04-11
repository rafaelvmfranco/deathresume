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

  async findRealUsage(userId: string) {
    const usage = await this.usageService.findOneByUserId(userId);
    const subscription = await this.getByUserId(userId);

    const period = subscription.period.name;

    const plan = subscription.plan[period].max;

    const successAndErrors: Record<string, any> = {
      views: { success: true },
      resumes: { success: true },
      alWords: { success: true },
      downloads: { success: true },
    };

    if ((plan as any)?.views <= usage.views) {
      successAndErrors["views"] = {
        success: false,
        errorText: ErrorMessage.UsageLimitExceeded + "views",
      };
    }
    if ((plan as any)?.resumes <= usage.resumes) {
      successAndErrors["resumes"] = {
        success: false,
        errorText: ErrorMessage.UsageLimitExceeded + "resumes",
      };
    }
    if ((plan as any)?.alWords <= usage.alWords) {
      successAndErrors["alWords"] = {
        success: false,
        errorText: ErrorMessage.UsageLimitExceeded + "Al Words",
      };
    }
    if ((plan as any)?.downloads <= usage.downloads) {
      successAndErrors["downloads"] = {
        success: false,
        errorText: ErrorMessage.UsageLimitExceeded + "downloads",
      };
    }

    return successAndErrors;
  }

  async ifShowResume(userId: string) {
    const planUsage = await this.findRealUsage(userId);
    const isPaid = await this.isSubscriptionPaid(userId);

    return {
      ...planUsage,
      payment: {
        success: isPaid,
        errorText: isPaid ? "" : ErrorMessage.PaymentPeriodEnded,
      },
    };
  }

  async successPayment(userId: string, planId: string, period: string, payment: any) {}

  async failedPayment(userId: string, planId: string, period: string, payment: any) {}
}
