# Gemini Prompt: Admin Member Detail Page — Memberly

Cole este prompt inteiro no Google AI Studio com Gemini 3.1 Pro.

---

## PROJECT REQUIREMENTS

Build a complete admin member detail/profile page for a course platform called "Memberly". This page shows a specific member's info, their product access list, activity timeline, and management actions. Think Stripe customer detail page — clean profile header, organized data sections, clear actions. Light theme, professional.

**Stack (NON-NEGOTIABLE):**
- React 19 (functional components, hooks only)
- TypeScript strict
- Tailwind CSS v4 (use @theme inline, NOT tailwind.config)
- motion/react (Framer Motion) for animations
- Single .tsx file, fully self-contained
- All data is hardcoded/mocked — this is a visual reference
- Export as: `export default function AdminMemberDetail()`
- Add `'use client'` at the top

---

## 1. GLOBAL DESIGN SYSTEM

Same as other admin pages:
- Background: #F8FAFC | Surface: #FFFFFF | Border: #E2E8F0
- Primary: #2563EB | Success: #059669 | Danger: #DC2626 | Purple: #7C3AED
- Text: #0F172A / #64748B / #94A3B8
- Typography: Inter (400-700)

---

## 2. PAGE STRUCTURE

```
[Breadcrumb]
[Profile Header — large avatar, name, email, role, join date]
[Two columns on desktop]
  Left (60%):
    [Product Access — list of products with grant date, source, actions]
    [Activity Timeline — recent actions]
  Right (40%):
    [Quick Stats card]
    [Actions card — grant access, change role]
```

---

## 3. COMPONENT STRUCTURE

### Section 1: Breadcrumb
- "Membros" → "Maria Silva"
- Standard admin style

### Section 2: Profile Header
- Container: bg-white, rounded-xl, border, p-6
- Layout: flex items-center gap-5

- **Avatar:** w-20 h-20, rounded-2xl (not circle — squared with rounded corners), overflow-hidden
  - Gradient background: linear-gradient(135deg, #2563EB, #7C3AED)
  - Initials: "MS" (text-2xl, font-bold, text-white)

- **Info:**
  - Name: "Maria Silva" (text-2xl, font-bold, slate-900)
  - Email: "maria@email.com" (text-sm, slate-500, mt-0.5, flex items-center gap-2)
    - Copy icon button next to email (w-5 h-5, text-slate-400, hover:text-slate-600, cursor-pointer)
  - Meta row: flex items-center gap-3, mt-2
    - Role badge: "member" (bg-blue-50, text-blue-700, rounded-full, px-2.5 py-0.5, text-xs, font-medium, ring-1 ring-blue-200)
    - Join date: "Membro desde 10 Mar 2026" (text-xs, slate-500) with calendar icon
    - ID: "ID: abc123" (text-xs, font-mono, slate-400, bg-slate-50, rounded, px-1.5 py-0.5)

- **Right side:** flex gap-2 (ml-auto)
  - "Atribuir Acesso" button: bg-blue-600, text-white, rounded-lg, h-9, px-4, text-sm, font-medium
  - "•••" more menu button: w-9 h-9, border, rounded-lg, hover:bg-slate-50 (three dots)

### Section 3: Left Column — Product Access
- Container: bg-white, rounded-xl, border, p-6, mt-5
- Header: flex justify-between items-center
  - "Produtos com Acesso" (font-semibold, slate-900) + count badge "(4)" (text-slate-500)
  - "Atribuir Acesso" link (text-sm, text-blue-600, hover:text-blue-800)

- **Access list:** divide-y, mt-4
  Each item: py-4, flex items-center gap-4
  - **Product thumbnail:** w-14 h-9, rounded-lg, gradient placeholder
  - **Info:** flex-1
    - Product title: "Método Completo de Calistenia" (font-medium, slate-900)
    - Meta row: flex items-center gap-2, mt-1
      - "Liberado em 10 Mar 2026" (text-xs, slate-500)
      - Source badge:
        - webhook: bg-emerald-50, text-emerald-700, ring-1 ring-emerald-200, "webhook"
        - manual: bg-amber-50, text-amber-700, ring-1 ring-amber-200, "manual"
      - Transaction ID (if exists): "tx: PAY-12345" (text-xs, font-mono, bg-slate-50, rounded, px-1.5 py-0.5, slate-500)
  - **Action:** "Remover" button (text-sm, text-red-500, hover:text-red-700, opacity-0 group-hover:opacity-100 transition)

- Mock 4 access items:
  1. Calistenia | 10 Mar 2026 | webhook | tx: PAY-78901 | gradient #1a1a2e→#0f3460
  2. Nutrição | 08 Mar 2026 | webhook | tx: PAY-78902 | gradient #1a2e1a→#0f6034
  3. Mindset | 01 Mar 2026 | manual | no tx | gradient #2e1a2e→#600f4a
  4. Treino em Casa | 25 Fev 2026 | webhook | tx: PAY-78903 | gradient #2e2e1a→#604a0f

### Section 4: Left Column — Activity Timeline
- Container: bg-white, rounded-xl, border, p-6, mt-5
- Title: "Atividade Recente" (font-semibold, slate-900)

- **Timeline:** mt-4, space-y-4
  Each event: flex gap-3, relative
  - Left: dot + vertical line
    - Dot: w-2.5 h-2.5, rounded-full (color varies by type), mt-1.5
    - Vertical line: absolute left-[5px] top-4 bottom-0 w-px bg-slate-200 (except last item)
  - Right: flex-1
    - Event text: text-sm, slate-700
    - Timestamp: text-xs, slate-400, mt-0.5

  - Dot colors by type:
    - Access granted: bg-emerald-500
    - Lesson completed: bg-blue-500
    - Comment posted: bg-purple-500
    - Login: bg-slate-400

  - Mock 6 events:
    1. 🟢 "Acesso ao produto Calistenia concedido via webhook" | há 2 dias
    2. 🔵 "Completou Aula 12: Muscle Up Progressão" | há 3 dias
    3. 🔵 "Completou Aula 11: Front Lever" | há 4 dias
    4. 🟣 "Comentou na Aula 10: Strict Muscle Up" | há 5 dias
    5. 🔵 "Completou Aula 10: Strict Muscle Up" | há 5 dias
    6. ⚪ "Login realizado" | há 1 semana

### Section 5: Right Column — Quick Stats
- Container: bg-white, rounded-xl, border, p-6
- Title: "Resumo" (font-semibold)
- Grid grid-cols-2, gap-4, mt-4

  Each stat: bg-slate-50, rounded-xl, p-4
  - Number: text-2xl, font-bold, slate-900
  - Label: text-xs, slate-500, mt-1

  Stats:
  1. "4" — "Produtos"
  2. "67%" — "Conclusão Média"
  3. "32" — "Aulas Concluídas"
  4. "5" — "Comentários"

### Section 6: Right Column — Actions
- Container: bg-white, rounded-xl, border, p-6, mt-5
- Title: "Ações" (font-semibold)
- List: space-y-2, mt-3

  Each action: w-full, flex items-center gap-3, p-3, rounded-lg, text-left, text-sm
  - "Atribuir Acesso a Produto" — icon: plus-circle (text-blue-600), hover:bg-blue-50
  - "Alterar Função" — icon: shield (text-purple-600), hover:bg-purple-50, subtitle "Atual: member" (text-xs, slate-400)
  - "Redefinir Senha" — icon: key (text-amber-600), hover:bg-amber-50
  - Divider: border-t, my-2
  - "Remover Membro" — icon: trash (text-red-500), hover:bg-red-50, text-red-600

---

## 4. ANIMATIONS & INTERACTIONS

**Entry:**
- Profile header: fade-in 0.4s
- Left column cards: stagger fade-up 0.05s, delay 0.1s
- Right column cards: stagger fade-up 0.05s, delay 0.15s
- Timeline dots: stagger scale-in (0→1), 0.08s between, delay 0.3s

**Interactions:**
- Access items: group hover → "Remover" appears (opacity transition 150ms)
- Copy email: click → brief "Copiado!" tooltip (fade-in, auto-hide 2s)
- Action buttons: hover bg tint, 150ms
- Stat cards: subtle hover scale(1.02), 200ms
- "Atribuir Acesso" button: hover lift + shadow

---

## 5. RESPONSIVE BEHAVIOR

- **Desktop:** 2-column (60/40)
- **Tablet:** Single column, right cards move below
- **Mobile:** Avatar smaller (w-16 h-16), name text-xl, meta wraps, actions stack. Timeline compact.

---

## 6. QUALITY RULES (CRITICAL)

- DO NOT use external images. Avatars are gradient + initials, thumbnails are gradients.
- DO NOT use Tailwind v3 syntax.
- DO NOT add placeholder comments.
- DO implement working copy-to-clipboard for email (navigator.clipboard).
- ALL text in Brazilian Portuguese (pt-BR).
- Single .tsx file, COMPLETE.
- Export: `export default function AdminMemberDetail()`
