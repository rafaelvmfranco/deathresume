import { z } from "zod";

import { basicsSchema, defaultBasics } from "./basics";
import { defaultMetadata, metadataSchema } from "./metadata";
import { defaultSections, sectionsSchema } from "./sections";

// Schema
export const resumeDataSchema = z.object({
  basics: basicsSchema,
  sections: sectionsSchema,
  metadata: metadataSchema,
});

export const resumeDataSchemaWithStringifiedLayout = resumeDataSchema.extend({
  metadata: metadataSchema.extend({
    layout: z.string(),
  }),
});

// Type
export type ResumeData = z.infer<typeof resumeDataSchema>;

export type ResumeDataWithStringifiedLayout = z.infer<typeof resumeDataSchemaWithStringifiedLayout>;

// Defaults
export const defaultResumeData: ResumeData = {
  basics: defaultBasics,
  sections: defaultSections,
  metadata: defaultMetadata,
};

export * from "./basics";
export * from "./metadata";
export * from "./sample";
export * from "./sections";
export * from "./shared";
