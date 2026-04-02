# Memberly

Plataforma de area de membros estilo Netflix para cursos digitais. Membros acessam produtos (cursos), modulos e aulas com video, PDF e comentarios. Admins gerenciam todo o conteudo via painel administrativo. Integrado com gateway de pagamento (Payt) para provisionamento automatico de acesso via webhook.

## Tech Stack

| Camada | Tecnologia |
|--------|-----------|
| Framework | Next.js 16+ (App Router, Turbopack) |
| UI | React 19, Tailwind CSS 4 (tema dark Netflix) |
| Linguagem | TypeScript 5 (strict) |
| Estado | Zustand 5 |
| Backend/DB | Supabase (PostgreSQL, Auth, Storage, RLS) |
| Email | Resend |
| IA | Gemini 2.5 Flash (geracao de banners) |
| Testes | Vitest + React Testing Library |
| Deploy | Vercel |

## Estrutura do Monorepo

```
Memberly/
├── packages/memberly-app/     # Aplicacao principal (Next.js)
│   ├── src/
│   │   ├── app/               # Rotas (App Router)
│   │   │   ├── (auth)/        # Login, forgot-password (publico)
│   │   │   ├── (member)/      # Dashboard, produtos, aulas (autenticado)
│   │   │   ├── admin/         # Painel admin: produtos, modulos, aulas, membros
│   │   │   ├── api/           # Route handlers (webhooks, AI, etc.)
│   │   │   └── auth/          # Callback de magic link
│   │   ├── components/
│   │   │   ├── admin/         # Formularios, listas, geracao de banner
│   │   │   ├── member/        # Hero banners, cards, layout de aulas
│   │   │   ├── shared/        # VideoPlayer (YouTube/Panda), PdfViewer, Comments
│   │   │   └── ui/            # Primitivos (Button, Input, Card, SortableList)
│   │   ├── lib/
│   │   │   ├── supabase/      # Clients: browser, server, admin (service role)
│   │   │   ├── webhooks/      # Payt: assinatura, provisionamento, logger
│   │   │   ├── email/         # Resend client e templates
│   │   │   ├── ai/            # Gemini client para banners
│   │   │   └── utils/         # Auth guards, API response helpers
│   │   ├── stores/            # Zustand: auth, toast, ui
│   │   └── types/             # TypeScript types (database, webhook, api)
│   ├── supabase/migrations/   # Migrations SQL (RLS incluso)
│   └── tests/
│       ├── unit/              # Componentes, lib, hooks
│       ├── integration/       # API routes, webhooks
│       └── e2e/               # Fluxos completos (webhook → acesso)
├── docs/
│   ├── stories/               # Stories de desenvolvimento (AIOX)
│   ├── prd/                   # Product Requirement Documents
│   └── architecture/          # Documentacao de arquitetura
└── .aiox-core/                # Framework AIOX (nao modificar L1/L2)
```

## Setup Local

### Pre-requisitos

- Node.js 20+
- npm 10+
- Projeto Supabase configurado

### Instalacao

```bash
git clone git@github.com:joaopedromei-prog/Memberly.git
cd Memberly
npm install
```

### Variaveis de Ambiente

Copie `.env.example` para `.env.local` em `packages/memberly-app/`:

```bash
cp packages/memberly-app/.env.example packages/memberly-app/.env.local
```

Preencha as variaveis:

| Variavel | Obrigatoria | Descricao |
|----------|-------------|-----------|
| `NEXT_PUBLIC_SUPABASE_URL` | Sim | URL do projeto Supabase |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Sim | Chave anonima (browser) |
| `SUPABASE_SERVICE_ROLE_KEY` | Sim | Service role (server-only, bypassa RLS) |
| `NEXT_PUBLIC_APP_URL` | Sim | URL da app (ex: `http://localhost:3000`) |
| `PAYT_INTEGRATION_KEY` | Sim | Chave para validacao de assinatura do webhook Payt |
| `DEFAULT_MEMBER_PASSWORD` | Sim | Senha padrao para criacao automatica de membros |
| `RESEND_API_KEY` | Sim | API key do Resend para envio de emails |
| `EMAIL_FROM` | Sim | Endereco remetente dos emails |
| `GEMINI_API_KEY` | Nao | API key do Google Gemini (geracao de banners com IA) |
| `NEXT_PUBLIC_PHONE_AUTH_ENABLED` | Nao | Habilita login por telefone/OTP (`false` por padrao) |

### Comandos

Todos os comandos podem ser executados da raiz do monorepo:

```bash
npm run dev          # Dev server (Turbopack, porta 3000)
npm run build        # Build de producao
npm run lint         # ESLint
npm run typecheck    # tsc --noEmit
npm test             # Todos os testes
```

Comandos adicionais (de dentro de `packages/memberly-app/`):

```bash
npm run test:unit    # Apenas testes unitarios
npm run test:watch   # Modo watch
npm run lint:fix     # Auto-fix ESLint
npm run format       # Prettier
```

Rodar um teste especifico:

```bash
cd packages/memberly-app && npx vitest run tests/unit/lib/utils/slugify.test.ts
```

## Arquitetura

### Autenticacao e Middleware

O `src/middleware.ts` roda no edge e controla todo o fluxo de auth:

1. Rotas publicas (`/login`, `/forgot-password`, `/api/webhooks`) passam direto
2. Sem sessao → redirect para `/login`
3. Role extraido do JWT `app_metadata.role` (fallback: query no `profiles`)
4. Rotas `/admin/*` exigem role admin
5. Modo preview (`?preview=true`) permite admin visualizar como membro

### Banco de Dados (Supabase)

Tabelas principais:

| Tabela | Descricao |
|--------|-----------|
| `profiles` | Membros e admins (vinculado ao Supabase Auth) |
| `products` | Cursos/produtos com slug, banner, descricao |
| `modules` | Modulos dentro de produtos (ordenados) |
| `lessons` | Aulas com video, PDF, drip days |
| `member_access` | Relacao membro ↔ produto (acesso concedido) |
| `lesson_progress` | Progresso de aulas por membro |
| `comments` | Comentarios em aulas |
| `product_mappings` | Mapeamento produto externo (Payt) → produto interno |
| `webhook_logs` | Log de todos os webhooks recebidos |
| `site_settings` | Configuracoes do site (email, branding) |

**RLS (Row-Level Security)** esta ativo em todas as tabelas. Membros so veem seus proprios dados. O client `admin.ts` usa service role para operacoes que precisam bypassar RLS (webhooks, admin ops).

Tres Supabase clients em `src/lib/supabase/`:
- **`client.ts`** — Browser (anon key)
- **`server.ts`** — Server components e route handlers (cookie-based auth)
- **`admin.ts`** — Service role (bypassa RLS)

### Fluxo de Webhook (Payt)

```
Payt envia POST → /api/webhooks/payt/
  → Valida assinatura HMAC
  → Busca product_mapping pelo product_id externo
  → Cria/encontra perfil do comprador
  → Concede acesso (member_access)
  → Envia email de boas-vindas com magic link
  → Loga tudo em webhook_logs
```

### Geracao de Banners com IA

Admin pode gerar banners visuais para produtos/modulos via Gemini:

```
Admin clica "Gerar Banner"
  → POST /api/ai/generate-banner
  → Gemini 2.5 Flash gera imagem
  → Base64 → Upload Supabase Storage
  → URL publica retornada
```

### Imports

Sempre usar imports absolutos com alias `@/*` → `src/*`:

```typescript
import { Button } from '@/components/ui/Button'
import { createServerClient } from '@/lib/supabase/server'
```

## Design System

Tema escuro inspirado na Netflix, definido via CSS variables em `globals.css`:

- Background: `#141414` / Surface: `#1a1a1a` / Card: `#2a2a2a`
- Cor primaria: `#e50914` (vermelho Netflix)
- Fontes: Geist (sans) / Geist Mono
- Animacoes: `motion/react` (nao `framer-motion`)
- Drag-and-drop: `@dnd-kit`
- Rich text: `@tiptap/react`
- Charts: `recharts`

## Deploy (Vercel)

1. Conecte o repositorio ao Vercel
2. **Root Directory:** `packages/memberly-app`
3. **Framework Preset:** Next.js
4. Configure todas as variaveis de ambiente
5. Push na `master` = deploy automatico

## Metodologia de Desenvolvimento (AIOX)

O projeto usa o framework **Synkra AIOX** para desenvolvimento orientado por stories. Todo trabalho comeca com uma story em `docs/stories/`.

Fluxo: `@sm cria story → @po valida → @dev implementa → @qa testa → @devops faz push`

Para mais detalhes, veja `CLAUDE.md` e `.aiox-core/`.
