import Groq from 'groq-sdk';
import { env } from '../config/env.js';
import { AppError } from '../utils/AppError.js';
import { logger } from '../utils/logger.js';

/**
 * Encapsula chamadas ao Groq.
 * A API key NUNCA é exposta ao cliente - somente o backend acessa.
 * Atende RNF16 (troca de provedor de IA) por meio de uma única camada.
 */
class GroqService {
  constructor() {
    this.client = new Groq({ apiKey: env.groq.apiKey });
    this.model = env.groq.model;
  }

  async #chatJSON({ system, user, temperature = 0.4 }) {
    try {
      const completion = await this.client.chat.completions.create({
        model: this.model,
        temperature,
        response_format: { type: 'json_object' },
        messages: [
          { role: 'system', content: system },
          { role: 'user', content: user },
        ],
      });
      const content = completion.choices?.[0]?.message?.content || '{}';
      return JSON.parse(content);
    } catch (err) {
      logger.error('[groq] Falha ao consultar IA:', err.message);
      throw new AppError('Falha ao consultar a IA. Tente novamente.', 502);
    }
  }

  async #chatText({ system, user, temperature = 0.6 }) {
    try {
      const completion = await this.client.chat.completions.create({
        model: this.model,
        temperature,
        messages: [
          { role: 'system', content: system },
          { role: 'user', content: user },
        ],
      });
      return completion.choices?.[0]?.message?.content?.trim() || '';
    } catch (err) {
      logger.error('[groq] Falha ao consultar IA:', err.message);
      throw new AppError('Falha ao consultar a IA. Tente novamente.', 502);
    }
  }

  /** RF07/RF08/RF21 - Geração de avaliação (diagnóstica ou progresso). */
  async generateAssessment({ trail, type, difficulty = 'iniciante', numQuestions = 8 }) {
    const system =
      'Você é um avaliador pedagógico. Gere avaliações em JSON estrito, sem texto fora do JSON. ' +
      'Cada questão deve ter: id (número sequencial), statement (enunciado), options (array com 4 alternativas), ' +
      'correct_index (0-3), topic (string), skill (string), difficulty ("iniciante"|"intermediario"|"avancado"). ' +
      'O JSON raiz deve ter o formato: { "questions": [...] }.';
    const user = `Gere uma avaliação ${type === 'diagnostica' ? 'DIAGNÓSTICA' : 'DE PROGRESSO'} ` +
      `com ${numQuestions} questões objetivas, dificuldade predominante "${difficulty}", ` +
      `para a trilha "${trail.title}".\n` +
      `Descrição da trilha: ${trail.description || 'sem descrição'}\n` +
      `Competências: ${JSON.stringify(trail.competencies || [])}\n` +
      `Tópicos: ${JSON.stringify(trail.topics || [])}\n` +
      `Habilidades: ${JSON.stringify(trail.skills || [])}\n` +
      `Distribua as questões entre os tópicos/habilidades. Apenas JSON na resposta.`;
    const data = await this.#chatJSON({ system, user, temperature: 0.5 });
    if (!Array.isArray(data.questions) || data.questions.length === 0) {
      throw new AppError('A IA não retornou questões válidas.', 502);
    }
    return data.questions;
  }

  /** RF11/RF12 - Análise pedagógica + correção. Retorna métricas por tópico/habilidade. */
  async analyzeAssessment({ assessment, studentAnswers }) {
    const system =
      'Você é um analista pedagógico. Receberá uma avaliação corrigida e responderá em JSON estrito ' +
      'com a estrutura: { "score": number(0-100), "level": "iniciante"|"intermediario"|"avancado", ' +
      '"by_topic": { "<topico>": { "acertos": n, "total": n, "percent": n } }, ' +
      '"by_skill": { "<habilidade>": { "acertos": n, "total": n, "percent": n } }, ' +
      '"feedback": "string com feedback construtivo ao aluno", ' +
      '"strengths": ["..."], "weaknesses": ["..."] }.';
    const user = `Avaliação (questões com correct_index, topic e skill):\n${JSON.stringify(
      assessment.questions
    )}\n\nRespostas do aluno (array de { question_id, selected_index }):\n${JSON.stringify(
      studentAnswers
    )}\n\nCalcule métricas e gere feedback. Apenas JSON.`;
    return this.#chatJSON({ system, user, temperature: 0.2 });
  }

  /** RF13/RF14 - Geração do plano de ensino inicial a partir das métricas. */
  async generateStudyPlan({ trail, metrics, level }) {
    const system =
      'Você é um planejador pedagógico. Responda em JSON estrito: ' +
      '{ "summary": "string", "priorities": ["topico1","topico2"], ' +
      '"goals": [{ "title": "...", "description": "...", "deadline_days": n }], ' +
      '"contents": [{ "topic": "...", "skill": "...", "resources": ["..."], "activities": ["..."] }] }.';
    const user = `Trilha: ${trail.title}\nNível atual do aluno: ${level}\nMétricas: ${JSON.stringify(
      metrics
    )}\nGere um plano focado em sanar lacunas e fortalecer pontos fracos. Apenas JSON.`;
    return this.#chatJSON({ system, user, temperature: 0.5 });
  }

  /** RF26 - Ajuste do plano com base em nova avaliação. */
  async adjustStudyPlan({ trail, currentPlan, metrics, level }) {
    const system =
      'Você é um planejador pedagógico que ajusta planos de ensino. Responda em JSON estrito ' +
      'no mesmo formato do plano anterior, com alterações pontuais nas prioridades, metas e conteúdos.';
    const user = `Trilha: ${trail.title}\nNível atual: ${level}\nPlano atual: ${JSON.stringify(
      currentPlan
    )}\nNovas métricas: ${JSON.stringify(metrics)}\nAjuste o plano. Apenas JSON.`;
    return this.#chatJSON({ system, user, temperature: 0.4 });
  }

  /** RF17/RF18 - Tutoria: explicação adaptada ao nível do aluno. */
  async tutor({ topic, question, level = 'iniciante' }) {
    const system =
      `Você é um tutor pedagógico. Explique de forma clara e adaptada para um aluno de nível "${level}". ` +
      'Use linguagem objetiva, exemplos práticos e analogias quando ajudar. Quando fizer sentido, finalize com 1-3 perguntas para reflexão.';
    const user = `Tópico: ${topic || 'geral'}\nDúvida do aluno: ${question}`;
    return this.#chatText({ system, user, temperature: 0.6 });
  }
}

export const groqService = new GroqService();
