# Gemini Prompt: Product Detail Page — Memberly

Cole este prompt inteiro no Google AI Studio com Gemini 3.1 Pro.

---

## PROJECT REQUIREMENTS

Build a complete product detail page for a Netflix-style course platform called "Memberly". This page shows a specific course — its hero banner, description, stats, and a grid of module cards. The member browses modules here and picks where to continue. Think Disney+ show page meets Masterclass course overview. Cinematic hero, portrait module cards with progress, immersive dark theme.

**Stack (NON-NEGOTIABLE):**
- React 19 (functional components, hooks only)
- TypeScript strict
- Tailwind CSS v4 (use @theme inline, NOT tailwind.config)
- motion/react (Framer Motion) for animations
- Single .tsx file, fully self-contained
- All data is hardcoded/mocked — this is a visual reference
- Export as: `export default function ProductDetail()`
- Add `'use client'` at the top

---

## 1. GLOBAL DESIGN SYSTEM

### Color Palette
- Background: #0A0A0A
- Surface: #141414
- Card: #1A1A1A (module cards)
- Border: #2A2A2A
- Primary accent: #E50914 (CTA, active states)
- Primary hover: #F40612
- Success: #46D369 (completed badge, progress fill)
- Lock: #F59E0B (amber, locked modules)
- Text primary: #FFFFFF
- Text secondary: #B3B3B3
- Text tertiary: #737373
- Gradient overlay: from-[#0A0A0A] via-[#0A0A0A]/60 to-transparent

### Typography
Google Fonts import: `Inter` (400, 500, 600, 700).
- Course title: 2.5rem (40px) desktop / 1.75rem (28px) mobile, font-weight 700, text-white
- Section title: 1.5rem (24px), font-weight 600, text-white
- Module card title: 1.125rem (18px), font-weight 700, text-white, drop-shadow
- Metadata: 0.875rem (14px), text-neutral-400
- Description: 0.875rem (14px), text-neutral-300, leading-relaxed
- Progress: 0.75rem (12px), text-neutral-300

### Spacing
- Content padding: px-4 sm:px-6 lg:px-16
- Max content width: max-w-7xl, mx-auto
- Module grid gap: gap-5
- Section spacing: mt-10

---

## 2. PAGE STRUCTURE

```
[Hero — cinematic banner with gradient, course info overlaid at bottom]
[Module Grid — portrait cards (5:7 aspect ratio) in responsive grid]
```

Full page component including a minimal sticky header (just logo + back).

---

## 3. COMPONENT STRUCTURE

### Section 1: Minimal Header (sticky, z-50)
- Height: h-14
- Background: transparent initially, bg-[#0A0A0A]/90 backdrop-blur-md after scrolling
- Left: "← Voltar" button (text-sm, text-neutral-400, hover:text-white, flex items-center gap-1)
- Right: "Memberly" logo (text-lg, font-bold, text-white/50)
- Padding: px-4 lg:px-16
- Transition: background-color 200ms on scroll

### Section 2: Product Hero (full bleed)
- Aspect ratio: aspect-[21/9] on desktop, aspect-[3/2] on mobile
- Background: CSS gradient placeholder (linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%))
- Gradient overlay from bottom: bg-gradient-to-t from-[#0A0A0A] via-[#0A0A0A]/60 to-transparent (covers bottom 60%)
- Content overlaid at bottom, pulled up with negative margin (-mt-36 on desktop, -mt-24 on mobile):

  **Course title:** "Método Completo de Calistenia" (h1, 40px desktop, 28px mobile, font-bold, text-white)
  
  **Stats row:** flex items-center gap-4, mt-2
  - "8 módulos" (text-sm, text-neutral-400)
  - "·" separator
  - "47 aulas" (text-sm, text-neutral-400)
  - "·" separator
  - "67% concluído" (text-sm, text-[#46D369])
  - Overall progress bar: inline, w-24 h-1.5 rounded-full bg-[#2A2A2A], fill bg-[#46D369] at 67%

  **Description:** (mt-3, max-w-2xl)
  - "Transforme seu corpo usando apenas o peso corporal. Do iniciante ao avançado, com progressões detalhadas para cada exercício. Inclui treinos de força, mobilidade, e handstand." 
  - Collapsible: line-clamp-2 by default
  - "ver mais" toggle (text-xs, text-[#E50914])

  **CTA button:** (mt-4)
  - "Continuar de onde parei" (bg-[#E50914], hover:bg-[#F40612], text-white, font-semibold, rounded-lg, px-6, h-11)
  - Below button: "Módulo 3 · Aula 9 — Muscle Up Progressão" (text-xs, text-neutral-500, mt-1.5)

### Section 3: Module Grid
- Title: "Módulos" (text-2xl, font-semibold, text-white, mt-10, mb-5)
- Grid: grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4, gap-5
- Max width: max-w-7xl, mx-auto

**Each module card:** (aspect-[5/7], rounded-xl, overflow-hidden, relative, group)
- Background: CSS gradient unique per module (placeholder for banner image)
- Gradient overlay: bg-gradient-to-t from-black/80 via-black/20 to-transparent
- Hover: scale(1.03), ring-1 ring-white/15, shadow-2xl, transition duration-300
- Cursor: pointer

- **Completed badge** (if 100%): absolute top-3 right-3
  - bg-[#46D369], text-black, text-xs, font-semibold, rounded-md, px-2.5 py-1
  - "✓ Concluído"

- **Lock icon** (if locked): absolute top-3 right-3
  - Lock SVG, w-6 h-6, text-amber-400
  - Card opacity: 0.5, cursor-not-allowed
  - No hover scale effect

- **Bottom content:** absolute bottom-0, p-4, w-full
  - Module title: "Módulo 1 — Fundamentos" (text-lg, font-bold, text-white, drop-shadow-md)
  - Lesson count: "12/12 aulas" (text-xs, text-neutral-300, mt-1)
  - Progress bar: h-1, w-full, rounded-full, bg-white/20, mt-2
    - Fill: bg-[#46D369], transition-all duration-500
  - Progress percentage overlaid or next to bar for context

- Mock 8 modules:
  1. "Módulo 1 — Fundamentos" | 12/12 aulas | 100% | ✓ Concluído | gradient: #2d1b69→#1a0a3e
  2. "Módulo 2 — Força Básica" | 10/10 aulas | 100% | ✓ Concluído | gradient: #1b4332→#0a2e1a
  3. "Módulo 3 — Avançado" | 8/12 aulas | 67% | in progress | gradient: #1a1a2e→#0f3460
  4. "Módulo 4 — Handstand" | 0/8 aulas | 0% | not started | gradient: #2e1a1a→#600f1a
  5. "Módulo 5 — Muscle Up" | 0/10 aulas | 0% | not started | gradient: #1a2e2e→#0f4a60
  6. "Módulo 6 — Mobilidade" | 0/6 aulas | 0% | not started | gradient: #2e2e1a→#604a0f
  7. "Módulo 7 — Programação de Treino" | 🔒 locked | gradient: #1f1f1f→#0a0a0a
  8. "Módulo 8 — Avaliação Final" | 🔒 locked | gradient: #1f1f1f→#0a0a0a

---

## 4. ANIMATIONS & INTERACTIONS

**Entry animations:**
- Hero image: subtle slow zoom (scale 1→1.03 over 15s, infinite, ease-in-out) — creates life
- Hero content (title, stats, CTA): stagger fade-up (y: 30→0), duration 0.7s, delay 0.3s, 0.1s between items
- Module grid: cards stagger in with fade-up (y: 20→0, opacity 0→1), 0.05s between each card, triggered on scroll into view (whileInView)
- Progress bars: width animates from 0% to actual value (duration 0.8s, ease-out, delay 0.5s after card appears)

**Hover interactions:**
- Module cards: scale(1.03), ring-1 ring-white/15, shadow-2xl, duration 300ms
- Locked cards: no hover effect (cursor-not-allowed, opacity-50)
- CTA button: translateY(-1px), shadow-lg shadow-[#E50914]/20, duration 200ms
- Back button: arrow shifts left 4px (translateX(-4px)), text goes white, duration 200ms

**Scroll behavior:**
- Header: transparent → blurred background on scroll (use scroll position state, threshold ~50px)
- Hero zoom: continuous, never stops (creates living banner feel)

---

## 5. RESPONSIVE BEHAVIOR

- **Desktop (≥1280px):** 4-column module grid, hero aspect-[21/9], large title 40px
- **Desktop (≥1024px):** 3-column grid
- **Tablet (≥768px):** 2-column grid, hero aspect-[16/9], smaller margins
- **Mobile (<768px):** 1-column grid (cards still portrait 5:7), hero aspect-[3/2], title 28px, CTA full-width
- Touch targets: all interactive elements min 44x44px
- Module cards: maintain 5:7 aspect ratio at all sizes

---

## 6. QUALITY RULES (CRITICAL)

- DO NOT use external images. Use unique CSS linear-gradients per module as banner placeholders.
- DO NOT use placeholder.com or unsplash.
- DO NOT add "// Add more" comments. Component must be COMPLETE.
- DO NOT use dependencies beyond React, Tailwind v4, and motion/react.
- DO NOT use Tailwind v3 syntax.
- DO use semantic HTML (header, main, section, article, h1, h2).
- DO ensure contrast ≥ 4.5:1.
- DO respect prefers-reduced-motion (disable zoom, disable stagger).
- DO implement working scroll-based header blur.
- DO implement working description expand/collapse.
- ALL text in Brazilian Portuguese (pt-BR).
- Single .tsx file, COMPLETE.
- Export: `export default function ProductDetail()`
