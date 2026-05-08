import { studyPlanService } from '../services/studyPlanService.js';

export const studyPlanController = {
  async getCurrent(req, res) {
    res.json({ plan: await studyPlanService.getCurrent(req.user.id, req.params.trailId) });
  },
  async history(req, res) {
    res.json({ plans: await studyPlanService.history(req.user.id, req.params.trailId) });
  },
  async regenerate(req, res) {
    const plan = await studyPlanService.generateInitial({
      userId: req.user.id,
      trailId: req.params.trailId,
      metrics: req.body?.metrics || {},
    });
    res.status(201).json({ plan });
  },
};
