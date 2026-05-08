# MentorAI - Backend

Backend da Plataforma Web de Aprendizagem Adaptativa com IA Groq, desenvolvida na unidade curricular Desenvolvimento de Sistemas (Técnico em Desenvolvimento de Sistemas).

A IA atua como avaliadora e orientadora pedagógica: gera avaliações, corrige, define o nível do aluno, cria e ajusta o plano de ensino e fornece tutoria adaptada ao nível.

## Stack

- Node.js (ES Modules), Express
- PostgreSQL + Sequelize
- JWT + Bcrypt (autenticação e RBAC)
- Helmet + CORS + express-rate-limit
- Zod (validação)
- Swagger / OpenAPI (`/docs`)
- groq-sdk (integração com Groq AI no backend - chave nunca exposta)

## Arquitetura (MVC limpo)

```
src/
├── app.js                # construção do app Express
├── server.js             # bootstrap
├── config/               # env, database, swagger
├── models/               # Sequelize (User, Trail, Enrollment, Assessment, StudyPlan, TutoringInteraction, ProgressLog)
├── controllers/          # entrada HTTP - apenas orquestram
├── services/             # regras de negócio + integração Groq
├── routes/               # express Router por contexto + anotações OpenAPI
├── middlewares/          # auth, RBAC, validate (Zod), rate limiters, errorHandler
├── validators/           # schemas Zod
├── utils/                # AppError, asyncHandler, jwt, logger
└── scripts/              # syncDatabase, seed
```

## Mapeamento dos Requisitos Funcionais

| RF | Onde |
|----|------|
| RF01–RF03 (cadastro/login/RBAC) | `routes/authRoutes.js`, `middlewares/authMiddleware.js` |
| RF04–RF06 (trilhas) | `routes/trailRoutes.js`, `services/trailService.js` |
| RF07–RF10 (diagnóstica) | `services/assessmentService.js` (`generate`, `submit`) |
| RF11–RF12 (análise IA) | `services/groqService.js` (`analyzeAssessment`) |
| RF13–RF16, RF26 (plano de ensino) | `services/studyPlanService.js` |
| RF17–RF19 (tutoria) | `services/tutoringService.js` |
| RF20–RF23 (avaliações de progresso) | `services/assessmentService.js` (dificuldade adaptativa em `decideNextDifficulty`) |
| RF24–RF28 (evolução/histórico) | `services/progressService.js`, `models/ProgressLog.js` |
| RF29–RF30 (gamificação) | `services/gamificationService.js` |

## Configuração

1. Crie o banco no Postgres:
   ```sql
   CREATE DATABASE "mentorAI";
   ```
2. Copie `.env.example` para `.env` e preencha as variáveis.
3. Instale dependências:
   ```bash
   npm install
   ```
4. (Opcional) Rode o seed para criar admin/aluno e uma trilha:
   ```bash
   npm run db:seed
   ```
5. Suba o servidor:
   ```bash
   npm run dev
   ```

A API estará em `http://localhost:3000/api/v1` e a documentação Swagger em `http://localhost:3000/docs`.

## Segurança

- Chave da Groq lida apenas via `process.env` no backend (`config/env.js`). Nunca enviada ao cliente.
- Helmet + CORS configurável + JWT (HS256) + bcrypt (salt configurável).
- Rate limiting global e específico:
  - `authLimiter` para `/auth/*` (anti brute-force).
  - `aiLimiter` em todas as rotas que chamam Groq (`/assessments/generate`, `/assessments/:id/submit`, `/study-plans/:id/regenerate`, `/tutoring/ask`).
- RBAC por middleware `authorize('admin')` (criação/edição de trilhas).
- Validação de entrada com Zod (`middlewares/validate.js`).

## Fluxo pedagógico (resumo)

1. Aluno cadastra-se e faz login (`/auth/register`, `/auth/login`).
2. Escolhe trilha (`GET /trails`, `POST /trails/:id/enroll`).
3. Gera avaliação diagnóstica (`POST /assessments/generate` com `type=diagnostica`).
4. Submete respostas (`POST /assessments/:id/submit`) -> Groq corrige, calcula métricas e nível, e o sistema cria o plano de ensino inicial automaticamente.
5. Aluno consulta o plano (`GET /study-plans/:trailId/current`) e usa tutoria (`POST /tutoring/ask`).
6. Sob demanda, gera avaliação de progresso (`POST /assessments/generate` com `type=progresso`) - dificuldade evolui conforme desempenho. Após submissão, plano é ajustado.
7. Visualiza evolução em `GET /progress/:trailId/evolution` e gamificação em `GET /gamification`.

## Notas para a turma

- O `sequelize.sync({ alter: true })` é executado em desenvolvimento - em produção utilize migrations.
- O modelo padrão Groq pode ser trocado em `GROQ_MODEL` (ex.: `llama-3.1-70b-versatile`).
- Para trocar de provedor de IA (RNF16), basta criar outro service com a mesma interface de `groqService`.
