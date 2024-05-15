import { z } from "nestjs-zod/z";

export const configSchema = z.object({
  NODE_ENV: z.enum(["development", "production"]).default("production"),

  IS_CONTAINER: z.string().default("false"),
  
  // Ports
  PORT: z.coerce.number().default(3000),

  __DEV__CLIENT_URL: z.string().optional(),
  __CLIENT_URL: z.string().url().optional(),

  // URLs
  PUBLIC_URL: z.string().url(),

  // Authentication Secrets
  ACCESS_TOKEN_SECRET: z.string(),
  REFRESH_TOKEN_SECRET: z.string(),

  // Browser
  CHROME_TOKEN: z.string(),
  CHROME_URL: z.string().url(),

  // Mail Server
  MAIL_FROM: z.string().includes("@").optional().default("noreply@localhost"),
  SMTP_URL: z.string().url().startsWith("smtp://").optional(),

  // Storage
  STORAGE_BUCKET: z.string(),

  // Redis
  REDIS_URL: z.string().optional(),
  REDIS_URL_CONTAINER: z.string().optional(),
  REDIS_PASSWORD: z.string().optional(),

  // Sentry
  VITE_SENTRY_DSN: z.string().url().startsWith("https://").optional(),

  // Crowdin (Optional)
  CROWDIN_PROJECT_ID: z.coerce.number().optional(),
  CROWDIN_PERSONAL_TOKEN: z.string().optional(),

  // Email (Optional)
  DISABLE_EMAIL_AUTH: z
    .string()
    .default("false")
    .transform((s) => s !== "false" && s !== "0"),

  // GitHub (OAuth)
  GITHUB_CLIENT_ID: z.string().optional(),
  GITHUB_CLIENT_SECRET: z.string().optional(),
  GITHUB_CALLBACK_URL: z.string().url().optional(),

  // Google (OAuth)
  GOOGLE_CLIENT_ID: z.string().optional(),
  GOOGLE_CLIENT_SECRET: z.string().optional(),
  GOOGLE_CALLBACK_URL: z.string().url().optional(),

  // Stripe
  STRIPE_API_KEY: z.string().optional(),
  CLIENT_STRIPE_CUSTOMER_PORTAL_URL: z.string().url().optional(),
  STRIPE_CREATE_SUCCESS_URL: z.string().optional(),
  STRIPE_WEBHOOK_SECRET: z.string().optional(),
});

export type Config = z.infer<typeof configSchema>;
