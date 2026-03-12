# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Memberly** is a Netflix-style member area platform for digital courses, built with the **Synkra AIOX** AI-orchestrated development framework (v5.0.3). Story-driven methodology — all work originates from stories in `docs/stories/`.

**Tech stack:** Next.js 16+ (App Router), React 19, TypeScript 5, Tailwind CSS 4, Zustand 5, Supabase (Auth + PostgreSQL + Storage), Vitest.

## Development Commands

Monorepo with single package `packages/memberly-app`. All commands run from **project root**:

```bash
npm run dev                # Start Next.js dev server (Turbopack)
npm run build              # Production build
npm run lint               # ESLint
npm run typecheck          # tsc --noEmit
npm test                   # Run all tests (vitest)
```

Run from `packages/memberly-app/` for more options:

```bash
npm run test:unit          # Unit tests only (vitest run tests/unit)
npm run test:watch         # Watch mode (vitest)
npm run lint:fix           # Auto-fix ESLint issues
npm run format             # Prettier formatting
```

Run a single test file:
```bash
cd packages/memberly-app && npx vitest run tests/unit/lib/utils/slugify.test.ts
```

AIOX framework commands (from `.aiox-core/`):
```bash
npm run build              # Build AIOX core
npm test                   # Framework tests (jest)
```

## Application Architecture

### Route Structure (Next.js App Router)

All app code lives in `packages/memberly-app/src/`.

- `app/(auth)/` — Login, forgot-password (public)
- `app/(member)/` — Member dashboard, product browsing, lesson player (authenticated)
- `app/admin/` — Admin panel: products, modules, lessons, members, settings
- `app/api/` — REST API route handlers

Key dynamic routes:
- `(member)/products/[slug]/` — Product detail page
- `(member)/products/[slug]/lessons/[lessonId]/` — Lesson player
- `admin/products/[id]/modules/[moduleId]/lessons/` — Lesson management

### Data Layer

**Supabase** with RLS (Row-Level Security) for data isolation. Migrations in `packages/memberly-app/supabase/migrations/`.

Core tables: `profiles` (members/admins), `products`, `modules`, `lessons`, `member_access`, `comments`, `lesson_progress`, `product_mappings`, `webhook_logs`.

Three Supabase clients in `src/lib/supabase/`:
- `client.ts` — Browser client (anon key)
- `server.ts` — Server components/route handlers (cookie-based auth)
- `admin.ts` — Service role client (bypasses RLS, for webhooks/admin ops)

### AI Integration

- **Gemini API** (`src/lib/ai/gemini-client.ts`) — Generates visual banners for products/modules. Model: `gemini-2.0-flash-exp`.
- Banner generation available in product/module forms via `api/ai/generate-banner`

### State Management

Zustand stores in `src/stores/`: `auth-store.ts`, `toast-store.ts`, `ui-store.ts`.

### Webhook System

Payment gateway (Payt) integration in `src/lib/webhooks/`:
- Signature validation → product lookup via `product_mappings` → auto-grant member access
- Endpoint: `api/webhooks/payt/`

### Component Organization

- `src/components/admin/` — Admin panel (forms, lists, banner generation)
- `src/components/member/` — Member area (hero banners, product cards, lesson layout)
- `src/components/shared/` — VideoPlayer (YouTube/Panda), PdfViewer, Comments
- `src/components/ui/` — Base primitives (Button, Input, Card, SortableList)

### Import Conventions

Absolute imports via `@/*` alias mapped to `src/*` (configured in `tsconfig.json`). Use `@/lib/...`, `@/components/...`, `@/stores/...`, `@/types/...`.

### Test Structure

Tests in `packages/memberly-app/tests/`:
- `unit/` — Components, lib, hooks, utils (vitest + @testing-library/react + jsdom)
- `integration/` — API routes, AI generation, webhooks
- `e2e/` — Full flows (webhook → access grant)

## AIOX Framework

### Layer Model

| Layer | Paths | Rule |
|-------|-------|------|
| L1 — Framework Core | `.aiox-core/core/`, `.aiox-core/constitution.md` | NEVER modify |
| L2 — Framework Templates | `.aiox-core/development/tasks/`, `templates/`, `checklists/`, `workflows/` | NEVER modify |
| L3 — Project Config | `.aiox-core/data/`, `agents/*/MEMORY.md`, `core-config.yaml` | Mutable with exceptions |
| L4 — Project Runtime | `docs/stories/`, `packages/`, `squads/`, `tests/` | Always modify freely |

### Agent System

Agents activated with `@agent-name` or `/AIOX:agents:agent-name`:

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

All development starts from a story. Stories in `docs/stories/` track progress via `[ ]` → `[x]`.

### Constitutional Principles

- **CLI First** — Build CLI/API before UI
- **Agent Authority** — Respect agent boundaries and exclusive operations
- **Story-Driven** — All work stems from stories, no ad-hoc development
- **No Invention** — Implement only what stories/PRD specify
- **Absolute Imports** — Use `@/` absolute import paths
