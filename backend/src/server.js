import { buildApp } from './app.js';
import { env } from './config/env.js';
import { sequelize, testConnection } from './config/database.js';
import './models/index.js';
import { logger } from './utils/logger.js';

const start = async () => {
  try {
    await testConnection();
    // Em desenvolvimento sincroniza modelos automaticamente.
    if (env.nodeEnv !== 'production') {
      await sequelize.sync({ alter: true });
      logger.info('[db] Modelos sincronizados (alter:true).');
    }

    const app = buildApp();
    app.listen(env.port, () => {
      logger.info(`Servidor MentorAI rodando em http://localhost:${env.port}`);
      logger.info(`Documentação Swagger: http://localhost:${env.port}/docs`);
      logger.info(`API base: http://localhost:${env.port}${env.apiPrefix}`);
    });
  } catch (err) {
    logger.error('Falha ao iniciar o servidor:', err);
    process.exit(1);
  }
};

start();
