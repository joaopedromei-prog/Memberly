# Gemini Prompt: Forgot Password Page — Memberly

Cole este prompt inteiro no Google AI Studio com Gemini 3.1 Pro.

---

## PROJECT REQUIREMENTS

Build a forgot password page for a digital course platform called "Memberly". This page must match the login page aesthetic — same dark cinematic vibe with animated gradient orbs in the background. Two states: the request form and the success confirmation. Elegant, simple, premium.

**Stack (NON-NEGOTIABLE):**
- React 19 (functional components, hooks only)
- TypeScript strict
- Tailwind CSS v4 (use @theme inline, NOT tailwind.config)
- motion/react (Framer Motion) for animations
- Single .tsx file, fully self-contained
- All data is hardcoded/mocked — this is a visual reference
- Export as: `export default function ForgotPassword()`
- Add `'use client'` at the top

---

## 1. GLOBAL DESIGN SYSTEM

### Color Palette
- Background: #0A0A0A
- Card surface: #141414/80 (semi-transparent glassmorphism)
- Card border: #1F1F1F
- Input bg: #0A0A0A
- Input border: #2A2A2A (default), #E50914 (focus)
- Primary accent: #E50914
- Primary hover: #F40612
- Success: #46D369 (success state icon)
- Text primary: #FFFFFF
- Text secondary: #A3A3A3
- Text tertiary: #666666
- Link: #E50914

### Typography
Google Fonts import: `Inter` (400, 500, 600, 700).
- Brand: 2rem (32px), font-weight 700, text-white, letter-spacing -0.02em
- Subtitle: 0.875rem (14px), text-neutral-500
- Description: 0.875rem (14px), text-neutral-400, leading-relaxed
- Label: 0.875rem (14px), font-weight 500, text-neutral-300
- Button: 0.875rem (14px), font-weight 600
- Link: 0.875rem (14px), font-weight 500

### Spacing
- Card: max-w-md, p-8 sm:p-10, rounded-2xl
- Input height: h-12, rounded-xl
- Button height: h-12, rounded-xl
- Field spacing: space-y-5

---

## 2. PAGE LAYOUT

Identical structure to login page:
```
[Background — animated gradient orbs]
[Centered card — form or success state]
```

---

## 3. COMPONENT STRUCTURE

### Layer 1: Background (identical to login)
- Pure black #0A0A0A base
- 3 animated gradient orbs:
  - Orb 1: #E50914 at 15% opacity, w-[500px] h-[500px], blur-[100px], top-left drift
  - Orb 2: #7C3AED at 12% opacity, w-[400px] h-[400px], blur-[80px], bottom-right drift
  - Orb 3: #E50914 at 8% opacity, w-[350px] h-[350px], blur-[70px], center drift
- Slow figure-8 drift: each orb 18-25s infinite ease-in-out
- Noise texture overlay: opacity 0.03

### Layer 2: Card (centered)

**Container:** flex items-center justify-center min-h-screen px-4

**Card style:** bg-[#141414]/80, backdrop-blur-xl, border border-[#1F1F1F], shadow-2xl, rounded-2xl, max-w-md, w-full, p-8 sm:p-10

The card has TWO states managed by a boolean `isSent`:

#### State A: Request Form (isSent = false)

1. **Brand:** (text-center, mb-8)
   - "Memberly" (text-3xl, font-bold, text-white, letter-spacing -0.02em)
   - "Área de Membros" (text-sm, text-neutral-500, mt-1)

2. **Icon:** (text-center, mb-6)
   - Lock icon inside circle: w-16 h-16, rounded-full, bg-[#1A1A1A], border border-[#2A2A2A], mx-auto
   - Lock SVG inside: w-7 h-7, text-neutral-400
   - Subtle pulse glow animation on the circle (opacity 0.5→1, 3s infinite)

3. **Description:** (text-center, mb-6)
   - "Esqueceu sua senha?" (text-lg, font-semibold, text-white)
   - "Informe seu email e enviaremos um link para redefinir sua senha." (text-sm, text-neutral-400, mt-2)

4. **Email field:**
   - Label: "Email" (text-sm, font-medium, text-neutral-300)
   - Input: h-12, bg-[#0A0A0A], border border-[#2A2A2A], rounded-xl, px-4, text-white
   - Placeholder: "seu@email.com"
   - Focus: border-[#E50914], ring-1 ring-[#E50914]/30

5. **Error message:** (hidden by default)
   - text-sm, text-red-400, flex items-center gap-2, mt-1

6. **Submit button:** (mt-6)
   - "Enviar link de recuperação" (w-full, h-12, bg-[#E50914], hover:bg-[#F40612], text-white, rounded-xl, font-semibold)
   - Hover: translateY(-1px), shadow-lg shadow-[#E50914]/20
   - Loading: spinner replaces text

7. **Back link:** (mt-5, text-center)
   - "Voltar ao login" (text-sm, text-[#E50914], hover:text-[#F40612], hover:underline)

#### State B: Success Confirmation (isSent = true)

Replaces the form content with:

1. **Brand:** same as State A

2. **Success icon:** (text-center, mb-6)
   - Animated checkmark inside circle: w-16 h-16, rounded-full, bg-[#46D369]/10, border border-[#46D369]/30, mx-auto
   - Checkmark SVG: w-8 h-8, text-[#46D369]
   - Entry: circle scales in (0→1, spring), checkmark draws in (SVG stroke-dashoffset animation, 0.5s delay)

3. **Message:** (text-center)
   - "Email enviado!" (text-lg, font-semibold, text-white)
   - "Se o email estiver cadastrado, você receberá um link de recuperação em instantes." (text-sm, text-neutral-400, mt-2, max-w-xs mx-auto)

4. **Info box:** (mt-6)
   - Container: bg-[#1A1A1A], border border-[#2A2A2A], rounded-xl, p-4
   - Icon: mail icon (text-neutral-500, w-5 h-5) on left
   - Text: "Verifique também sua pasta de spam" (text-sm, text-neutral-400)

5. **Back button:** (mt-6)
   - "Voltar ao login" (w-full, h-12, bg-[#1A1A1A], hover:bg-[#2A2A2A], text-white, rounded-xl, font-semibold, border border-[#2A2A2A])

6. **Resend link:** (mt-3, text-center)
   - "Não recebeu? Reenviar email" (text-sm, text-[#E50914], hover:text-[#F40612])

---

## 4. ANIMATIONS & INTERACTIONS

**Page load (State A):**
1. Orbs fade in (2s)
2. Card: fade-up + scale (y: 30→0, scale: 0.97→1, opacity: 0→1), 0.8s, delay 0.3s
3. Lock icon: fade-in + pulse starts, delay 0.6s
4. Form content: stagger fade-up, 0.08s between, delay 0.8s
5. Button: fade-in, delay 1.1s

**Transition A → B (on submit):**
- Card content crossfades: form fades out (opacity 1→0, y: 0→-10, 0.3s), success fades in (opacity 0→1, y: 10→0, 0.3s, delay 0.2s)
- Success circle: scale pop (0→1.1→1, spring, 0.5s)
- Checkmark: stroke draws in (stroke-dashoffset 100→0, 0.5s, delay 0.3s)
- Card height adjusts smoothly (transition max-height or use AnimatePresence with layout)

**Interactions:**
- Input focus: border transition 200ms
- Button hover: lift + glow, 200ms
- Back link: color transition 200ms
- Lock icon: continuous subtle pulse (opacity 0.5→1, 3s infinite)

**prefers-reduced-motion:**
- Disable orb drift (keep static glow)
- Disable lock pulse
- Disable checkmark draw (show instantly)
- Keep fade transitions (opacity only, no movement)

---

## 5. RESPONSIVE BEHAVIOR

- **Desktop:** Card centered, full orb effect, p-10
- **Tablet:** Same, slightly smaller orbs
- **Mobile (<768px):** Card near full-width (mx-4), p-8, orbs 50% size, brand text-2xl
- Touch targets: input h-12, button h-12, links min 44px tap area
- Keyboard: Tab order email → submit → back link

---

## 6. QUALITY RULES (CRITICAL)

- DO NOT use external images. Background is pure CSS/motion gradients.
- DO NOT make it light theme. Must match the login page dark cinematic style.
- DO NOT use Tailwind v3 syntax.
- DO NOT add dependencies beyond React, Tailwind v4, and motion/react.
- DO NOT add placeholder comments.
- DO implement BOTH states (form + success) with working toggle (useState isSent).
- DO implement the animated checkmark SVG transition.
- DO implement the state crossfade animation.
- DO implement working controlled input (useState).
- DO respect prefers-reduced-motion.
- ALL text in Brazilian Portuguese (pt-BR).
- Single .tsx file, COMPLETE.
- Export: `export default function ForgotPassword()`
