import { idSchema } from "@reactive-resume/schema";
import { createZodDto } from "nestjs-zod/dto";
import { z } from "nestjs-zod/z";

export const secretsSchema = z.object({
  id: idSchema,
  password: z.string().nullable().default(null),
  lastSignedIn: z.date().or(z.dateString()),
  verificationToken: z.string().nullable(),
  twoFactorSecret: z.string().nullable(),
  twoFactorBackupCodes: z.array(z.string()).default([]),
  refreshToken: z.string().nullable(),
  resetToken: z.string().nullable(),
  userId: idSchema,
});

export class SecretsDto extends createZodDto(secretsSchema) {}
