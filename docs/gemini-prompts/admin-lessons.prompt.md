# Gemini Prompt: Admin Lesson Management Page — Memberly

Cole este prompt inteiro no Google AI Studio com Gemini 3.1 Pro.

---

## PROJECT REQUIREMENTS

Build a complete admin lesson management page for a course platform called "Memberly". This page lists all lessons within a specific module, with drag & drop reordering, publish toggles, video provider badges, duration, and CRUD actions. Think Notion's task list meets a premium CMS. Light theme, clean rows, satisfying drag interactions.

**Stack (NON-NEGOTIABLE):**
- React 19 (functional components, hooks only)
- TypeScript strict
- Tailwind CSS v4 (use @theme inline, NOT tailwind.config)
- motion/react (Framer Motion) for animations and Reorder
- Single .tsx file, fully self-contained
- All data is hardcoded/mocked — this is a visual reference
- Export as: `export default function AdminLessons()`
- Add `'use client'` at the top

---

## 1. GLOBAL DESIGN SYSTEM

Same admin palette:
- Background: #F8FAFC | Surface: #FFFFFF | Border: #E2E8F0
- Primary: #2563EB | Success: #059669 | Danger: #DC2626 | Purple: #7C3AED
- YouTube red: #DC2626 | Panda green: #059669
- Text: #0F172A / #64748B / #94A3B8
- Typography: Inter (400-700)

---

## 2. PAGE STRUCTURE

```
[Breadcrumb — Produtos > Calistenia > Módulos > Módulo 3 > Aulas]
[Page Header — module name + "Nova Aula" button]
[Module Stats — quick overview bar]
[Lesson List — draggable rows with rich info]
[Empty State — when no lessons]
```

---

## 3. COMPONENT STRUCTURE

### Section 1: Breadcrumb
- "Produtos" → "Método Completo de Calistenia" → "Módulos" → "Módulo 3 — Avançado" → "Aulas"

### Section 2: Page Header
- Left: "Aulas — Módulo 3 — Avançado" (h2, 24px, bold)
- Right: "Nova Aula" button (bg-blue-600, text-white, rounded-lg, h-10, px-4, + icon)

### Section 3: Module Stats Bar
- Container: bg-white, rounded-xl, border, p-4, flex items-center gap-6, mb-5
- Stats inline:
  - "12 aulas" (text-sm, font-medium, slate-700) with play icon (slate-400)
  - Divider: w-px h-5 bg-slate-200
  - "8 publicadas" (text-sm, emerald-600) with green dot
  - "4 rascunhos" (text-sm, amber-600) with yellow dot
  - Divider
  - "3h 10min total" (text-sm, slate-600) with clock icon

### Section 4: Lesson List
- Container: bg-white, rounded-xl, border, overflow-hidden

- **Header row:** bg-slate-50/80, flex, px-4 py-3
  - [Drag] | Aula | Provedor | Duração | Status | Drip | Ações
  - Text: xs, uppercase, font-semibold, tracking-wider, slate-500

- **Each lesson row:** flex items-center, px-4, py-3.5, border-b border-slate-100
  - Hover: bg-slate-50, transition 150ms
  - Dragging: shadow-lg, bg-white, scale(1.01), rounded-lg, z-50

  **Row content:**
  - **Drag handle:** ⠿ (6-dot grip), text-slate-300, hover:text-slate-500, cursor-grab, w-8, flex-shrink-0
    - Touch area: 44x44px

  - **Aula cell:** flex-1, flex items-center gap-3
    - Order number: w-7 h-7, rounded-lg, bg-slate-100, text-xs, font-semibold, slate-600, flex items-center justify-center
    - Title: font-medium, slate-900 (hover: text-blue-600)
    - If has attachments: paperclip icon (w-3.5 h-3.5, text-slate-400, ml-1)

  - **Provedor cell:** w-24
    - YouTube: badge bg-red-50, text-red-700, ring-1 ring-red-200, rounded-full, px-2.5 py-0.5, text-xs, "YouTube"
    - Panda: badge bg-emerald-50, text-emerald-700, ring-1 ring-emerald-200, "Panda"

  - **Duração cell:** w-20, text-sm, slate-500, text-center
    - "15 min" format

  - **Status cell:** w-24
    - Published: badge bg-emerald-50, text-emerald-700, ring-1 ring-emerald-200, "Publicada"
    - Draft: badge bg-slate-100, text-slate-600, ring-1 ring-slate-200, "Rascunho"
    - Clickable: toggle on click (hover: opacity-80)

  - **Drip cell:** w-20, text-center
    - If drip_days set: "7 dias" (text-xs, font-medium, bg-amber-50, text-amber-700, rounded-full, px-2 py-0.5)
    - If null: "—" (text-slate-300)

  - **Actions cell:** w-28, flex items-center justify-end gap-1
    - "Duplicar": icon button, copy, text-purple-500, hover:bg-purple-50, w-8 h-8, rounded-md
    - "Editar": icon button, pencil, text-blue-600, hover:bg-blue-50
    - "Excluir": icon button, trash, text-red-500, hover:bg-red-50

- **Mock 10 lessons:**
  1. "Introdução ao Módulo" | YouTube | 8 min | Publicada | — | no attachments
  2. "Força de Puxada" | Panda | 12 min | Publicada | — | 1 attachment
  3. "Exercícios de Transição" | YouTube | 10 min | Publicada | — | no
  4. "Kipping Basics" | Panda | 15 min | Publicada | — | 2 attachments
  5. "False Grip Training" | YouTube | 18 min | Publicada | 7 dias | 1 attachment
  6. "Band-Assisted Muscle Up" | Panda | 14 min | Publicada | 7 dias | no
  7. "Negative Muscle Ups" | YouTube | 12 min | Publicada | 14 dias | no
  8. "Strict Muscle Up" | Panda | 20 min | Publicada | 14 dias | 1 attachment
  9. "Muscle Up Progressão" | YouTube | 15 min | Rascunho | 21 dias | 2 attachments
  10. "Ring Muscle Up" | Panda | 18 min | Rascunho | 21 dias | no

### Section 5: Empty State (shown when no lessons)
- Centered, py-16
- Dashed border: border-2 border-dashed border-slate-200, rounded-xl
- Icon: play circle (w-12 h-12, text-slate-300)
- Title: "Nenhuma aula criada" (text-lg, font-medium, slate-500)
- Subtitle: "Comece adicionando a primeira aula deste módulo." (text-sm, slate-400)
- Button: "Criar Primeira Aula" (bg-blue-600, text-white, rounded-lg, mt-4)

---

## 4. ANIMATIONS & INTERACTIONS

**Entry:**
- Header: fade-in 0.4s
- Stats bar: fade-in 0.4s, delay 0.1s
- Lesson rows: stagger fade-in (opacity 0→1), 0.03s between each, delay 0.15s

**Drag & Drop:**
- Grab: cursor changes to grabbing
- Dragging: card lifts (shadow-lg), subtle scale(1.01), bg stays white, z-50
- Drop indicator: 2px blue line between rows
- After drop: spring settle (200ms)
- Other rows: smooth layout shift (Reorder.Group from motion/react)

**Interactions:**
- Row hover: bg-slate-50, 150ms
- Status badge click: optimistic toggle with opacity flash
- Action buttons: hover bg tint, 150ms
- Order number: subtle pulse on reorder complete
- Drag handle: color shift on hover (300→500)

---

## 5. RESPONSIVE BEHAVIOR

- **Desktop:** Full table with all columns
- **Tablet:** Hide Drip column, smaller actions
- **Mobile:** Card layout. Each lesson = card with order number, title, badges row, actions row. Drag via long-press grip icon at top-right of card.

---

## 6. QUALITY RULES (CRITICAL)

- DO NOT use external images.
- DO NOT use Tailwind v3 syntax.
- DO implement drag & drop visuals using motion/react Reorder.
- DO implement working status toggle.
- ALL text in Brazilian Portuguese (pt-BR).
- Single .tsx file, COMPLETE.
- Export: `export default function AdminLessons()`
