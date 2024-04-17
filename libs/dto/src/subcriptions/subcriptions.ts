import { idSchema } from "@reactive-resume/schema";
import { createZodDto } from "nestjs-zod/dto";
import { z } from "nestjs-zod/z";

import { planSchema } from "../plans";

const PeriodNameSchema = z.enum(["month", "year"]);

const paymentContent = z.object({
  customerId: z.string(),
  subscriptionId: z.string(),
});

export const subscriptionSchema = z.object({
  id: z.string().optional(),
  userId: idSchema,
  planId: idSchema,
  period: PeriodNameSchema,
  payment: paymentContent.optional(),
  startPaymentAt: z.union([z.null(), z.number()]),
  lastPaymentAt: z.union([z.null(), z.number()]),
  activeUntil: z.number(),
  createdAt: z.number(),
});

export class SubscriptionDto extends createZodDto(subscriptionSchema) {}

export const subscriptionWithPlanSchema = subscriptionSchema.merge(z.object({ plan: planSchema }));

export class SubscriptionWithPlan extends createZodDto(subscriptionWithPlanSchema) {}

export type PeriodName = z.infer<typeof PeriodNameSchema>