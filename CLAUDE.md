# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Memberly** is a Netflix-style member area platform for digital courses, built with the **Synkra AIOX** AI-orchestrated development framework (v5.0.3). Story-driven methodology — all work originates from stories in `docs/stories/`.

**Tech stack:** Next.js 16+ (App Router), React 19, TypeScript 5, Tailwind CSS 4, Zustand 5, Supabase (Auth + PostgreSQL + Storage), Vitest.

## Development Commands

Monorepo with single package `packages/memberly-app`. All commands run from **project root**:

```bash
npm run dev                # Start Next.js dev server (Turbopack, default port 3000)
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

Dev server with specific port (run from app dir, root `npm run dev` doesn't forward `--port`):
```bash
cd packages/memberly-app && npx next dev --port 3000
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

- **Gemini API** (`src/lib/ai/gemini-client.ts`) — Generates visual banners for products/modules. Model: `gemini-2.5-flash-image` with 2 retries, exponential backoff, 60s timeout.
- Banner generation: `POST /api/ai/generate-banner` → Gemini → base64 → Supabase Storage → public URL

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

### Middleware & Auth Flow

`src/middleware.ts` handles edge authentication:
1. Public routes (`/login`, `/forgot-password`, `/api/webhooks`) bypass auth
2. No session → redirect to `/login`
3. Role from JWT `app_metadata.role` (fallback: DB query on `profiles`)
4. Admin routes → enforce admin role; preview mode (`?preview=true`) lets admin bypass `member_access` RLS

Auth guards for API routes: `authenticateUser()` and `requireAdmin()` in `src/lib/utils/auth-guard.ts`.
API responses: use `apiSuccess()` / `apiError()` helpers from `src/lib/utils/api-response.ts`.

### Import Conventions

Absolute imports via `@/*` alias mapped to `src/*` (configured in `tsconfig.json`). Use `@/lib/...`, `@/components/...`, `@/stores/...`, `@/types/...`.

### Key Libraries

- `motion/react` (NOT `framer-motion`) — animations
- `@tiptap/react` — rich text editor for lesson descriptions
- `@dnd-kit` — sortable drag-and-drop for products/modules/lessons
- `recharts` — admin dashboard charts

### Test Structure

Tests in `packages/memberly-app/tests/`:
- `unit/` — Components, lib, hooks, utils (vitest + @testing-library/react + jsdom)
- `integration/` — API routes, AI generation, webhooks
- `e2e/` — Full flows (webhook → access grant)
- Vitest globals enabled (`describe`, `it`, `expect` without imports)
- Setup file: `tests/unit/setup.ts`

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

### Gemini UI Integration (`.gemini.tsx` files)

Before starting any UI implementation, **always check** for `.gemini.tsx` files:

```bash
find packages/memberly-app/src -name "*.gemini.tsx" 2>/dev/null
```

If a `.gemini.tsx` file exists in the relevant component area:
1. **It is the visual reference** — treat it as the design spec. The visual output is sacred.
2. **Follow the integration task** in `.aiox-core/development/tasks/dev-integrate-gemini-ui.md`
3. Replace mocked data with real Supabase queries/props
4. Fix imports (`framer-motion` → `motion/react`, Tailwind v3 → v4 syntax)
5. Decompose into proper components in `src/components/`
6. Delete the `.gemini.tsx` file when integration is complete

The `.gemini.tsx` was generated by Gemini 3.1 Pro via Google AI Studio as a one-shot visual reference. Its design quality must be preserved — do not simplify animations or remove visual effects.

### Environment Variables

Required in `.env.local` (see `.env.example`):
```
NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY  # Browser-safe
SUPABASE_SERVICE_ROLE_KEY                                 # Server-only, bypasses RLS
NEXT_PUBLIC_APP_URL                                       # http://localhost:3000
PAYT_WEBHOOK_SECRET                                       # Webhook signature validation
GEMINI_API_KEY                                            # AI banner generation
```

### Design System (Tailwind v4)

Netflix-inspired dark theme. Custom CSS variables in `globals.css`:
- `--color-dark-bg: #141414`, `--color-dark-surface: #1a1a1a`, `--color-dark-card: #2a2a2a`
- `--color-primary: #e50914` (Netflix red)
- Fonts: Geist (sans) / Geist Mono
- Custom `animate-shimmer` for skeleton loading

### Constitutional Principles

- **CLI First** — Build CLI/API before UI
- **Agent Authority** — Respect agent boundaries and exclusive operations
- **Story-Driven** — All work stems from stories, no ad-hoc development
- **No Invention** — Implement only what stories/PRD specify
- **Absolute Imports** — Use `@/` absolute import paths
