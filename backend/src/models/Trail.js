import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../config/database.js';

export class Trail extends Model {}

Trail.init(
  {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    title: { type: DataTypes.STRING(160), allowNull: false },
    description: { type: DataTypes.TEXT },
    competencies: { type: DataTypes.JSONB, defaultValue: [] }, // RF05
    topics: { type: DataTypes.JSONB, defaultValue: [] }, // RF05
    skills: { type: DataTypes.JSONB, defaultValue: [] }, // RF05
    active: { type: DataTypes.BOOLEAN, defaultValue: true },
  },
  { sequelize, modelName: 'Trail', tableName: 'trails' }
);
