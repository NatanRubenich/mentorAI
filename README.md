# MentorAI — Plataforma de Aprendizagem Adaptativa com IA Groq

> Situação de Aprendizagem — Curso Técnico em Desenvolvimento de Sistemas
> Unidade Curricular: **Desenvolvimento de Sistemas (25h)**
> Tema: *Desenvolvimento de Plataforma Web de Aprendizagem Adaptativa com IA para Personalização do Ensino*

Este repositório contém o **back-end** de uma plataforma educacional em que a Inteligência Artificial **Groq** atua como **avaliadora e orientadora pedagógica**: gera avaliações, corrige automaticamente, classifica o nível do aluno, cria/ajusta um plano de ensino personalizado e oferece tutoria adaptada — tudo de forma **autônoma, sem mentor humano** (RNF19).

---

## Sumário

- [Sobre o projeto](#sobre-o-projeto)
- [Atores e fluxos (Caso de Uso)](#atores-e-fluxos-caso-de-uso)
- [Stack](#stack)
- [Arquitetura (MVC limpo)](#arquitetura-mvc-limpo)
- [Mapeamento dos Requisitos Funcionais (RF01–RF30)](#mapeamento-dos-requisitos-funcionais-rf01rf30)
- [Como rodar](#como-rodar)
- [Como testar a API](#como-testar-a-api)
  - [Como aluno](#como-aluno)
  - [Como administrador](#como-administrador)
- [Segurança](#segurança)
- [Notas para a turma](#notas-para-a-turma)

---

## Sobre o projeto

A maioria das plataformas de e-learning oferece conteúdos **estáticos** e iguais para todos. O MentorAI parte de uma proposta diferente: **cada aluno percorre uma trilha única**, ajustada continuamente pela IA com base no seu desempenho real.

### O que o sistema faz

1. **Catálogo de Trilhas** — o admin cadastra trilhas de conhecimento (ex.: *Lógica de Programação*) com competências, tópicos e habilidades.
2. **Diagnóstico inicial** — o aluno escolhe uma trilha e a IA gera uma avaliação **diagnóstica** sob medida.
3. **Correção automática + classificação** — ao submeter, a IA corrige, calcula métricas por tópico/habilidade e define o nível do aluno (`iniciante` / `intermediario` / `avancado`).
4. **Plano de ensino personalizado** — a partir do diagnóstico, a IA gera um plano com prioridades, metas e conteúdos.
5. **Tutoria adaptativa** — o aluno pergunta, a IA explica em linguagem adequada ao seu nível atual.
6. **Avaliações de progresso** — sob demanda do aluno, novas provas são geradas. A **dificuldade evolui** conforme o desempenho (sobe se acerta ≥75 %, desce se acerta <50 %).
7. **Plano se ajusta sozinho** — após cada avaliação de progresso, a IA reescreve o plano focando nas lacunas que persistem.
8. **Histórico e evolução** — séries temporais, comparações entre avaliações e gamificação (XP, tiers e badges) para engajamento.

### Princípios de projeto

- **A IA é o cérebro pedagógico**, mas o **back-end é o guardião dos dados e da segurança** — a chave Groq nunca trafega para o cliente.
- **MVC limpo**: rotas finas, controllers magros, regras de negócio nos *services*, persistência nos *models*.
- **Provedor de IA plugável** (RNF16): toda comunicação com a Groq passa por `groqService`. Trocar para OpenAI, Gemini, etc. = criar outro service com a mesma interface.
- **Autonomia**: nenhuma operação pedagógica depende de um humano cadastrar prova, gabarito ou conteúdo.

---

## Atores e fluxos (Caso de Uso)

```
┌─────────┐                                              ┌──────────────────┐
│  Aluno  │                                              │ Groq AI (externo)│
└────┬────┘                                              └────────┬─────────┘
     │  Login/Cadastro                                            │
     ├──────────────────────────────────────────────►             │
     │  Escolhe Trilha                                            │
     ├──────────────────────────────────────────────►             │
     │  Solicita Avaliação Diagnóstica                            │
     ├──────────────────────────────────────────────────────────► │ gera questões
     │  ◄─── questões ─── corrige ─── plano inicial ◄─────────────┤
     │  Estuda pelo Plano + Tutoria sob demanda                   │
     ├──────────────────────────────────────────────────────────► │ explica
     │  Solicita Avaliação de Progresso (dificuldade adaptativa)  │
     ├──────────────────────────────────────────────────────────► │ gera/corrige/ajusta plano
     │  Visualiza Evolução, Histórico e Gamificação               │
     ├──────────────────────────────────────────────►             │
┌────┴────┐                                                       │
│  Admin  │                                                       │
└────┬────┘                                                       │
     │  Gerencia Trilhas (CRUD)                                   │
     ├──────────────────────────────────────────────►             │
```

> **Regras essenciais (do diagrama):**
> - Toda avaliação é **gerada e corrigida pela Groq**.
> - O plano se ajusta a cada nova avaliação de progresso.
> - A dificuldade evolui conforme o desempenho.
> - Histórico de provas e notas é **persistido**.
> - O sistema funciona **sem mentor humano**.

---

## Stack

- **Node.js 18+** com **ES Modules** (`type: module`)
- **Express** + **express-rate-limit** + **Helmet** + **CORS**
- **PostgreSQL** + **Sequelize**
- **JWT** (`jsonwebtoken`) + **Bcrypt**
- **Zod** (validação de entrada)
- **Swagger / OpenAPI 3** (`/docs`) via `swagger-jsdoc` + `swagger-ui-express`
- **groq-sdk** (única ponte com a IA, **somente no servidor**)
- **dotenv** (configuração)

---

## Arquitetura (MVC limpo)

```
backend/
└── src/
    ├── app.js               # construção do app Express (helmet, cors, swagger, rotas, error handler)
    ├── server.js            # bootstrap (conecta DB, sincroniza modelos em dev, ouve a porta)
    ├── config/              # env, database, swagger
    ├── models/              # Sequelize: User, Trail, Enrollment, Assessment,
    │                        # StudyPlan, TutoringInteraction, ProgressLog
    ├── controllers/         # entrada HTTP — apenas orquestram (sem regra de negócio)
    ├── services/            # regras de negócio + integração com Groq
    ├── routes/              # express.Router por contexto + anotações OpenAPI
    ├── middlewares/         # authenticate, authorize (RBAC), validate (Zod),
    │                        # rate limiters, errorHandler
    ├── validators/          # schemas Zod por contexto
    ├── utils/               # AppError, asyncHandler, jwt, logger
    └── scripts/             # syncDatabase, seed
```

---

## Mapeamento dos Requisitos Funcionais (RF01–RF30)

| RF | Descrição | Onde no código |
|----|-----------|----------------|
| RF01–RF03 | Cadastro, login JWT, RBAC | `routes/authRoutes.js`, `middlewares/authMiddleware.js`, `services/authService.js` |
| RF04–RF06 | CRUD de trilhas, associação de competências/tópicos/habilidades, escolha pelo aluno | `routes/trailRoutes.js`, `services/trailService.js`, `models/Trail.js`, `models/Enrollment.js` |
| RF07–RF10 | Geração da diagnóstica, personalização por trilha, registro de respostas/notas/métricas, classificação do nível | `services/assessmentService.js` (`generate`, `submit`), `services/groqService.js` (`generateAssessment`) |
| RF11–RF12 | Envio de dados pedagógicos à IA, análise por tópico/habilidade | `services/groqService.js` (`analyzeAssessment`) |
| RF13–RF16 | Geração, persistência e visualização do plano de ensino | `services/studyPlanService.js`, `models/StudyPlan.js`, `routes/studyPlanRoutes.js` |
| RF17–RF19 | Tutoria adaptada ao nível e registro das interações | `services/tutoringService.js`, `models/TutoringInteraction.js` |
| RF20–RF23 | Avaliações de progresso sob demanda, dificuldade adaptativa, correção automática + feedback | `services/assessmentService.js` (`decideNextDifficulty`) |
| RF24–RF28 | Comparação, atualização do progresso, ajuste contínuo do plano, histórico, evolução | `services/progressService.js`, `services/studyPlanService.js` (`adjustFromAssessment`), `models/ProgressLog.js` |
| RF29–RF30 | XP, tiers, badges e indicadores | `services/gamificationService.js` |

---

## Como rodar

> Todos os comandos abaixo são executados **dentro da pasta `backend/`**.

### 1. Pré-requisitos

- Node.js 18+
- PostgreSQL rodando localmente

### 2. Crie o banco

```bash
psql -U natanrubenich -h localhost -d postgres -c 'CREATE DATABASE "mentorAI";'
```

### 3. Configure o ambiente

```bash
cd backend
cp .env.example .env
# edite o .env com suas credenciais (DB, JWT_SECRET, GROQ_API_KEY)
```

### 4. Instale e popule

```bash
npm install
npm run db:seed   # cria admin, aluno e uma trilha de exemplo
```

O seed imprime as credenciais geradas:

```
Admin: admin@mentorai.local / admin123
Aluno: aluno@mentorai.local / aluno123
Trilha de exemplo: Lógica de Programação (<UUID>)
```

### 5. Suba o servidor

```bash
npm run dev
```

| Recurso | URL |
|---------|-----|
| Base da API | `http://localhost:3000/api/v1` |
| Swagger UI | `http://localhost:3000/docs` |
| OpenAPI JSON | `http://localhost:3000/openapi.json` |
| Health check | `http://localhost:3000/api/v1/health` |

---

## Como testar a API

A forma mais simples é pelo **Swagger** (`http://localhost:3000/docs`):
1. Faça login em `POST /auth/login` para obter o `token`.
2. Clique em **Authorize** no topo da página e cole `Bearer <token>` (o Swagger UI já adiciona o `Bearer` automaticamente — basta colar o token).
3. Execute as outras rotas.

Abaixo, fluxos completos via **cURL** para os dois perfis.

### Como aluno

> Use `aluno@mentorai.local / aluno123` (criado pelo seed).

#### 1) Login

```bash
TOKEN=$(curl -s -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"aluno@mentorai.local","password":"aluno123"}' \
  | jq -r .token)
```

> Sem `jq`? Imprima a resposta inteira e copie o `token` manualmente.

#### 2) Listar trilhas e se matricular

```bash
curl -s http://localhost:3000/api/v1/trails \
  -H "Authorization: Bearer $TOKEN" | jq

# pegue o UUID da trilha desejada e:
TRAIL_ID="<UUID_DA_TRILHA>"

curl -s -X POST http://localhost:3000/api/v1/trails/$TRAIL_ID/enroll \
  -H "Authorization: Bearer $TOKEN" | jq
```

#### 3) Gerar avaliação diagnóstica

```bash
ASSESSMENT_ID=$(curl -s -X POST http://localhost:3000/api/v1/assessments/generate \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d "{\"trail_id\":\"$TRAIL_ID\",\"type\":\"diagnostica\",\"num_questions\":5}" \
  | jq -r .assessment.id)

# ver as questões (sem gabarito)
curl -s http://localhost:3000/api/v1/assessments/$ASSESSMENT_ID \
  -H "Authorization: Bearer $TOKEN" | jq
```

#### 4) Submeter respostas

```bash
curl -s -X POST http://localhost:3000/api/v1/assessments/$ASSESSMENT_ID/submit \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "answers": [
      { "question_id": 1, "selected_index": 0 },
      { "question_id": 2, "selected_index": 2 },
      { "question_id": 3, "selected_index": 1 },
      { "question_id": 4, "selected_index": 3 },
      { "question_id": 5, "selected_index": 0 }
    ]
  }' | jq
```

A resposta traz a avaliação corrigida (score, métricas, feedback) **e** o plano de ensino gerado automaticamente.

#### 5) Consultar plano de ensino

```bash
curl -s http://localhost:3000/api/v1/study-plans/$TRAIL_ID/current \
  -H "Authorization: Bearer $TOKEN" | jq
```

#### 6) Pedir tutoria

```bash
curl -s -X POST http://localhost:3000/api/v1/tutoring/ask \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d "{
    \"trail_id\": \"$TRAIL_ID\",
    \"topic\": \"Estruturas de repetição\",
    \"question\": \"Qual a diferença entre while e for? Pode me dar exemplos?\"
  }" | jq
```

#### 7) Avaliação de progresso (dificuldade adaptativa)

```bash
NEW_ID=$(curl -s -X POST http://localhost:3000/api/v1/assessments/generate \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d "{\"trail_id\":\"$TRAIL_ID\",\"type\":\"progresso\",\"num_questions\":5}" \
  | jq -r .assessment.id)

# submete (mesmo formato do passo 4)
# após a submissão o plano é AJUSTADO automaticamente (RF26)
```

#### 8) Evolução, histórico e gamificação

```bash
curl -s http://localhost:3000/api/v1/progress/$TRAIL_ID/evolution \
  -H "Authorization: Bearer $TOKEN" | jq

curl -s http://localhost:3000/api/v1/progress/$TRAIL_ID/compare \
  -H "Authorization: Bearer $TOKEN" | jq

curl -s http://localhost:3000/api/v1/gamification \
  -H "Authorization: Bearer $TOKEN" | jq
```

---

### Como administrador

> Use `admin@mentorai.local / admin123` (criado pelo seed). O admin **não cadastra provas** — provas são sempre geradas pela IA. O admin **gerencia trilhas**.

#### 1) Login

```bash
ADMIN_TOKEN=$(curl -s -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@mentorai.local","password":"admin123"}' \
  | jq -r .token)
```

#### 2) Criar trilha (RF04/RF05)

```bash
curl -s -X POST http://localhost:3000/api/v1/trails \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "JavaScript Moderno",
    "description": "ES6+, Promises, async/await, módulos.",
    "competencies": ["Programação assíncrona", "Modularização"],
    "topics": ["let/const", "arrow functions", "Promises", "async/await", "import/export"],
    "skills": ["Refatorar código legado", "Tratar erros assíncronos"]
  }' | jq
```

#### 3) Editar trilha

```bash
curl -s -X PUT http://localhost:3000/api/v1/trails/$TRAIL_ID \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{ "description": "Descrição atualizada", "active": true }' | jq
```

#### 4) Cadastrar outro admin

Apenas admins autenticados podem criar outros admins (defesa em profundidade no `authController.register` — alunos que tentarem registrar `role: "admin"` viram `aluno`).

```bash
curl -s -X POST http://localhost:3000/api/v1/auth/register \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Outro Admin",
    "email": "admin2@mentorai.local",
    "password": "senhaSegura123",
    "role": "admin"
  }' | jq
```

#### 5) Remover trilha

```bash
curl -s -X DELETE http://localhost:3000/api/v1/trails/$TRAIL_ID \
  -H "Authorization: Bearer $ADMIN_TOKEN" -i
```

#### O que o admin **não** pode fazer

- ❌ Cadastrar prova manualmente (não existe endpoint — prova é sempre gerada pela IA).
- ❌ Submeter prova de outro usuário.
- ❌ Editar plano de ensino do aluno (gerado/ajustado pela IA).

---

## Segurança

- **Chave Groq isolada no servidor**: `config/env.js` lê `GROQ_API_KEY` apenas via `process.env`. O cliente **nunca** vê a chave.
- **Helmet** com headers de segurança padrão.
- **CORS** configurável via `CORS_ORIGIN` (use a URL do front, não `*` em produção).
- **JWT** (HS256) com `JWT_SECRET` forte e `JWT_EXPIRES_IN` ajustável.
- **Bcrypt** com salt configurável (`BCRYPT_SALT_ROUNDS`).
- **Rate limiting em três camadas**:
  - `globalLimiter` — todas as rotas (300 req / 15 min por IP).
  - `authLimiter` — `/auth/*` (20 req / 15 min — anti brute-force).
  - `aiLimiter` — todas as rotas que consultam Groq (15 req/min por usuário).
- **RBAC** via `authorize('admin')` nas rotas de gestão de trilhas.
- **Validação Zod** em body, params e query (rejeita payloads malformados antes de tocar no service).
- **Logs** centralizados (RNF17) em `utils/logger.js`.

---

## Notas para a turma

- Em desenvolvimento, `sequelize.sync({ alter: true })` cria/ajusta as tabelas automaticamente. **Em produção use migrations** (`sequelize-cli`).
- O modelo Groq pode ser trocado em `GROQ_MODEL` (ex.: `llama-3.1-70b-versatile`). Veja [models suportados](https://console.groq.com/docs/models).
- Para trocar de provedor de IA (RNF16), basta criar outro service com a mesma interface pública de `groqService` e injetá-lo nos services consumidores.
- O front-end (React) não está neste repositório, mas a API é totalmente RESTful e a documentação OpenAPI em `/docs` permite gerar clientes automáticos (ex.: `openapi-generator-cli`).
