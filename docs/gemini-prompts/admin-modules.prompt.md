# Gemini Prompt: Admin Modules Page — Memberly

Cole este prompt inteiro no Google AI Studio com Gemini 3.1 Pro.

---

## PROJECT REQUIREMENTS

Build a complete admin module management page for a course platform called "Memberly". This page shows all modules of a specific product, with drag & drop reordering, inline editing, and quick access to lessons. Think Notion's drag list meets Linear's clean aesthetic. Light theme, functional, satisfying micro-interactions.

**Stack (NON-NEGOTIABLE):**
- React 19 (functional components, hooks only)
- TypeScript strict
- Tailwind CSS v4 (use @theme inline, NOT tailwind.config)
- motion/react (Framer Motion) for animations and reorder
- Single .tsx file, fully self-contained
- All data is hardcoded/mocked — this is a visual reference
- Export as: `export default function AdminModules()`
- Add `'use client'` at the top

---

## 1. GLOBAL DESIGN SYSTEM

### Color Palette
- Background: #F8FAFC
- Surface: #FFFFFF
- Border: #E2E8F0
- Primary: #2563EB
- Success: #059669
- Purple: #7C3AED (module accent)
- Danger: #DC2626
- Amber: #D97706
- Text primary: #0F172A
- Text secondary: #64748B
- Text tertiary: #94A3B8
- Drag handle: #CBD5E1 (slate-300), hover #94A3B8
- Drop indicator: #2563EB at 20% opacity

---

## 2. PAGE STRUCTURE

```
[Breadcrumb]
[Page Header — product name + "Novo Módulo" button]
[Course Stats — completion widget]
[Module List — draggable cards with thumbnails, lesson counts, actions]
[Empty State — when no modules]
```

---

## 3. COMPONENT STRUCTURE

### Section 1: Breadcrumb
- "Produtos" → "Método Completo de Calistenia" → "Módulos"
- Style: text-xs, slate-500, flex gap-1, mb-4
- Clickable: hover:text-slate-700
- Current: text-slate-900

### Section 2: Page Header
- Left: "Módulos — Método Completo de Calistenia" (h2, 24px, bold, slate-900)
- Right: "Novo Módulo" button (bg-blue-600, text-white, rounded-lg, h-10, px-4, font-medium, + icon)

### Section 3: Course Stats Widget (mb-6)
- Container: bg-white, rounded-xl, border, p-5, flex items-center gap-6
- Left section: flex items-center gap-4
  - Circular progress ring: w-14 h-14, SVG circle
    - Background circle: stroke slate-200, strokeWidth 3
    - Progress arc: stroke emerald-500, strokeWidth 3, strokeDasharray proportional to 67%
    - Center: "67%" text (text-sm, font-bold, slate-900)
  - Stats:
    - "67% concluído" (text-sm, font-semibold, slate-900)
    - "32 de 47 aulas publicadas" (text-xs, slate-500)
- Right section: flex gap-6
  - "8 módulos" (text-sm, slate-600) with grid icon (slate-400)
  - "47 aulas" (text-sm, slate-600) with play icon (slate-400)
  - "12h 30min" (text-sm, slate-600) with clock icon (slate-400)

### Section 4: Module List
- Vertical list of draggable module cards, gap-3

**Each module card:** bg-white, rounded-xl, border, p-4, flex items-center gap-4, shadow-sm
- Hover: shadow-md, border-slate-300, transition 200ms
- While dragging: shadow-xl, scale(1.02), opacity-90, rotate(1deg), z-50

**Card content:**
- **Drag handle:** (left-most, cursor-grab)
  - 6-dot grip icon (⠿): text-slate-300, hover:text-slate-500, w-6
  - Touch: touch-action-none, min 44x44px hit area

- **Thumbnail:** w-20 h-12, rounded-lg, overflow-hidden
  - CSS gradient per module (placeholder)
  - No image fallback: bg-slate-100, "Sem img" (text-xs, slate-400)

- **Info:** flex-1
  - Title: font-medium, slate-900 (clickable to lessons, hover:text-blue-600)
  - Below title: flex items-center gap-3, mt-0.5
    - Lesson count: "12 aulas" (text-xs, slate-500) with mini play icon
    - Duration: "2h 15min" (text-xs, slate-500) with clock icon
    - Published status: dot + "Todas publicadas" (text-xs, emerald-600) or "3 rascunhos" (text-xs, amber-600)

- **Progress mini-bar:** w-24, h-1.5, rounded-full, bg-slate-100
  - Fill: bg-emerald-500 at proportional %
  - Below: "100%" or "67%" (text-xs, slate-400)

- **Actions:** flex items-center gap-1
  - "Gerenciar Aulas" link-button: bg-blue-50, text-blue-700, rounded-lg, px-3 py-1.5, text-sm, font-medium, hover:bg-blue-100
    - Shows lesson count in parentheses: "Aulas (12)"
  - "Duplicar": icon button, copy icon, text-purple-600, hover:bg-purple-50, w-8 h-8, rounded-md
  - "Editar": icon button, pencil icon, text-blue-600, hover:bg-blue-50
  - "Excluir": icon button, trash icon, text-red-500, hover:bg-red-50

**Mock 6 modules:**
1. "Módulo 1 — Fundamentos" | 12 aulas | 2h 15min | 100% | Todas publicadas | gradient #2d1b69→#1a0a3e
2. "Módulo 2 — Força Básica" | 10 aulas | 1h 50min | 100% | Todas publicadas | gradient #1b4332→#0a2e1a
3. "Módulo 3 — Avançado" | 12 aulas | 3h 10min | 67% | 4 rascunhos | gradient #1a1a2e→#0f3460
4. "Módulo 4 — Handstand" | 8 aulas | 1h 30min | 0% | 8 rascunhos | gradient #2e1a1a→#600f1a
5. "Módulo 5 — Muscle Up" | 10 aulas | 2h 45min | 0% | 2 rascunhos | gradient #1a2e2e→#0f4a60
6. "Módulo 6 — Mobilidade" | 6 aulas | 1h | 0% | Todas publicadas | gradient #2e2e1a→#604a0f

---

## 4. ANIMATIONS & INTERACTIONS

**Entry:**
- Breadcrumb: fade-in 0.3s
- Header: fade-in 0.4s
- Stats widget: fade-up 0.5s, delay 0.1s
- Module cards: stagger fade-up (y: 12→0), 0.06s between each, delay 0.2s

**Drag & Drop:**
- Grab cursor on drag handle
- While dragging: card lifts (shadow-xl), slight rotation (1deg), scale(1.02), opacity-90
- Drop zone indicator: 2px blue line between cards where item will be placed
- After drop: card settles with spring animation (scale 1.02→1, rotation 0, 300ms spring)
- Other cards smoothly shift position (layout animation, 200ms)

**Interactions:**
- Card hover: shadow-sm → shadow-md, border darkens, 200ms
- Action buttons: appear on card hover (opacity 0→1 for delete, or always visible for Aulas)
- "Gerenciar Aulas" hover: bg-blue-50 → bg-blue-100
- Progress ring: stroke-dashoffset animates from 0 to value on mount (1s, ease-out)
- "Novo Módulo" button: hover lift + shadow

---

## 5. RESPONSIVE BEHAVIOR

- **Desktop (≥1024px):** Full card layout, all info visible, drag handles
- **Tablet (768-1023px):** Smaller thumbnails (w-16 h-10), hide duration, compact actions
- **Mobile (<768px):** Cards stack full-width, thumbnail top, info below, actions as icon row. Drag via long-press. Stats widget: 2x2 grid instead of row
- Touch: drag handle 44x44px, long-press to start drag on mobile

---

## 6. QUALITY RULES (CRITICAL)

- DO NOT use external images. Use CSS gradients as thumbnails.
- DO NOT actually implement drag-and-drop library. Mock the visual states with motion/react (Reorder component from motion/react is acceptable).
- DO NOT use Tailwind v3 syntax.
- DO NOT use dependencies beyond React, Tailwind v4, motion/react.
- DO implement the SVG circular progress ring with animated stroke.
- DO implement card hover states with action reveal.
- ALL text in Brazilian Portuguese (pt-BR).
- Single .tsx file, COMPLETE.
- Export: `export default function AdminModules()`
