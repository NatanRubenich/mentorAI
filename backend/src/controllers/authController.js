import { authService } from '../services/authService.js';

export const authController = {
  async register(req, res) {
    // RBAC: somente admin autenticado pode criar outro admin (RF03)
    const desiredRole = req.body.role;
    if (desiredRole === 'admin' && req.user?.role !== 'admin') {
      req.body.role = 'aluno';
    }
    const user = await authService.register(req.body);
    res.status(201).json({ user });
  },

  async login(req, res) {
    const { token, user } = await authService.login(req.body);
    res.json({ token, user });
  },

  async me(req, res) {
    const user = await authService.me(req.user.id);
    res.json({ user });
  },
};
