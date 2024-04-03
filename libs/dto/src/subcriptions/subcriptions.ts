import { idSchema } from "@reactive-resume/schema";
import { createZodDto } from "nestjs-zod/dto";
import { z } from "nestjs-zod/z";

import { planSchema } from "../plans";

const PeriodNameSchema = z.enum(["month", "year"]);

const Period = z.object({
  name: PeriodNameSchema,
  monthlyPayments: z.number().refine((value) => value === 1 || value === 12),
});

const paymentContent = z.object({
  fakeData: z.string(),
});

export const subcriptionSchema = z.object({
  id: z.string().optional(),
  userId: idSchema,
  planId: idSchema,
  period: Period,
  payments: z.array(paymentContent),
  startPaymentAt: z.union([z.null(), z.number()]),
  lastPaymentAt: z.union([z.null(), z.number()]),
  activeUntil: z.number().refine((value) => value === Infinity || Number.isFinite(value)),
  createdAt: z.number(),
});

export class SubcriptionDto extends createZodDto(subcriptionSchema) {}

export const subcriptionWithPlanSchema = subcriptionSchema.merge(z.object({ plan: planSchema }));

export class SubcriptionWithPlan extends createZodDto(subcriptionWithPlanSchema) {}

export type PeriodName = z.infer<typeof PeriodNameSchema>
export type Period = z.infer<typeof Period>;
