import { HttpException, HttpStatus, Injectable, Logger } from "@nestjs/common";

import { FirebaseService } from "../firebase/firebase.service";
import {
  SubscriptionDto,
  SubscriptionWithPlan,
  PlanDto,
  PeriodName,
  UserWithSecrets,
  UserDto,
} from "@reactive-resume/dto";
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

  async findByStripePriceId(priceId: string) {
    return await this.firebaseService.findUnique("subscriptionCollection", {
      condition: { field: "payment.priceId", value: priceId },
    });
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

  async create(user: UserDto, stripePriceId: string) {
    const customer = await this.stripeService.createCustomer(user.email);

    await this.firebaseService.updateItem(
      "subscriptionCollection",
      {
        condition: {
          field: "userId",
          value: user.id,
        },
      },
      {
        dto: {
          payment: {
            customerId: customer.id,
          },
        },
      },
    );

    const session = await this.stripeService.createSubscription(stripePriceId, customer.id);

    return session.url;
  }

  async update(priceId: string, subscriptionId: string) {
    const stripeSubscription = await this.stripeService.updateSubscription(priceId, subscriptionId);

    const interval = stripeSubscription.plan.interval as PeriodName;
    const planId = await this.planService.getPlanByPriceId(stripeSubscription.plan.id, interval);

    const updatedDto = {
      activeUntil: stripeSubscription.endPeriod,
      lastPaymentAt: new Date(),
      period: interval,
      planId,
    };

    const updated = await this.firebaseService.updateItem(
      "subscriptionCollection",
      {
        condition: {
          field: "payment.subscriptionId",
          value: subscriptionId,
        },
      },
      {
        dto: updatedDto,
      },
    );

    return updated;
  }

  async stopSubscription(userId: string) {

    const subscription = await this.firebaseService.findUnique("subscriptionCollection", {
      condition: { field: "userId", value: userId },
    });

    await this.stripeService.cancelSubscription(subscription.payment.subscriptionId);

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
        const priceId = event.data.object.lines.data[0].plan.id;
        const period = event.data.object.lines.data[0].plan.interval;

        const currentPlanId = await this.planService.getPlanByPriceId(priceId, period);

        const updatedDto = {
          activeUntil: event.data.object.lines.data[0].period.end,
          lastPaymentAt: event.data.object.lines.data[0].period.start,
          startPaymentAt: event.data.object.lines.data[0].period.start,
          period: event.data.object.lines.data[0].plan.interval,
          payment: {
            subscriptionId: event.data.object.subscription,
          },
          planId: currentPlanId,
        };

        const customerId = event.data.object.customer;

        await this.firebaseService.updateItem(
          "subscriptionCollection",
          {
            condition: {
              field: "payment.customerId",
              value: customerId,
            },
          },
          {
            dto: updatedDto,
          },
        );

        break;

      case "customer.subscription.updated":
        // cancel subscription case

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
