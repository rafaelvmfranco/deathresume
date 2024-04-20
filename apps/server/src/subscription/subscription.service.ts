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
    const period = subscription.period;

    const plan = (await this.firebaseService.findUniqueById("planCollection", planId)) as PlanDto;

    return {
      ...subscription,
      plan: { name: plan.name, ...plan[period] },
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

  async create(priceId: string, userEmail: string) {
    const customer = await this.stripeService.createCustomer(userEmail);

    // save customer id to subscription
    Logger.log("customer - subs service", JSON.stringify(customer));

    const session = await this.stripeService.createSubscription(priceId, customer.id);
    Logger.log("session - subs service", JSON.stringify(session));
    return session.url;
  }

  async update(priceId: string, subscriptionId: string) {
    const stripeSubscription = await this.stripeService.updateSubscription(priceId, subscriptionId);

    console.log("stripeSubscription", stripeSubscription);

    const interval = stripeSubscription.plan.interval;
    const planId = stripeSubscription.plan.id;

    const plans = await this.planService.getAll();
    const plan = (plans as unknown as any[]).find(
      (plan) => plan[interval].stripePriceId === planId,
    );

    console.log("plan", plan);

    // update local subscription with new plan

    // update updated plan
  }

  async stopSubscription(userId: string) {
    // fix: extract subscription id from subscription
    const subscriptionId = "";
    await this.stripeService.cancelSubscription(subscriptionId);

    return await this.firebaseService.deleteByField("subscriptionCollection", {
      condition: { field: "userId", value: userId },
    });
  }

  async handleWebhook(body: any, signature: string) {
    let event = null;
    try {
      event = await this.stripeService.constructEvent(body, signature);
    } catch (error) {
      console.log("error", error);
      Logger.error("Connection to Stripe failed:", error);
      throw new HttpException(`Webhook Error: ${error.message}`, HttpStatus.BAD_REQUEST);
    }

    await this.handleEvent(event);
  }

  async handleEvent(event: any) {
    console.log("event type", event.type);
    //console.log("event type", event);
    switch (event.type) {
      case "invoice.payment_succeeded":
        // update subscription //
        console.log("event - lines data", event.data.object.lines.data[0]);
        console.log("subscription id", event.data.object.subscription);
        console.log("customer id", event.data.object.customer);
        console.log("subscription details", event.data.object.subscription_details);
        console.log("subscription period end", event.data.object.period_end);
        console.log("subscription period real end", event.data.object.lines.data[0].period.end);
        console.log("subscription period real start", event.data.object.lines.data[0].period.start);

        console.log("subscription plan id", event.data.object.lines.data[0].plan.id);
        console.log("subscription plan interval", event.data.object.lines.data[0].plan.interval);
        // find by customer id :
        // - add subscription id
        // update period (calculate difference between timestamps)
        // startedPaymentAt - add
        // and date end of subscription
        // change plan id - how?? by price id
        break;

      case "subscription.updated":
        console.log("event", event);
        break;
      default:
        break;
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

    const plan = subscription.plan.max;

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
