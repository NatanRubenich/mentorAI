import { Router } from 'express';
import { z } from 'zod';
import { authenticate } from '../middlewares/authMiddleware.js';
import { aiLimiter } from '../middlewares/rateLimiters.js';
import { validate } from '../middlewares/validate.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { tutoringController } from '../controllers/tutoringController.js';

const router = Router();
router.use(authenticate);

const askSchema = z.object({
  trail_id: z.string().uuid().optional(),
  topic: z.string().max(160).optional(),
  question: z.string().min(3).max(2000),
});

/**
 * @openapi
 * /tutoring/ask:
 *   post:
 *     tags: [Tutoria]
 *     summary: Solicita explicação à IA (RF17/RF18)
 *     security: [{ bearerAuth: [] }]
 */
router.post('/ask', aiLimiter, validate({ body: askSchema }), asyncHandler(tutoringController.ask));

/**
 * @openapi
 * /tutoring/history:
 *   get:
 *     tags: [Tutoria]
 *     summary: Histórico de interações (RF19)
 *     security: [{ bearerAuth: [] }]
 */
router.get('/history', asyncHandler(tutoringController.history));

export default router;
