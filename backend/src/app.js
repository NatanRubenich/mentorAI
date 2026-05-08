import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import swaggerUi from 'swagger-ui-express';

import { env } from './config/env.js';
import { swaggerSpec } from './config/swagger.js';
import routes from './routes/index.js';
import { globalLimiter } from './middlewares/rateLimiters.js';
import { errorHandler, notFoundHandler } from './middlewares/errorHandler.js';
import { logger } from './utils/logger.js';

export const buildApp = () => {
  const app = express();

  // Segurança
  app.use(helmet());
  app.use(
    cors({
      origin: env.cors.origin === '*' ? true : env.cors.origin.split(',').map((o) => o.trim()),
      credentials: true,
    })
  );

  // Parsing
  app.use(express.json({ limit: '1mb' }));
  app.use(express.urlencoded({ extended: true }));

  // Log simples (RNF17)
  app.use((req, _res, next) => {
    logger.debug(`${req.method} ${req.originalUrl}`);
    next();
  });

  // Rate limit global
  app.use(globalLimiter);

  // Swagger / OpenAPI
  app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, { explorer: true }));
  app.get('/openapi.json', (_req, res) => res.json(swaggerSpec));

  // Rotas da API
  app.use(env.apiPrefix, routes);

  // 404 + erros
  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
};
