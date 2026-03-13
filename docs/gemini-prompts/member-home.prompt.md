# Gemini Prompt: Member Home — Memberly

Cole este prompt inteiro no Google AI Studio com Gemini 3.1 Pro.

---

## PROJECT REQUIREMENTS

Build a complete Netflix-style member home page for a digital course platform called "Memberly". This is the main page members see after login — their personal catalog of courses with progress tracking. Think Netflix meets Masterclass. Dark, cinematic, immersive.

**Stack (NON-NEGOTIABLE):**
- React 19 (functional components, hooks only)
- TypeScript strict
- Tailwind CSS v4 (use @theme inline, NOT tailwind.config)
- motion/react (Framer Motion) for animations
- Single .tsx file, fully self-contained
- All data is hardcoded/mocked — this is a visual reference
- Export as: `export default function MemberHome()`
- Add `'use client'` at the top

---

## 1. GLOBAL DESIGN SYSTEM

### Color Palette
- Background: #0A0A0A (pure dark, almost black)
- Surface: #141414 (cards, raised areas)
- Card: #1A1A1A (interactive cards on hover)
- Border: #2A2A2A (subtle, only when needed)
- Primary accent: #E50914 (Netflix red — CTAs, active states, progress bars)
- Primary hover: #F40612
- Success: #46D369 (completion badges, checkmarks)
- Text primary: #FFFFFF
- Text secondary: #B3B3B3
- Text tertiary: #808080
- Gradient overlay: from #0A0A0A via #0A0A0A/60 to transparent

### Typography
Google Fonts import: `Inter` (400, 500, 600, 700).
- All text: 'Inter', system-ui, -apple-system, sans-serif
- Hero title: 3rem (48px) desktop / 1.75rem (28px) mobile, font-weight 700, text-white
- Section title: 1.25rem (20px), font-weight 600, text-white
- Card title: 0.875rem (14px), font-weight 500, text-neutral-300
- Progress label: 0.75rem (12px), font-weight 500
- Metadata: 0.75rem (12px), text-neutral-500

### Spacing & Layout
- Max content width: 100% (full bleed hero, padded content)
- Content padding: px-4 sm:px-6 lg:px-16
- Section vertical spacing: py-6
- Card gap: gap-3 (carousel items)
- Border radius: rounded-lg (8px) for cards

---

## 2. PAGE STRUCTURE (top to bottom)

```
[Header — sticky, blur on scroll]
[Hero Banner — full width, auto-rotating, cinematic]
[Continue Watching — carousel with context cards]
[My Courses — carousel with all courses]
[Bookmarks — carousel with bookmarked lessons]
[Footer — minimal]
```

This component renders the FULL PAGE including header and footer.

---

## 3. COMPONENT STRUCTURE

### Section 1: Header (sticky top, z-50)
- Height: h-16 (64px)
- Background: bg-[#0A0A0A]/80 backdrop-blur-md (transparent until scroll, then blur kicks in)
- Left: "Memberly" text logo (text-xl, font-bold, text-white)
- Right: Search icon (lupa, 20px, text-neutral-400, hover:text-white) + user name "João Silva" (text-sm, text-neutral-300) + "Sair" button (text-sm, text-neutral-500, hover:text-white)
- Border bottom: none normally, 1px border-[#2A2A2A] after scrolling (use scroll state)
- Padding: px-4 md:px-8 lg:px-16

### Section 2: Hero Banner (full bleed, auto-rotating)
- Height: h-[56vw] max-h-[70vh] min-h-[300px]
- Displays one featured course at a time, auto-rotates every 6 seconds
- Each slide has:
  - Full-width background image (use CSS gradient as placeholder: linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%))
  - Dark gradient overlay from bottom: bg-gradient-to-t from-[#0A0A0A] via-[#0A0A0A]/60 to-transparent
  - Content pinned to bottom-left (p-4 sm:p-6 lg:p-16):
    - Course title: "Método Completo de Calistenia" (h1, 48px desktop, 28px mobile, font-bold, text-white, text-shadow)
    - Description: "Transforme seu corpo com exercícios de peso corporal. Do iniciante ao avançado." (text-sm md:text-base, text-neutral-300, max-w-xl, line-clamp-2)
    - CTA button: "Continuar Assistindo" (bg-[#E50914] hover:bg-[#F40612], text-white, font-semibold, rounded, px-6, h-11, min-w-[44px])
    - Below button: "Módulo 3 · Aula 12 · 67% concluído" (text-xs, text-neutral-400, mt-2)
  - Dot indicators: bottom-right, flex gap-2
    - Active: w-6 h-2 bg-white rounded-full (pill shape)
    - Inactive: w-2 h-2 bg-white/40 rounded-full
    - Transition: width animates smoothly

- Mock 3 slides:
  1. "Método Completo de Calistenia" — gradient bg #1a1a2e → #0f3460
  2. "Fundamentos da Nutrição Esportiva" — gradient bg #1a2e1a → #0f6034
  3. "Mindset e Disciplina" — gradient bg #2e1a2e → #600f4a

- Slide transition: fade + subtle scale (opacity 0→1, scale 1.05→1, duration 0.8s)
- Pause rotation on hover

### Section 3: Continue Watching (carousel)
- Section title: "Continue Assistindo" (text-xl, font-semibold, text-white, mb-3)
- Horizontal scrollable carousel (overflow-x-auto, snap-x, scrollbar-hide)
- Show scroll arrows on desktop (left/right, appear on section hover)
  - Arrow style: w-10 h-10, bg-black/70, rounded-full, text-white, backdrop-blur-sm
  - Position: absolute, vertically centered on the card area
  - Hidden on mobile

- Each card (w-[300px] sm:w-[340px] flex-shrink-0 snap-start):
  - Thumbnail: aspect-video, rounded-lg, bg-[#1A1A1A] with gradient placeholder
  - Overlay on thumbnail bottom: thin progress bar (h-1, bg-[#E50914], rounded-full) showing completion %
  - Hover: scale(1.05), shadow-2xl, z-10, transition duration-200
  - Below thumbnail:
    - Course name: "Método Completo de Calistenia" (text-sm, font-medium, text-neutral-300, line-clamp-1)
    - Context line: "Aula 12: Muscle Up Progressão · Módulo 3" (text-xs, text-neutral-500, line-clamp-1)
    - Time: "Assistido há 2 horas" (text-xs, text-neutral-600, mt-0.5)

- Mock 5 cards:
  1. Calistenia | Aula 12: Muscle Up Progressão | Módulo 3 | 67% | há 2h
  2. Nutrição | Aula 5: Macros para Hipertrofia | Módulo 2 | 34% | há 1 dia
  3. Mindset | Aula 8: Rotina Matinal | Módulo 2 | 52% | há 3 dias
  4. Treino em Casa | Aula 3: Aquecimento | Módulo 1 | 15% | há 5 dias
  5. Mobilidade | Aula 1: Introdução | Módulo 1 | 8% | há 1 semana

### Section 4: My Courses (carousel)
- Section title: "Meus Cursos" (same style as above)
- Same carousel mechanic as Continue Watching
- Card style (w-[250px] sm:w-[300px] lg:w-[350px] flex-shrink-0 snap-start):
  - Thumbnail: aspect-video, rounded-lg, bg-gradient placeholder
  - Hover: scale(1.05), duration-200
  - Completion badge (if 100%): absolute top-right, bg-[#46D369], text-black, text-xs, font-semibold, rounded, px-2 py-0.5, "✓ 100%"
  - Below thumbnail:
    - Title (text-sm, text-neutral-300, line-clamp-2, mt-2)
    - Progress bar: h-1 bg-[#2A2A2A] rounded-full, fill with primary color proportional to %
    - Progress label: "67% concluído" (text-xs, text-neutral-500, mt-1)

- Mock 6 cards:
  1. Método Completo de Calistenia | gradient #1a1a2e→#0f3460 | 67%
  2. Fundamentos da Nutrição | gradient #1a2e1a→#0f6034 | 34%
  3. Mindset e Disciplina | gradient #2e1a2e→#600f4a | 100%
  4. Treino em Casa | gradient #2e2e1a→#604a0f | 15%
  5. Mobilidade e Flexibilidade | gradient #1a2e2e→#0f4a60 | 8%
  6. Técnicas de Respiração | gradient #2e1a1a→#600f0f | 0%

### Section 5: Bookmarks (carousel) — only if bookmarks exist
- Section title: "Favoritos" with heart icon (text-neutral-500) next to title
- Same carousel mechanic
- Cards (w-[280px] flex-shrink-0 snap-start):
  - Smaller than course cards, more compact
  - Thumbnail: aspect-video, rounded-lg
  - Below:
    - Lesson title: "Muscle Up Progressão" (text-sm, font-medium, text-neutral-300)
    - Context: "Calistenia · Módulo 3" (text-xs, text-neutral-500)
    - Duration: "15 min" (text-xs, text-neutral-600)

- Mock 4 cards:
  1. Muscle Up Progressão | Calistenia · Módulo 3 | 15 min
  2. Macros para Hipertrofia | Nutrição · Módulo 2 | 22 min
  3. Rotina Matinal de Campeão | Mindset · Módulo 2 | 18 min
  4. Progressão de Handstand | Calistenia · Módulo 4 | 25 min

### Section 6: Footer
- Background: #0A0A0A
- Padding: px-4 md:px-8 lg:px-16, py-8
- Links row: "Suporte" | "Termos de Uso" | "Privacidade" (text-sm, text-neutral-500, hover:text-neutral-300, flex gap-6)
- Copyright: "© 2026 Memberly. Todos os direitos reservados." (text-xs, text-neutral-600, mt-6)

---

## 4. ANIMATIONS & INTERACTIONS

**Entry animations (on mount):**
- Header: none (instant render, sticky)
- Hero: fade-in (opacity 0→1, duration 1s)
- Hero content (title, desc, CTA): stagger fade-up (y: 30→0), delay 0.3s after hero image, 0.1s between items
- Carousel sections: fade-up (y: 20→0, opacity 0→1), duration 0.6s, triggered on scroll into view (whileInView)
- Each section staggers 0.15s after previous

**Hero auto-rotation:**
- Crossfade between slides: outgoing opacity 1→0 + scale 1→1.02, incoming opacity 0→1 + scale 1.05→1
- Duration: 0.8s per transition
- Interval: 6s
- Pause on hover (setIsPaused)
- Dot indicator: active dot width animates from w-2 to w-6 (transition-all duration-300)

**Card hover (all carousels):**
- scale(1.05), transition duration-200 ease-out
- shadow-2xl appears
- z-10 to overlap neighbors
- Thumbnail brightness: slight increase (filter brightness-110)

**Scroll arrows:**
- Opacity 0 → 1 on carousel hover (group-hover, transition-opacity duration-200)
- Click: smooth scroll by 80% of container width

**Progress bars:**
- Initial render: width animates from 0% to actual value (transition-all duration-700 ease-out, delay 0.3s)

---

## 5. RESPONSIVE BEHAVIOR

- **Desktop (≥1024px):** Full layout, 16px side padding, large hero, visible scroll arrows, cards 350px wide
- **Tablet (768-1023px):** 6px padding, medium hero, cards 300px, arrows hidden (touch scroll)
- **Mobile (<768px):** 4px padding, compact hero (min-h-[300px]), cards 250px, single-line card info, stacked footer links
- Touch: snap-x snap-mandatory for carousels (native scroll snapping)
- Touch targets: all buttons minimum 44x44px
- Hero CTA: full width on mobile (w-full sm:w-auto)

---

## 6. QUALITY RULES (CRITICAL)

- DO NOT use external images. Use CSS gradients (linear-gradient) as image placeholders for all thumbnails and hero backgrounds. Each course gets a unique gradient.
- DO NOT use placeholder.com, unsplash, or any image URLs.
- DO NOT add comments like "// Add more sections here". Component must be COMPLETE.
- DO NOT use any dependencies beyond React, Tailwind v4, and motion/react.
- DO NOT use Tailwind v3 syntax. Use Tailwind v4 (e.g., `bg-black/60` not `bg-opacity-60`).
- DO use semantic HTML (header, main, nav, section, footer).
- DO ensure text contrast ≥ 4.5:1 on all backgrounds.
- DO respect `prefers-reduced-motion` media query.
- DO implement working auto-rotation with pause on hover.
- DO implement working horizontal scroll with snap points.
- ALL text must be in Brazilian Portuguese (pt-BR).
- The output must be a SINGLE .tsx file.
- Export as default: `export default function MemberHome()`
