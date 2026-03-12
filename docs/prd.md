# Memberly Product Requirements Document (PRD)

> **Versão:** 1.0
> **Data:** 2026-03-11
> **Autor:** Morgan (PM Agent) + Stakeholder Input
> **Status:** Draft
> **Baseado em:** [Project Brief v1.0](./brief.md)

---

## 1. Goals and Background Context

### Goals

- Eliminar a dependência de plataformas terceiras (Cademi, Astron Members) para hospedagem de cursos e mentorias da The Scalers
- Fornecer ao admin ferramentas eficientes de criação manual de conteúdo com suporte a rich text, duplicação, bulk upload e geração de banners via IA
- Entregar uma experiência Netflix-like para membros de 30-80 anos com baixa familiaridade digital
- Integrar com gateway Payt para liberação automática de acesso por produto via webhook
- Suportar 10.000 membros ativos no MVP com arquitetura escalável para 1M no futuro

### Background Context

A The Scalers é uma empresa de marketing digital especializada em infoprodutos e estratégias de direct response para experts do nicho de saúde, vendendo cursos, mentorias e acompanhamentos digitais. Atualmente depende de plataformas SaaS como Cademi e Astron Members para hospedar conteúdo, enfrentando custos crescentes, customização limitada e processo manual de criação.

A equipe de desenvolvimento é enxuta (1 pessoa + IA), o que torna ferramentas eficientes de criação de conteúdo uma necessidade operacional. O público-alvo dos membros (30-80 anos, brasileiros comuns) exige uma interface extremamente simples e acessível.

### Change Log

| Date | Version | Description | Author |
|------|---------|-------------|--------|
| 2026-03-11 | 1.0 | Criação inicial do PRD a partir do Project Brief | Morgan (PM) |

---

## 2. Requirements

### Functional Requirements

- **FR1:** O sistema deve permitir que o admin crie, edite e exclua **produtos** (cursos/mentorias), cada um com nome, descrição, banner e configurações de acesso
- **FR2:** O sistema deve permitir que o admin crie, edite, reordene e exclua **módulos** dentro de um produto, cada um com título, descrição e banner
- **FR3:** O sistema deve permitir que o admin crie, edite, reordene e exclua **aulas** dentro de um módulo, cada uma com título, descrição, vídeo (YouTube ou Panda Video embed) e/ou PDF anexo
- **FR4:** O sistema deve suportar embed de vídeos via **YouTube** (iframe) e **Panda Video** (embed code/SDK), com o admin selecionando o provider e informando o ID/URL do vídeo
- **FR5:** O sistema deve permitir upload e anexo de **arquivos PDF** às aulas, com visualização inline e opção de download
- **FR6:** O sistema deve receber **webhooks da Payt** para processar eventos de compra e liberar automaticamente o acesso do membro ao produto específico comprado
- **FR7:** O sistema deve implementar **controle de acesso por produto**: cada membro visualiza apenas os produtos aos quais tem acesso liberado (por compra via webhook ou atribuição manual pelo admin)
- **FR8:** O sistema deve fornecer **autenticação de membros** com login por email/senha, registro (quando criado via webhook ou admin), e recuperação de senha
- **FR9:** O sistema deve exibir uma **interface Netflix-like** para membros: catálogo visual com banners horizontais por categoria/produto, cards de módulos, navegação por poucos cliques
- **FR10:** O sistema deve permitir que membros **comentem** nas aulas, com exibição cronológica dos comentários e possibilidade de resposta pelo admin
- **FR11:** O sistema deve fornecer ao admin um **painel de gestão de membros** com lista de membros, busca, filtro por produto, visualização de status de acesso, e possibilidade de adicionar/remover acesso manualmente
- **FR12:** O sistema deve permitir **geração de imagens de banner** para produtos e módulos via IA (Gemini API), com opção de upload manual como alternativa
- **FR13:** O admin deve poder **criar e editar todo conteúdo manualmente** com editor rich text para descrições, duplicação de módulos/aulas, e status rascunho/publicado por aula
- **FR14:** O sistema deve exibir **progresso do membro** por produto/módulo (aulas assistidas / total de aulas) de forma visual na interface Netflix-like
- **FR15:** O sistema deve fornecer um **dashboard admin** com visão geral: total de membros, produtos ativos, membros recentes, e acesso rápido às ações principais
- **FR16:** O sistema deve suportar **domínio customizado** (a ser configurado futuramente) para a área de membros
- **FR17:** O sistema deve permitir **upload de arquivos de qualquer tipo** nas aulas (não apenas PDF)
- **FR18:** O sistema deve exibir **preview do produto como o membro verá**, acessível pelo admin
- **FR19:** O sistema deve suportar **bulk upload de múltiplos arquivos** por aula
- **FR20:** O sistema deve exibir no painel admin a **% de completude do curso** (aulas com vídeo, descrição, publicadas)

### Non-Functional Requirements

- **NFR1:** O tempo de carregamento de qualquer página deve ser **< 3 segundos** (P95) para conexões 4G ou superiores
- **NFR2:** O sistema deve suportar **1.000 usuários simultâneos** no MVP sem degradação perceptível de performance
- **NFR3:** A interface do membro deve ser **totalmente responsiva** (desktop, tablet e mobile browser) com design mobile-first dado o perfil do público-alvo
- **NFR4:** A autenticação deve usar **Supabase Auth** com Row Level Security (RLS) para garantir isolamento de dados entre membros
- **NFR5:** O sistema deve ter **uptime >= 99.5%** aproveitando a infraestrutura Vercel + Supabase
- **NFR6:** Todas as comunicações devem usar **HTTPS/TLS**; dados sensíveis não devem ser armazenados em plain text
- **NFR7:** O sistema deve estar em conformidade básica com a **LGPD** (consentimento, direito de exclusão, proteção de dados pessoais)
- **NFR8:** O código deve seguir **TypeScript strict mode** com ESLint e Prettier configurados
- **NFR9:** O sistema deve usar **absolute imports** conforme padrão AIOX
- **NFR10:** A arquitetura deve ser **stateless** para permitir escalabilidade horizontal futura
- **NFR11:** A interface do membro deve priorizar **acessibilidade básica**: fontes legíveis (mín. 16px), contraste adequado, botões com área de toque mínima de 44px, navegação por teclado
- **NFR12:** O endpoint de webhook deve validar **assinatura/token** da Payt para evitar requisições fraudulentas
- **NFR13:** O sistema de IA deve usar a **Gemini API** (Google) para geração de banners

---

## 3. User Interface Design Goals

### Overall UX Vision

Uma experiência dividida em duas interfaces completamente distintas:

1. **Área de Membros (público):** Visual Netflix-like — escuro, imersivo, visual-first. Banners hero grandes, carrosséis horizontais de conteúdo, navegação mínima. O membro nunca deve se sentir perdido. Projetado para pessoas de 30-80 anos que podem não ser tech-savvy: fontes grandes, poucos botões, ações óbvias.

2. **Painel Admin (interno):** Clean, funcional, orientado a tarefas. Dashboard com métricas rápidas, CRUD eficiente para produtos/módulos/aulas com editor rich text, duplicação e bulk upload. O admin é tech-savvy em marketing, então a interface pode ser mais densa — mas sempre clara.

### Key Interaction Paradigms

- **Browse & Watch:** O membro navega visualmente (Netflix-style) e clica para assistir. Máximo 3 cliques até o conteúdo: Home → Produto → Aula
- **Create & Manage:** O admin usa formulários com rich text, duplicação e bulk upload para criar conteúdo de forma eficiente
- **Progressive Disclosure:** Mostrar apenas o essencial; detalhes sob demanda (expandir descrições, ver mais módulos)
- **Visual Feedback:** Progresso visual (barras, checkmarks em aulas concluídas), estados de loading, confirmações de ação

### Core Screens and Views

**Área de Membros:**
1. **Login/Registro** — Tela simples com email/senha, recuperação de senha
2. **Home (Catálogo)** — Vitrine Netflix-like com banners hero e carrosséis de produtos acessíveis
3. **Produto (Módulos)** — Lista de módulos com banners, descrição e progresso
4. **Módulo (Aulas)** — Lista de aulas com status (assistida/pendente), duração, descrição
5. **Player de Aula** — Vídeo embed (YouTube/Panda Video) + PDF anexo + seção de comentários

**Painel Admin:**
6. **Dashboard** — Métricas gerais, atalhos para ações frequentes
7. **Gestão de Produtos** — Lista, criar/editar produto, geração de banners via IA
8. **Gestão de Módulos/Aulas** — CRUD com drag-and-drop para reordenação
9. **Gestão de Membros** — Lista, busca, filtros, atribuição de acesso
10. **Configurações** — Webhook, domínio, preferências gerais

### Accessibility

**WCAG AA (parcial)** — Foco em acessibilidade prática para o público-alvo:
- Contraste mínimo 4.5:1 para texto
- Fontes >= 16px body, >= 20px headings
- Área de toque mínima 44x44px em mobile
- Navegação por teclado funcional
- Alt text em imagens/banners
- Não depender exclusivamente de cor para comunicar informação

### Branding

- A ser definido pelo stakeholder — inicialmente usar paleta neutra/escura (Netflix-inspired) para área de membros
- Painel admin com tema claro e profissional
- Logo e identidade visual da The Scalers a serem incorporados posteriormente
- Banners e imagens de módulos podem ser gerados via IA (Gemini) ou uploadados manualmente pelo admin

### Target Devices and Platforms

**Web Responsive** — Desktop, tablet e mobile browser. Mobile-first design dado que grande parte do público-alvo acessa via smartphone. Sem app nativo no MVP.

---

## 4. Technical Assumptions

### Repository Structure: Monorepo

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

### Service Architecture: Serverless

- **Frontend + API:** Next.js no Vercel (App Router + Route Handlers)
- **Database + Auth + Storage:** Supabase (PostgreSQL, Auth, Storage)
- **IA (imagens):** Gemini API (Google) para geração de banners — chamada via Route Handlers do Next.js
- **Webhook:** Next.js Route Handler dedicado para receber webhooks da Payt

**Rationale:** Serverless minimiza complexidade operacional para equipe enxuta. Vercel e Supabase oferecem free tier generoso e escalam automaticamente. Sem necessidade de gerenciar servidores, containers ou infraestrutura.

### Testing Requirements: Unit + Integration

- **Unit tests:** Jest + React Testing Library para componentes e lógica de negócio
- **Integration tests:** Testes de API routes (webhook, CRUD) com banco de teste
- **E2E:** Não no MVP — adicionar com Playwright na Phase 2
- **Linting:** ESLint + Prettier com config strict
- **Type checking:** TypeScript strict mode (`tsc --noEmit`)

**Rationale:** Unit + integration cobre os cenários críticos (webhook processing, controle de acesso, CRUD) sem overhead excessivo de E2E para equipe de 1.

### Additional Technical Assumptions

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

## 5. Epic List

| # | Epic | Goal |
|---|------|------|
| 1 | **Foundation & Auth** | Estabelecer projeto Next.js, Supabase, autenticação de membros e admin, e layout base das duas interfaces (admin + membro) |
| 2 | **Gestão de Conteúdo (Admin)** | Permitir que o admin crie e gerencie produtos, módulos e aulas com suporte a vídeo embed e PDFs |
| 3 | **Área de Membros Netflix-like** | Implementar a interface de consumo de conteúdo com navegação visual, player de vídeo e comentários |
| 4 | **Integração Payt & Controle de Acesso** | Receber webhooks da Payt, liberar acesso automático por produto e implementar controle de visibilidade |
| 5 | **Geração de Banners via IA** | Permitir que o admin gere imagens de banner para produtos e módulos via Gemini API, com upload manual como alternativa |
| 6 | **Rebranding & Ferramentas Avançadas de Conteúdo** | Remover AI Wizard/Claude API, adicionar rich text, duplicação, bulk upload, preview de produto e barra de progresso do curso no admin |

---

## 6. Epic Details

---

### Epic 1: Foundation & Auth

**Goal:** Estabelecer a infraestrutura base do projeto — Next.js 16+ com App Router, integração Supabase (DB, Auth, Storage), layouts fundamentais para as duas interfaces (painel admin e área de membros), autenticação funcional para membros e admin, e deploy contínuo via Vercel. Ao final deste epic, um membro pode fazer login e ver uma página placeholder, e o admin pode acessar um dashboard esqueleto.

#### Story 1.1: Project Setup & Supabase Integration

> Como **desenvolvedor**,
> quero inicializar o projeto Next.js 16+ com Supabase integrado,
> para que tenhamos a base técnica funcional com deploy contínuo.

**Acceptance Criteria:**

1. Projeto Next.js 16+ criado em `packages/memberly-app/` com App Router, TypeScript strict, Tailwind CSS v4 e Zustand configurados
2. Supabase project conectado com variáveis de ambiente (`.env.local`) para DB, Auth e Storage
3. Supabase client configurado em `lib/supabase/` com client-side e server-side helpers
4. ESLint + Prettier configurados com regras do projeto
5. Absolute imports configurados via `tsconfig.json` paths
6. App roda localmente (`npm run dev`) e exibe página de canary/health check na rota `/`
7. Deploy funcional no Vercel (push to main = deploy automático)

---

#### Story 1.2: Database Schema & RLS Foundation

> Como **desenvolvedor**,
> quero criar o schema inicial do banco de dados com RLS,
> para que os dados estejam estruturados e seguros desde o início.

**Acceptance Criteria:**

1. Tabelas criadas via migrations Supabase: `profiles`, `products`, `modules`, `lessons`, `member_access`, `comments`
2. Tabela `profiles` estende o auth.users do Supabase com campos: `id`, `full_name`, `avatar_url`, `role` (member/admin), `created_at`
3. Tabela `products` com: `id`, `title`, `description`, `banner_url`, `slug`, `is_published`, `sort_order`, `created_at`, `updated_at`
4. Tabela `modules` com: `id`, `product_id` (FK), `title`, `description`, `banner_url`, `sort_order`, `created_at`
5. Tabela `lessons` com: `id`, `module_id` (FK), `title`, `description`, `video_provider` (youtube/pandavideo), `video_id`, `pdf_url`, `sort_order`, `duration_minutes`, `created_at`
6. Tabela `member_access` com: `id`, `profile_id` (FK), `product_id` (FK), `granted_at`, `granted_by` (webhook/manual), `transaction_id`
7. Tabela `comments` com: `id`, `lesson_id` (FK), `profile_id` (FK), `content`, `parent_id` (self-ref FK para replies), `created_at`
8. Tabela `lesson_progress` com: `id`, `profile_id` (FK), `lesson_id` (FK), `completed`, `completed_at`
9. RLS policies habilitadas: membros só acessam dados de produtos que possuem em `member_access`, admin acessa tudo
10. Migration scripts commitados e aplicáveis via `supabase db push`

---

#### Story 1.3: Auth System (Member + Admin)

> Como **membro ou admin**,
> quero fazer login com email/senha e ser redirecionado para a interface correta,
> para que eu acesse apenas o que me é permitido.

**Acceptance Criteria:**

1. Página de login (`/login`) com formulário de email/senha usando Supabase Auth
2. Página de recuperação de senha (`/forgot-password`) funcional
3. Após login, redirect automático: `role=admin` → `/admin`, `role=member` → `/` (área de membros)
4. Middleware Next.js protege rotas `/admin/*` (apenas role=admin) e rotas de membro (apenas autenticados)
5. Página de logout funcional que limpa sessão e redireciona ao login
6. Sessão persistida via Supabase Auth (refresh token automático)
7. UI do login é limpa, centralizada, com branding placeholder e responsiva

---

#### Story 1.4: Admin Layout & Dashboard Shell

> Como **admin**,
> quero acessar um painel administrativo com navegação e dashboard,
> para que eu tenha um ponto central de gestão do sistema.

**Acceptance Criteria:**

1. Layout admin (`/admin`) com sidebar de navegação: Dashboard, Produtos, Membros, Configurações
2. Sidebar responsiva (collapsa em mobile para hamburger menu)
3. Dashboard com cards placeholder: Total de Membros, Total de Produtos, Membros Recentes, Ações Rápidas
4. Header com nome do admin logado e botão de logout
5. Breadcrumb navigation funcional
6. Layout usa Tailwind CSS com tema claro e profissional

---

#### Story 1.5: Member Layout Shell (Netflix-like Base)

> Como **membro**,
> quero ver uma interface visual estilo Netflix ao fazer login,
> para que minha experiência de navegação seja familiar e agradável.

**Acceptance Criteria:**

1. Layout de membro (`/`) com header minimal: logo placeholder, nome do membro, botão de logout
2. Página home com layout Netflix-like: hero banner grande no topo (placeholder), área de carrosséis horizontais (placeholder)
3. Footer simples com links de suporte e copyright
4. Tema escuro (Netflix-inspired) com paleta neutra: fundo escuro (#141414), texto branco, acentos em cor primária
5. Layout totalmente responsivo (mobile-first): cards se ajustam, hero redimensiona, navegação simplifica
6. Fontes >= 16px body, botões >= 44px touch target
7. Transições suaves de navegação entre páginas

---

### Epic 2: Gestão de Conteúdo (Admin)

**Goal:** Dotar o painel administrativo de funcionalidade completa para criação e gestão de produtos, módulos e aulas. O admin poderá criar a estrutura de um curso do zero, configurar vídeos (YouTube/Panda Video), anexar PDFs, reordenar conteúdo e publicar/despublicar produtos. Ao final deste epic, o admin pode criar um curso completo pronto para ser consumido por membros.

#### Story 2.1: CRUD de Produtos

> Como **admin**,
> quero criar, editar, listar e excluir produtos (cursos/mentorias),
> para que eu possa gerenciar o catálogo de conteúdo oferecido.

**Acceptance Criteria:**

1. Página `/admin/products` lista todos os produtos com: título, banner (thumbnail), status (publicado/rascunho), número de módulos, data de criação
2. Botão "Novo Produto" abre formulário com campos: título, descrição (textarea), banner (upload de imagem), slug (auto-gerado do título, editável)
3. Banner é uploaded para Supabase Storage e URL salva no produto
4. Edição de produto existente com os mesmos campos, pré-preenchidos
5. Toggle de publicação (publicado/rascunho) — produtos não publicados não aparecem para membros
6. Exclusão de produto com confirmação (soft delete ou hard delete com warning)
7. Validação de formulário: título obrigatório, slug único
8. Feedback visual de sucesso/erro nas operações (toast notifications)

---

#### Story 2.2: CRUD de Módulos

> Como **admin**,
> quero criar, editar, reordenar e excluir módulos dentro de um produto,
> para que eu organize o conteúdo em seções lógicas.

**Acceptance Criteria:**

1. Página `/admin/products/[id]/modules` lista módulos do produto com: título, banner, número de aulas, ordem
2. Formulário de criação/edição de módulo: título, descrição, banner (upload)
3. Drag-and-drop para reordenar módulos (atualiza `sort_order` no banco)
4. Exclusão de módulo com confirmação (alerta se contém aulas)
5. Breadcrumb: Produtos > [Nome do Produto] > Módulos
6. Módulos são exibidos na ordem definida pelo `sort_order`

---

#### Story 2.3: CRUD de Aulas com Video Embed

> Como **admin**,
> quero criar aulas com vídeos do YouTube ou Panda Video e anexar PDFs,
> para que o conteúdo esteja completo para os membros.

**Acceptance Criteria:**

1. Página `/admin/products/[id]/modules/[moduleId]/lessons` lista aulas do módulo com: título, provider de vídeo, duração, ordem
2. Formulário de criação/edição de aula: título, descrição, provider de vídeo (select: YouTube / Panda Video), ID ou URL do vídeo, duração estimada (minutos), upload de PDF (opcional)
3. Preview do vídeo embed no formulário de edição (exibe o player embedado conforme o provider selecionado)
4. PDF uploaded para Supabase Storage com URL salva na aula
5. Drag-and-drop para reordenar aulas dentro do módulo
6. Exclusão de aula com confirmação
7. Breadcrumb: Produtos > [Produto] > Módulos > [Módulo] > Aulas

---

#### Story 2.4: Gestão de Membros (Admin)

> Como **admin**,
> quero visualizar, buscar e gerenciar membros e seus acessos,
> para que eu tenha controle sobre quem acessa cada produto.

**Acceptance Criteria:**

1. Página `/admin/members` lista membros com: nome, email, data de registro, número de produtos com acesso
2. Busca por nome ou email com resultado em tempo real (debounced)
3. Filtro por produto (ver apenas membros com acesso a um produto específico)
4. Ao clicar em um membro, exibir detalhes: perfil, lista de produtos com acesso (com data de liberação e origem: webhook/manual)
5. Ação de atribuir acesso manual: selecionar produto e confirmar
6. Ação de remover acesso: selecionar produto e confirmar com warning
7. Paginação na lista de membros (preparado para 10K+ registros)

---

### Epic 3: Área de Membros Netflix-like

**Goal:** Implementar a experiência completa de consumo de conteúdo para membros — navegação visual estilo Netflix com banners e carrosséis, player de vídeo funcional (YouTube e Panda Video), visualização de PDFs, progresso por produto/módulo, e sistema de comentários nas aulas. Ao final deste epic, um membro pode navegar, assistir aulas, baixar materiais e comentar.

#### Story 3.1: Home — Catálogo Netflix-like

> Como **membro**,
> quero ver meus produtos em uma vitrine visual estilo Netflix,
> para que eu encontre facilmente o conteúdo que quero assistir.

**Acceptance Criteria:**

1. Página home (`/`) exibe hero banner rotativo com o produto mais recente ou featured
2. Abaixo do hero, carrosséis horizontais ("Continue Assistindo" se houver progresso, "Meus Cursos" com produtos do membro)
3. Cada card de produto exibe: banner, título, barra de progresso (% de aulas concluídas)
4. Cards são clicáveis e levam à página do produto
5. Se o membro não tem produtos, exibir mensagem amigável ("Você ainda não tem cursos. Entre em contato com o suporte.")
6. Carrosséis com scroll horizontal (drag em desktop, swipe em mobile)
7. Layout responsivo: 4-5 cards em desktop, 2 cards em tablet, 1.5 cards em mobile (mostrando parcialmente o próximo)
8. Loading skeletons enquanto dados carregam

---

#### Story 3.2: Página de Produto — Módulos

> Como **membro**,
> quero ver todos os módulos de um produto com seu progresso,
> para que eu saiba o que já assisti e o que falta.

**Acceptance Criteria:**

1. Página `/products/[slug]` exibe: banner hero do produto, título, descrição
2. Lista de módulos em grid ou lista vertical com: banner, título, descrição, número de aulas, progresso (X/Y concluídas)
3. Módulo clicável leva à página de aulas
4. Módulos exibidos na ordem definida pelo admin (`sort_order`)
5. Indicador visual de módulo concluído (100% das aulas assistidas)
6. Botão "Continuar de onde parei" que leva à próxima aula não concluída
7. Verificação de acesso: se membro não tem acesso ao produto, redirect para home com mensagem

---

#### Story 3.3: Player de Aula com Video Embed

> Como **membro**,
> quero assistir aulas em vídeo e acessar materiais PDF,
> para que eu consuma o conteúdo do curso.

**Acceptance Criteria:**

1. Página `/products/[slug]/lessons/[lessonId]` exibe player de vídeo (YouTube iframe ou Panda Video embed conforme configurado)
2. Abaixo do player: título da aula, descrição
3. Se houver PDF: botão "Material da Aula" com opção de visualizar inline (iframe) ou baixar
4. Sidebar ou lista abaixo com as outras aulas do módulo (navegação rápida entre aulas)
5. Aula atual destacada na lista de aulas
6. Botões "Aula Anterior" e "Próxima Aula" para navegação sequencial
7. Botão "Marcar como concluída" que atualiza `lesson_progress`
8. Player responsivo (aspect ratio 16:9, adapta ao viewport)
9. Verificação de acesso: sem acesso ao produto → redirect

---

#### Story 3.4: Sistema de Comentários

> Como **membro**,
> quero comentar nas aulas para tirar dúvidas,
> para que eu possa interagir e esclarecer pontos do conteúdo.

**Acceptance Criteria:**

1. Seção de comentários abaixo do player na página de aula
2. Textarea para novo comentário com botão "Enviar"
3. Lista de comentários em ordem cronológica (mais recentes primeiro) com: nome do autor, avatar placeholder, data relativa ("há 2 horas"), conteúdo
4. Suporte a replies (1 nível): botão "Responder" em cada comentário, replies exibidos indentados abaixo do pai
5. Admin pode responder comentários (identificado com badge "Admin")
6. Paginação ou load-more para comentários (preparado para muitas interações)
7. Validação: comentário não pode ser vazio, limite de 2000 caracteres
8. Membro só pode comentar em aulas de produtos que tem acesso

---

#### Story 3.5: Tracking de Progresso

> Como **membro**,
> quero ver meu progresso nos cursos automaticamente,
> para que eu saiba quanto já avancei e o que falta.

**Acceptance Criteria:**

1. Ao marcar aula como concluída, `lesson_progress` é atualizado no banco
2. Progresso calculado em tempo real: % de aulas concluídas por módulo e por produto
3. Barra de progresso visível nos cards de produto (home) e nos cards de módulo (página de produto)
4. Seção "Continue Assistindo" na home mostra o último produto/aula acessado pelo membro
5. Ícone de checkmark nas aulas já concluídas na lista de aulas
6. Progresso persistido no banco via `lesson_progress` (não localStorage)

---

### Epic 4: Integração Payt & Controle de Acesso

**Goal:** Implementar a integração com o gateway de pagamento Payt via webhook para liberação automática de acesso, e garantir que o controle de acesso funcione end-to-end: compra → webhook → acesso instantâneo ao produto. Ao final deste epic, o fluxo de compra-para-acesso está automatizado.

#### Story 4.1: Webhook Endpoint da Payt

> Como **sistema**,
> quero receber e processar webhooks da Payt,
> para que compras sejam convertidas automaticamente em acessos.

**Acceptance Criteria:**

1. Route Handler em `/api/webhooks/payt` recebe POST requests da Payt
2. Validação de assinatura/token do webhook para garantir autenticidade (conforme documentação da Payt)
3. Payload parseado para extrair: email do comprador, ID do produto comprado, ID da transação, status da compra
4. Se status = "approved/paid": buscar ou criar membro por email, criar registro em `member_access` vinculando membro ao produto
5. Se membro não existe: criar profile com role=member e enviar email de boas-vindas com credenciais (via Supabase Auth invite)
6. Se acesso já existe para esse membro+produto: ignorar (idempotência)
7. Log de todos os webhooks recebidos para auditoria (tabela `webhook_logs`)
8. Retornar HTTP 200 para webhooks válidos, 401 para inválidos, 500 para erros internos
9. Testes de integração cobrindo cenários: nova compra, membro existente, produto duplicado, assinatura inválida

---

#### Story 4.2: Mapeamento Produto Payt → Produto Memberly

> Como **admin**,
> quero mapear IDs de produtos da Payt para produtos do Memberly,
> para que o webhook saiba qual produto liberar.

**Acceptance Criteria:**

1. Tabela `product_mappings` com: `id`, `external_product_id` (ID na Payt), `product_id` (FK para products), `gateway` (payt), `created_at`
2. Na edição de produto no admin, campo para informar o "ID externo (Payt)" do produto
3. Webhook usa `product_mappings` para traduzir o ID do produto recebido no payload para o produto interno
4. Se ID externo não encontrado no mapeamento: logar warning e retornar 200 (não falhar)
5. Um produto pode ter múltiplos mapeamentos (diferentes ofertas na Payt para o mesmo produto)

---

#### Story 4.3: Fluxo de Acesso Automático End-to-End

> Como **membro que acabou de comprar**,
> quero acessar o produto imediatamente após a compra,
> para que eu não precise esperar ou contatar suporte.

**Acceptance Criteria:**

1. Fluxo completo funcional: Payt envia webhook → sistema processa → membro recebe acesso → login disponível
2. Se membro é novo: email com link de definição de senha é enviado automaticamente via Supabase Auth
3. Se membro já existe: acesso ao novo produto aparece imediatamente no catálogo (sem necessidade de novo login)
4. Tempo entre webhook recebido e acesso disponível: < 5 segundos
5. Admin pode verificar no painel de membros que o acesso foi liberado (com origem "webhook" e transaction_id)
6. Teste end-to-end simulado: enviar webhook mock → verificar acesso criado → verificar produto visível no catálogo do membro

---

### Epic 5: Geração de Banners via IA

**Goal:** Permitir que o admin gere imagens de banner para produtos e módulos via Gemini API (Google), com upload manual como alternativa. Ao final deste epic, o admin pode gerar banners visuais diretamente nos formulários de criação/edição de produtos e módulos.

#### Story 5.1: Geração de Banners via IA nos Formulários

> Como **admin**,
> quero gerar imagens de banner para produtos e módulos via IA,
> para que a área de membros tenha visual completo sem necessidade de designer.

**Acceptance Criteria:**

1. Nos formulários de criação/edição de produto e módulo, botão "Gerar Banner com IA" ao lado do upload manual
2. Ao clicar, enviar descrição do produto/módulo para **Gemini API (Google)** com capacidade nativa de geração de imagens
3. Banner gerado exibido como preview para aprovação
4. Admin pode aceitar, rejeitar (manter atual ou placeholder) ou regenerar o banner
5. Banners aprovados são salvos no Supabase Storage e vinculados ao respectivo produto/módulo
6. Se API de imagem indisponível: fallback para banners placeholder com gradient + texto
7. Loading state durante geração com mensagem "Gerando banner..."

---

### Epic 6: Rebranding & Ferramentas Avançadas de Conteúdo

**Goal:** Remover o AI Wizard e a dependência da Claude API, e adicionar ferramentas avançadas de criação manual de conteúdo: rich text editor, duplicação de módulos/aulas, status rascunho/publicado por aula, preview do produto como membro, reestruturação do layout do player, bulk upload de arquivos e barra de progresso do curso no admin.

#### Story 6.1: Remoção do AI Wizard & Claude API

> Como **desenvolvedor**,
> quero remover o AI Wizard e toda integração com a Claude API,
> para que o sistema não dependa mais dessa API e o código fique mais enxuto.

#### Story 6.2: Rich Text Editor nas Descrições de Aulas

> Como **admin**,
> quero editar descrições de aulas com um editor rich text,
> para que eu possa formatar o conteúdo com negrito, itálico, listas e links.

#### Story 6.3: Geração de Banners Standalone nos Formulários

> Como **admin**,
> quero gerar banners via IA diretamente nos formulários de produto e módulo,
> para que eu não precise de um wizard separado para obter banners visuais.

#### Story 6.4: Status Rascunho/Publicado por Aula + Duplicar Módulo/Aula

> Como **admin**,
> quero controlar o status de publicação de cada aula individualmente e duplicar módulos/aulas,
> para que eu tenha mais controle e agilidade na gestão de conteúdo.

#### Story 6.5: Preview do Produto como Membro (Admin)

> Como **admin**,
> quero visualizar o produto exatamente como o membro verá,
> para que eu possa validar a experiência antes de publicar.

#### Story 6.6: Reestruturar Layout do Player de Aula

> Como **membro**,
> quero um layout de player de aula mais organizado e funcional,
> para que minha experiência de aprendizado seja melhor.

#### Story 6.7: Bulk Upload + Barra de Progresso do Curso no Admin

> Como **admin**,
> quero fazer upload de múltiplos arquivos por aula e ver a % de completude do curso,
> para que eu gerencie o conteúdo de forma mais eficiente.

---

## 7. Checklist Results Report

> A ser preenchido após execução do `pm-checklist` na fase de validação.

---

## 8. Next Steps

### UX Expert Prompt

> `@ux-design-expert`: Revise o PRD do Memberly em `docs/prd.md`, com foco especial na Seção 3 (UI Design Goals) e nas stories do Epic 3 (Área de Membros Netflix-like). Crie a arquitetura de design: design tokens, component inventory, wireframes conceituais e user flows para as duas interfaces (membro Netflix-like + painel admin). O público-alvo de membros é 30-80 anos com baixa familiaridade digital — acessibilidade e simplicidade são prioridade absoluta.

### Architect Prompt

> `@architect`: Revise o PRD do Memberly em `docs/prd.md`, com foco na Seção 4 (Technical Assumptions) e nos 6 epics. Crie a arquitetura técnica: schema detalhado do banco, estrutura de pastas do Next.js App Router, definição de API routes, integração Supabase (Auth, RLS, Storage), fluxo do webhook Payt, e integração com Gemini API para geração de banners. Valide as decisões técnicas do PRD e proponha ajustes se necessário.

---

*Documento gerado por Morgan (PM Agent) — Synkra AIOX v5.0.3*
*— Morgan, planejando o futuro 📊*
