# Gemini Prompt: Admin New Product Page — Memberly

Cole este prompt inteiro no Google AI Studio com Gemini 3.1 Pro.

---

## PROJECT REQUIREMENTS

Build a complete "Create New Product" page for a course platform called "Memberly". This is a step-by-step product creation experience — not just a boring form. It should feel like creating a new project in Vercel or a new workspace in Notion. Clean, focused, guiding the admin through each field. Light theme, spacious, premium form UX.

**Stack (NON-NEGOTIABLE):**
- React 19 (functional components, hooks only)
- TypeScript strict
- Tailwind CSS v4 (use @theme inline, NOT tailwind.config)
- motion/react (Framer Motion) for animations
- Single .tsx file, fully self-contained
- All data is hardcoded/mocked — this is a visual reference
- Export as: `export default function AdminNewProduct()`
- Add `'use client'` at the top

---

## 1. GLOBAL DESIGN SYSTEM

Same admin palette:
- Background: #F8FAFC | Surface: #FFFFFF | Border: #E2E8F0
- Primary: #2563EB | Success: #059669 | Danger: #DC2626 | Purple: #7C3AED
- Text: #0F172A / #64748B / #94A3B8
- Typography: Inter (400-700)

---

## 2. PAGE STRUCTURE

```
[Page Header — "Novo Produto" + cancel link]
[Centered card — max-w-2xl, the creation form]
  [Step indicator — visual progress dots]
  [Form fields — title, description, slug, banner]
  [Action buttons — create + cancel]
```

Centered, focused layout. No sidebar distractions. The form IS the page.

---

## 3. COMPONENT STRUCTURE

### Section 1: Page Header
- Flex justify-between items-center, mb-8
- Left: "Novo Produto" (h1, 24px, bold, slate-900)
- Right: "Cancelar" link (text-sm, slate-500, hover:text-slate-700)

### Section 2: Creation Card
- Container: bg-white, rounded-2xl, border, shadow-sm, p-8 sm:p-10, max-w-2xl, mx-auto

**Step indicator:** (mb-8, flex justify-center)
- 3 dots in a row with connecting lines:
  - Step 1 "Básico" — active: w-3 h-3 bg-blue-600 rounded-full + label below (text-xs, font-medium, blue-600)
  - Step 2 "Detalhes" — upcoming: w-3 h-3 bg-slate-200 + label (text-xs, slate-400)
  - Step 3 "Banner" — upcoming: same
  - Connecting lines between dots: w-16 h-px bg-slate-200 (active: bg-blue-600)
- Mock: Step 1 active

**Form content:** (space-y-6)

1. **Title field:**
   - Label: "Como se chama seu produto?" (text-base, font-semibold, slate-900 — bigger than normal labels)
   - Helper: "O nome que seus membros verão" (text-sm, slate-400, mt-1)
   - Input: h-12, rounded-xl, border, px-4, text-base, slate-900, mt-3
   - Placeholder: "Ex: Método Completo de Calistenia"
   - Focus: border-blue-500, ring-1 ring-blue-500/30
   - Auto-focus on mount

2. **Description field:**
   - Label: "Descreva seu produto" (text-base, font-semibold)
   - Helper: "Uma breve descrição para seus membros" (text-sm, slate-400)
   - Textarea: 4 rows, rounded-xl, border, px-4 py-3, resize-y, mt-3
   - Placeholder: "Do que se trata este curso?"
   - Character counter: right-aligned below, "0/500" (text-xs, slate-400)
   - Counter turns amber at 450, red at 500

3. **Slug field:** (collapsible, default hidden)
   - Toggle: "Personalizar URL" (text-sm, text-blue-600, hover:text-blue-800, cursor-pointer, flex items-center gap-1, mt-2)
   - When open: slide-down animation (AnimatePresence)
     - Container: bg-slate-50, rounded-xl, p-4, mt-3, border
     - Label: "Slug (URL)" (text-sm, font-medium, slate-700)
     - Input with prefix: flex, rounded-xl, border, overflow-hidden
       - Prefix: bg-slate-100, px-3, text-sm, slate-400, border-r, flex items-center: "memberly.com/products/"
       - Input: flex-1, h-11, px-3, bg-white
     - Auto-generated from title (show in real-time)
     - Helper: "Gerado automaticamente do título" (text-xs, slate-400)

4. **Banner section:**
   - Label: "Banner do produto" (text-base, font-semibold)
   - Helper: "Imagem de capa (recomendado 16:9)" (text-sm, slate-400)
   
   **Upload zone:** mt-3
   - No banner: dashed border-2 border-slate-200 rounded-xl, p-8, text-center, hover:border-slate-300 hover:bg-slate-50, cursor-pointer, transition
     - Upload cloud icon: w-10 h-10, text-slate-300, mx-auto
     - "Arraste uma imagem ou clique para selecionar" (text-sm, slate-500, mt-3)
     - "PNG, JPG até 5MB" (text-xs, slate-400, mt-1)
     - OR divider: flex items-center gap-3, mt-4
       - Lines: flex-1 h-px bg-slate-200
       - "ou" (text-xs, slate-400)
     - "Gerar com IA" button: bg-purple-50, text-purple-700, rounded-lg, px-4 py-2, text-sm, font-medium, hover:bg-purple-100, mt-3
       - Sparkle icon (w-4 h-4)
   
   - With banner preview: aspect-video, rounded-xl, border, overflow-hidden, relative
     - Image (gradient placeholder)
     - Hover overlay: bg-black/40, flex items-center justify-center gap-3
       - "Trocar" button (bg-white/90, text-slate-900, rounded-lg, px-3 py-1.5, text-sm)
       - "Remover" button (bg-red-500/90, text-white, rounded-lg, px-3 py-1.5, text-sm)

### Section 3: Action Buttons
- Container: flex items-center justify-between, mt-8, pt-6, border-t border-slate-100
- Left: "Cancelar" (text-sm, text-slate-500, hover:text-slate-700)
- Right: flex gap-3
  - "Salvar como Rascunho" button: border, bg-white, text-slate-700, rounded-xl, h-11, px-5, text-sm, font-medium, hover:bg-slate-50
  - "Criar Produto" button: bg-blue-600, text-white, rounded-xl, h-11, px-6, text-sm, font-medium, hover:bg-blue-700
    - Hover: translateY(-1px), shadow-md shadow-blue-500/20
    - Loading: spinner
    - Disabled: opacity-50 (when title empty)

---

## 4. ANIMATIONS & INTERACTIONS

**Entry:**
- Card: fade-up (y: 20→0, opacity 0→1), duration 0.6s, ease [0.25, 0.4, 0, 1]
- Step dots: stagger scale-in, 0.1s between, delay 0.3s
- Form fields: stagger fade-up (y: 10→0), 0.08s between, delay 0.4s
- First input auto-focuses with a subtle ring pulse

**Interactions:**
- Input focus: border + ring transition 200ms
- Slug field expand: height animation (0→auto) via AnimatePresence, 300ms ease
- Slug auto-generate: text appears character by character as user types title (debounced 200ms)
- Character counter: color transition at thresholds (slate → amber → red)
- Banner drop zone: border-color shift on dragover (slate-200 → blue-400)
- Banner preview hover overlay: opacity 0→1, 200ms
- "Criar Produto" button: disabled→enabled transition (opacity + shadow appear)
- Step dots: active dot has subtle pulse ring (ring-4 ring-blue-100, animate)

---

## 5. RESPONSIVE BEHAVIOR

- **Desktop:** Centered card, max-w-2xl, generous padding p-10
- **Tablet:** Same, p-8
- **Mobile:** Full-width card (mx-4), p-6, buttons stack vertically (flex-col-reverse, gap-3), each full-width
- Inputs: h-12 at all sizes
- Banner zone: aspect-video maintained

---

## 6. QUALITY RULES (CRITICAL)

- DO NOT use external images. Banner preview uses CSS gradient.
- DO NOT use Tailwind v3 syntax.
- DO NOT add placeholder comments.
- DO implement working controlled inputs (title updates slug in real-time).
- DO implement working character counter with color thresholds.
- DO implement working slug toggle (expand/collapse with animation).
- DO implement "Criar Produto" disabled state (empty title = disabled).
- ALL text in Brazilian Portuguese (pt-BR).
- Single .tsx file, COMPLETE.
- Export: `export default function AdminNewProduct()`
