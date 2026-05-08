import { Router } from 'express';
import { z } from 'zod';
import { authenticate } from '../middlewares/authMiddleware.js';
import { validate } from '../middlewares/validate.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { progressController } from '../controllers/progressController.js';

const router = Router();
router.use(authenticate);

const trailIdParam = z.object({ trailId: z.string().uuid() });

/**
 * @openapi
 * /progress/history:
 *   get:
 *     tags: [Progresso]
 *     summary: Histórico geral de progresso (RF27)
 *     security: [{ bearerAuth: [] }]
 */
router.get('/history', asyncHandler(progressController.history));

/**
 * @openapi
 * /progress/{trailId}/evolution:
 *   get:
 *     tags: [Progresso]
 *     summary: Série temporal de evolução (RF28)
 *     security: [{ bearerAuth: [] }]
 */
router.get(
  '/:trailId/evolution',
  validate({ params: trailIdParam }),
  asyncHandler(progressController.evolution)
);

/**
 * @openapi
 * /progress/{trailId}/compare:
 *   get:
 *     tags: [Progresso]
 *     summary: Compara duas últimas avaliações corrigidas (RF24)
 *     security: [{ bearerAuth: [] }]
 */
router.get(
  '/:trailId/compare',
  validate({ params: trailIdParam }),
  asyncHandler(progressController.compare)
);

export default router;
