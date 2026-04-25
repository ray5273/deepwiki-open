# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

DeepWiki-Open is an AI-powered wiki generator for GitHub, GitLab, and Bitbucket repositories. It clones repos, creates code embeddings, generates documentation with diagrams, and serves an interactive wiki. It also provides RAG-powered Q&A ("Ask") and a multi-turn "DeepResearch" feature.

## Architecture

**Two-process system:**

- **Frontend**: Next.js 15 app (TypeScript, Tailwind CSS v4, React 19) on port 3000. Pages use the App Router under `src/app/`. The main entry page (`src/app/page.tsx`) lets users input a repo URL; wiki pages render at `src/app/[owner]/[repo]/page.tsx`.
- **Backend**: FastAPI (Python 3.11+) on port 8001. Entry point is `api/main.py` which runs uvicorn serving `api/api.py`. Wiki generation streams over WebSocket (`api/websocket_wiki.py`). Chat/Ask uses RAG (`api/rag.py`) with embeddings built by `api/data_pipeline.py`.

**Communication:** The Next.js frontend proxies certain API routes to the backend via `next.config.ts` rewrites. WebSocket connections go directly to the backend (`ws://localhost:8001/ws/`). The WebSocket client is at `src/utils/websocketClient.ts`.

**AI Provider abstraction:** `api/config.py` loads JSON configs from `api/config/` (generator.json, embedder.json) and maps provider names to client classes (GoogleGenAIClient, OpenAIClient, OllamaClient, OpenRouterClient, BedrockClient, AzureAIClient, DashscopeClient). Alternative configs for local/vllm setups are in `local-config/`.

**Data pipeline:** `api/data_pipeline.py` clones repos, splits code into chunks, creates embeddings (via `api/tools/embedder.py`), and stores them using adalflow's LocalDB + FAISS under `~/.adalflow/`.

**Prompts:** All LLM prompts are centralized in `api/prompts.py`.

**i18n:** Frontend uses next-intl. Translation files are in `src/messages/` (en, zh, ja, kr, es, fr, ru, vi, pt-br, zh-tw).

## Common Commands

### Backend (Python/FastAPI)

```bash
# Install dependencies
python -m pip install poetry==2.0.1 && poetry install -C api

# Run the API server (port 8001)
python -m api.main

# Run tests
pytest test/

# Run a single test
pytest test/test_extract_repo_name.py -k "test_name"
```

### Frontend (Next.js)

```bash
# Install dependencies
npm install

# Dev server (port 3000, turbopack)
npm run dev

# Production build
npm run build

# Lint
npm run lint
```

### Docker

```bash
# Full stack (frontend + backend)
docker-compose up

# Rebuild
docker-compose up --build
```

## Environment Variables

Configured via `.env` in project root. Key variables:
- `GOOGLE_API_KEY`, `OPENAI_API_KEY`, `OPENROUTER_API_KEY` - model provider keys
- `AZURE_OPENAI_API_KEY`, `AZURE_OPENAI_ENDPOINT`, `AZURE_OPENAI_VERSION` - Azure OpenAI
- `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `AWS_REGION` - Bedrock
- `OLLAMA_HOST` - Ollama endpoint (default: http://localhost:11434)
- `DEEPWIKI_EMBEDDER_TYPE` - embedder backend: `openai` (default), `google`, `ollama`
- `DEEPWIKI_CONFIG_DIR` - override config directory path
- `DEEPWIKI_AUTH_MODE`, `DEEPWIKI_AUTH_CODE` - optional wiki authentication
- `SERVER_BASE_URL` - backend URL for frontend proxying (default: http://localhost:8001)
- `PORT` - backend port (default: 8001)

## Testing

Tests live in `test/` and use pytest with markers: `unit`, `integration`, `slow`, `network`. Config is in `pytest.ini`.

## Key Conventions

- Backend uses adalflow as the core AI framework for embeddings, model clients, and data storage.
- Generator and embedder configs are JSON files in `api/config/` with `${ENV_VAR}` placeholder support.
- The `.adalflow/` directory stores cloned repos and embedding databases; it persists via Docker volume.
- Frontend components are in `src/components/`, with Mermaid diagram rendering (`Mermaid.tsx`) and Markdown rendering (`Markdown.tsx`) as core display components.

## Skill routing

When the user's request matches an available skill, ALWAYS invoke it using the Skill
tool as your FIRST action. Do NOT answer directly, do NOT use other tools first.
The skill has specialized workflows that produce better results than ad-hoc answers.

Key routing rules:
- Product ideas, "is this worth building", brainstorming → invoke office-hours
- Bugs, errors, "why is this broken", 500 errors → invoke investigate
- Ship, deploy, push, create PR → invoke ship
- QA, test the site, find bugs → invoke qa
- Code review, check my diff → invoke review
- Update docs after shipping → invoke document-release
- Weekly retro → invoke retro
- Design system, brand → invoke design-consultation
- Visual audit, design polish → invoke design-review
- Architecture review → invoke plan-eng-review
- Save progress, checkpoint, resume → invoke checkpoint
- Code quality, health check → invoke health
