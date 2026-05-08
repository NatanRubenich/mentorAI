import { StudyPlan, Trail, User } from '../models/index.js';
import { AppError } from '../utils/AppError.js';
import { groqService } from './groqService.js';

export const studyPlanService = {
  /** RF13/RF14/RF15 */
  async generateInitial({ userId, trailId, metrics = {}, level }) {
    const trail = await Trail.findByPk(trailId);
    if (!trail) throw new AppError('Trilha não encontrada.', 404);
    const user = await User.findByPk(userId);
    const generated = await groqService.generateStudyPlan({
      trail,
      metrics,
      level: level || user?.level || 'iniciante',
    });

    // desativa planos anteriores da trilha
    await StudyPlan.update(
      { active: false },
      { where: { user_id: userId, trail_id: trailId, active: true } }
    );

    const lastVersion = await StudyPlan.max('version', {
      where: { user_id: userId, trail_id: trailId },
    });

    return StudyPlan.create({
      user_id: userId,
      trail_id: trailId,
      version: (lastVersion || 0) + 1,
      summary: generated.summary || '',
      priorities: generated.priorities || [],
      goals: generated.goals || [],
      contents: generated.contents || [],
      active: true,
    });
  },

  /** RF26 */
  async adjustFromAssessment({ userId, trailId, metrics }) {
    const current = await StudyPlan.findOne({
      where: { user_id: userId, trail_id: trailId, active: true },
      order: [['version', 'DESC']],
    });

    if (!current) {
      // Sem plano anterior, gera inicial
      return studyPlanService.generateInitial({ userId, trailId, metrics });
    }

    const trail = await Trail.findByPk(trailId);
    const user = await User.findByPk(userId);
    const adjusted = await groqService.adjustStudyPlan({
      trail,
      currentPlan: {
        summary: current.summary,
        priorities: current.priorities,
        goals: current.goals,
        contents: current.contents,
      },
      metrics,
      level: user?.level || 'iniciante',
    });

    current.active = false;
    await current.save();

    return StudyPlan.create({
      user_id: userId,
      trail_id: trailId,
      version: current.version + 1,
      summary: adjusted.summary || current.summary,
      priorities: adjusted.priorities || current.priorities,
      goals: adjusted.goals || current.goals,
      contents: adjusted.contents || current.contents,
      active: true,
    });
  },

  /** RF16 */
  async getCurrent(userId, trailId) {
    const plan = await StudyPlan.findOne({
      where: { user_id: userId, trail_id: trailId, active: true },
      order: [['version', 'DESC']],
    });
    if (!plan) throw new AppError('Plano de ensino ainda não gerado para esta trilha.', 404);
    return plan;
  },

  history: (userId, trailId) =>
    StudyPlan.findAll({
      where: { user_id: userId, trail_id: trailId },
      order: [['version', 'DESC']],
    }),
};
