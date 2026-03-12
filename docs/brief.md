# Project Brief: Memberly

> **Versão:** 1.0
> **Data:** 2026-03-11
> **Autor:** Atlas (Analyst Agent) + Stakeholder Input
> **Status:** Draft

---

## Executive Summary

**Memberly** é uma plataforma web interna de criação de áreas de membros estilo Netflix, desenvolvida para a **The Scalers** — uma empresa de marketing digital especializada em infoprodutos e estratégias de direct response para experts do nicho de saúde.

O produto resolve um problema central: **eliminar a dependência de plataformas terceiras** (Cademi, Astron Members) para hospedagem de cursos e mentorias, oferecendo controle total, customização profunda e — como diferencial estratégico — **geração automatizada de áreas de membros completas via IA**, incluindo módulos, banners, descrições de aulas e estrutura de conteúdo a partir de poucos inputs.

**Proposta de valor:** Uma ferramenta interna que permite a um profissional de marketing, sem conhecimento técnico avançado, criar e gerenciar áreas de membros premium com UI Netflix-like, onde a IA faz o trabalho pesado de estruturação e design.

---

## Problem Statement

### Situação Atual

A The Scalers opera no mercado de infoprodutos digitais, vendendo cursos, mentorias e acompanhamentos para experts do nicho de saúde. Atualmente, a hospedagem de conteúdo depende de plataformas terceiras como Cademi e Astron Members.

### Pain Points

1. **Custo recorrente elevado** — Plataformas SaaS cobram mensalidades que escalam com o número de alunos, impactando margens em operações de alto volume
2. **Customização limitada** — Mesmo plataformas white-label impõem restrições de layout, fluxo e funcionalidade que não atendem necessidades específicas
3. **Falta de controle** — Dependência de terceiros para uptime, features, políticas de uso e roadmap do produto
4. **Processo manual de criação** — Montar módulos, banners, descrições e estrutura de cada novo produto é trabalhoso e repetitivo
5. **Zero integração com IA** — Nenhuma plataforma do mercado oferece geração automatizada de áreas de membros completas

### Por Que Resolver Agora

- A operação está em crescimento e os custos com plataformas terceiras tendem a aumentar
- O diferencial competitivo de gerar áreas de membros via IA não existe no mercado — first-mover advantage
- A equipe é enxuta (1 pessoa + IA + dev futuro), então a automação via IA é essencial para viabilizar a operação

---

## Proposed Solution

### Conceito

Uma aplicação web (Next.js + Supabase) que funciona como **ferramenta interna de criação e gestão de áreas de membros**, com duas interfaces principais:

1. **Painel Administrativo** — Para o gestor da The Scalers criar, configurar e gerenciar produtos, módulos, aulas e membros
2. **Área de Membros** — Interface Netflix-like para os alunos/membros consumirem conteúdo (vídeo-aulas e PDFs)

### Diferencial Chave: IA Generativa

Com poucos inputs (nome do produto, tema, público-alvo, quantidade de módulos), a IA gera automaticamente:
- Estrutura completa de módulos e aulas
- Banners visuais para módulos
- Títulos e descrições das aulas
- Estrutura de navegação

### Por Que Vai Funcionar

- **Controle total:** Infraestrutura própria, sem dependência de terceiros
- **Custo previsível:** Custos de hosting (Vercel/Supabase) são significativamente menores que SaaS por aluno
- **Velocidade de criação:** O que leva horas manualmente, a IA faz em minutos
- **UX premium:** Interface Netflix-like projetada especificamente para o público 30-80 anos com baixa familiaridade digital

---

## Target Users

### Primary User Segment: Gestor de Produtos (Admin)

- **Perfil:** Profissional de marketing da The Scalers, especializado em marketing digital
- **Conhecimento técnico:** Intermediário — sabe usar bem tecnologia, mas sem background de programação
- **Workflow atual:** Cria produtos (cursos, mentorias), configura páginas de venda, gerencia alunos
- **Necessidades:**
  - Interface administrativa intuitiva e autoexplicativa
  - Criação rápida de novas áreas de membros (idealmente com IA)
  - Visibilidade sobre membros, acessos e conteúdos
  - Integração com gateway de pagamento para liberação automática
- **Frustração principal:** Processo manual, lento e limitado nas plataformas atuais

### Secondary User Segment: Membros (Alunos/Clientes)

- **Perfil demográfico:** Homens e mulheres, 30-80 anos, brasileiros
- **Conhecimento técnico:** Baixo — muitos não têm familiaridade avançada com internet e navegação
- **Comportamento:** Consomem conteúdo de saúde, buscam transformação pessoal via cursos de experts
- **Necessidades:**
  - Interface extremamente simples e intuitiva (zero fricção)
  - Navegação clara e visual (banners grandes, poucos cliques)
  - Player de vídeo funcional e confiável
  - Acesso fácil a materiais complementares (PDFs)
  - Possibilidade de tirar dúvidas via comentários nas aulas
- **Frustração principal:** Plataformas confusas, muitos botões, difícil encontrar o conteúdo

---

## Goals & Success Metrics

### Business Objectives

- **Eliminar custos com plataformas terceiras** em até 6 meses após lançamento do MVP
- **Reduzir tempo de criação de área de membros** de horas para minutos (via IA)
- **Manter taxa de reembolso por experiência ruim** abaixo de 2%
- **Suportar 10.000 membros ativos** no MVP, com arquitetura escalável para 1M

### User Success Metrics

- **Time-to-first-content:** Membro acessa primeira aula em < 60 segundos após login
- **Criação de área de membros via IA:** Admin cria área completa em < 10 minutos
- **Taxa de conclusão de módulos:** Monitorar para otimizar engajamento
- **Tickets de suporte por UX:** < 5% dos membros ativos

### Key Performance Indicators (KPIs)

- **Uptime:** >= 99.5%
- **Tempo de carregamento:** < 3 segundos (P95)
- **Membros ativos simultâneos suportados:** 1.000 (MVP)
- **Áreas de membros criadas por mês:** Métrica de adoção interna
- **NPS dos membros:** >= 7.0

---

## MVP Scope

### Core Features (Must Have)

- **UI Netflix-like para membros:** Sistema de banners, catálogo visual de cursos/módulos, navegação intuitiva com cards grandes e poucos cliques — projetado para público 30-80 anos com baixa familiaridade digital
- **Gestão de módulos e aulas (Admin):** CRUD completo de produtos, módulos e aulas com upload de vídeo e PDFs, organização drag-and-drop
- **Controle de acesso por produto:** Cada membro vê APENAS os produtos que comprou, com liberação automática via webhook do gateway de pagamento
- **Integração webhook com gateway de pagamento:** Receber notificação de compra e liberar acesso instantâneo ao produto específico comprado
- **Player de vídeo integrado:** Player funcional e responsivo para vídeo-aulas (pode usar player externo embedado como Vimeo/YouTube ou solução própria)
- **Visualizador de PDFs:** Abrir/baixar materiais complementares em PDF dentro da plataforma
- **Sistema de comentários nas aulas:** Membros podem comentar e tirar dúvidas embaixo de cada aula
- **Geração de área de membros via IA:** Com poucos inputs, a IA gera automaticamente estrutura de módulos, banners, títulos e descrições das aulas
- **Autenticação e gestão de membros:** Login/registro, recuperação de senha, painel básico de gerenciamento de membros no admin

### Out of Scope for MVP

- Gamificação (pontos, ranking, badges)
- Certificados de conclusão
- Comunidade/fórum
- App mobile nativo (iOS/Android)
- Multi-idioma
- Vendas internas (upsell dentro da plataforma)
- Importação em lotes de membros
- Analytics avançado
- White-label / multi-tenant (é ferramenta interna, não SaaS)

### MVP Success Criteria

O MVP é bem-sucedido quando:
1. Um gestor consegue criar uma área de membros completa usando IA em menos de 10 minutos
2. Um membro compra, recebe acesso automaticamente e assiste sua primeira aula sem fricção
3. A plataforma suporta 10.000 membros ativos com performance aceitável (< 3s load time)
4. O sistema de comentários funciona para interação básica aluno-conteúdo

---

## Post-MVP Vision

### Phase 2 Features

- **Gamificação:** Sistema de pontos, rankings e badges para aumentar engajamento e reduzir evasão
- **Certificados:** Geração automática de certificados personalizados ao concluir módulos/cursos
- **Analytics dashboard:** Métricas de engajamento, progresso dos alunos, taxa de conclusão, aulas mais vistas
- **Importação em lotes:** Migrar membros de plataformas anteriores em massa
- **Notificações:** Email e push para novos conteúdos, lembretes de progresso
- **IA aprimorada:** Geração de thumbnails, sugestões de estrutura baseadas no nicho, otimização de descrições

### Long-term Vision (1-2 anos)

- **Multi-tenant:** Transformar Memberly de ferramenta interna em SaaS, oferecendo para outros infoprodutores
- **App mobile nativo:** Experiência mobile dedicada para membros
- **Comunidade integrada:** Fórum e chat entre membros do mesmo produto
- **Vendas internas:** Upsell e cross-sell dentro da própria área de membros
- **IA avançada:** Criação de conteúdo assistida, transcrição automática de aulas, resumos de aula, quizzes gerados por IA
- **Suporte a 1M+ membros:** Arquitetura redesenhada para escala massiva

### Expansion Opportunities

- **Licenciamento para parceiros:** Oferecer Memberly como white-label para outras agências de marketing digital
- **Marketplace de templates:** Templates de áreas de membros para diferentes nichos
- **Integrações ampliadas:** CRM, email marketing, automação de marketing, plataformas de ads

---

## Technical Considerations

### Platform Requirements

- **Target Platforms:** Web (responsive — desktop e mobile browser)
- **Browser Support:** Chrome, Safari, Firefox, Edge (versões recentes)
- **Performance Requirements:** < 3s page load (P95), suporte a 1.000 usuários simultâneos no MVP

### Technology Preferences

- **Frontend:** Next.js 16+, React, TypeScript, Tailwind CSS
- **State Management:** Zustand
- **Backend:** Next.js API Routes + Supabase (BaaS)
- **Database:** Supabase (PostgreSQL) com Row Level Security (RLS)
- **Hosting/Infrastructure:** Vercel (frontend) + Supabase (backend/DB/auth/storage)
- **IA (texto):** Claude API (Anthropic) para geração de estrutura de áreas de membros
- **IA (imagens):** Gemini API (Google) para geração de banners de módulos e produtos

### Architecture Considerations

- **Repository Structure:** Monorepo com packages/ (conforme estrutura AIOX)
- **Service Architecture:** Serverless (Vercel Edge Functions + Supabase)
- **Integração Webhook:** Endpoint para receber webhooks da Payt (gateway de pagamento)
- **Video Embed:** Suporte a YouTube embed e Panda Video embed (ambos obrigatórios no MVP)
- **Storage:** Supabase Storage para PDFs e assets; vídeos hospedados externamente (YouTube / Panda Video)
- **Security:** RLS no Supabase para isolamento de dados por membro, autenticação via Supabase Auth
- **Escalabilidade:** Arquitetura stateless permite escalar horizontalmente; Supabase e Vercel escalam sob demanda

---

## Constraints & Assumptions

### Constraints

- **Budget:** Baixo — priorizar ferramentas com free tier generoso (Vercel, Supabase) e minimizar custos operacionais
- **Timeline:** O mais rápido possível — MVP funcional como prioridade absoluta
- **Resources:** 1 pessoa (marketing/gestão) + IA para desenvolvimento; futuro dev disponível para manutenção/evolução
- **Technical:** Sem app mobile no MVP; vídeos hospedados externamente para evitar custos de storage/streaming

### Key Assumptions

- O gateway Payt suporta webhooks para notificação de compra e liberação automática de acesso
- Vídeos serão embedados via YouTube (fase inicial) e Panda Video (suporte nativo obrigatório desde o MVP)
- O volume inicial de membros (< 10.000) é suportado pelo free tier / plano básico do Supabase
- A geração de banners via IA utilizará a **Gemini API (Google)** com capacidade nativa de geração de imagens
- O admin da plataforma tem acesso a email e password dos membros não será necessário (Supabase Auth gerencia isso)
- A operação inicial será single-tenant (apenas The Scalers), sem necessidade de isolamento multi-empresa

---

## Risks & Open Questions

### Key Risks

- **Dependência de IA para geração de conteúdo:** A qualidade dos banners e descrições geradas pode não atender expectativas — necessário ciclo de refinamento e possibilidade de edição manual
- **UX para público 30-80 anos:** O público-alvo tem baixa familiaridade digital; qualquer complexidade na interface pode gerar abandono e tickets de suporte
- **Hosting de vídeos:** Depender de plataforma externa para vídeos adiciona um ponto de falha; se o serviço cair, as aulas ficam indisponíveis
- **Escala futura (10K → 1M):** A transição de 10K para 1M membros exigirá revisão significativa de arquitetura, possivelmente migrando de Supabase para infraestrutura dedicada
- **Equipe de 1 pessoa:** Bus factor crítico — se a pessoa responsável ficar indisponível, não há backup para manutenção

### Open Questions (Resolved)

- **Gateway de pagamento:** Payt
- **Hosting de vídeos:** YouTube (inicial) + Panda Video (suporte obrigatório desde o MVP)
- **Produtos atuais:** 1 produto
- **Migração de membros:** Não necessária
- **LGPD específica para saúde:** Sem requisitos específicos além do padrão
- **Domínio:** Ainda não existe — a ser definido

### Areas Needing Further Research

- Benchmark de performance de Supabase com 10K+ usuários ativos
- Documentação da API/webhook da Payt para integração de liberação de acesso
- Documentação do Panda Video para embed e configuração de player
- Documentação da Gemini API para geração de imagens (limites, custos, qualidade de output)

---

## Appendices

### A. Research Summary — Competitive Analysis

**Cademi (cademi.com.br):**
- Hub de membros premium com UI Netflix-like
- Gamificação nativa (pontuação e ranking)
- White-label completo (domínio, layout, textos)
- Alunos ilimitados por preço fixo
- Vendas internas (banners com link para checkout)
- Importação em lotes (até 5.000 contatos)
- Suporte com reuniões e central de ajuda

**Astron Members (astronmembers.com.br):**
- Área de membros premium com vitrine estilo Netflix
- Comunidades privadas
- Suporte multi-idioma
- Certificados personalizados
- App mobile (iOS e Android)
- Formulários de inscrição simplificados
- Integração com Digital Manager Guru

**Diferencial do Memberly vs. concorrentes:**
- Geração automatizada de áreas de membros via IA (nenhum concorrente oferece)
- Ferramenta interna (sem custos de SaaS por aluno)
- Controle total sobre UX, features e roadmap
- Customização ilimitada (código-fonte próprio)

### B. References

- [Cademi — O que a área de membros pode te oferecer](https://cademi.com.br/blog/o-que-a-area-de-membros-da-cademi-pode-te-oferecer/)
- [Cademi — Área de membros estilo Netflix](https://cademi.com.br/blog/area-de-membros-estilo-netflix/)
- [Cademi — Funcionalidades que transformam seu negócio](https://cademi.com.br/blog/funcionalidades-da-cademi/)
- [Astron Members — Plataforma](https://www.astronmembers.com.br/)
- [Astron Members — Features](https://www.astronmembers.com.br/features)

---

## Next Steps

### Immediate Actions

1. **Responder às Open Questions** acima para refinar escopo e decisões técnicas
2. **Handoff para @pm (Morgan)** — Iniciar criação do PRD a partir deste brief
3. **@architect (Aria)** — Validar stack técnica e definir arquitetura detalhada
4. **@data-engineer (Dara)** — Modelar schema do banco de dados (membros, produtos, módulos, aulas, acessos)
5. **@ux-design-expert (Uma)** — Criar wireframes da UI Netflix-like e do painel admin

### PM Handoff

Este Project Brief fornece o contexto completo para o **Memberly**. O próximo passo é ativar `@pm` para trabalhar com o stakeholder na criação do PRD seção por seção, usando este brief como base. O PRD deverá detalhar os requisitos funcionais e não-funcionais de cada feature do MVP.

---

*Documento gerado por Atlas (Analyst Agent) — Synkra AIOX v5.0.3*
*— Atlas, investigando a verdade 🔎*
