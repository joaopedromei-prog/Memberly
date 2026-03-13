# Gemini Prompt: Login Page — Memberly

Cole este prompt inteiro no Google AI Studio com Gemini 3.1 Pro.

---

## PROJECT REQUIREMENTS

Build a stunning, cinematic login page for a digital course platform called "Memberly". This is the first thing users see — it must make an instant premium impression. Think Apple TV+ sign-in meets Stripe's aesthetic. Dark, clean, with one striking visual element that makes it memorable. Not just a form on a page — an experience.

**Stack (NON-NEGOTIABLE):**
- React 19 (functional components, hooks only)
- TypeScript strict
- Tailwind CSS v4 (use @theme inline, NOT tailwind.config)
- motion/react (Framer Motion) for animations
- Single .tsx file, fully self-contained
- All data is hardcoded/mocked — this is a visual reference
- Export as: `export default function LoginPage()`
- Add `'use client'` at the top

---

## 1. GLOBAL DESIGN SYSTEM

### Color Palette
- Background: #0A0A0A (deep black)
- Card/Form surface: #141414 (elevated card)
- Card border: #1F1F1F (extremely subtle, 1px)
- Input background: #0A0A0A (recessed feel against card)
- Input border: #2A2A2A (default), #E50914 (focus)
- Input border error: #EF4444
- Primary accent: #E50914 (submit button, focus rings)
- Primary hover: #F40612
- Text primary: #FFFFFF
- Text secondary: #A3A3A3
- Text tertiary: #666666
- Link: #E50914 (hover: #F40612)

### Typography
Google Fonts import: `Inter` (400, 500, 600, 700).
- Brand name: 2rem (32px), font-weight 700, text-white, letter-spacing -0.02em
- Form title: not needed (brand name serves as title)
- Label: 0.875rem (14px), font-weight 500, text-neutral-300
- Input text: 0.875rem (14px), text-white
- Input placeholder: text-neutral-600
- Button text: 0.875rem (14px), font-weight 600
- Error text: 0.875rem (14px), text-red-400
- Link text: 0.875rem (14px), font-weight 500

### Spacing
- Page: full viewport (min-h-screen)
- Card: max-w-md (448px), w-full, p-8 sm:p-10
- Card border-radius: rounded-2xl
- Input height: h-12 (48px)
- Input border-radius: rounded-xl
- Button height: h-12 (48px)
- Button border-radius: rounded-xl
- Vertical spacing between form fields: space-y-5
- Gap between input and label: mt-2

---

## 2. PAGE LAYOUT

Full viewport, two visual layers:

```
[Background layer — animated gradient mesh / ambient glow]
[Foreground — centered login card with form]
```

---

## 3. COMPONENT STRUCTURE

### Layer 1: Background (full screen, fixed, z-0)

**Animated ambient glow effect:**
- Pure black (#0A0A0A) base
- 3 large blurred circles (gradient orbs) floating slowly:
  - Orb 1: radial-gradient, #E50914 at 20% opacity, w-[600px] h-[600px], blur-[120px], positioned top-left area
  - Orb 2: radial-gradient, #7C3AED (violet) at 15% opacity, w-[500px] h-[500px], blur-[100px], positioned bottom-right
  - Orb 3: radial-gradient, #E50914 at 10% opacity, w-[400px] h-[400px], blur-[80px], positioned center-bottom
- Animation: each orb drifts slowly in a figure-8 or circular path
  - Orb 1: x oscillation ±80px, y oscillation ±60px, duration 20s, infinite, ease-in-out
  - Orb 2: x ±60px, y ±80px, duration 25s, infinite
  - Orb 3: x ±40px, y ±50px, duration 18s, infinite
- Subtle noise texture overlay: CSS pseudo-element with background-image noise, opacity 0.03
- The orbs create a living, breathing background — never static

### Layer 2: Login Card (centered, z-10)

**Container:** flex items-center justify-center min-h-screen px-4

**Card:**
- Background: bg-[#141414]/80 (semi-transparent, subtle glassmorphism)
- Backdrop: backdrop-blur-xl
- Border: 1px solid #1F1F1F
- Shadow: shadow-2xl shadow-black/50
- Max width: max-w-md, w-full
- Padding: p-8 sm:p-10
- Border radius: rounded-2xl

**Card content (top to bottom):**

1. **Brand:**
   - "Memberly" (text-3xl, font-bold, text-white, text-center, letter-spacing -0.02em)
   - "Área de Membros" (text-sm, text-neutral-500, text-center, mt-1)
   - Spacing: mb-10

2. **Email field:**
   - Label: "Email" (text-sm, font-medium, text-neutral-300)
   - Input: h-12, w-full, bg-[#0A0A0A], border border-[#2A2A2A], rounded-xl, px-4, text-sm, text-white
   - Placeholder: "seu@email.com" (text-neutral-600)
   - Focus: border-[#E50914], ring-1 ring-[#E50914]/30, outline-none
   - Transition: border-color 200ms

3. **Password field:**
   - Label: "Senha" (same style)
   - Input: same style as email, type=password
   - Placeholder: "Sua senha"
   - Right inside input: toggle visibility icon (eye/eye-off), text-neutral-600, hover:text-neutral-400, w-5 h-5
   - The input should have pr-12 to accommodate the icon

4. **Error message (shown conditionally):**
   - Mock state: hidden by default
   - When shown: text-sm, text-red-400, flex items-center gap-2, mt-1
   - Icon: small ⚠ or exclamation circle, text-red-400

5. **Submit button:**
   - "Entrar" (text-sm, font-semibold, text-white)
   - Style: w-full, h-12, bg-[#E50914], hover:bg-[#F40612], rounded-xl, transition-all duration-200
   - Hover: slight lift — translateY(-1px), shadow-lg shadow-[#E50914]/20
   - Active: translateY(0), shadow-none
   - Loading state (mock: not loading): spinner replaces text (h-5 w-5 animate-spin border-2 border-white border-t-transparent rounded-full)
   - Disabled: opacity-50, cursor-not-allowed
   - Margin top: mt-6

6. **Forgot password link:**
   - "Esqueci minha senha" (text-sm, text-[#E50914], hover:text-[#F40612], text-center, mt-5)
   - Hover: underline

7. **Bottom separator + social proof (optional flair):**
   - Thin line: border-t border-[#1F1F1F], mt-8, pt-6
   - Text: "Acesso exclusivo para membros" (text-xs, text-neutral-600, text-center)

---

## 4. ANIMATIONS & INTERACTIONS

**Page load sequence (orchestrated, cinematic):**
1. Background orbs fade in (opacity 0→0.2/0.15/0.1), duration 2s, ease-out
2. Card appears: fade-up + scale (y: 30→0, scale: 0.97→1, opacity: 0→1), duration 0.8s, delay 0.3s, ease [0.25, 0.4, 0, 1]
3. Brand text: fade-in (opacity 0→1), duration 0.5s, delay 0.7s
4. Form fields: stagger fade-up (y: 10→0), 0.08s between each, delay 0.9s
5. Button: fade-in + subtle pulse glow, delay 1.2s

**Background orbs (continuous):**
- Slow drift animation (described above)
- Never stop — creates living atmosphere
- prefers-reduced-motion: disable drift, keep static glow

**Input interactions:**
- Focus: border transitions from #2A2A2A to #E50914 (200ms)
- Focus: subtle glow ring appears (ring-1 ring-[#E50914]/30)
- Label: no float animation — static above input

**Button interactions:**
- Hover: translateY(-1px), shadow-lg with red glow (shadow-[#E50914]/20), bg darkens
- Active (click): translateY(0), shadow-none (pressed feel)
- All transitions: 200ms ease

**Password toggle:**
- Icon transition: opacity swap (200ms)
- Eye ↔ eye-off

**Error state:**
- Shake animation on card when error appears: x oscillation [-8, 8, -6, 6, -2, 2, 0]px, duration 500ms
- Error text fades in (opacity 0→1, y: -4→0, duration 300ms)
- Input border turns red simultaneously

---

## 5. RESPONSIVE BEHAVIOR

- **Desktop (≥1024px):** Card centered, full orb effect visible, generous padding (p-10)
- **Tablet (768-1023px):** Same as desktop, slightly smaller orbs
- **Mobile (<768px):** Card takes near full-width (mx-4), padding p-8, orbs scaled down (50% size) to reduce visual noise, brand text smaller (text-2xl)
- Touch targets: inputs h-12 (48px), button h-12, password toggle 44x44px hit area
- Keyboard: Tab order is email → password → submit → forgot password
- Autofill: style compatible with browser autofill (no bg-flash)

---

## 6. QUALITY RULES (CRITICAL)

- DO NOT use external images. The background is pure CSS/motion gradients.
- DO NOT use a flat white/gray background. This is a DARK, cinematic login.
- DO NOT make it look like a generic auth form. The animated orb background is what makes it premium.
- DO NOT use Tailwind v3 syntax.
- DO NOT add dependencies beyond React, Tailwind v4, and motion/react.
- DO NOT add comments like "// TODO" or "// Add more".
- DO use semantic HTML (main, form, label, input, button).
- DO ensure all text contrast ≥ 4.5:1 against backgrounds.
- DO respect `prefers-reduced-motion` — disable orb animation, keep static glow.
- DO make the form fully functional (controlled inputs with useState, preventDefault on submit).
- DO implement password visibility toggle (working state toggle).
- DO implement the orchestrated load animation sequence exactly as described.
- ALL text must be in Brazilian Portuguese (pt-BR).
- Single .tsx file, COMPLETE.
- Export: `export default function LoginPage()`
