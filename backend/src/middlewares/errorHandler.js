import { AppError } from '../utils/AppError.js';
import { logger } from '../utils/logger.js';

// 404
export const notFoundHandler = (req, _res, next) => {
  next(new AppError(`Rota não encontrada: ${req.method} ${req.originalUrl}`, 404));
};

// Handler central
// eslint-disable-next-line no-unused-vars
export const errorHandler = (err, req, res, _next) => {
  const status = err.statusCode || 500;
  const payload = {
    error: err.name || 'Error',
    message: err.message || 'Erro interno do servidor.',
  };
  if (err.details) payload.details = err.details;

  if (status >= 500) {
    logger.error(err);
  } else {
    logger.warn(`${status} ${req.method} ${req.originalUrl} - ${err.message}`);
  }

  res.status(status).json(payload);
};
