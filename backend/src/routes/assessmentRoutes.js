import { Router } from 'express';
import { authenticate } from '../middlewares/authMiddleware.js';
import { validate } from '../middlewares/validate.js';
import { aiLimiter } from '../middlewares/rateLimiters.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { assessmentController } from '../controllers/assessmentController.js';
import {
  generateAssessmentSchema,
  submitAssessmentSchema,
  idParamSchema,
} from '../validators/assessmentValidators.js';

const router = Router();
router.use(authenticate);

/**
 * @openapi
 * /assessments:
 *   get:
 *     tags: [Avaliações]
 *     summary: Lista avaliações do aluno (RF24)
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: query
 *         name: trail_id
 *         schema: { type: string }
 *       - in: query
 *         name: type
 *         schema: { type: string, enum: [diagnostica, progresso] }
 *     responses: { 200: { description: OK } }
 */
router.get('/', asyncHandler(assessmentController.list));

/**
 * @openapi
 * /assessments/generate:
 *   post:
 *     tags: [Avaliações]
 *     summary: Gera avaliação via Groq (RF07/RF21)
 *     description: Diagnóstica ou de progresso. Dificuldade adaptativa (RF22).
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [trail_id, type]
 *             properties:
 *               trail_id: { type: string, format: uuid }
 *               type: { type: string, enum: [diagnostica, progresso] }
 *               num_questions: { type: integer, minimum: 3, maximum: 20 }
 *     responses: { 201: { description: Avaliação criada } }
 */
router.post(
  '/generate',
  aiLimiter,
  validate({ body: generateAssessmentSchema }),
  asyncHandler(assessmentController.generate)
);

/**
 * @openapi
 * /assessments/{id}:
 *   get:
 *     tags: [Avaliações]
 *     summary: Detalha avaliação (sem gabarito antes da submissão)
 *     security: [{ bearerAuth: [] }]
 *     parameters: [{ in: path, name: id, required: true, schema: { type: string } }]
 *     responses: { 200: { description: OK } }
 */
router.get('/:id', validate({ params: idParamSchema }), asyncHandler(assessmentController.getById));

/**
 * @openapi
 * /assessments/{id}/submit:
 *   post:
 *     tags: [Avaliações]
 *     summary: Submete respostas - corrige via Groq e atualiza plano (RF09/RF11/RF23/RF25/RF26)
 *     security: [{ bearerAuth: [] }]
 *     parameters: [{ in: path, name: id, required: true, schema: { type: string } }]
 *     responses: { 200: { description: Corrigida } }
 */
router.post(
  '/:id/submit',
  aiLimiter,
  validate({ params: idParamSchema, body: submitAssessmentSchema }),
  asyncHandler(assessmentController.submit)
);

export default router;
