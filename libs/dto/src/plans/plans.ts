import { createZodDto } from "nestjs-zod/dto";
import { z } from "nestjs-zod/z";


export const PlanNameSchema = z.enum(["free", "plus", "premium", "enterprise"]);

const maxContent = z.object({
  resumes: z.number().nullable(),
  downloads: z.number().nullable(),
  views: z.number().nullable(),
  alWords: z.number().nullable(),
});

const planContent = z.object({
  price: z.number(),
  max: maxContent,
});

export const planSchema = z.object({
  name: PlanNameSchema,
  year: planContent,
  month: planContent,
});

export class PlanDto extends createZodDto(planSchema) {}
export type PlanName = z.infer<typeof PlanNameSchema>;
