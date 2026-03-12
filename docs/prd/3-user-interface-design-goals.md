# 3. User Interface Design Goals

## Overall UX Vision

Uma experiência dividida em duas interfaces completamente distintas:

1. **Área de Membros (público):** Visual Netflix-like — escuro, imersivo, visual-first. Banners hero grandes, carrosséis horizontais de conteúdo, navegação mínima. O membro nunca deve se sentir perdido. Projetado para pessoas de 30-80 anos que podem não ser tech-savvy: fontes grandes, poucos botões, ações óbvias.

2. **Painel Admin (interno):** Clean, funcional, orientado a tarefas. Dashboard com métricas rápidas, CRUD eficiente para produtos/módulos/aulas, wizard de criação via IA com preview. O admin é tech-savvy em marketing, então a interface pode ser mais densa — mas sempre clara.

## Key Interaction Paradigms

- **Browse & Watch:** O membro navega visualmente (Netflix-style) e clica para assistir. Máximo 3 cliques até o conteúdo: Home → Produto → Aula
- **Create & Manage:** O admin usa formulários e wizards para criar conteúdo. A IA reduz friction preenchendo campos automaticamente
- **Progressive Disclosure:** Mostrar apenas o essencial; detalhes sob demanda (expandir descrições, ver mais módulos)
- **Visual Feedback:** Progresso visual (barras, checkmarks em aulas concluídas), estados de loading, confirmações de ação

## Core Screens and Views

**Área de Membros:**
1. **Login/Registro** — Tela simples com email/senha, recuperação de senha
2. **Home (Catálogo)** — Vitrine Netflix-like com banners hero e carrosséis de produtos acessíveis
3. **Produto (Módulos)** — Lista de módulos com banners, descrição e progresso
4. **Módulo (Aulas)** — Lista de aulas com status (assistida/pendente), duração, descrição
5. **Player de Aula** — Vídeo embed (YouTube/Panda Video) + PDF anexo + seção de comentários

**Painel Admin:**
6. **Dashboard** — Métricas gerais, atalhos para ações frequentes
7. **Gestão de Produtos** — Lista, criar/editar produto, wizard IA
8. **Gestão de Módulos/Aulas** — CRUD com drag-and-drop para reordenação
9. **Gestão de Membros** — Lista, busca, filtros, atribuição de acesso
10. **Configurações** — Webhook, domínio, preferências gerais

## Accessibility

**WCAG AA (parcial)** — Foco em acessibilidade prática para o público-alvo:
- Contraste mínimo 4.5:1 para texto
- Fontes >= 16px body, >= 20px headings
- Área de toque mínima 44x44px em mobile
- Navegação por teclado funcional
- Alt text em imagens/banners
- Não depender exclusivamente de cor para comunicar informação

## Branding

- A ser definido pelo stakeholder — inicialmente usar paleta neutra/escura (Netflix-inspired) para área de membros
- Painel admin com tema claro e profissional
- Logo e identidade visual da The Scalers a serem incorporados posteriormente
- Banners e imagens de módulos serão gerados via IA ou uploadados pelo admin

## Target Devices and Platforms

**Web Responsive** — Desktop, tablet e mobile browser. Mobile-first design dado que grande parte do público-alvo acessa via smartphone. Sem app nativo no MVP.

---
