# Gemini Prompt: Admin Settings Page — Memberly

Cole este prompt inteiro no Google AI Studio com Gemini 3.1 Pro.

---

## PROJECT REQUIREMENTS

Build a complete admin settings page for a course platform called "Memberly". This is where admins configure their platform — branding, webhooks, and email templates. Must feel like Stripe's settings or Vercel's project config. Organized in tabs, each section self-contained, clear hierarchy. Light theme, professional, trustworthy.

**Stack (NON-NEGOTIABLE):**
- React 19 (functional components, hooks only)
- TypeScript strict
- Tailwind CSS v4 (use @theme inline, NOT tailwind.config)
- motion/react (Framer Motion) for animations
- Single .tsx file, fully self-contained
- All data is hardcoded/mocked — this is a visual reference
- Export as: `export default function AdminSettings()`
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
[Page Header — "Configurações"]
[Tab Navigation — Branding | Webhooks | Email]
[Tab Content — one section visible at a time]
```

---

## 3. COMPONENT STRUCTURE

### Section 1: Page Header
- "Configurações" (h1, 24px, bold, slate-900)
- "Gerencie as configurações da sua plataforma" (text-sm, slate-500, mt-1)

### Section 2: Tab Navigation (mt-6)
- Container: border-b border-slate-200
- 3 tabs inline: flex gap-8
- Each tab: pb-3, text-sm, font-medium, cursor-pointer, relative
  - Active: text-blue-600, border-b-2 border-blue-600 (animated underline)
  - Inactive: text-slate-500, hover:text-slate-700
  - Transition: color 200ms
- Tabs: "Branding" | "Webhooks" | "Email"
- Active indicator (bottom border) slides to active tab position (motion layoutId)
- Default active: "Branding"

### TAB 1: Branding

**Card 1: Identidade da Plataforma** (bg-white, rounded-xl, border, p-6, mt-6)
- Title: "Identidade da Plataforma" (font-semibold, slate-900)
- Subtitle: "Personalize o visual da sua área de membros" (text-sm, slate-500)
- Divider: border-t, mt-4, pt-5

**Fields:**

- **Nome da plataforma:**
  - Label: "Nome" (text-sm, font-medium, slate-700)
  - Input: h-11, rounded-xl, border, px-4, value "Memberly"
  - Helper: "Exibido no header e emails" (text-xs, slate-400)

- **Logo upload:** (mt-5)
  - Label: "Logo"
  - Current: flex items-center gap-4
    - Preview circle: w-16 h-16, rounded-xl, bg-slate-900, flex items-center justify-center
      - "M" (text-2xl, font-bold, text-white) — placeholder for logo
    - Right: flex-col gap-2
      - "Alterar logo" button (text-sm, text-blue-600, hover:text-blue-800)
      - "Remover" link (text-sm, text-red-500)
      - "PNG ou SVG, max 2MB" (text-xs, slate-400)

- **Cor primária:** (mt-5)
  - Label: "Cor primária"
  - Flex items-center gap-3:
    - Color swatch: w-11 h-11, rounded-xl, border, cursor-pointer (shows current color)
      - Mock color: #E50914 (red)
    - Hex input: w-32, h-11, rounded-xl, border, px-3, text-sm, font-mono
      - Value: "#E50914"
    - Preview row: flex gap-2, ml-4
      - Mini button preview: bg-[currentColor], text-white, rounded-lg, px-3 py-1.5, text-xs, "Botão"
      - Mini progress preview: w-20 h-1.5, rounded-full, bg-[currentColor]

**Save button:** (mt-6, flex justify-end)
- "Salvar Alterações" (bg-blue-600, text-white, rounded-lg, h-10, px-5, font-medium)
- Disabled when no changes (opacity-50)

---

### TAB 2: Webhooks

**Card 1: URL do Webhook** (bg-white, rounded-xl, border, p-6, mt-6)
- Title: "Endpoint do Webhook"
- Subtitle: "Configure sua plataforma de pagamento para enviar eventos para esta URL"

- **URL display:** (mt-4)
  - Container: flex items-center gap-2, bg-slate-50, rounded-xl, border, p-3
  - URL text: flex-1, text-sm, font-mono, slate-700, truncate
    - "https://memberly.com/api/webhooks/payt"
  - Copy button: w-9 h-9, rounded-lg, border, bg-white, hover:bg-slate-50, flex items-center justify-center
    - Copy icon (w-4 h-4, slate-500)
    - On click: icon briefly becomes checkmark (text-emerald-500), reverts after 2s

- **Status indicator:** (mt-3, flex items-center gap-2)
  - Green pulse dot: w-2.5 h-2.5, rounded-full, bg-emerald-500, animate-pulse
  - "Ativo — último evento recebido há 2 horas" (text-sm, slate-600)

**Card 2: Webhook Secret** (bg-white, rounded-xl, border, p-6, mt-5)
- Title: "Secret Key"
- Subtitle: "Usada para verificar a autenticidade dos webhooks recebidos"

- **Secret display:** (mt-4)
  - Container: flex items-center gap-2, bg-slate-50, rounded-xl, border, p-3
  - Secret text: flex-1, text-sm, font-mono, slate-700
    - Masked: "whsec_••••••••••••••••••••••••" (default)
    - Revealed: "whsec_abc123def456ghi789jkl012mno" (when toggled)
  - Toggle visibility: eye/eye-off icon button (w-9 h-9, rounded-lg, border)
  - Copy button: same style as URL copy

- **Rotate button:** (mt-3)
  - "Gerar Novo Secret" button (border, bg-white, text-slate-700, rounded-lg, px-4 py-2, text-sm, hover:bg-slate-50)
    - Warning icon (text-amber-500, w-4 h-4, mr-2)
  - Warning text below: "Atenção: rotacionar o secret invalida o anterior imediatamente." (text-xs, text-amber-600, mt-2)

**Card 3: Logs Recentes** (bg-white, rounded-xl, border, p-6, mt-5)
- Title: "Últimos Webhooks Recebidos" + badge "últimas 24h"
- List of 5 recent webhook events:
  
  Each row: flex items-center gap-3, py-3, border-b border-slate-100 (last: no border)
  - Status dot: w-2 h-2, rounded-full
    - processed: bg-emerald-500
    - failed: bg-red-500
    - ignored: bg-slate-400
  - Event: "purchase.approved" (text-sm, font-mono, slate-700)
  - Email: "maria@email.com" (text-sm, slate-500, truncate, max-w-[200px])
  - Timestamp: "há 2h" (text-xs, slate-400, ml-auto)

  Mock 5:
  1. ✅ purchase.approved | maria@email.com | há 2h
  2. ✅ purchase.approved | joao@test.com | há 5h
  3. ❌ purchase.approved | pedro@mail.com | há 8h
  4. ✅ purchase.approved | ana@email.com | há 12h
  5. ⚪ purchase.refunded | lucas@test.com | há 18h

- "Ver todos os logs" link (text-sm, text-blue-600, mt-3)

---

### TAB 3: Email

**Card 1: Template de Boas-Vindas** (bg-white, rounded-xl, border, p-6, mt-6)
- Title: "Email de Boas-Vindas"
- Subtitle: "Enviado automaticamente quando um membro recebe acesso a um produto"

- **Toggle:** (mt-4, flex items-center justify-between)
  - "Ativo" label (text-sm, slate-700)
  - Toggle switch: w-11 h-6, rounded-full, bg-emerald-500 (active), thumb right
  
- **Subject field:** (mt-5)
  - Label: "Assunto"
  - Input: h-11, rounded-xl, border, px-4
  - Value: "Bem-vindo(a) ao {{product_name}}!"
  - Helper: "Use {{product_name}} para inserir o nome do produto" (text-xs, slate-400)

- **Body field:** (mt-4)
  - Label: "Corpo do Email"
  - Textarea: 8 rows, rounded-xl, border, px-4 py-3, font-mono text-sm
  - Value:
    ```
    Olá {{member_name}},

    Seu acesso ao {{product_name}} foi liberado!

    Acesse agora: {{login_url}}

    Qualquer dúvida, entre em contato.

    Abraço,
    Equipe {{platform_name}}
    ```
  - Helper: "Variáveis: {{member_name}}, {{product_name}}, {{login_url}}, {{platform_name}}" (text-xs, slate-400)

- **Preview section:** (mt-5)
  - "Pré-visualizar" toggle button (text-sm, text-blue-600, flex items-center gap-1)
  - When open: slide-down card
    - Container: bg-slate-50, rounded-xl, border, p-5
    - Simulated email:
      - From: "Memberly <noreply@memberly.com>" (text-xs, slate-500)
      - Subject: "Bem-vindo(a) ao Método Completo de Calistenia!" (text-sm, font-medium, slate-900)
      - Divider: border-t, my-3
      - Body rendered with variables replaced (text-sm, slate-700, leading-relaxed)
      - Variables shown in blue highlight: bg-blue-50, text-blue-700, rounded, px-1

- **Save:** (mt-5, flex justify-end)
  - "Salvar Template" (bg-blue-600, text-white, rounded-lg, h-10, px-5)

---

## 4. ANIMATIONS & INTERACTIONS

**Entry:**
- Header + tabs: fade-in 0.4s
- Tab content: crossfade on tab switch (outgoing opacity 1→0 x:-10, incoming 0→1 x:10, 200ms, AnimatePresence mode="wait")

**Tab indicator:**
- Bottom border slides to active tab (motion layoutId="tab-indicator", spring transition)

**Interactions:**
- Copy buttons: icon swap (copy→check) with scale pop (0.8→1.1→1)
- Secret toggle: text transitions between masked/revealed (opacity crossfade)
- Color swatch: click opens native color picker (input type="color" hidden, triggered by click)
- Color preview updates in real-time as hex changes
- Email preview expand: slide-down (height 0→auto, AnimatePresence)
- Toggle switch: thumb slides with spring (300ms)
- Save buttons: disabled→enabled on field change (opacity transition)
- Webhook status dot: CSS pulse animation (continuous)

---

## 5. RESPONSIVE BEHAVIOR

- **Desktop:** Full width within admin layout, all content comfortable
- **Tablet:** Same, slightly less padding
- **Mobile:** Tabs scroll horizontally if needed (overflow-x-auto). Cards full-width, p-5. Secret/URL truncate properly. Email preview full-width.
- Touch targets: all buttons/toggles min 44px

---

## 6. QUALITY RULES (CRITICAL)

- DO NOT use external images.
- DO NOT use Tailwind v3 syntax.
- DO NOT add placeholder comments.
- DO implement working tab switching with animated indicator.
- DO implement working copy-to-clipboard with visual feedback.
- DO implement working secret show/hide toggle.
- DO implement working color picker (input type=color + hex sync).
- DO implement working email preview expand/collapse.
- DO implement working toggle switches.
- ALL text in Brazilian Portuguese (pt-BR).
- Single .tsx file, COMPLETE.
- Export: `export default function AdminSettings()`
