# Gemini Prompt: Admin Edit Product Page — Memberly

Cole este prompt inteiro no Google AI Studio com Gemini 3.1 Pro.

---

## PROJECT REQUIREMENTS

Build a complete admin product edit page for a course platform called "Memberly". This is where admins configure a product (course) — title, description, slug, banner, publication status, and access webhook mappings. Must feel like a premium settings page — clean form with visual feedback, banner preview, and a clear action hierarchy. Think Vercel project settings meets Stripe product config. Light theme, organized sections.

**Stack (NON-NEGOTIABLE):**
- React 19 (functional components, hooks only)
- TypeScript strict
- Tailwind CSS v4 (use @theme inline, NOT tailwind.config)
- motion/react (Framer Motion) for animations
- Single .tsx file, fully self-contained
- All data is hardcoded/mocked — this is a visual reference
- Export as: `export default function AdminEditProduct()`
- Add `'use client'` at the top

---

## 1. GLOBAL DESIGN SYSTEM

### Color Palette
- Background: #F8FAFC
- Surface: #FFFFFF
- Border: #E2E8F0
- Primary: #2563EB
- Success: #059669
- Danger: #DC2626
- Purple: #7C3AED
- Text primary: #0F172A
- Text secondary: #64748B
- Input bg: #FFFFFF
- Input border: #E2E8F0, focus: #2563EB
- Section border: #F1F5F9

### Typography
Google Fonts import: `Inter` (400, 500, 600, 700).
- Page title: 1.5rem, font-weight 700
- Section title: 1rem, font-weight 600, slate-900
- Section description: 0.875rem, slate-500
- Label: 0.875rem, font-weight 500, slate-700
- Input: 0.875rem, slate-900
- Helper text: 0.75rem, slate-400

---

## 2. PAGE STRUCTURE

```
[Breadcrumb]
[Page Header — product name + action buttons]
[Two column layout on desktop]
  Left (60%): 
    [Basic Info section — title, slug, description]
    [Banner section — preview + upload/generate]
    [Danger Zone — delete product]
  Right (40%):
    [Status card — publish toggle + stats]
    [Quick Links card — modules, lessons, webhooks]
    [Duplicate card — copy product]
```

---

## 3. COMPONENT STRUCTURE

### Section 1: Breadcrumb
- "Produtos" → "Método Completo de Calistenia" → "Editar"
- Same style as other admin pages

### Section 2: Page Header
- Left: "Editar Produto" (h1, 24px, bold)
- Right: flex gap-3
  - "Ver como membro" button: border, bg-white, text-slate-700, rounded-lg, h-10, px-4, text-sm, hover:bg-slate-50, eye icon
  - "Salvar Alterações" button: bg-blue-600, text-white, rounded-lg, h-10, px-4, text-sm, font-medium, hover:bg-blue-700
    - Disabled state: opacity-50 when no changes
    - Loading state: spinner replaces text

### Section 3: Left Column — Basic Info Card
- Container: bg-white, rounded-xl, border, p-6
- Title: "Informações Básicas" (font-semibold, slate-900)
- Subtitle: "Detalhes principais do produto" (text-sm, slate-500, mt-1)
- Divider: border-t, mt-4, pt-5

**Fields:**
- **Título:** 
  - Label: "Título *" 
  - Input: h-11, rounded-xl, border, px-4
  - Value: "Método Completo de Calistenia"
  - Focus: border-blue-500, ring-1 ring-blue-500/30

- **Slug (URL):**
  - Collapsible "Configurações avançadas" toggle (chevron + text-sm slate-500)
  - When open: bg-slate-50, rounded-lg, p-4, border
  - Label: "Slug (URL)"
  - Input with prefix: flex items-center, border rounded-xl
    - Prefix: bg-slate-50, px-3, text-sm, text-slate-400, border-r: "/products/"
    - Input: flex-1, h-11, px-3
    - Value: "metodo-completo-calistenia"
  - Helper: "Gerado automaticamente do título" (text-xs, slate-400)

- **Descrição:**
  - Label: "Descrição"
  - Textarea: 4 rows, rounded-xl, border, px-4 py-3, resize-y
  - Value: "Transforme seu corpo usando apenas o peso corporal..."
  - Character count: bottom-right "156/500" (text-xs, slate-400)

### Section 4: Left Column — Banner Card
- Container: bg-white, rounded-xl, border, p-6, mt-5
- Title: "Banner" + subtitle "Imagem de capa do produto (16:9)"

**Banner preview:**
- Aspect-video, rounded-xl, overflow-hidden, border, mt-4
- If banner exists: show image (use gradient placeholder: linear-gradient(135deg, #1a1a2e, #0f3460))
- Overlay on hover: bg-black/40 with "Alterar" button centered (text-white, font-medium)
- If no banner: dashed border zone with upload icon, "Clique para gerar ou fazer upload" text

**Action buttons below preview:** flex gap-3, mt-3
- "Gerar com IA" button: bg-purple-50, text-purple-700, rounded-lg, px-4 py-2, text-sm, font-medium, hover:bg-purple-100
  - Icon: sparkle/magic wand (w-4 h-4)
- "Fazer Upload" button: border, bg-white, text-slate-700, rounded-lg, px-4 py-2, text-sm
  - Icon: upload arrow
- "Remover" button (only if banner exists): text-red-500, text-sm, hover:text-red-700

### Section 5: Left Column — Danger Zone
- Container: bg-white, rounded-xl, border border-red-200, p-6, mt-5
- Title: "Zona de Perigo" (font-semibold, text-red-600)
- Description: "Ações irreversíveis. Tenha certeza antes de prosseguir." (text-sm, slate-500)
- Divider: border-t border-red-100, mt-3, pt-4

**Delete product:**
- Flex justify-between items-center
  - Left:
    - "Excluir Produto" (font-medium, slate-900)
    - "Remove o produto e todos os módulos e aulas associados" (text-sm, slate-500)
  - Right: "Excluir" button (bg-red-50, text-red-600, rounded-lg, px-4 py-2, text-sm, font-medium, hover:bg-red-100, border border-red-200)

### Section 6: Right Column — Status Card
- Container: bg-white, rounded-xl, border, p-6
- Title: "Status de Publicação"

**Publish toggle:** (mt-4)
- Large toggle switch: w-12 h-7, rounded-full
  - Published: bg-emerald-500, thumb right
  - Draft: bg-slate-200, thumb left
  - Transition: 200ms
- Label right of toggle:
  - Published: "Publicado" (text-sm, font-medium, emerald-700) + "Visível para membros com acesso" (text-xs, slate-500)
  - Draft: "Rascunho" (text-sm, font-medium, slate-600) + "Não visível para membros" (text-xs, slate-500)

**Quick stats:** (mt-5, grid grid-cols-2 gap-3)
- "8 módulos" — icon + number + label (bg-slate-50, rounded-lg, p-3)
- "47 aulas" — same
- "1.248 membros" — same, icon users
- "67% conclusão" — same, icon chart

### Section 7: Right Column — Quick Links
- Container: bg-white, rounded-xl, border, p-6, mt-5
- Title: "Acesso Rápido"
- List of 3 link items (space-y-2, mt-3):
  - Each: flex items-center gap-3, p-3, rounded-lg, hover:bg-slate-50, cursor-pointer, transition
  - "Gerenciar Módulos" + "8 módulos" badge + chevron right — icon grid (text-purple-600)
  - "Configurar Webhooks" + "1 mapeamento" badge + chevron — icon link (text-blue-600)
  - "Ver como Membro" + chevron — icon eye (text-emerald-600)

### Section 8: Right Column — Duplicate
- Container: bg-white, rounded-xl, border, p-6, mt-5
- Title: "Duplicar Produto"
- Description: "Cria uma cópia completa com todos os módulos e aulas" (text-sm, slate-500, mt-1)
- Button: "Duplicar Produto" (w-full, mt-3, border, bg-white, text-slate-700, rounded-lg, h-10, font-medium, hover:bg-slate-50)
  - Icon: copy (w-4 h-4, mr-2)

---

## 4. ANIMATIONS & INTERACTIONS

**Entry:**
- Left column: fade-up 0.5s
- Right column: fade-up 0.5s, delay 0.1s
- Cards within columns: stagger 0.05s

**Interactions:**
- Input focus: border transition + ring, 200ms
- Toggle switch: thumb slides with spring (300ms)
- Banner hover overlay: opacity 0→1, 200ms
- Quick link hover: bg-slate-50, chevron shifts right 4px
- Danger delete hover: bg-red-50→bg-red-100
- Save button: disabled when no changes, enabled with subtle pulse glow on first change
- Slug prefix: seamless input feel

---

## 5. RESPONSIVE BEHAVIOR

- **Desktop (≥1024px):** Two-column (60/40), side by side
- **Tablet (768-1023px):** Single column, right column cards move below left
- **Mobile (<768px):** Single column, full width, reduced padding, stats 2x2 grid
- All inputs: h-11 minimum touch target
- Banner: aspect-video at all sizes

---

## 6. QUALITY RULES (CRITICAL)

- DO NOT use external images. Banner preview is a CSS gradient.
- DO NOT use Tailwind v3 syntax.
- DO NOT add placeholder comments.
- DO NOT use dependencies beyond React, Tailwind v4, motion/react.
- DO implement working publish toggle (useState).
- DO implement working advanced settings collapse.
- DO implement working form inputs (controlled with useState).
- DO implement character count for description.
- ALL text in Brazilian Portuguese (pt-BR).
- Single .tsx file, COMPLETE.
- Export: `export default function AdminEditProduct()`
