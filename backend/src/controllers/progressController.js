import { progressService } from '../services/progressService.js';

export const progressController = {
  async history(req, res) {
    res.json({ logs: await progressService.history(req.user.id, req.query.trail_id) });
  },
  async evolution(req, res) {
    res.json(await progressService.evolution(req.user.id, req.params.trailId));
  },
  async compare(req, res) {
    res.json(await progressService.compare(req.user.id, req.params.trailId));
  },
};
