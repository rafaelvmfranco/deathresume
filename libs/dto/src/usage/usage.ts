import { idSchema } from "@reactive-resume/schema";
import { createZodDto } from "nestjs-zod/dto";
import { z } from "nestjs-zod/z";

const currentCount = z.object({ current: z.number().default(0) });

export const usageSchema = z.object({
  id: z.string().optional(),
  userId: idSchema,
  resumes: currentCount,
  downloads: currentCount,
  views: currentCount,
  alWords: currentCount,
});

export class UsageDto extends createZodDto(usageSchema) {}

const updateFields = z.enum(["resumes", "downloads", "views", "alWords"]);
export type UpdateFields = z.infer<typeof updateFields>;

const actionTypes = z.enum(["increment", "decrement"]);
export type ChangeFieldAction = z.infer<typeof actionTypes>;

export type UpdateUsageDto = {
  action: z.infer<typeof actionTypes>;
  field: z.infer<typeof updateFields>;
};
