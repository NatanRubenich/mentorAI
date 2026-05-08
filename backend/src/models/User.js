import { DataTypes, Model } from 'sequelize';
import bcrypt from 'bcrypt';
import { sequelize } from '../config/database.js';
import { env } from '../config/env.js';

export class User extends Model {
  async checkPassword(plain) {
    return bcrypt.compare(plain, this.password_hash);
  }

  toJSON() {
    const values = { ...this.get() };
    delete values.password_hash;
    return values;
  }
}

User.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    name: { type: DataTypes.STRING(120), allowNull: false },
    email: {
      type: DataTypes.STRING(160),
      allowNull: false,
      unique: true,
      validate: { isEmail: true },
    },
    password_hash: { type: DataTypes.STRING, allowNull: false },
    role: {
      type: DataTypes.ENUM('aluno', 'admin'),
      allowNull: false,
      defaultValue: 'aluno',
    },
    level: { type: DataTypes.STRING(40), allowNull: true }, // RF10
    xp: { type: DataTypes.INTEGER, defaultValue: 0 }, // RF29
    badges: { type: DataTypes.JSONB, defaultValue: [] }, // RF29
  },
  {
    sequelize,
    modelName: 'User',
    tableName: 'users',
  }
);

User.beforeSave(async (user) => {
  if (user.changed('password_hash') && user.password_hash && !user.password_hash.startsWith('$2')) {
    user.password_hash = await bcrypt.hash(user.password_hash, env.bcrypt.saltRounds);
  }
});
