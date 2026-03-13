# Gemini Prompt: Admin Members Page — Memberly

Cole este prompt inteiro no Google AI Studio com Gemini 3.1 Pro.

---

## PROJECT REQUIREMENTS

Build a complete admin members management page for a course platform called "Memberly". This is where admins view, search, filter, import, export, and batch-manage member access. Must feel like a premium CRM — clean data table with powerful actions. Think Linear's member list or Stripe's customer dashboard. Light theme, professional, efficient.

**Stack (NON-NEGOTIABLE):**
- React 19 (functional components, hooks only)
- TypeScript strict
- Tailwind CSS v4 (use @theme inline, NOT tailwind.config)
- motion/react (Framer Motion) for animations
- Single .tsx file, fully self-contained
- All data is hardcoded/mocked — this is a visual reference
- Export as: `export default function AdminMembers()`
- Add `'use client'` at the top

---

## 1. GLOBAL DESIGN SYSTEM

### Color Palette
- Background: #F8FAFC
- Surface: #FFFFFF
- Border: #E2E8F0
- Primary: #2563EB (blue-600)
- Success: #059669 (emerald-600)
- Danger: #DC2626 (red-600)
- Purple: #7C3AED
- Text primary: #0F172A
- Text secondary: #64748B
- Text tertiary: #94A3B8
- Row hover: #F8FAFC
- Selected: #EFF6FF

### Typography
Google Fonts import: `Inter` (400, 500, 600, 700).
- Page title: 1.5rem, font-weight 700, slate-900
- Table header: 0.75rem, font-weight 600, uppercase, tracking-wider, slate-500
- Table cell: 0.875rem, slate-700
- Name: 0.875rem, font-weight 500, slate-900
- Badge: 0.75rem, font-weight 500

---

## 2. PAGE STRUCTURE

```
[Header — title + member count + Import/Export buttons]
[Filters — search + product filter dropdown]
[Members Table — avatar, name, email, products, date, actions]
[Pagination — bottom]
[Bulk Action Bar — floating, when selected]
```

---

## 3. COMPONENT STRUCTURE

### Section 1: Page Header
- Left: "Membros" (h1, 24px, bold) + badge "1,248 membros" (bg-slate-100, text-slate-600, rounded-full, px-2.5 py-0.5, text-xs, ml-3)
- Right: flex gap-2
  - "Importar CSV" button: border border-slate-200, bg-white, text-slate-700, rounded-lg, px-4 h-10, text-sm, font-medium, hover:bg-slate-50
    - Icon: upload arrow (w-4 h-4, mr-2)
  - "Exportar" button: same style
    - Icon: download arrow (w-4 h-4, mr-2)

### Section 2: Filters (mt-4, flex gap-3)
- **Search:** flex-1, max-w-sm
  - Magnifying glass icon left, h-10, bg-white, border, rounded-lg, pl-10
  - Placeholder: "Buscar por nome ou email..."
  - Focus: border-blue-500, ring-1 ring-blue-500/30
- **Product filter:** select dropdown
  - "Todos os produtos" + list of products
  - h-10, bg-white, border, rounded-lg, w-52

### Section 3: Members Table
- Container: bg-white, rounded-xl, border, shadow-sm, overflow-hidden, mt-4

- **Header:** bg-slate-50/80
  - Columns: [Checkbox] | Membro | Email | Produtos | Registrado em | Ações
  - Text: xs, uppercase, font-semibold, slate-500

- **Rows:** each member
  - Hover: bg-slate-50
  - Selected: bg-blue-50
  - Border: border-b border-slate-100

  **Row content:**
  - **Checkbox:** w-4 h-4, rounded, accent-blue-600
  - **Membro cell:** flex items-center gap-3
    - Avatar: w-9 h-9, rounded-full, bg-gradient (unique per member), flex items-center justify-center
      - Initials: text-xs, font-semibold, text-white
    - Name: font-medium, slate-900 (clickable, hover:text-blue-600)
  - **Email cell:** text-sm, slate-500
  - **Produtos cell:** 
    - If 1-2 products: show as mini badges (bg-blue-50, text-blue-700, rounded-full, px-2 py-0.5, text-xs)
    - If 3+: show first badge + "+N" badge (bg-slate-100, text-slate-600)
  - **Registrado em:** text-sm, slate-500, "10 Mar 2026" format
  - **Ações:** flex gap-1
    - "Ver" button: eye icon, w-8 h-8, rounded-md, hover:bg-slate-100, text-slate-500
    - "Revogar" button: x-circle icon, w-8 h-8, rounded-md, hover:bg-red-50, text-red-500 (only shows on hover of row)

- **Mock 8 members:**
  1. "Maria Silva" | MS | maria@email.com | Calistenia, Nutrição | 10 Mar 2026 | gradient #2563EB→#7C3AED
  2. "João Oliveira" | JO | joao@test.com | Calistenia | 08 Mar 2026 | gradient #059669→#0EA5E9
  3. "Pedro Santos" | PS | pedro@mail.com | Mindset, Calistenia, Nutrição | 05 Mar 2026 | gradient #DC2626→#F97316
  4. "Ana Costa" | AC | ana@email.com | Nutrição | 03 Mar 2026 | gradient #7C3AED→#EC4899
  5. "Lucas Ferreira" | LF | lucas@test.com | Calistenia, Treino em Casa | 01 Mar 2026 | gradient #0EA5E9→#06B6D4
  6. "Carla Mendes" | CM | carla@mail.com | Mindset | 28 Fev 2026 | gradient #F97316→#EAB308
  7. "Rafael Lima" | RL | rafael@email.com | Calistenia, Nutrição, Mindset, Mobilidade | 25 Fev 2026 | gradient #059669→#7C3AED
  8. "Beatriz Souza" | BS | beatriz@test.com | Treino em Casa | 20 Fev 2026 | gradient #EC4899→#8B5CF6

### Section 4: Pagination
- Container: flex items-center justify-between, mt-4
- Left: "Mostrando 1-8 de 1.248 membros" (text-sm, slate-500)
- Right: flex gap-1
  - Page buttons: w-9 h-9, rounded-lg, text-sm
  - Active: bg-blue-600, text-white
  - Inactive: bg-white, border, text-slate-700, hover:bg-slate-50
  - "← Anterior" and "Próximo →" buttons at edges
  - Show: ← 1 2 3 ... 62 63 →
  - Current page: 1

### Section 5: Bulk Action Bar (when ≥1 selected)
- Fixed bottom-4, centered, bg-slate-900, text-white, rounded-xl, shadow-2xl, px-6 py-3, z-50
- "X selecionado(s)" + divider + "Conceder Acesso" (text-emerald-400) + "Revogar Acesso" (text-red-400) + "Limpar" (text-slate-400)
- Entry: slide-up from bottom
- Mock: 3 members selected

---

## 4. ANIMATIONS & INTERACTIONS

**Entry:**
- Title: fade-in 0.4s
- Filters: fade-in 0.3s, delay 0.1s
- Table: fade-in 0.5s, delay 0.15s

**Interactions:**
- Row hover: bg-slate-50, action buttons appear (opacity 0→1, 150ms)
- Checkbox toggle: accent color transition
- Bulk bar: slide-up (y: 20→0, 0.3s) on first selection
- Search: focus ring 200ms
- Pagination: button hover bg 150ms
- Avatar: subtle scale(1.05) on row hover, 200ms

---

## 5. RESPONSIVE BEHAVIOR

- **Desktop:** Full table, all columns
- **Tablet:** Hide email column, smaller avatars
- **Mobile:** Card layout instead of table. Each member = card with avatar, name, email, product badges, date. Actions as icon row at bottom of card.
- Pagination: simplified on mobile (← 1/63 →)
- Bulk bar: full width on mobile

---

## 6. QUALITY RULES (CRITICAL)

- DO NOT use external images. Avatars are gradient circles with initials.
- DO NOT use Tailwind v3 syntax.
- DO NOT add placeholder comments.
- DO NOT use dependencies beyond React, Tailwind v4, motion/react.
- DO implement working search filter (filters mock array by name/email).
- DO implement working checkbox selection + bulk bar toggle.
- DO implement working pagination state (visual only, page 1 of 63).
- ALL text in Brazilian Portuguese (pt-BR).
- Single .tsx file, COMPLETE.
- Export: `export default function AdminMembers()`
