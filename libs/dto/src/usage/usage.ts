import { idSchema } from "@reactive-resume/schema";
import { createZodDto } from "nestjs-zod/dto";
import { z } from "nestjs-zod/z";

const currentCount = z.object({ current: z.number().default(0) });

const updateFiels = z.enum(["resumes", "downloads", "views", "alWords"]);

export type UpdateFields = z.infer<typeof updateFiels>;

export const usageSchema = z.object({
  id: z.string().optional(),
  userId: idSchema,
  resumes: currentCount,
  downloads: currentCount,
  views: currentCount,
  alWords: currentCount,
});

export class UsageDto extends createZodDto(usageSchema) {}
