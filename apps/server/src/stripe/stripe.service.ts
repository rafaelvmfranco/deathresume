import { Inject, Injectable } from "@nestjs/common";
import Stripe from "stripe";
import { ConfigService } from "@nestjs/config";
import { Config } from "../config/schema";
import { MODULE_OPTIONS_TOKEN } from "./stripe.module-definition";

export interface StripeModuleOptions {
  apiKey: string;
  options: Stripe.StripeConfig;
}

@Injectable()
export class StripeService {
  public readonly stripe: Stripe;
  constructor(
    @Inject(MODULE_OPTIONS_TOKEN) private options: StripeModuleOptions,
    private readonly configService: ConfigService<Config>,
  ) {
    this.stripe = new Stripe(this.options.apiKey, this.options.options);
  }

  async get() {
    return await this.stripe.paymentIntents.list();
  }

  async handleWebhook(eventBody: any) {
    // depends on type of event
    console.log("eventBody", eventBody);
  }

  async createCustomer(userEmail: string) {
    const customer = await this.stripe.customers.create({
      email: userEmail,
    });

    return customer;
  }

  async createSubscription(productId: string, customerId: string) {
    const session = await this.stripe.checkout.sessions.create({
      mode: "subscription",
      payment_method_types: ["card"],
      line_items: [
        {
          price: productId,
          quantity: 1,
        },
      ],
      customer: customerId,
      success_url: this.configService.getOrThrow("STRIPE_CREATE_SUCCESS_URL"),
    });

    return session;
  }

  async updateSubscription(priceId: string, subscriptionId: string) {
    const currentSession = await this.stripe.subscriptions.retrieve(subscriptionId);

    // 1 user can have 1 item in subcription only
    const itemId = currentSession.items.data[0].id;

    const subscriptionItem = await this.stripe.subscriptionItems.update(itemId, {
      price: priceId,
    });

    const newSubscription = await this.stripe.subscriptions.retrieve(subscriptionId);

    return { endPeriod: newSubscription.current_period_end, ...subscriptionItem };
  }

  async cancelSubscription(subscriptionId: string) {
    // cancel immediately
    const subscription = await this.stripe.subscriptions.cancel(
      subscriptionId,
    );

    return subscription;
  }
}
