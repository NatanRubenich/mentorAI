import { z } from 'zod';

export const trailCreateSchema = z.object({
  title: z.string().min(2).max(160),
  description: z.string().optional(),
  competencies: z.array(z.string()).default([]),
  topics: z.array(z.string()).default([]),
  skills: z.array(z.string()).default([]),
  active: z.boolean().optional(),
});

export const trailUpdateSchema = trailCreateSchema.partial();

export const idParamSchema = z.object({ id: z.string().uuid() });
