import { Trail, Enrollment } from '../models/index.js';
import { AppError } from '../utils/AppError.js';

export const trailService = {
  list: () => Trail.findAll({ where: { active: true }, order: [['title', 'ASC']] }),

  async getById(id) {
    const trail = await Trail.findByPk(id);
    if (!trail) throw new AppError('Trilha não encontrada.', 404);
    return trail;
  },

  create: (data) => Trail.create(data),

  async update(id, data) {
    const trail = await trailService.getById(id);
    return trail.update(data);
  },

  async remove(id) {
    const trail = await trailService.getById(id);
    await trail.destroy();
  },

  async enroll(userId, trailId) {
    await trailService.getById(trailId);
    const [enrollment, created] = await Enrollment.findOrCreate({
      where: { user_id: userId, trail_id: trailId },
      defaults: { user_id: userId, trail_id: trailId },
    });
    if (!created) enrollment.status = 'ativo';
    await enrollment.save();
    return enrollment;
  },

  listEnrollments: (userId) =>
    Enrollment.findAll({ where: { user_id: userId }, include: [{ model: Trail }] }),
};
