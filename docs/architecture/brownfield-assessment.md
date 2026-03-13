# Brownfield Discovery Assessment — Memberly

**Data:** 2026-03-13
**Autor:** @architect (Aria)
**Versão:** 1.0
**Status:** Phase 1 Complete (System Architecture Assessment)

---

## 1. Resumo Executivo

O **Memberly** é uma plataforma de área de membros estilo Netflix para cursos digitais, construída com Next.js 16, React 19, Supabase e o framework AIOX. O projeto tem **10 commits em 3 dias**, 9 Epics (8 completos), **78 componentes**, **33 rotas API** e **58 arquivos de teste**.

### Scorecard Geral

| Dimensão | Score | Status |
|----------|-------|--------|
| Arquitetura & Estrutura | 9.0/10 | ✅ Excelente |
| Qualidade do Schema DB | 8.2/10 | ✅ Sólido |
| Segurança | 6.5/10 | ⚠️ Atenção |
| Qualidade de Código | 7.5/10 | ⚠️ Moderado |
| Cobertura de Testes | 5.5/10 | ❌ Insuficiente |
| Performance | 7.0/10 | ⚠️ Moderado |
| Acessibilidade | 7.0/10 | ⚠️ Moderado |
| **GERAL** | **7.2/10** | **⚠️ Precisa Melhorias** |

---

## 2. Tech Stack Detectado

| Camada | Tecnologia | Versão |
|--------|-----------|--------|
| Framework | Next.js (App Router) | 16.1.6 |
| UI | React | 19.2.3 |
| Linguagem | TypeScript | 5 |
| CSS | Tailwind CSS | 4 |
| State | Zustand | 5.0.11 |
| Database | Supabase (PostgreSQL + Auth + Storage) | 2.99.1 |
| AI | Google Gemini (@google/generative-ai) | 0.24.1 |
| Animações | motion/react | 12.36.0 |
| Drag & Drop | @dnd-kit | latest |
| Editor | @tiptap/react | 3.20.1 |
| Charts | recharts | 3.8.0 |
| Testes | Vitest + Testing Library | 4.0.18 |
| Validação | Zod | 4.3.6 |
| Linting | ESLint 9 + Prettier 3.8.1 | latest |

---

## 3. Mapa Arquitetural

```
┌─────────────────────────────────────────────────────────────────┐
│                        BROWSER (Client)                         │
├─────────────────────────────────────────────────────────────────┤
│  Zustand Stores          React 19 Components                    │
│  ┌──────────┐  ┌─────────────────────────────────────────────┐ │
│  │ auth     │  │ (member)/ — Netflix-style member area        │ │
│  │ toast    │  │ admin/   — Admin panel with CRUD             │ │
│  │ ui       │  │ (auth)/  — Login, forgot password            │ │
│  └──────────┘  └─────────────────────────────────────────────┘ │
├─────────────────────────────────────────────────────────────────┤
│                     EDGE MIDDLEWARE                              │
│  src/middleware.ts — Auth check, role enforcement, preview mode  │
├─────────────────────────────────────────────────────────────────┤
│                     NEXT.JS API LAYER (33 routes)               │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────────────┐  │
│  │ Products │ │ Members  │ │ Lessons  │ │ Webhooks/AI/etc  │  │
│  │ 6 routes │ │ 7 routes │ │ 6 routes │ │ 14 routes        │  │
│  └──────────┘ └──────────┘ └──────────┘ └──────────────────┘  │
│  Auth Guards: authenticateUser() / requireAdmin()               │
├─────────────────────────────────────────────────────────────────┤
│                     SUPABASE (3 clients)                        │
│  ┌───────────┐ ┌───────────┐ ┌───────────────┐               │
│  │ Browser   │ │ Server    │ │ Admin (svc)   │               │
│  │ anon key  │ │ cookies   │ │ bypasses RLS  │               │
│  └───────────┘ └───────────┘ └───────────────┘               │
├─────────────────────────────────────────────────────────────────┤
│                     POSTGRESQL + RLS                            │
│  10 tables, 19 migrations, row-level security enabled           │
│  Core: profiles, products, modules, lessons, member_access      │
│  Support: comments, progress, bookmarks, webhooks, settings     │
├─────────────────────────────────────────────────────────────────┤
│                     EXTERNAL INTEGRATIONS                       │
│  ┌──────────┐ ┌──────────────┐ ┌────────────────────────┐     │
│  │ Gemini   │ │ Payt Webhook │ │ YouTube / Panda Video  │     │
│  │ Banners  │ │ Payments     │ │ Video Embedding        │     │
│  └──────────┘ └──────────────┘ └────────────────────────┘     │
└─────────────────────────────────────────────────────────────────┘
```

---

## 4. Findings — SEGURANÇA (Severidade: CRÍTICA)

### 4.1 XSS via dangerouslySetInnerHTML

| # | Arquivo | Descrição | Severidade |
|---|---------|-----------|------------|
| S1 | `components/admin/EmailSettings.tsx` | Template de email renderizado sem sanitização | CRITICAL |
| S2 | `components/member/LessonInfo.tsx` | Descrição de lição renderizada como HTML bruto | CRITICAL |

**Recomendação:** Instalar `dompurify` e sanitizar todo conteúdo antes de `dangerouslySetInnerHTML`.

### 4.2 Rotas API sem Autorização

| # | Rota | Descrição | Severidade |
|---|------|-----------|------------|
| S3 | `PATCH /api/products/[id]/modules/reorder` | Sem `requireAdmin()` — qualquer usuário autenticado pode reordenar módulos | HIGH |
| S4 | `POST /api/members/[id]/access` | Falta revalidação de admin em certos métodos | HIGH |

**Recomendação:** Adicionar `requireAdmin()` em todas as rotas de mutação admin.

### 4.3 Upload sem Rate Limiting

| # | Arquivo | Descrição | Severidade |
|---|---------|-----------|------------|
| S5 | `app/api/upload/route.ts` | Sem rate limiting — atacante pode DOS o Storage | HIGH |
| S6 | `app/api/upload/route.ts` | Extensão extraída com `.pop()` — spoofing possível | MEDIUM |

---

## 5. Findings — QUALIDADE DE CÓDIGO

### 5.1 Error Handling

| # | Arquivo | Descrição | Severidade |
|---|---------|-----------|------------|
| C1 | `app/(member)/page.tsx` | Sem error boundary — falha no fetch crasheia a página inteira | CRITICAL |
| C2 | `app/admin/page.tsx` | `Promise.all()` sem handling — um metric que falha quebra o dashboard | CRITICAL |
| C3 | Nenhum `error.tsx` | Nenhuma página de erro customizada nos route groups | HIGH |

**Recomendação:** Criar `error.tsx` em `(member)/`, `admin/`, e rotas críticas.

### 5.2 Duplicação de Código

| # | Arquivos | Descrição | Severidade |
|---|----------|-----------|------------|
| C4 | ProductForm, ModuleForm, LessonForm | ~95% da estrutura duplicada — sem form component compartilhado | MEDIUM |
| C5 | Rotas API (GET/PATCH/DELETE) | Lógica de auth duplicada em cada handler | MEDIUM |

### 5.3 Type Safety

| # | Arquivo | Descrição | Severidade |
|---|---------|-----------|------------|
| C6 | `app/api/lessons/[id]/comments/route.ts` | Cast `as unknown as` sem validação | MEDIUM |
| C7 | `app/api/products/[id]/route.ts` | `updateData` sem whitelist de campos aceitos | MEDIUM |

---

## 6. Findings — DATABASE

### 6.1 Indexação Incompleta

| # | Tabela | Index Faltando | Impacto |
|---|--------|----------------|---------|
| D1 | `modules` | `(product_id, sort_order)` composite | Ordenação lenta em produtos com muitos módulos |
| D2 | `lessons` | `(module_id, sort_order)` composite | Ordenação lenta |
| D3 | `comments` | `(lesson_id, created_at DESC)` | Listagem de comentários não otimizada |
| D4 | `lesson_progress` | `(lesson_id)` | Agregações de progresso lentas |
| D5 | `lesson_bookmarks` | `(lesson_id)` | Lookup de bookmarks |

### 6.2 Colunas updated_at Faltando

| # | Tabela | Status |
|---|--------|--------|
| D6 | `modules` | Sem `updated_at` + trigger |
| D7 | `lessons` | Sem `updated_at` + trigger |
| D8 | `comments` | Sem `updated_at` + trigger |
| D9 | `lesson_progress` | Sem `updated_at` + trigger |
| D10 | `member_access` | Sem `updated_at` + trigger |

### 6.3 Constraints Faltando

| # | Tabela | Constraint | Severidade |
|---|--------|-----------|------------|
| D11 | `profiles` | `CHECK (char_length(full_name) <= 255)` | MEDIUM |
| D12 | `comments` | `CHECK (char_length(content) >= 1)` (mínimo) | LOW |

### 6.4 Pontos Fortes do DB

- ✅ Schema bem normalizado (Product → Module → Lesson)
- ✅ UUIDs em todas as tabelas
- ✅ TIMESTAMPTZ consistente
- ✅ RLS abrangente e seguro (após fix no migration 11)
- ✅ Migrations incrementais sem operações destrutivas
- ✅ Naming conventions consistente (snake_case)

---

## 7. Findings — PERFORMANCE

| # | Arquivo | Descrição | Severidade |
|---|---------|-----------|------------|
| P1 | `app/api/members/import/route.ts` | `listUsers()` busca TODOS os users para checar 1 email — O(n) | CRITICAL |
| P2 | `app/api/settings/route.ts` | Updates sequenciais em loop (N requests para N settings) | HIGH |
| P3 | `app/api/products/[id]/modules/reorder/route.ts` | Updates sequenciais (N requests para N módulos) | HIGH |
| P4 | `lib/queries/admin-metrics.ts` | Agregações no JavaScript em vez de GROUP BY no PostgreSQL | MEDIUM |
| P5 | `lib/utils/continue-watching.ts` | Over-fetch de produtos sem LIMIT | MEDIUM |

---

## 8. Findings — TESTES

### Gap Analysis

| Categoria | Total | Testado | Gap |
|-----------|-------|---------|-----|
| API Routes | 33 | 14 | **58%** |
| Lib Utilities | 24 | 9 | **63%** |
| Components | 78 | 32 | **59%** |
| Stores | 3 | 1 | **67%** |
| Middleware | 1 | 0 | **100%** |
| **TOTAL** | **139** | **56** | **60%** |

### Gaps Críticos

| # | Descrição | Severidade |
|---|-----------|------------|
| T1 | `middleware.ts` sem testes — edge auth não validada | CRITICAL |
| T2 | `auth-guard.ts` sem testes — `requireAdmin()` não validada | CRITICAL |
| T3 | 19 rotas API sem testes (CRUD de products, members, settings) | HIGH |
| T4 | Sem coverage reporting configurado | HIGH |
| T5 | 2/3 Zustand stores sem testes | MEDIUM |
| T6 | Sem `error.tsx` pages e portanto sem testes de error boundaries | MEDIUM |

### Pontos Fortes dos Testes

- ✅ Webhook testing excelente (crypto real, edge cases)
- ✅ Utility testing robusto (slugify com Unicode/acentos)
- ✅ Gemini client com retry logic testada
- ✅ Setup file limpo com mocks adequados

---

## 9. Findings — ACESSIBILIDADE

| # | Arquivo | Descrição | Severidade |
|---|---------|-----------|------------|
| A1 | `EmailSettings.tsx` | Toggle button sem `aria-pressed` | MEDIUM |
| A2 | `HeroBanner.tsx` | Navegação de dots sem `aria-current="page"` | LOW |

**Pontos Fortes:** `aria-label` em botões, HTML semântico, role attributes presentes.

---

## 10. Recomendações Priorizadas

### CRITICAL (Sprint Atual)

| # | Ação | Effort | Impact |
|---|------|--------|--------|
| R1 | Sanitizar `dangerouslySetInnerHTML` com DOMPurify | 2h | Elimina XSS (S1, S2) |
| R2 | Adicionar `requireAdmin()` nas rotas faltantes | 1h | Corrige auth bypass (S3, S4) |
| R3 | Criar `error.tsx` em route groups | 2h | Previne crashes (C1, C2, C3) |
| R4 | Fix N+1 no member import (batch lookup) | 2h | Corrige timeout (P1) |

### HIGH (Próximo Sprint)

| # | Ação | Effort | Impact |
|---|------|--------|--------|
| R5 | Adicionar rate limiting no upload | 2h | Segurança (S5) |
| R6 | Batch updates em settings e reorder | 3h | Performance (P2, P3) |
| R7 | Testar middleware.ts e auth-guard.ts | 4h | Cobertura crítica (T1, T2) |
| R8 | Migration: composite indexes | 1h | Query performance (D1-D5) |
| R9 | Configurar coverage reporting | 1h | Visibilidade (T4) |

### MEDIUM (Backlog)

| # | Ação | Effort | Impact |
|---|------|--------|--------|
| R10 | Migration: colunas `updated_at` | 2h | Auditoria (D6-D10) |
| R11 | Extrair form component compartilhado | 4h | DRY (C4) |
| R12 | Testar 19 rotas API faltantes | 8h | Cobertura (T3) |
| R13 | Refatorar admin-metrics para GROUP BY | 3h | Performance (P4) |
| R14 | Whitelist de campos em PATCH routes | 2h | Type safety (C7) |

### LOW (Nice to Have)

| # | Ação | Effort | Impact |
|---|------|--------|--------|
| R15 | Testar stores toast e ui | 2h | Cobertura (T5) |
| R16 | Aria attributes faltantes | 1h | A11y (A1, A2) |
| R17 | React.memo em Carousel, HeroBanner | 1h | Performance micro |

---

## 11. Pontos Fortes (Preservar)

1. **Arquitetura limpa** — Separação clara de camadas (App Router groups, 3 Supabase clients, auth guards)
2. **RLS robusto** — Políticas abrangentes com `is_admin()` helper function
3. **Migrations seguras** — 19 migrations incrementais sem operações destrutivas
4. **Schema bem projetado** — Normalização correta, UUIDs, TIMESTAMPTZ
5. **Webhook system sólido** — Signature validation, idempotency, logging
6. **AI integration resiliente** — Retries, exponential backoff, timeout
7. **Story-driven development** — 43 stories documentadas em 9 Epics
8. **Zero dead code** — Sem `@ts-ignore`, sem código comentado, sem imports não usados
9. **Naming conventions** — Consistente em toda a codebase (snake_case DB, camelCase TS)
10. **Test quality** — Testes existentes são de alta qualidade (edge cases, crypto real)

---

## 12. Merge Strategy

**Recomendação: `manual`**

O projeto tem infraestrutura existente robusta (ESLint 9, Prettier, Vitest, Tailwind 4, TypeScript strict). Integrações devem preservar todas as configurações existentes. O AIOX já está integrado ao projeto.

---

## 13. Próximos Passos (Brownfield Phases 2-10)

| Fase | Agente | Output | Status |
|------|--------|--------|--------|
| 1. System Architecture | @architect (Aria) | `brownfield-assessment.md` | ✅ COMPLETE |
| 2. Database Specialist | @data-engineer (Dara) | `db-specialist-review.md` | ⏳ Pending |
| 3. Frontend/UX Spec | @ux-design-expert (Uma) | `frontend-spec.md` | ⏳ Pending |
| 4. Tech Debt Draft | @architect (Aria) | `technical-debt-DRAFT.md` | ⏳ Pending |
| 5. DB Review | @data-engineer (Dara) | `db-specialist-review.md` | ⏳ Pending |
| 6. UX Review | @ux-design-expert (Uma) | `ux-specialist-review.md` | ⏳ Pending |
| 7. QA Gate | @qa (Quinn) | `qa-review.md` | ⏳ Pending |
| 8. Final Assessment | @architect (Aria) | `technical-debt-assessment.md` | ⏳ Pending |
| 9. Executive Report | @analyst (Alex) | `TECHNICAL-DEBT-REPORT.md` | ⏳ Pending |
| 10. Epic Planning | @pm (Morgan) | Epic + stories | ⏳ Pending |

---

*— Aria, arquitetando o futuro 🏗️*
