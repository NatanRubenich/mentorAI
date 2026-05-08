import { z } from 'zod';

export const generateAssessmentSchema = z.object({
  trail_id: z.string().uuid(),
  type: z.enum(['diagnostica', 'progresso']),
  num_questions: z.number().int().min(3).max(20).optional(),
});

export const submitAssessmentSchema = z.object({
  answers: z
    .array(
      z.object({
        question_id: z.number().int(),
        selected_index: z.number().int().min(0).max(10),
      })
    )
    .min(1),
});

export const idParamSchema = z.object({ id: z.string().uuid() });
