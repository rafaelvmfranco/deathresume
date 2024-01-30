import { idSchema } from "@reactive-resume/schema";
import { createZodDto } from "nestjs-zod/dto";
import { z } from "nestjs-zod/z";

const currentCount = z.object({ current: z.number().nullable() });

export const usageSchema = z.object({
  id: z.string().optional(),
  userId: idSchema,
  usage: z.object({
    resumes: currentCount,
    downloads: currentCount,
    views: currentCount,
    alWords: currentCount,
  }),
});

export class UsageDto extends createZodDto(usageSchema) {}