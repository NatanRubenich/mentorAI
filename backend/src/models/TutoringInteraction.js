import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../config/database.js';

export class TutoringInteraction extends Model {}

TutoringInteraction.init(
  {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    user_id: { type: DataTypes.UUID, allowNull: false },
    trail_id: { type: DataTypes.UUID },
    topic: { type: DataTypes.STRING(160) },
    question: { type: DataTypes.TEXT, allowNull: false }, // RF17
    answer: { type: DataTypes.TEXT, allowNull: false }, // RF18
    level_used: { type: DataTypes.STRING(40) }, // RF18
  },
  { sequelize, modelName: 'TutoringInteraction', tableName: 'tutoring_interactions' }
);
