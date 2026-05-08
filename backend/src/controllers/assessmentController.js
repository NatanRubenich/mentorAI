import { assessmentService } from '../services/assessmentService.js';
import { studyPlanService } from '../services/studyPlanService.js';

export const assessmentController = {
  async generate(req, res) {
    const assessment = await assessmentService.generate({
      userId: req.user.id,
      trailId: req.body.trail_id,
      type: req.body.type,
      numQuestions: req.body.num_questions,
    });
    // Não expõe correct_index para o aluno
    const json = assessment.toJSON();
    json.questions = json.questions.map(({ correct_index, ...rest }) => rest);
    res.status(201).json({ assessment: json });
  },

  async getById(req, res) {
    const assessment = await assessmentService.forStudentView(req.params.id, req.user);
    res.json({ assessment });
  },

  async submit(req, res) {
    const assessment = await assessmentService.submit({
      id: req.params.id,
      userId: req.user.id,
      answers: req.body.answers,
    });

    // Após avaliação corrigida: cria/ajusta plano de ensino automaticamente
    // (RF13 para diagnóstica / RF26 para progresso)
    let studyPlan = null;
    try {
      studyPlan =
        assessment.type === 'diagnostica'
          ? await studyPlanService.generateInitial({
              userId: req.user.id,
              trailId: assessment.trail_id,
              metrics: assessment.metrics,
              level: req.user.role === 'admin' ? 'iniciante' : undefined,
            })
          : await studyPlanService.adjustFromAssessment({
              userId: req.user.id,
              trailId: assessment.trail_id,
              metrics: assessment.metrics,
            });
    } catch (err) {
      // não derruba a submissão se IA falhar no plano; apenas loga via errorHandler em chamada manual
      studyPlan = { error: 'Não foi possível gerar/ajustar o plano automaticamente.' };
    }

    res.json({ assessment, study_plan: studyPlan });
  },

  async list(req, res) {
    const filters = {};
    if (req.query.trail_id) filters.trail_id = req.query.trail_id;
    if (req.query.type) filters.type = req.query.type;
    res.json({ assessments: await assessmentService.list(req.user.id, filters) });
  },
};
