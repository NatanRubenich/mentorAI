import { Router } from 'express';
import { authenticate, authorize } from '../middlewares/authMiddleware.js';
import { validate } from '../middlewares/validate.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { trailController } from '../controllers/trailController.js';
import { trailCreateSchema, trailUpdateSchema, idParamSchema } from '../validators/trailValidators.js';

const router = Router();
router.use(authenticate);

/**
 * @openapi
 * /trails:
 *   get:
 *     tags: [Trilhas]
 *     summary: Lista trilhas (RF06)
 *     security: [{ bearerAuth: [] }]
 *     responses: { 200: { description: OK } }
 */
router.get('/', asyncHandler(trailController.list));
router.get('/:id', validate({ params: idParamSchema }), asyncHandler(trailController.getById));

router.get('/me/enrollments', asyncHandler(trailController.myEnrollments));
router.post('/:id/enroll', validate({ params: idParamSchema }), asyncHandler(trailController.enroll));

// Admin only (RF04/RF05)
router.post('/', authorize('admin'), validate({ body: trailCreateSchema }), asyncHandler(trailController.create));
router.put(
  '/:id',
  authorize('admin'),
  validate({ params: idParamSchema, body: trailUpdateSchema }),
  asyncHandler(trailController.update)
);
router.delete('/:id', authorize('admin'), validate({ params: idParamSchema }), asyncHandler(trailController.remove));

export default router;
