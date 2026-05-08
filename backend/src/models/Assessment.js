import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../config/database.js';

export class Assessment extends Model {}

Assessment.init(
  {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    user_id: { type: DataTypes.UUID, allowNull: false },
    trail_id: { type: DataTypes.UUID, allowNull: false },
    type: {
      type: DataTypes.ENUM('diagnostica', 'progresso'),
      allowNull: false,
    },
    difficulty: {
      type: DataTypes.ENUM('iniciante', 'intermediario', 'avancado'),
      defaultValue: 'iniciante',
    },
    questions: { type: DataTypes.JSONB, allowNull: false, defaultValue: [] },
    answers: { type: DataTypes.JSONB, defaultValue: [] }, // respostas do aluno
    score: { type: DataTypes.FLOAT },
    metrics: { type: DataTypes.JSONB, defaultValue: {} }, // RF09 - métricas por tópico/habilidade
    feedback: { type: DataTypes.TEXT }, // RF23
    status: {
      type: DataTypes.ENUM('gerada', 'em_andamento', 'corrigida'),
      defaultValue: 'gerada',
    },
    submitted_at: { type: DataTypes.DATE },
  },
  { sequelize, modelName: 'Assessment', tableName: 'assessments' }
);
