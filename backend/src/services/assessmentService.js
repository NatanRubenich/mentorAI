import { Assessment, Trail, User, ProgressLog } from '../models/index.js';
import { AppError } from '../utils/AppError.js';
import { groqService } from './groqService.js';

const DIFFICULTY_PROGRESSION = {
  iniciante: 'intermediario',
  intermediario: 'avancado',
  avancado: 'avancado',
};

const DIFFICULTY_REGRESSION = {
  avancado: 'intermediario',
  intermediario: 'iniciante',
  iniciante: 'iniciante',
};

const decideNextDifficulty = (last) => {
  if (!last) return 'iniciante';
  const score = last.score ?? 0;
  if (score >= 75) return DIFFICULTY_PROGRESSION[last.difficulty] || 'intermediario';
  if (score < 50) return DIFFICULTY_REGRESSION[last.difficulty] || 'iniciante';
  return last.difficulty || 'iniciante';
};

export const assessmentService = {
  /** RF07/RF08/RF21 */
  async generate({ userId, trailId, type, numQuestions = 8 }) {
    const trail = await Trail.findByPk(trailId);
    if (!trail) throw new AppError('Trilha não encontrada.', 404);

    let difficulty = 'iniciante';
    if (type === 'progresso') {
      const last = await Assessment.findOne({
        where: { user_id: userId, trail_id: trailId, status: 'corrigida' },
        order: [['createdAt', 'DESC']],
      });
      difficulty = decideNextDifficulty(last); // RF22 - dificuldade adaptativa
    }

    const questions = await groqService.generateAssessment({
      trail,
      type,
      difficulty,
      numQuestions,
    });

    // Normaliza ids sequenciais para garantir consistência
    const normalized = questions.map((q, idx) => ({
      id: idx + 1,
      statement: q.statement,
      options: q.options,
      correct_index: q.correct_index,
      topic: q.topic,
      skill: q.skill,
      difficulty: q.difficulty || difficulty,
    }));

    return Assessment.create({
      user_id: userId,
      trail_id: trailId,
      type,
      difficulty,
      questions: normalized,
      status: 'gerada',
    });
  },

  async getById(id, user) {
    const assessment = await Assessment.findByPk(id);
    if (!assessment) throw new AppError('Avaliação não encontrada.', 404);
    if (user.role !== 'admin' && assessment.user_id !== user.id) {
      throw new AppError('Acesso negado a esta avaliação.', 403);
    }
    return assessment;
  },

  async forStudentView(id, user) {
    const assessment = await assessmentService.getById(id, user);
    // Aluno não deve ver correct_index antes de submeter
    const sanitized = {
      ...assessment.toJSON(),
      questions:
        assessment.status === 'corrigida'
          ? assessment.questions
          : assessment.questions.map(({ correct_index, ...rest }) => rest),
    };
    return sanitized;
  },

  /** RF09/RF10/RF11/RF12/RF23 + RF25/RF27 (histórico) */
  async submit({ id, userId, answers }) {
    const assessment = await Assessment.findByPk(id);
    if (!assessment) throw new AppError('Avaliação não encontrada.', 404);
    if (assessment.user_id !== userId) throw new AppError('Acesso negado.', 403);
    if (assessment.status === 'corrigida') {
      throw new AppError('Avaliação já foi corrigida.', 409);
    }

    // Análise via Groq (RF11/RF12/RF23)
    const analysis = await groqService.analyzeAssessment({
      assessment,
      studentAnswers: answers,
    });

    assessment.answers = answers;
    assessment.score = analysis.score;
    assessment.metrics = {
      by_topic: analysis.by_topic || {},
      by_skill: analysis.by_skill || {},
      strengths: analysis.strengths || [],
      weaknesses: analysis.weaknesses || [],
    };
    assessment.feedback = analysis.feedback || '';
    assessment.status = 'corrigida';
    assessment.submitted_at = new Date();
    await assessment.save();

    // RF10 - classificação do nível do aluno (atualiza User)
    const user = await User.findByPk(userId);
    if (user && analysis.level) {
      user.level = analysis.level;
      // RF29 - gamificação leve (XP por avaliação)
      user.xp = (user.xp || 0) + Math.round((analysis.score || 0) / 10);
      await user.save();
    }

    // RF24/RF25/RF27 - histórico
    const last = await ProgressLog.findOne({
      where: { user_id: userId, trail_id: assessment.trail_id },
      order: [['createdAt', 'DESC']],
    });
    await ProgressLog.create({
      user_id: userId,
      trail_id: assessment.trail_id,
      assessment_id: assessment.id,
      previous_score: last?.current_score ?? null,
      current_score: assessment.score,
      delta: last ? assessment.score - last.current_score : null,
      level: analysis.level,
      notes: analysis.feedback?.slice(0, 500),
    });

    return assessment;
  },

  list: (userId, filters = {}) =>
    Assessment.findAll({
      where: { user_id: userId, ...filters },
      order: [['createdAt', 'DESC']],
    }),
};
