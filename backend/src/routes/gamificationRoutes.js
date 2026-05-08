import { Router } from 'express';
import { authenticate } from '../middlewares/authMiddleware.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { gamificationController } from '../controllers/gamificationController.js';

const router = Router();
router.use(authenticate);

/**
 * @openapi
 * /gamification:
 *   get:
 *     tags: [Gamificação]
 *     summary: Painel de XP, tier e badges (RF29/RF30)
 *     security: [{ bearerAuth: [] }]
 */
router.get('/', asyncHandler(gamificationController.dashboard));

export default router;
