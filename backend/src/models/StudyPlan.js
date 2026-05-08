import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../config/database.js';

export class StudyPlan extends Model {}

StudyPlan.init(
  {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    user_id: { type: DataTypes.UUID, allowNull: false },
    trail_id: { type: DataTypes.UUID, allowNull: false },
    version: { type: DataTypes.INTEGER, defaultValue: 1 },
    priorities: { type: DataTypes.JSONB, defaultValue: [] }, // RF14
    goals: { type: DataTypes.JSONB, defaultValue: [] }, // RF14
    contents: { type: DataTypes.JSONB, defaultValue: [] }, // RF14
    summary: { type: DataTypes.TEXT },
    active: { type: DataTypes.BOOLEAN, defaultValue: true }, // RF15/RF16
  },
  { sequelize, modelName: 'StudyPlan', tableName: 'study_plans' }
);
