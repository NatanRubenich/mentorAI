import { User } from '../models/index.js';
import { AppError } from '../utils/AppError.js';

const LEVEL_TIERS = [
  { name: 'Bronze', min: 0 },
  { name: 'Prata', min: 100 },
  { name: 'Ouro', min: 300 },
  { name: 'Platina', min: 700 },
  { name: 'Diamante', min: 1500 },
];

const tierFor = (xp) => [...LEVEL_TIERS].reverse().find((t) => xp >= t.min) || LEVEL_TIERS[0];

export const gamificationService = {
  async dashboard(userId) {
    const user = await User.findByPk(userId);
    if (!user) throw new AppError('Usuário não encontrado.', 404);
    const tier = tierFor(user.xp || 0);
    return {
      xp: user.xp || 0,
      tier: tier.name,
      next_tier: LEVEL_TIERS.find((t) => t.min > (user.xp || 0))?.name || null,
      badges: user.badges || [],
      level: user.level,
    };
  },

  async grantBadge(userId, badge) {
    const user = await User.findByPk(userId);
    if (!user) throw new AppError('Usuário não encontrado.', 404);
    const badges = user.badges || [];
    if (!badges.includes(badge)) {
      badges.push(badge);
      user.badges = badges;
      await user.save();
    }
    return user;
  },
};
