import { ProgressLog, Assessment } from '../models/index.js';

export const progressService = {
  /** RF24/RF27/RF28 */
  history: (userId, trailId) =>
    ProgressLog.findAll({
      where: { user_id: userId, ...(trailId ? { trail_id: trailId } : {}) },
      order: [['createdAt', 'ASC']],
    }),

  async evolution(userId, trailId) {
    const logs = await progressService.history(userId, trailId);
    const series = logs.map((l) => ({
      date: l.createdAt,
      score: l.current_score,
      delta: l.delta,
      level: l.level,
    }));
    const last = logs[logs.length - 1];
    const first = logs[0];
    return {
      series,
      summary: {
        total_assessments: logs.length,
        first_score: first?.current_score ?? null,
        last_score: last?.current_score ?? null,
        overall_delta:
          first && last && first !== last ? last.current_score - first.current_score : 0,
        current_level: last?.level ?? null,
      },
    };
  },

  async compare(userId, trailId) {
    const last2 = await Assessment.findAll({
      where: { user_id: userId, trail_id: trailId, status: 'corrigida' },
      order: [['createdAt', 'DESC']],
      limit: 2,
    });
    if (last2.length < 2) {
      return { message: 'Necessário pelo menos duas avaliações corrigidas para comparar.' };
    }
    const [current, previous] = last2;
    return {
      previous: { id: previous.id, score: previous.score, metrics: previous.metrics },
      current: { id: current.id, score: current.score, metrics: current.metrics },
      delta: (current.score ?? 0) - (previous.score ?? 0),
    };
  },
};
