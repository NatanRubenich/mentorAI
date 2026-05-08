import { verifyToken } from '../utils/jwt.js';
import { AppError } from '../utils/AppError.js';

export const authenticate = (req, _res, next) => {
  try {
    const header = req.headers.authorization;
    if (!header?.startsWith('Bearer ')) {
      throw new AppError('Token de autenticação ausente.', 401);
    }
    const token = header.slice(7);
    const payload = verifyToken(token);
    req.user = { id: payload.sub, role: payload.role, email: payload.email };
    next();
  } catch (err) {
    if (err instanceof AppError) return next(err);
    next(new AppError('Token inválido ou expirado.', 401));
  }
};

export const authorize = (...roles) => (req, _res, next) => {
  if (!req.user) return next(new AppError('Não autenticado.', 401));
  if (!roles.includes(req.user.role)) {
    return next(new AppError('Acesso negado para este perfil.', 403));
  }
  next();
};
