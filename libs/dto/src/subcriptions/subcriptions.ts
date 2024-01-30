import { idSchema } from "@reactive-resume/schema";
import { createZodDto } from "nestjs-zod/dto";
import { z } from "nestjs-zod/z";

import { planSchema } from "../plans";

const Period = z.enum(["month", "year"]);

const paymentContent = z.object({
  fakeData: z.string(),
});

export const subcriptionSchema = z.object({
  id: z.string().optional(),
  userId: idSchema,
  planId: idSchema,
  period: Period,
  payments: z.array(paymentContent),
  isPaidPlanActive: z.boolean().default(false)
});

export class SubcriptionDto extends createZodDto(subcriptionSchema) {}

export const subcriptionWithPlansSchema = subcriptionSchema.merge(z.object({ plan: planSchema }));

export class SubcriptionWithPlans extends createZodDto(subcriptionWithPlansSchema) {}
