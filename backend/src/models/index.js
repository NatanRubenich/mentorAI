import { sequelize } from '../config/database.js';
import { User } from './User.js';
import { Trail } from './Trail.js';
import { Enrollment } from './Enrollment.js';
import { Assessment } from './Assessment.js';
import { StudyPlan } from './StudyPlan.js';
import { TutoringInteraction } from './TutoringInteraction.js';
import { ProgressLog } from './ProgressLog.js';

// Associações
User.hasMany(Enrollment, { foreignKey: 'user_id', onDelete: 'CASCADE' });
Enrollment.belongsTo(User, { foreignKey: 'user_id' });

Trail.hasMany(Enrollment, { foreignKey: 'trail_id', onDelete: 'CASCADE' });
Enrollment.belongsTo(Trail, { foreignKey: 'trail_id' });

User.hasMany(Assessment, { foreignKey: 'user_id', onDelete: 'CASCADE' });
Assessment.belongsTo(User, { foreignKey: 'user_id' });
Trail.hasMany(Assessment, { foreignKey: 'trail_id' });
Assessment.belongsTo(Trail, { foreignKey: 'trail_id' });

User.hasMany(StudyPlan, { foreignKey: 'user_id', onDelete: 'CASCADE' });
StudyPlan.belongsTo(User, { foreignKey: 'user_id' });
Trail.hasMany(StudyPlan, { foreignKey: 'trail_id' });
StudyPlan.belongsTo(Trail, { foreignKey: 'trail_id' });

User.hasMany(TutoringInteraction, { foreignKey: 'user_id', onDelete: 'CASCADE' });
TutoringInteraction.belongsTo(User, { foreignKey: 'user_id' });
Trail.hasMany(TutoringInteraction, { foreignKey: 'trail_id' });
TutoringInteraction.belongsTo(Trail, { foreignKey: 'trail_id' });

User.hasMany(ProgressLog, { foreignKey: 'user_id', onDelete: 'CASCADE' });
ProgressLog.belongsTo(User, { foreignKey: 'user_id' });
Trail.hasMany(ProgressLog, { foreignKey: 'trail_id' });
ProgressLog.belongsTo(Trail, { foreignKey: 'trail_id' });
Assessment.hasOne(ProgressLog, { foreignKey: 'assessment_id' });
ProgressLog.belongsTo(Assessment, { foreignKey: 'assessment_id' });

export {
  sequelize,
  User,
  Trail,
  Enrollment,
  Assessment,
  StudyPlan,
  TutoringInteraction,
  ProgressLog,
};
