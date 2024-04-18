import { HttpException, HttpStatus, Injectable, Logger } from "@nestjs/common";

import { FirebaseService } from "../firebase/firebase.service";
import { SubscriptionDto, SubscriptionWithPlan, PlanDto } from "@reactive-resume/dto";
import { PlanService } from "../plan/plan.service";
import { ErrorMessage } from "@reactive-resume/utils";
import { UsageService } from "../usage/usage.service";
import { StripeService } from "../stripe/stripe.service";

@Injectable()
export class SubscriptionService {
  constructor(
    private readonly firebaseService: FirebaseService,
    private readonly planService: PlanService,
    private readonly usageService: UsageService,
    private readonly stripeService: StripeService,
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
        period: "year",
        payment: null,
        startPaymentAt: null,
        lastPaymentAt: null,
        activeUntil: new Date().setFullYear(new Date().getFullYear() + 1),
        createdAt: Date.now(),
      },
    });
  }

  async create(priceId: string, userEmail: string){
      const customer = await this.stripeService.createCustomer(userEmail);

      const session = await this.stripeService.createSubscription(priceId, customer.id);
      Logger.log("session - subs service", JSON.stringify(session));
      return session.url;
  }

  async update(priceId: string, subscriptionId: string) {
    const stripeSubscription = await this.stripeService.updateSubscription(priceId, subscriptionId);


    const interval = stripeSubscription.plan.interval;
    const planId = stripeSubscription.plan.id;

    const plans = (await this.planService.getAll());
    const plan = (plans as unknown as any[]).find((plan) => plan[interval].stripePriceId === planId);
  }
  async stopSubscription(userId: string) {

    // fix: extract subscription id from subscription
    const subscriptionId = ""
    await this.stripeService.cancelSubscription(subscriptionId);

    return await this.firebaseService.deleteByField("subscriptionCollection", {
      condition: { field: "userId", value: userId },
    });
  }

  async handleWebhook(body: any, signature: string) {
console.log("handleWebhook - service")
    let event = null;
      try {
        event = await this.stripeService.constructEvent(body, signature);
      } catch (error){
        console.log("handleWebhook - service - 1", error.message)
        throw new HttpException(`Webhook Error: ${error.message}`, HttpStatus.BAD_REQUEST);
      }
  }

  async isSubscriptionPaid(userId: string) {
    const subscription = await this.getByUserId(userId);
    return Boolean(subscription.activeUntil > new Date().getTime());
  }

  async findRealUsage(userId: string) {
    const usage = await this.usageService.findOneByUserId(userId);
    const subscription = await this.getByUserId(userId);

    const period = subscription.period;

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
}
