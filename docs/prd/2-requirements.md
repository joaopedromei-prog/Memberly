# 2. Requirements

## Functional Requirements

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
- **FR12:** O sistema deve oferecer **geração de área de membros via IA**: a partir de inputs mínimos (nome do produto, tema, público-alvo, quantidade de módulos), a IA gera automaticamente a estrutura completa de módulos, títulos de aulas, descrições e sugestões de banners
- **FR13:** O admin deve poder **editar manualmente** todo conteúdo gerado pela IA (títulos, descrições, banners, estrutura) antes ou depois da publicação
- **FR14:** O sistema deve exibir **progresso do membro** por produto/módulo (aulas assistidas / total de aulas) de forma visual na interface Netflix-like
- **FR15:** O sistema deve fornecer um **dashboard admin** com visão geral: total de membros, produtos ativos, membros recentes, e acesso rápido às ações principais
- **FR16:** O sistema deve suportar **domínio customizado** (a ser configurado futuramente) para a área de membros

## Non-Functional Requirements

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
- **NFR13:** O sistema de IA deve usar a **Claude API** (Anthropic) para geração de conteúdo textual e estrutural, e a **Gemini API** (Google) para geração de imagens de banners

---
