import { ZodError } from 'zod';
import { AppError } from '../utils/AppError.js';

export const validate = (schemas) => (req, _res, next) => {
  try {
    if (schemas.body) req.body = schemas.body.parse(req.body);
    if (schemas.params) req.params = schemas.params.parse(req.params);
    if (schemas.query) req.query = schemas.query.parse(req.query);
    next();
  } catch (err) {
    if (err instanceof ZodError) {
      return next(
        new AppError(
          'Dados inválidos.',
          422,
          err.issues.map((i) => ({ path: i.path.join('.'), message: i.message }))
        )
      );
    }
    next(err);
  }
};
