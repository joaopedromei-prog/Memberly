# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Memberly** is a greenfield full-stack application being developed using the **Synkra AIOX** AI-orchestrated development framework (v5.0.3). The project uses a story-driven development methodology where all work originates from stories in `docs/stories/`.

**Active tech stack:** Next.js 16+, React, TypeScript, Tailwind CSS, Zustand, Supabase.

## Development Commands

Commands run from `.aiox-core/`:

```bash
npm run build              # Build AIOX core
npm test                   # Run unit + integration tests
npm run test:unit          # Unit tests only (jest tests/unit)
npm run test:integration   # Integration tests only (jest tests/integration)
npm run lint               # ESLint check
npm run typecheck          # TypeScript type checking (tsc --noEmit)
```

Validation commands (root):

```bash
npm run validate:structure  # Validate project structure
npm run validate:agents     # Validate agent definitions
npm run sync:ide            # Sync IDE configurations
```

## Architecture

### Layer Model (Framework vs Project)

| Layer | Paths | Rule |
|-------|-------|------|
| L1 — Framework Core | `.aiox-core/core/`, `.aiox-core/constitution.md` | NEVER modify |
| L2 — Framework Templates | `.aiox-core/development/tasks/`, `templates/`, `checklists/`, `workflows/` | NEVER modify |
| L3 — Project Config | `.aiox-core/data/`, `agents/*/MEMORY.md`, `core-config.yaml` | Mutable with exceptions |
| L4 — Project Runtime | `docs/stories/`, `packages/`, `squads/`, `tests/` | Always modify freely |

### Key Directories

- `docs/stories/` — Active development stories (source of truth for work in progress)
- `docs/prd/` — Product requirement documents (sharded epics)
- `docs/architecture/` — Architecture decisions and documentation
- `packages/` — Application source code (Next.js app goes here)
- `.aiox-core/development/agents/` — Agent persona definitions
- `.aiox-core/development/tasks/` — 115+ executable task definitions
- `.ai/` — Decision logs (ADR format, auto-generated)

### Agent System

Agents are activated with `@agent-name` or `/AIOX:agents:agent-name`:

| Agent | Role | Exclusive Operations |
|-------|------|---------------------|
| `@dev` (Dex) | Implementation | git add/commit |
| `@qa` (Quinn) | Quality gates | QA verdicts |
| `@architect` (Aria) | Architecture | Tech decisions |
| `@pm` (Morgan) | Product management | Epic orchestration |
| `@po` (Pax) | Story validation | Backlog prioritization |
| `@sm` (River) | Story creation | Story drafting |
| `@analyst` (Alex) | Research | Requirements analysis |
| `@data-engineer` (Dara) | Database | Schema DDL, migrations |
| `@ux-design-expert` (Uma) | UI/UX | Design direction |
| `@devops` (Gage) | DevOps | **git push, gh pr create** (exclusive) |

**Critical:** Only `@devops` can run `git push` or create GitHub PRs.

### Story-Driven Development Flow

```
@sm *create-story → @po *validate-story → @dev *develop → @qa *qa-gate → @devops *push
```

All development must start from a story. Stories live at `docs/stories/` and track progress via checkboxes `[ ]` → `[x]`.

### Configuration

- `core-config.yaml` — Framework settings (tech stack preset, agent locations, QA config)
- `.env` — Environment variables (Supabase, GitHub, LLM API keys — see `.env.example`)
- `docs/framework/tech-stack.md` — Active tech stack details (auto-loaded for `@dev`)
- `docs/framework/coding-standards.md` — Code standards (auto-loaded for `@dev`)

## Constitutional Principles

Non-negotiable rules enforced by the framework:

- **CLI First** — Build CLI/API before UI
- **Agent Authority** — Respect agent boundaries and exclusive operations
- **Story-Driven** — All work stems from stories, no ad-hoc development
- **No Invention** — Implement only what stories/PRD specify
- **Absolute Imports** — Use absolute import paths in application code
