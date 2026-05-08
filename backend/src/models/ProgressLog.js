import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../config/database.js';

export class ProgressLog extends Model {}

ProgressLog.init(
  {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    user_id: { type: DataTypes.UUID, allowNull: false },
    trail_id: { type: DataTypes.UUID, allowNull: false },
    assessment_id: { type: DataTypes.UUID },
    previous_score: { type: DataTypes.FLOAT },
    current_score: { type: DataTypes.FLOAT },
    delta: { type: DataTypes.FLOAT },
    level: { type: DataTypes.STRING(40) },
    notes: { type: DataTypes.TEXT },
  },
  { sequelize, modelName: 'ProgressLog', tableName: 'progress_logs' }
);
