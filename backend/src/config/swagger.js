import swaggerJsdoc from 'swagger-jsdoc';
import { env } from './env.js';

export const swaggerSpec = swaggerJsdoc({
  definition: {
    openapi: '3.0.3',
    info: {
      title: 'MentorAI - API',
      version: '1.0.0',
      description:
        'Plataforma de Aprendizagem Adaptativa com IA (Groq). Atende RF01–RF30 e RNFs descritos na situação de aprendizagem.',
    },
    servers: [{ url: env.apiPrefix, description: 'API base' }],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
    tags: [
      { name: 'Auth', description: 'Cadastro e autenticação (RF01–RF03)' },
      { name: 'Trilhas', description: 'Trilhas de conhecimento (RF04–RF06)' },
      { name: 'Avaliações', description: 'Diagnóstica e progresso (RF07–RF10, RF20–RF23)' },
      { name: 'Plano de Ensino', description: 'Plano personalizado (RF13–RF16, RF26)' },
      { name: 'Tutoria', description: 'Estudo guiado (RF17–RF19)' },
      { name: 'Progresso', description: 'Histórico e evolução (RF24–RF28)' },
      { name: 'Gamificação', description: 'XP, tiers e badges (RF29–RF30)' },
    ],
  },
  apis: ['./src/routes/*.js'],
});
