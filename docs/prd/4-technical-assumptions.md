# 4. Technical Assumptions

## Repository Structure: Monorepo

Monorepo com estrutura `packages/` conforme padrão AIOX. O app Next.js será o único package no MVP:

```
packages/
  memberly-app/         # Next.js app (frontend + API routes)
    src/
      app/              # App Router (Next.js 16+)
      components/       # React components
      lib/              # Utilities, API clients, hooks
      types/            # TypeScript type definitions
```

**Rationale:** Monorepo simplifica o setup para equipe de 1 pessoa + IA, permite adicionar packages futuros (e.g., SDK, CLI) sem reestruturação.

## Service Architecture: Serverless

- **Frontend + API:** Next.js no Vercel (App Router + Route Handlers)
- **Database + Auth + Storage:** Supabase (PostgreSQL, Auth, Storage)
- **IA (texto):** Claude API (Anthropic) para geração de estrutura — chamada via Route Handlers do Next.js
- **IA (imagens):** Gemini API (Google) para geração de banners — chamada via Route Handlers do Next.js
- **Webhook:** Next.js Route Handler dedicado para receber webhooks da Payt

**Rationale:** Serverless minimiza complexidade operacional para equipe enxuta. Vercel e Supabase oferecem free tier generoso e escalam automaticamente. Sem necessidade de gerenciar servidores, containers ou infraestrutura.

## Testing Requirements: Unit + Integration

- **Unit tests:** Jest + React Testing Library para componentes e lógica de negócio
- **Integration tests:** Testes de API routes (webhook, CRUD) com banco de teste
- **E2E:** Não no MVP — adicionar com Playwright na Phase 2
- **Linting:** ESLint + Prettier com config strict
- **Type checking:** TypeScript strict mode (`tsc --noEmit`)

**Rationale:** Unit + integration cobre os cenários críticos (webhook processing, controle de acesso, CRUD) sem overhead excessivo de E2E para equipe de 1.

## Additional Technical Assumptions

- Next.js 16+ com App Router (React Server Components por padrão)
- Tailwind CSS v4 para styling com design tokens
- Zustand para state management client-side (carrinho de módulos, progresso, UI state)
- Supabase JS Client v2 para interação com banco, auth e storage
- Vídeos são hospedados externamente (YouTube / Panda Video) — o sistema apenas armazena referências (URLs/IDs)
- PDFs são armazenados no Supabase Storage com acesso controlado via signed URLs
- A geração de imagens para banners via IA usa a **Gemini API (Google)** com capacidade de geração de imagens nativa — fallback é upload manual
- O webhook da Payt requer validação de assinatura/token para segurança
- Deploy contínuo via Vercel (push to main = deploy)

---
