import { sequelize, User, Trail } from '../models/index.js';
import { logger } from '../utils/logger.js';

const run = async () => {
  try {
    await sequelize.authenticate();
    await sequelize.sync({ alter: true });

    const [admin] = await User.findOrCreate({
      where: { email: 'admin@mentorai.local' },
      defaults: {
        name: 'Administrador',
        email: 'admin@mentorai.local',
        password_hash: 'admin123', // será criptografada pelo hook
        role: 'admin',
      },
    });

    const [aluno] = await User.findOrCreate({
      where: { email: 'aluno@mentorai.local' },
      defaults: {
        name: 'Aluno Teste',
        email: 'aluno@mentorai.local',
        password_hash: 'aluno123',
        role: 'aluno',
      },
    });

    const [trail] = await Trail.findOrCreate({
      where: { title: 'Lógica de Programação' },
      defaults: {
        title: 'Lógica de Programação',
        description: 'Fundamentos de algoritmos e lógica para iniciantes em desenvolvimento.',
        competencies: ['Resolução de problemas', 'Pensamento computacional'],
        topics: ['Variáveis', 'Estruturas condicionais', 'Estruturas de repetição', 'Funções', 'Vetores'],
        skills: ['Modelar problemas', 'Implementar algoritmos', 'Depurar código'],
        active: true,
      },
    });

    logger.info('Seed concluído.');
    logger.info(`Admin: ${admin.email} / admin123`);
    logger.info(`Aluno: ${aluno.email} / aluno123`);
    logger.info(`Trilha de exemplo: ${trail.title} (${trail.id})`);
    process.exit(0);
  } catch (err) {
    logger.error('Falha no seed:', err);
    process.exit(1);
  }
};

run();
