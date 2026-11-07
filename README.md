# ProposalFlow

Describe a project's scope, get an AI-written client proposal back as Markdown.

Generation runs asynchronously: the API queues a job, a worker calls a Python AI service (Gemini via LangChain), and the result is stored and fetched once it's ready.

## How it works

```
Client ──► Express API ──► BullMQ (Redis) ──► Proposal worker ──► AI service (FastAPI + Gemini)
              │                                      │
              └──────────── PostgreSQL ◄─────────────┘
```

1. User registers / logs in (JWT in httpOnly cookies).
2. User submits a scope (project name, goal, features, tech stack, budget, timeline).
3. User starts a proposal for that scope. The API creates a `pending` proposal and enqueues a job.
4. The worker marks it `processing`, calls the AI service, then stores the Markdown and marks it `completed` (or `failed` after retries).
5. Client polls the status endpoint, then fetches the finished proposal.

## Stack

| Part | Tech |
| --- | --- |
| API | Node.js, Express 5, TypeScript, Prisma, PostgreSQL |
| Queue | BullMQ, Redis (also backs rate limiting) |
| AI service | Python, FastAPI, LangChain, Gemini 2.5 Flash |
| Frontend | Next.js, React, Tailwind (minimal proposal viewer) |
| Email | Resend (welcome email via worker) |
| Tooling | Docker Compose, Postman/Newman tests, GitHub Actions |

## Project structure

```
ai-service/   FastAPI service + prompts that generate the proposal
frontend/     Next.js proposal viewer
server/
  prisma/     Schema, migrations, seed
  src/
    controller/   Request handlers
    routes/       Route definitions
    middleware/   Auth, validation, rate limiting, errors
    bullmq/       Queues and workers
    lib/          Prisma, Redis, JWT helpers
  tests/postman/  API test collection
```

## Getting started

Requires Docker and Docker Compose, plus a [Google AI Studio](https://aistudio.google.com/) API key.

```bash
git clone https://github.com/Mark1q/ProposalFlow.git
cd ProposalFlow

cp .env.example .env
cp server/.env.example server/.env
cp ai-service/.env.example ai-service/.env
```

Fill in the values:

- `.env`: Postgres credentials, `GOOGLE_API_KEY`, `RESEND_API_KEY`
- `server/.env`: `DATABASE_URL`, `ACCESS_TOKEN_SECRET`, `REFRESH_TOKEN_SECRET`, token expiries, Redis settings
- `ai-service/.env`: `GOOGLE_API_KEY`

Then start everything:

```bash
docker compose up --build
```

On startup the API container generates the Prisma client, pushes the schema, and seeds the database (including a test user, `test@example.com` / `password123`).

| Service | URL |
| --- | --- |
| API | http://localhost:3000 |
| Frontend | http://localhost:3001 |
| AI service | http://localhost:8000 |
| Queue dashboard | http://localhost:3000/admin/queues |

> `NODE_ENV=test` disables rate limiting. Use `dev` for normal local work.

## API

| Method | Endpoint | Description |
| --- | --- | --- |
| `POST` | `/api/auth/register` | Create an account |
| `POST` | `/api/auth/login` | Log in (sets cookies) |
| `POST` | `/api/auth/refresh` | Refresh the access token |
| `POST` | `/api/auth/logout` | Clear cookies |
| `POST` | `/api/scope` | Create a scope |
| `GET` | `/api/scope/:id` | Get a scope |
| `POST` | `/api/proposal/start` | Queue proposal generation for a scope |
| `GET` | `/api/proposal/:id/status` | Check generation status |
| `GET` | `/api/proposal/:id` | Get the proposal |
| `GET` | `/health` | Health check (DB reachable) |

Proposal status: `pending` → `processing` → `completed` | `failed`.

Scope body:

```json
{
  "projectName": "Client Portal",
  "businessGoal": "Reduce support tickets by letting clients self-serve",
  "features": ["User Auth", "Invoices", "Export to PDF"],
  "techStack": ["Next.js", "PostgreSQL"],
  "budget": 15000,
  "timeline": "8 weeks"
}
```

## Details

- **Auth:** short-lived access token (15 min) and refresh token in httpOnly, `sameSite=strict` cookies. Passwords hashed with bcrypt.
- **Rate limits (per window):** auth 5 / 15 min, proposal creation 10 / hour, scope 20 / 15 min, everything else 100 / 15 min.
- **Retries:** proposal jobs retry up to 10 times with exponential backoff before being marked `failed`.
- **Validation:** request bodies validated with Joi.

## Testing

API tests run with Newman against a running stack:

```bash
cd server
npm run test:api
```

They also run in CI on pushes and PRs touching `server/`.

## Local development without Docker

Each service runs on its own. You'll need Postgres and Redis running locally.

```bash
# API + workers
cd server
npm install
npx prisma db push
npm run dev
npm run worker:proposal
npm run worker:auth

# AI service
cd ai-service
pip install -r requirements.txt
fastapi dev main.py

# Frontend
cd frontend
npm install
npm run dev -- -p 3001
```

## Roadmap

- Swagger/OpenAPI docs
- LLM response caching
- Fuller frontend (scope wizard, auth, proposal list)