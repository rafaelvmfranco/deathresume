import Stripe from 'stripe';

import { ConfigurableModuleBuilder } from '@nestjs/common';

export interface StripeModuleOptions {
    apiKey: string;
    options: Stripe.StripeConfig;
  }

export const { ConfigurableModuleClass, MODULE_OPTIONS_TOKEN } =
  new ConfigurableModuleBuilder<StripeModuleOptions>()
    .setClassMethodName('forRoot')
    .build();