import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../config/database.js';

export class Enrollment extends Model {}

Enrollment.init(
  {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    user_id: { type: DataTypes.UUID, allowNull: false },
    trail_id: { type: DataTypes.UUID, allowNull: false },
    status: {
      type: DataTypes.ENUM('ativo', 'concluido', 'pausado'),
      defaultValue: 'ativo',
    },
    started_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  },
  { sequelize, modelName: 'Enrollment', tableName: 'enrollments' }
);
