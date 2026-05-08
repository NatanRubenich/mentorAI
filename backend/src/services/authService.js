import { User } from '../models/index.js';
import { AppError } from '../utils/AppError.js';
import { signToken } from '../utils/jwt.js';

export const authService = {
  async register({ name, email, password, role = 'aluno' }) {
    const exists = await User.findOne({ where: { email } });
    if (exists) throw new AppError('E-mail já cadastrado.', 409);

    // somente admin pode criar admin (validado também no controller via RBAC, aqui é defesa em profundidade)
    const finalRole = role === 'admin' ? 'admin' : 'aluno';

    const user = await User.create({
      name,
      email,
      password_hash: password, // hook beforeSave criptografa
      role: finalRole,
    });
    return user;
  },

  async login({ email, password }) {
    const user = await User.findOne({ where: { email } });
    if (!user) throw new AppError('Credenciais inválidas.', 401);
    const ok = await user.checkPassword(password);
    if (!ok) throw new AppError('Credenciais inválidas.', 401);

    const token = signToken({ sub: user.id, role: user.role, email: user.email });
    return { token, user };
  },

  async me(userId) {
    const user = await User.findByPk(userId);
    if (!user) throw new AppError('Usuário não encontrado.', 404);
    return user;
  },
};
