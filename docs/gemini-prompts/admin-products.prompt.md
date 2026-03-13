# Gemini Prompt: Admin Products List — Memberly

Cole este prompt inteiro no Google AI Studio com Gemini 3.1 Pro.

---

## PROJECT REQUIREMENTS

Build a complete admin products listing page for a course platform called "Memberly". This is the main working page for admins — where they manage all their courses. It needs to be clean, functional, and efficient. Think Linear's project list or Vercel's dashboard tables. Light theme, data-dense, every pixel has purpose.

**Stack (NON-NEGOTIABLE):**
- React 19 (functional components, hooks only)
- TypeScript strict
- Tailwind CSS v4 (use @theme inline, NOT tailwind.config)
- motion/react (Framer Motion) for animations
- Single .tsx file, fully self-contained
- All data is hardcoded/mocked — this is a visual reference
- Export as: `export default function AdminProducts()`
- Add `'use client'` at the top

---

## 1. GLOBAL DESIGN SYSTEM

### Color Palette
- Background: #F8FAFC (slate-50)
- Surface/Card: #FFFFFF
- Card border: #E2E8F0 (slate-200)
- Primary accent: #2563EB (blue-600)
- Primary hover: #1D4ED8 (blue-700)
- Success: #059669 (emerald-600) — published badge
- Warning: #D97706 (amber-600)
- Danger: #DC2626 (red-600) — delete actions
- Purple: #7C3AED — module link accent
- Text primary: #0F172A (slate-900)
- Text secondary: #64748B (slate-500)
- Text tertiary: #94A3B8 (slate-400)
- Row hover: #F8FAFC (slate-50)
- Selected row: #EFF6FF (blue-50)

### Typography
Google Fonts import: `Inter` (400, 500, 600, 700).
- Page title: 1.5rem (24px), font-weight 700, slate-900
- Table header: 0.75rem (12px), font-weight 600, slate-500, uppercase, letter-spacing 0.05em
- Table cell: 0.875rem (14px), font-weight 400, slate-700
- Product name: 0.875rem (14px), font-weight 500, slate-900
- Badge: 0.75rem (12px), font-weight 500
- Button: 0.875rem (14px), font-weight 500
- Empty state: 1rem (16px), font-weight 500, slate-500

### Spacing
- Page padding: p-0 (assumes admin layout provides padding)
- Card border-radius: rounded-xl
- Button border-radius: rounded-lg
- Badge border-radius: rounded-full
- Table row height: py-4
- Cell padding: px-6

---

## 2. PAGE STRUCTURE

```
[Page Header — title + search + filters + "Novo Produto" button]
[Stats Bar — inline quick stats]
[Products Table — sortable, with thumbnails, status toggle, actions]
[Empty State — when no products match filter]
```

This component renders only MAIN CONTENT (no sidebar — handled by layout).

---

## 3. COMPONENT STRUCTURE

### Section 1: Page Header
- Top row: flex items-center justify-between, mb-6
  - Left: "Produtos" (h1, 24px, font-bold, slate-900)
  - Right: "Novo Produto" button
    - Style: bg-[#2563EB], hover:bg-[#1D4ED8], text-white, rounded-lg, px-4, h-10, font-medium, text-sm
    - Icon: + (plus) before text, gap-2
    - Hover: translateY(-1px), shadow-md shadow-blue-500/20
    - Transition: all 200ms

- Second row: flex items-center gap-3, mb-4
  - **Search input:** flex-1, max-w-sm
    - Container: relative
    - Icon: magnifying glass (absolute left-3, text-slate-400, w-4 h-4)
    - Input: w-full, h-10, bg-white, border border-slate-200, rounded-lg, pl-10 pr-4, text-sm, text-slate-900
    - Placeholder: "Buscar produtos..." (text-slate-400)
    - Focus: border-[#2563EB], ring-1 ring-[#2563EB]/30
  
  - **Status filter:** dropdown/select
    - Style: h-10, bg-white, border border-slate-200, rounded-lg, px-3, text-sm, text-slate-700
    - Options: "Todos os status", "Publicados", "Rascunhos"
    - Width: w-44

  - **Sort indicator:** (right-aligned)
    - "6 produtos" (text-sm, text-slate-500)

### Section 2: Stats Bar (optional quick metrics)
- Container: flex gap-4, mb-5
- 3 mini stat pills (inline, not cards):
  - Each: flex items-center gap-2, bg-white, border border-slate-200, rounded-full, px-4 py-2
  - "6 total" (text-sm, font-medium, slate-700) with dot (w-2 h-2, rounded-full, bg-slate-400)
  - "4 publicados" with green dot (bg-emerald-500)
  - "2 rascunhos" with yellow dot (bg-amber-500)

### Section 3: Products Table
- Container: bg-white, rounded-xl, border border-slate-200, shadow-sm, overflow-hidden

- **Table header:** bg-slate-50/80
  - Columns: [Checkbox] | Produto | Status | Módulos | Aulas | Criado em | Ações
  - Style: text-xs, font-semibold, uppercase, tracking-wider, text-slate-500, py-3.5 px-6
  - Checkbox column: w-12, centered
  - Ações column: text-right

- **Table rows:** each row represents a product
  - Hover: bg-slate-50, transition duration-150
  - Selected: bg-blue-50
  - Border: border-b border-slate-100 (last row: no border)
  - Padding: py-4 px-6

  **Row content:**
  - **Checkbox:** w-4 h-4, rounded, border-slate-300, accent-[#2563EB]
  - **Produto cell:** flex items-center gap-3
    - Thumbnail: w-16 h-10, rounded-md, object-cover (use gradient placeholder per product)
    - No image fallback: w-16 h-10, rounded-md, bg-slate-100, flex items-center justify-center, text-xs text-slate-400: "Sem img"
    - Product name: font-medium, text-slate-900 (hover: text-[#2563EB], cursor-pointer)
    - Slug below name: text-xs, text-slate-400, mt-0.5
  
  - **Status cell:** clickable badge (toggle publish/unpublish)
    - Published: bg-emerald-50, text-emerald-700, ring-1 ring-emerald-200, rounded-full, px-2.5 py-1, text-xs, font-medium
    - Draft: bg-slate-100, text-slate-600, ring-1 ring-slate-200
    - Hover: opacity-80
    - Cursor: pointer
  
  - **Módulos cell:** text-sm, text-slate-600, center-aligned
  
  - **Aulas cell:** text-sm, text-slate-600, center-aligned (note: mock a count, not actual lesson data)
  
  - **Criado em cell:** text-sm, text-slate-500
    - Format: "10 Mar 2026" (short Brazilian format)
  
  - **Ações cell:** flex items-center justify-end gap-1
    - Each action: icon button, w-8 h-8, rounded-md, hover:bg-slate-100, transition
    - "Módulos" button: grid/squares icon (text-purple-600, hover:bg-purple-50)
    - "Editar" button: pencil icon (text-blue-600, hover:bg-blue-50)
    - "Duplicar" button: copy icon (text-slate-500, hover:bg-slate-100)
    - "Excluir" button: trash icon (text-red-500, hover:bg-red-50)
    - Each with tooltip on hover (title attribute is fine)

- **Mock 6 products:**
  1. "Método Completo de Calistenia" | /calistenia | Publicado | 8 módulos | 47 aulas | 10 Mar 2026 | gradient #1a1a2e→#0f3460
  2. "Fundamentos da Nutrição" | /nutricao | Publicado | 5 módulos | 32 aulas | 08 Mar 2026 | gradient #1a2e1a→#0f6034
  3. "Treino em Casa" | /treino-casa | Rascunho | 3 módulos | 18 aulas | 05 Mar 2026 | gradient #2e2e1a→#604a0f
  4. "Mindset e Disciplina" | /mindset | Publicado | 4 módulos | 24 aulas | 01 Mar 2026 | gradient #2e1a2e→#600f4a
  5. "Mobilidade e Flexibilidade" | /mobilidade | Rascunho | 6 módulos | 36 aulas | 28 Fev 2026 | gradient #1a2e2e→#0f4a60
  6. "Técnicas de Respiração" | /respiracao | Publicado | 3 módulos | 15 aulas | 20 Fev 2026 | gradient #2e1a1a→#600f0f

### Section 4: Bulk Actions Bar (when rows selected)
- Appears fixed at bottom of screen when ≥1 checkbox selected
- Style: fixed bottom-4 left-1/2 -translate-x-1/2, bg-slate-900, text-white, rounded-xl, shadow-2xl, px-6 py-3, flex items-center gap-4, z-50
- Content:
  - "X selecionado(s)" (text-sm, font-medium)
  - Divider: w-px h-5 bg-slate-700
  - "Publicar" button (text-sm, text-emerald-400, hover:text-emerald-300)
  - "Despublicar" button (text-sm, text-amber-400, hover:text-amber-300)
  - "Excluir" button (text-sm, text-red-400, hover:text-red-300)
- Entry animation: slide-up from bottom (y: 20→0, opacity 0→1, duration 0.3s)
- Mock state: 2 products selected (show bar)

---

## 4. ANIMATIONS & INTERACTIONS

**Entry animations:**
- Page title: fade-in (opacity 0→1, duration 0.4s)
- Stats pills: stagger fade-in, 0.05s between each, delay 0.1s
- Table: fade-in (opacity 0→1, duration 0.5s, delay 0.15s)
- Rows: NO individual animation (too many items)

**Interactions:**
- Row hover: bg-slate-50, duration 150ms
- Checkbox: click toggles, accent color transition
- Status badge click: optimistic toggle with brief opacity flash
- Action buttons: hover bg tint, duration 150ms
- "Novo Produto" button: hover lift (-1px) + shadow, duration 200ms
- Search input: focus ring animation (ring opacity 0→1, 200ms)
- Bulk actions bar: slide-up on first selection, slide-down on deselect all

**Search:**
- Debounce not needed (mock data, just filter state)
- On type: filter products by name (case-insensitive)
- Show "Nenhum produto encontrado" when filter returns 0

---

## 5. RESPONSIVE BEHAVIOR

- **Desktop (≥1024px):** Full table visible, all columns, search + filter side by side
- **Tablet (768-1023px):** Hide slug column, smaller thumbnails (w-12 h-8), action icons only (no text)
- **Mobile (<768px):** Transform table into card list
  - Each product: card with thumbnail top, info below
  - Status badge, actions row at bottom of card
  - Search full width, filter below
  - Stack stats pills vertically or scroll horizontally
- Bulk actions bar: full width on mobile (left-4 right-4 instead of centered)

---

## 6. QUALITY RULES (CRITICAL)

- DO NOT use external images. Use CSS gradients as thumbnail placeholders.
- DO NOT add "// TODO" or placeholder comments.
- DO NOT use dependencies beyond React, Tailwind v4, and motion/react.
- DO NOT use Tailwind v3 syntax.
- DO use semantic HTML (main, table, thead, tbody, th, td, button, input).
- DO ensure contrast ≥ 4.5:1.
- DO respect prefers-reduced-motion.
- DO implement working search filter (filters the mock data array).
- DO implement working checkbox selection (select all + individual).
- DO implement working status filter dropdown.
- DO show/hide bulk actions bar based on selection state.
- ALL text in Brazilian Portuguese (pt-BR).
- Single .tsx file, COMPLETE.
- Export: `export default function AdminProducts()`
