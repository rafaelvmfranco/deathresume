import { createZodDto } from "nestjs-zod/dto";
import { z } from "nestjs-zod/z";

const PlanName = z.enum(["free", "plus", "premium", "enterprise"]);

const maxCount = z.object({ max: z.number().nullable() });

const planContent = z.object({
  price: z.number(),
  resumes: maxCount,
  downloads: maxCount,
  views: maxCount,
  alWords: maxCount,
});

export const planSchema = z.object({
  id: z.string().optional(),
  name: PlanName,
  conditions: z.object({
    year: planContent,
    month: planContent,
  }),
});

export class PlanDto extends createZodDto(planSchema) {}
export type PlanName = z.infer<typeof PlanName>;