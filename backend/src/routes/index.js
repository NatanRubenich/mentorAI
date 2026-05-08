import { Router } from 'express';
import authRoutes from './authRoutes.js';
import trailRoutes from './trailRoutes.js';
import assessmentRoutes from './assessmentRoutes.js';
import studyPlanRoutes from './studyPlanRoutes.js';
import tutoringRoutes from './tutoringRoutes.js';
import progressRoutes from './progressRoutes.js';
import gamificationRoutes from './gamificationRoutes.js';

const router = Router();

router.get('/health', (_req, res) => res.json({ status: 'ok', uptime: process.uptime() }));

router.use('/auth', authRoutes);
router.use('/trails', trailRoutes);
router.use('/assessments', assessmentRoutes);
router.use('/study-plans', studyPlanRoutes);
router.use('/tutoring', tutoringRoutes);
router.use('/progress', progressRoutes);
router.use('/gamification', gamificationRoutes);

export default router;
