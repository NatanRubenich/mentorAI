import { gamificationService } from '../services/gamificationService.js';

export const gamificationController = {
  async dashboard(req, res) {
    res.json(await gamificationService.dashboard(req.user.id));
  },
};
