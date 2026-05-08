import { TutoringInteraction, User } from '../models/index.js';
import { groqService } from './groqService.js';

export const tutoringService = {
  /** RF17/RF18/RF19 */
  async ask({ userId, trailId, topic, question }) {
    const user = await User.findByPk(userId);
    const level = user?.level || 'iniciante';
    const answer = await groqService.tutor({ topic, question, level });

    return TutoringInteraction.create({
      user_id: userId,
      trail_id: trailId || null,
      topic: topic || null,
      question,
      answer,
      level_used: level,
    });
  },

  history: (userId, trailId) =>
    TutoringInteraction.findAll({
      where: { user_id: userId, ...(trailId ? { trail_id: trailId } : {}) },
      order: [['createdAt', 'DESC']],
      limit: 50,
    }),
};
