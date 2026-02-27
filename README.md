# ProposalFlow

![Docker](https://img.shields.io/badge/docker-ready-blue?logo=docker)
![License](https://img.shields.io/badge/license-MIT-green)

**AI-powered proposal generator for freelance developers and agencies.** Answer 10–12 business-focused questions, get a professional, persuasive proposal in under 3 minutes.


## Who It's For

- **Freelance developers** who lose deals because their proposals read like invoices
- **Small agencies** that need consistent, high-quality proposals without the overhead
- **Consultants** who want to move fast without sacrificing professionalism


## The Problem

Most freelance proposals lose clients before they finish reading. They're full of tech specs, feature lists, and vague timelines — but say nothing about business outcomes, pricing rationale, or why *you* are the right person for the job.

ProposalFlow fixes that.

## Why Not Just Use ChatGPT?

You could paste your project details into ChatGPT and ask for a proposal. You’d get a generic draft. ProposalFlow generates a structured, outcome-driven proposal designed to win.

- **Structured wizard, not open prompting** — captures the exact inputs that make proposals win: business goals, pain points, success metrics, and budget sensitivity
- **Built-in pricing logic** — generates three value-based tiers (Foundation, Enhanced, Complete) framed around client outcomes, not your hourly rate
- **Scope protection built in** — assumptions and exclusions are generated automatically, before the client even signs
- **Repeatable and scalable** — every proposal follows a proven structure; no prompt engineering required


## What It Generates

You fill out a short scope wizard. ProposalFlow generates a complete, client-ready proposal with:

- **Executive summary** — hooks the client in the first paragraph
- **Value-based pricing tiers** — Foundation, Enhanced, and Complete, each framed around outcomes not deliverables
- **Phase-based timeline** — week-by-week breakdown with client touchpoints built in
- **Embedded case studies** — auto-generated proof of relevant experience
- **Assumptions & exclusions** — protects you from scope creep before the project starts
- **Clear next steps** — ends with a call to action, not a wall of text

Proposals are returned as Markdown, making them easy to edit, copy into any tool, or render directly in the browser.


## How It Works

```
Scope Wizard (10–12 questions)
        ↓
Proposal Job queued (BullMQ + Redis)
        ↓
AI Service generates markdown (Google Gemini via LangChain)
        ↓
Proposal stored + status updated (PostgreSQL)
        ↓
Client views polished proposal (Next.js frontend)
```

## Tech Stack

| Layer | Technology |
|---|---|
| API Server | Node.js + Express (TypeScript) |
| Queue / Workers | BullMQ + Redis |
| Database | PostgreSQL + Prisma ORM |
| AI Service | Python + FastAPI + LangChain + Google Gemini 2.5 Flash |
| Frontend | Next.js 16 + React 19 + Tailwind CSS v4 |
| Auth | JWT (access + refresh tokens, httpOnly cookies) |
| Email | Resend |
| Infrastructure | Docker Compose |

---

## Getting Started
### Prerequisites

- Docker + Docker Compose
- A [Google AI Studio](https://aistudio.google.com/) API key
- A [Resend](https://resend.com/) API key

### Setup

1. Clone the repo and copy the example env files:

```bash
cp .env.example .env
cp server/.env.example server/.env
cp ai-service/.env.example ai-service/.env
```

2. Fill in your credentials in each `.env` file.

3. Start everything:

```bash
docker compose up --build
```

This starts the database, Redis, API server, two background workers, the AI service, and the frontend.

| Service | URL |
|---|---|
| API | http://localhost:3000 |
| Frontend | http://localhost:3001 |
| Queue Dashboard | http://localhost:3000/admin/queues |
| AI Service | http://localhost:8000 |

---

## API Overview

### Auth

```
POST /api/auth/register
POST /api/auth/login
POST /api/auth/logout
POST /api/auth/refresh
```

### Scope (the wizard input)

```
POST /api/scope              — submit project details, returns scope_id
GET  /api/scope/:id          — retrieve a saved scope
```

### Proposals

```
POST /api/proposal/start      — kick off generation, returns proposalId
GET  /api/proposal/:id/status — poll for pending / processing / completed / failed
GET  /api/proposal/:id        — fetch the completed proposal with finalMarkdown
```

## Scope Wizard Input

```json
{
  "projectName": "Client Portal Redesign",
  "businessGoal": "Reduce support tickets by giving clients self-serve access",
  "features": ["User auth", "Dashboard", "Document upload", "Notifications"],
  "techStack": ["Next.js", "PostgreSQL", "Tailwind CSS"],
  "budget": 15000,
  "timeline": "2 months"
}
```


## Project Structure

```
proposalflow/
├── server/          — Express API, workers, auth, queue logic
│   ├── src/
│   │   ├── bullmq/  — queues and workers
│   │   ├── controller/
│   │   ├── middleware/
│   │   ├── routes/
│   │   └── validations/
│   └── prisma/      — schema and migrations
├── ai-service/      — FastAPI service, Gemini integration, prompt templates
├── frontend/        — Next.js proposal viewer
└── docker-compose.yaml
```

---

## Running Tests

API integration tests use Newman (Postman CLI):

```bash
# From the server directory
npm run test:api
```

The full test suite covers auth flows, token refresh, scope validation, and proposal lifecycle.

### CI (GitHub Actions)

The test pipeline runs automatically on pushes to `main`. It requires two repository secrets — go to **Settings → Secrets and variables → Actions** and add:

| Secret | Description |
|---|---|
| `SERVER_ENV_TEST` | Full contents of `server/.env` for the test environment |
| `GOOGLE_API_KEY` | Google AI Studio API key for the AI service |


## Environment Variables

See `.env.example`, `server/.env.example`, and `ai-service/.env.example` for all required variables. Key ones:

| Variable | Description |
|---|---|
| `GOOGLE_API_KEY` | Google AI Studio key for Gemini |
| `RESEND_API_KEY` | Email delivery |
| `ACCESS_TOKEN_SECRET` | JWT signing secret |
| `REFRESH_TOKEN_SECRET` | JWT refresh secret |
| `DATABASE_URL` | PostgreSQL connection string |

---

## Project Status

🚧 MVP Complete  
🚧 UI improvements in progress  
📄 PDF export coming soon  
🎥 Demo video coming soon

## Contributing

PRs and issues are welcome. If you're adding a feature, open an issue first so we can discuss the approach.

## License

MIT
