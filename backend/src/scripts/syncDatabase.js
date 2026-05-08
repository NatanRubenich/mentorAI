import { sequelize } from '../config/database.js';
import '../models/index.js';
import { logger } from '../utils/logger.js';

const run = async () => {
  try {
    await sequelize.authenticate();
    await sequelize.sync({ alter: true });
    logger.info('Banco de dados sincronizado com sucesso.');
    process.exit(0);
  } catch (err) {
    logger.error('Falha ao sincronizar banco:', err);
    process.exit(1);
  }
};

run();
