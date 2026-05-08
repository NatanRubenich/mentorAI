import { Router } from 'express';
import { z } from 'zod';
import { authenticate } from '../middlewares/authMiddleware.js';
import { aiLimiter } from '../middlewares/rateLimiters.js';
import { validate } from '../middlewares/validate.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { studyPlanController } from '../controllers/studyPlanController.js';

const router = Router();
router.use(authenticate);

const trailIdParam = z.object({ trailId: z.string().uuid() });

/**
 * @openapi
 * /study-plans/{trailId}/current:
 *   get:
 *     tags: [Plano de Ensino]
 *     summary: Plano atual do aluno na trilha (RF16)
 *     security: [{ bearerAuth: [] }]
 *     parameters: [{ in: path, name: trailId, required: true, schema: { type: string } }]
 *     responses: { 200: { description: OK } }
 */
router.get('/:trailId/current', validate({ params: trailIdParam }), asyncHandler(studyPlanController.getCurrent));

/**
 * @openapi
 * /study-plans/{trailId}/history:
 *   get:
 *     tags: [Plano de Ensino]
 *     summary: Histórico de versões do plano
 *     security: [{ bearerAuth: [] }]
 */
router.get('/:trailId/history', validate({ params: trailIdParam }), asyncHandler(studyPlanController.history));

/**
 * @openapi
 * /study-plans/{trailId}/regenerate:
 *   post:
 *     tags: [Plano de Ensino]
 *     summary: Regera plano (Groq) - RF13
 *     security: [{ bearerAuth: [] }]
 */
router.post(
  '/:trailId/regenerate',
  aiLimiter,
  validate({ params: trailIdParam }),
  asyncHandler(studyPlanController.regenerate)
);

export default router;
