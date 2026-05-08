import { tutoringService } from '../services/tutoringService.js';

export const tutoringController = {
  async ask(req, res) {
    const interaction = await tutoringService.ask({
      userId: req.user.id,
      trailId: req.body.trail_id,
      topic: req.body.topic,
      question: req.body.question,
    });
    res.status(201).json({ interaction });
  },
  async history(req, res) {
    res.json({
      interactions: await tutoringService.history(req.user.id, req.query.trail_id),
    });
  },
};
