# Generate Gemini UI Prompt

## Purpose

Gerar um prompt altamente otimizado para o Google AI Studio (Gemini 3.1 Pro) que produza UI premium, cinematográfica e animada em **one-shot**. O output é um `.tsx` autocontido que serve como referência visual para o `@dev` integrar no projeto.

Esta task transforma uma story/briefing em um prompt que faz o Gemini entregar resultado de agência de design — não "UI de IA".

---

## Execution Modes

### 1. YOLO Mode - Fast (0-1 prompts)
- Lê a story, gera o prompt sem perguntas
- **Best for:** Componentes simples, hero sections

### 2. Interactive Mode - Balanced **[DEFAULT]**
- Pergunta sobre referências visuais, estilo, animações
- **Best for:** Páginas completas, redesigns

### 3. Pre-Flight Planning
- Analisa o design system existente, mapeia componentes, define paleta
- **Best for:** Primeira UI do projeto ou mudança radical de estilo

---

## Task Definition (AIOX Task Format V1.0)

```yaml
task: generateGeminiUiPrompt()
responsável: Dex (Builder) ou Uma (UX)
responsavel_type: Agente
atomic_layer: Organism

Entrada:
- campo: story_id
  tipo: string
  origem: User Input
  obrigatório: false
  validação: Story must exist in docs/stories/

- campo: component_description
  tipo: string
  origem: User Input
  obrigatório: false
  validação: Free text describing what to build

- campo: reference_style
  tipo: string
  origem: User Input
  obrigatório: false
  validação: editorial|cinematic|minimal|brutalist|glassmorphism|neo-minimal-void

- campo: mode
  tipo: string
  origem: User Input
  obrigatório: false
  validação: yolo|interactive|preflight

Saída:
- campo: gemini_prompt
  tipo: string
  destino: Clipboard / stdout
  persistido: false

- campo: gemini_file
  tipo: file
  destino: docs/gemini-prompts/{story_id}-{component}.prompt.md
  persistido: true
```

---

## Pre-Conditions

```yaml
pre-conditions:
  - [ ] Story exists OR component_description provided
  - [ ] Project design system is readable (tailwind config, existing components)
```

---

## Execution Steps

### Step 1: Gather Context

Ler e extrair de:

1. **A story** (se fornecida) — acceptance criteria, descrição visual
2. **O design system do projeto:**
   - `tailwind.config.ts` — cores, fontes, breakpoints
   - `src/components/ui/` — componentes base existentes
   - `src/app/globals.css` — variáveis CSS customizadas
3. **Componentes existentes similares** — pra manter consistência
4. **Referência visual** (se fornecida) — Pinterest, Dribbble, screenshot

### Step 2: Definir o Perfil Visual

Antes de gerar o prompt, resolver estas decisões:

| Decisão | Opções |
|---------|--------|
| **Mood** | Cinematic / Editorial / Minimal / Brutalist / Playful |
| **Cor dominante** | Dark + accent / Light + contrast / Gradients |
| **Tipografia** | Serif display + Sans body / Mono + Sans / All Sans |
| **Animação** | Framer Motion / GSAP / CSS only / None |
| **Densidade** | Breathing (muito espaço) / Balanced / Dense (dashboard) |
| **Glass effects** | Liquid glass / Frosted / None |

### Step 3: Gerar o Prompt

O prompt DEVE seguir esta estrutura exata (ordem importa — o Gemini processa top-down):

---

#### TEMPLATE DO PROMPT GEMINI

```markdown
## PROJECT REQUIREMENTS

Build a [COMPONENT_TYPE] for [CONTEXT/BRAND] using the following stack:

**Stack (NON-NEGOTIABLE):**
- React 19 (functional components, hooks only)
- TypeScript strict
- Tailwind CSS v4 (use @theme, not tailwind.config)
- [ANIMATION_LIB: motion/react (Framer Motion) | GSAP | CSS only]
- Single .tsx file, fully self-contained
- All data is hardcoded/mocked (this is a visual reference)

---

## 1. GLOBAL DESIGN SYSTEM

### Color Palette
- Background: [HEX] (e.g., #0A0A0A)
- Surface/Card: [HEX] (e.g., #141414)
- Primary accent: [HEX] (e.g., #7C3AED)
- Text primary: [HEX] (e.g., #FAFAFA)
- Text secondary: [HEX] (e.g., #A1A1AA)
- Border: [HEX] (e.g., #27272A)
- Gradient (if applicable): from [HEX] to [HEX]

### Typography
Google Fonts import: `[DISPLAY_FONT]` ([weights]) and `[BODY_FONT]` ([weights]).
- Display/Headlines: '[DISPLAY_FONT]', [fallback]
- Body/UI: '[BODY_FONT]', [fallback]
- Size scale: hero [Xrem], h1 [Xrem], h2 [Xrem], body [Xrem], small [Xrem]
- Letter-spacing: headlines [-0.02em], body [0]
- Line-height: headlines [1.1], body [1.6]

### Spacing & Layout
- Max content width: [1280px | 1440px]
- Section padding: [py-24 lg:py-32]
- Component gap: [gap-6 | gap-8]
- Border radius: [rounded-xl | rounded-2xl | rounded-3xl]

---

## 2. BACKGROUND & ATMOSPHERE

[Choose one or combine:]

**Option A — Solid + Texture:**
Pure [color] background with subtle noise texture (CSS grain overlay, opacity 0.03)

**Option B — Gradient:**
Radial gradient from [color] at center to [color] at edges. Subtle, not Instagram.

**Option C — Video Background:**
Full-screen looping, muted, autoplay `<video>` tag with:
- Slow cinematic zoom (CSS transform scale 1 → 1.05 over 20s, infinite)
- Dark overlay (bg-black/60) for text readability
- Placeholder: use a CSS gradient or solid color as fallback

**Option D — Animated Particles/Shapes:**
Floating [circles|dots|lines] with slow drift animation (Framer Motion).
Opacity 0.1-0.3. Never distracting.

---

## 3. COMPONENT STRUCTURE

[DETAILED DESCRIPTION OF EACH SECTION, TOP TO BOTTOM]

### [Section 1: e.g., Navigation]
- Position: [sticky top | fixed | relative]
- Layout: [logo left, links center, CTA right]
- Blur: [backdrop-blur-xl] on scroll
- Links: [list each link text]
- CTA button: [text], [style: solid/outline/ghost], [color]

### [Section 2: e.g., Hero]
- Layout: [centered | split left-right | asymmetric]
- Headline: "[exact text]"
- Subheadline: "[exact text]"
- CTA: "[button text]" → [style]
- Visual element: [image placeholder | 3D object | video | illustration]
- Decorative: [floating badges | glassmorphism cards | gradient orbs]

### [Section N: repeat for each section...]

---

## 4. ANIMATIONS & INTERACTIONS

**Entry animations (on mount / scroll into view):**
- Headlines: fade-up (y: 30 → 0, opacity: 0 → 1), duration 0.8s, ease [0.25, 0.4, 0, 1]
- Body text: fade-up, 0.1s delay after headline
- Cards: stagger children, 0.1s between each
- Images: scale 0.95 → 1 + fade, duration 1s

**Hover interactions:**
- Cards: translateY(-4px) + shadow increase + border glow
- Buttons: scale(1.02) + background shift
- Links: underline slide-in from left

**Scroll animations:**
- Parallax: [background moves at 0.5x scroll speed]
- Reveal: sections fade-in as they enter viewport (Intersection Observer or Framer Motion whileInView)

**Continuous animations:**
- [Floating elements: y oscillation ±10px, 6s infinite, ease-in-out]
- [Gradient shift: background-position animation, 8s infinite]
- [Glow pulse: opacity 0.5 → 1, 3s infinite]

---

## 5. RESPONSIVE BEHAVIOR

- **Desktop (≥1024px):** [describe layout — e.g., 2-column grid, sidebar visible]
- **Tablet (768-1023px):** [describe changes — e.g., single column, smaller fonts]
- **Mobile (<768px):** [describe changes — e.g., stacked, hamburger menu, smaller padding]
- Touch targets: minimum 44x44px
- Font scaling: clamp() for fluid typography

---

## 6. QUALITY RULES (CRITICAL)

- DO NOT use placeholder services (unsplash, placeholder.com). Use CSS gradients or solid colors for image placeholders.
- DO NOT add comments like "// Add more sections here". The component must be COMPLETE.
- DO NOT use any external dependencies beyond the specified stack.
- DO use semantic HTML (section, nav, main, article, footer).
- DO ensure contrast ratio ≥ 4.5:1 for all text.
- DO make all animations respect prefers-reduced-motion.
- The output must be a SINGLE .tsx file that renders the complete component.
- Export as default: `export default function [ComponentName]() {}`
```

---

### Step 4: Salvar e Instruir

1. Salvar o prompt gerado em `docs/gemini-prompts/{id}-{component}.prompt.md`
2. Informar o usuário:

```
✅ Prompt gerado: docs/gemini-prompts/{file}.prompt.md

Próximos passos:
1. Abra o Google AI Studio (aistudio.google.com)
2. Selecione Gemini 3.1 Pro como modelo
3. Cole o prompt inteiro
4. Se tiver imagem de referência, anexe junto
5. Copie o .tsx gerado
6. Salve como: src/components/{area}/{ComponentName}.gemini.tsx
7. Chame @dev *develop {story} para integrar
```

---

## Banco de Fontes Premium (referência Viktor Oddy)

### Display (Headlines)
| Fonte | Vibe | Pair com |
|-------|------|----------|
| Instrument Serif | Editorial, elegante | Inter, Satoshi |
| Playfair Display | Luxo, clássico | Lato, Source Sans |
| Clash Display | Moderno, bold | General Sans, Switzer |
| Cabinet Grotesk | Geométrico, clean | Inter, Manrope |
| Fraunces | Artístico, orgânico | Work Sans, Nunito |

### Body (UI/Texto)
| Fonte | Vibe |
|-------|------|
| Inter | Universal, neutro |
| Satoshi | Moderno, tech |
| General Sans | Clean, friendly |
| Space Grotesk | Tech, monospaced feel |
| Manrope | Rounded, approachable |

### Monospace (Code/Data)
| Fonte | Vibe |
|-------|------|
| JetBrains Mono | Dev-focused |
| Fira Code | Ligatures |
| IBM Plex Mono | Corporate |

---

## Estilos Visuais de Referência

### 🌑 Neo-Minimal Void (Dark + Neon Accent)
```
Background: #0A0A0A | Surface: #141414 | Accent: #7C3AED
Fonts: Space Grotesk + Inter | Animations: Subtle, precision
Vibe: Tech premium, dashboard, SaaS
```

### 🫧 Liquid Glass (Glassmorphism + Motion)
```
Background: gradient ou video | Cards: bg-white/5 backdrop-blur-2xl
Border: 1px solid rgba(255,255,255,0.1) | Accent: contextual
Fonts: Instrument Serif + Satoshi | Animations: Fluid, organic
Vibe: Apple, premium product, editorial
```

### 🎬 Cinematic (Full-screen + Video + Scale)
```
Background: video loop | Overlay: bg-black/50-70
Typography: Massive (6-8rem hero) | Animations: Slow, parallax, zoom
Fonts: Clash Display + General Sans | Color: Minimal, mostly white on dark
Vibe: Film, luxury brand, award-winning agency
```

### 📰 Editorial (Typography-driven + Asymmetric)
```
Background: #FAFAF9 or #0A0A0A | Grid: Asymmetric, intentional
Typography: Mixed serif/sans, varied sizes | Animations: Scroll-triggered reveals
Fonts: Fraunces + Work Sans | Color: High contrast, 2-color max
Vibe: Magazine, portfolio, fashion
```

### ⚡ Brutalist (Raw + Bold + Intentional Clash)
```
Background: solid harsh color | Borders: thick, visible
Typography: Oversized, overlapping | Animations: Abrupt, snap
Fonts: Cabinet Grotesk + IBM Plex Mono | Color: High contrast, unexpected combos
Vibe: Creative agency, music, avant-garde
```

---

## Anti-Patterns (o que faz UI parecer "feita por IA")

❌ **Nunca faça:**
- Gradients genéricos azul-roxo sem razão (o "default AI gradient")
- Sombras exageradas em tudo (drop-shadow-2xl em cada card)
- Border radius excessivo sem consistência
- Hero section com headline genérica "Welcome to Our Platform"
- Ícones de emoji como decoração (🚀🎯💡)
- Espaçamento inconsistente entre seções
- Fontes system-ui sem importar nada customizado
- Cards com todos o mesmo tamanho numa grid perfeita (boring)
- Usar Lorem ipsum (invente copy real e contextual)
- Animações em tudo ao mesmo tempo (overload sensorial)

✅ **Sempre faça:**
- Uma hierarquia visual clara (1 elemento domina, resto suporta)
- Espaçamento generoso entre seções (py-24 mínimo)
- No máximo 2 fontes (1 display + 1 body)
- No máximo 3 cores (bg + text + 1 accent)
- Animações com propósito (guiar o olho, não distrair)
- Copy contextual e realista (não genérica)
- Pelo menos 1 elemento "surpreendente" (um detalhe inesperado)
- Responsive genuíno (não apenas empilhar)

---

## Uso

```
*generate-gemini-ui-prompt 8.1                    # A partir de story
*generate-gemini-ui-prompt --desc "Hero section do memberly com banner cinematográfico"
*generate-gemini-ui-prompt 8.1 --style cinematic   # Com estilo forçado
*generate-gemini-ui-prompt --desc "Dashboard admin" --style neo-minimal-void
```

---

## Post-Conditions

```yaml
post-conditions:
  - [ ] Prompt salvo em docs/gemini-prompts/
  - [ ] Prompt especifica stack exato do projeto
  - [ ] Prompt tem cores em hex, não nomes genéricos
  - [ ] Prompt tem fontes específicas com weights
  - [ ] Prompt tem animações detalhadas com valores (duration, ease, delay)
  - [ ] Prompt tem seção de responsive behavior
  - [ ] Prompt tem quality rules no final
  - [ ] Nenhum anti-pattern presente no prompt
```

---

## Change Log

| Date | Version | Description | Author |
|------|---------|-------------|--------|
| 2026-03-12 | 1.0 | Task criada com base no workflow Viktor Oddy + Gemini 3.1 Pro | Robin |
