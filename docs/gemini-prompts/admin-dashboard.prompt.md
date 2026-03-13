# Gemini Prompt: Admin Dashboard — Memberly

Cole este prompt inteiro no Google AI Studio com Gemini 3.1 Pro selecionado.

---

## PROJECT REQUIREMENTS

Build a complete admin dashboard page for a Netflix-style course platform called "Memberly". This is the main `/admin` page that admins see after login. It must feel like a premium SaaS analytics dashboard — think Linear, Vercel, or Raycast admin panels. Clean, data-dense, but never cluttered.

**Stack (NON-NEGOTIABLE):**
- React 19 (functional components, hooks only)
- TypeScript strict
- Tailwind CSS v4 (use @theme inline, NOT tailwind.config)
- motion/react (Framer Motion) for animations
- Recharts for the chart (import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts')
- Single .tsx file, fully self-contained
- All data is hardcoded/mocked — this is a visual reference
- Export as: `export default function AdminDashboard()`

---

## 1. GLOBAL DESIGN SYSTEM

### Color Palette
- Background: #F8FAFC (slate-50, cool light gray)
- Surface/Card: #FFFFFF
- Card border: #E2E8F0 (slate-200)
- Card border hover: #CBD5E1 (slate-300)
- Primary accent: #2563EB (blue-600 — used for CTAs, active states, chart line)
- Secondary accent: #7C3AED (violet-600 — used for secondary metrics)
- Success: #059669 (emerald-600)
- Warning: #D97706 (amber-600)
- Danger: #DC2626 (red-600)
- Text primary: #0F172A (slate-900)
- Text secondary: #64748B (slate-500)
- Text tertiary: #94A3B8 (slate-400)
- Sidebar bg: #FFFFFF
- Sidebar border: #F1F5F9 (slate-100)

### Typography
Google Fonts import: `Inter` (400, 500, 600, 700) only.
- All text: 'Inter', system-ui, -apple-system, sans-serif
- Dashboard title: 1.5rem (24px), font-weight 700, color slate-900
- Card title: 0.875rem (14px), font-weight 500, color slate-500, uppercase, letter-spacing 0.05em
- Card value: 2rem (32px), font-weight 700, color slate-900
- Card subtext: 0.75rem (12px), font-weight 500
- Table header: 0.75rem (12px), font-weight 600, color slate-500, uppercase, letter-spacing 0.05em
- Table cell: 0.875rem (14px), font-weight 400, color slate-700
- Section title: 1.125rem (18px), font-weight 600, color slate-900

### Spacing & Layout
- Page max width: 100% (fluid within sidebar layout)
- Page padding: px-8 py-8
- Card padding: p-6
- Card border-radius: rounded-xl (12px)
- Card shadow: shadow-sm (subtle, almost flat)
- Section gap: gap-8 between major sections
- Card grid gap: gap-5
- Border radius consistency: all rounded-xl

---

## 2. PAGE LAYOUT (assume sidebar already exists on left, 256px wide)

This component renders only the MAIN CONTENT AREA (right side). No sidebar, no top header — those are handled by the layout. The component receives no props.

Layout structure (top to bottom):

```
[Page title + date range selector]
[4 stat cards in a row]
[2-column: Chart (left 60%) + Recent Webhooks (right 40%)]
[2-column: Top Lessons (left 50%) + Quick Actions (right 50%)]
[Full width: Recent Products table]
```

---

## 3. COMPONENT STRUCTURE (top to bottom)

### Section 1: Page Header
- Left: "Dashboard" title (h1, 24px, bold)
- Below title: "Visão geral da sua plataforma" (14px, slate-500)
- Right: Date range pill selector with 3 options: "7 dias", "30 dias", "90 dias"
  - Style: inline-flex, rounded-lg bg-slate-100, each option is a button
  - Active option: bg-white, shadow-sm, text-slate-900, font-medium
  - Inactive: text-slate-500, hover:text-slate-700
  - Default active: "30 dias"

### Section 2: Stat Cards (4 cards in a grid, sm:grid-cols-2 lg:grid-cols-4)

Each card has:
- Top: icon (24x24) + title on same line
- Middle: big number (32px, bold)
- Bottom: comparison with previous period (green ↑ or red ↓ + percentage)

**Card 1: Total de Membros**
- Icon: Users icon (SVG, stroke, slate-400)
- Value: "1,248"
- Comparison: "↑ 12% vs mês anterior" (text-emerald-600, bg-emerald-50, rounded-full, px-2 py-0.5)

**Card 2: Membros Ativos (30d)**
- Icon: Activity/pulse icon (SVG, stroke, blue-500)
- Value: "847"
- Comparison: "↑ 8% vs período anterior" (emerald)

**Card 3: Taxa de Conclusão**
- Icon: CheckCircle icon (SVG, stroke, violet-500)
- Value: "64%"
- Comparison: "↑ 3% vs mês anterior" (emerald)
- Extra: thin progress bar below the number (h-1.5, rounded-full, bg-slate-100, fill bg-violet-500 at 64%)

**Card 4: Aulas Publicadas**
- Icon: Play icon (SVG, stroke, slate-400)
- Value: "156"
- Comparison: "+12 este mês" (text-slate-500, neutral — no color)

### Section 3: Chart + Webhooks (2 columns, gap-5)

**Left column (lg:col-span-7 in a 12-col grid): Novos Membros**
- Card with title "Novos Membros" + subtitle "Últimos 30 dias"
- Right of title: total "87 novos" in a subtle badge (bg-blue-50, text-blue-700, rounded-full)
- Recharts AreaChart:
  - Data: 30 days of mocked data (array of { date: "01/02", members: randomInt(1-8) })
  - Area fill: linear gradient from blue-500 (opacity 0.15) to transparent
  - Line: stroke blue-500, strokeWidth 2, smooth curve (type="monotone")
  - XAxis: show every 5th day label, text slate-400, fontSize 12
  - YAxis: hidden
  - Tooltip: custom styled (bg-slate-900, text-white, rounded-lg, shadow-xl, px-3 py-2)
  - Grid: horizontal only, stroke slate-100
  - Height: 280px
  - No legend

**Right column (lg:col-span-5): Webhooks Recentes**
- Card with title "Webhooks Recentes"
- List of 7 items, each with:
  - Left: status dot (8px circle) — green (#059669) for "processed", red (#DC2626) for "failed", gray (#94A3B8) for "ignored"
  - Middle: email (truncated with text-ellipsis, max-w-[160px]) + event type below (text-xs, slate-400)
  - Right: time ago "há 2h", "há 5h", etc (text-xs, slate-400)
- Mock data:
  - maria@email.com | purchase | processed | há 1h
  - joao@test.com | purchase | processed | há 2h
  - pedro@mail.com | purchase | failed | há 3h
  - ana@email.com | purchase | processed | há 5h
  - lucas@test.com | purchase | ignored | há 6h
  - carla@mail.com | purchase | processed | há 8h
  - rafael@email.com | purchase | processed | há 12h
- Bottom: link "Ver todos os logs →" (text-sm, text-blue-600, hover:text-blue-800)

### Section 4: Top Lessons + Quick Actions (2 columns, gap-5)

**Left column: Aulas Mais Assistidas**
- Card with title "Aulas Mais Assistidas" + subtitle "Top 5 por conclusões"
- Ranked list (1-5), each item:
  - Left: rank number in a circle (w-7 h-7, rounded-full)
    - #1: bg-amber-100, text-amber-700
    - #2: bg-slate-100, text-slate-600
    - #3: bg-orange-50, text-orange-600
    - #4-5: bg-slate-50, text-slate-500
  - Middle: lesson title (font-medium, slate-900) + module name below (text-xs, slate-400)
  - Right: completion count + mini bar
    - "234 conclusões" (text-sm, slate-600)
    - Below: progress bar (h-1, rounded-full, bg-slate-100) with fill proportional to max
- Mock data:
  1. "Introdução ao Método" | Módulo 1 - Fundamentos | 234
  2. "Configurando seu Ambiente" | Módulo 1 - Fundamentos | 198
  3. "Primeiro Projeto Prático" | Módulo 2 - Prática | 176
  4. "Técnicas Avançadas" | Módulo 3 - Avançado | 145
  5. "Revisão e Próximos Passos" | Módulo 4 - Conclusão | 132

**Right column: Ações Rápidas**
- Card with title "Ações Rápidas"
- 3 action cards stacked vertically (gap-3):

  **Action 1: Novo Produto**
  - Left: icon in circle (w-10 h-10, bg-blue-50, rounded-xl) with + icon (text-blue-600)
  - Right: "Novo Produto" (font-medium) + "Criar um novo curso" (text-sm, slate-500)
  - Full card is a hoverable button (hover: border-blue-200, bg-blue-50/50)

  **Action 2: Gerenciar Produtos**
  - Left: icon in circle (bg-violet-50, rounded-xl) with grid icon (text-violet-600)
  - Right: "Gerenciar Produtos" + "Ver e editar cursos"

  **Action 3: Gerenciar Membros**
  - Left: icon in circle (bg-emerald-50, rounded-xl) with users icon (text-emerald-600)
  - Right: "Gerenciar Membros" + "Ver e gerenciar acessos"

### Section 5: Recent Products Table
- Card with title "Produtos Recentes" + right-aligned link "Ver todos →" (text-blue-600)
- Clean table with:
  - Columns: Produto | Módulos | Aulas | Status | Criado em | Ação
  - Header: uppercase, text-xs, font-semibold, slate-500, border-b slate-200
  - Rows: py-4, border-b slate-100 (last row no border)
  - Status: badge — "Publicado" (bg-emerald-50, text-emerald-700, ring-1 ring-emerald-200) or "Rascunho" (bg-slate-100, text-slate-600, ring-1 ring-slate-200)
  - Action: "Editar" link (text-blue-600, hover:text-blue-800, font-medium)
- Mock data (5 rows):
  1. "Método Completo de Calistenia" | 8 módulos | 47 aulas | Publicado | 10 Mar 2026
  2. "Fundamentos da Nutrição" | 5 módulos | 32 aulas | Publicado | 08 Mar 2026
  3. "Treino em Casa" | 3 módulos | 18 aulas | Rascunho | 05 Mar 2026
  4. "Mindset e Disciplina" | 4 módulos | 24 aulas | Publicado | 01 Mar 2026
  5. "Mobilidade e Flexibilidade" | 6 módulos | 36 aulas | Rascunho | 28 Fev 2026

---

## 4. ANIMATIONS & INTERACTIONS

**Entry animations (on mount):**
- Stat cards: stagger fade-up (y: 20 → 0, opacity: 0 → 1), duration 0.5s, ease [0.25, 0.4, 0, 1], delay: card1 0s, card2 0.05s, card3 0.1s, card4 0.15s
- Chart section: fade-in (opacity 0 → 1), duration 0.6s, delay 0.2s
- Lower sections: fade-up (y: 16 → 0), duration 0.5s, delay 0.3s
- Table rows: NO animation (too many items, would feel janky)

**Hover interactions:**
- Stat cards: translateY(-2px) + shadow-md transition (duration 200ms)
- Quick action cards: border-color change + subtle bg tint (duration 150ms)
- Table rows: bg-slate-50 (duration 150ms)
- All transitions: transition-all duration-200

**Chart interactions:**
- Tooltip follows mouse on hover (built into Recharts)
- Area fill animates on mount (Recharts default)

**Date range selector:**
- Active pill slides with a subtle width transition (no jump)

---

## 5. RESPONSIVE BEHAVIOR

- **Desktop (≥1024px):** Full 2-column layouts, 4 stat cards in row, table visible
- **Tablet (768-1023px):** 2 stat cards per row, chart and webhooks stack vertically, table horizontal scroll
- **Mobile (<768px):** 1 stat card per row, all sections stack, table scrolls horizontally, reduced padding (px-4 py-4)
- Touch targets: all interactive elements minimum 44x44px
- Table: wrapped in overflow-x-auto with min-w-[600px] on the table element

---

## 6. QUALITY RULES (CRITICAL)

- DO NOT use any image placeholders or external images. This dashboard is pure data/UI.
- DO NOT add comments like "// Add more here". Component must be COMPLETE and render perfectly.
- DO NOT use any dependencies beyond React, Tailwind v4, motion/react, and Recharts.
- DO NOT use Tailwind v3 syntax (no `bg-opacity-50`, use `bg-blue-500/50` instead).
- DO use semantic HTML (main, section, h1, table, thead, tbody).
- DO ensure all text has minimum 4.5:1 contrast ratio.
- DO respect `prefers-reduced-motion` — wrap motion components with a check.
- DO make the chart responsive with ResponsiveContainer width="100%" height={280}.
- DO use `'use client'` directive at the top of the file.
- ALL text content must be in Brazilian Portuguese (pt-BR).
- The output must be a SINGLE .tsx file with EVERYTHING inside.
- Export as default: `export default function AdminDashboard()`
