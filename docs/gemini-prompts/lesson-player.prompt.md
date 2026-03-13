# Gemini Prompt: Lesson Player — Memberly

Cole este prompt inteiro no Google AI Studio com Gemini 3.1 Pro.

---

## PROJECT REQUIREMENTS

Build a complete lesson player page for a Netflix-style course platform called "Memberly". This is where members spend 90% of their time — watching video lessons, reading descriptions, downloading materials, and navigating between lessons. It must feel immersive and focused, like watching a movie on Netflix but with educational context. Dark theme, video-first, zero distractions.

**Stack (NON-NEGOTIABLE):**
- React 19 (functional components, hooks only)
- TypeScript strict
- Tailwind CSS v4 (use @theme inline, NOT tailwind.config)
- motion/react (Framer Motion) for animations
- Single .tsx file, fully self-contained
- All data is hardcoded/mocked — this is a visual reference
- Export as: `export default function LessonPlayer()`
- Add `'use client'` at the top

---

## 1. GLOBAL DESIGN SYSTEM

### Color Palette
- Background: #141414 (slightly lighter than pure black — video page feel)
- Surface: #1A1A1A (sidebar, cards)
- Card active: #2A2A2A (current lesson in sidebar)
- Border: #333333 (subtle separators)
- Primary accent: #E50914 (active lesson indicator, play icon, progress)
- Success: #46D369 (completed checkmarks)
- Warning/Lock: #F59E0B (amber, locked lessons)
- Text primary: #FFFFFF
- Text secondary: #A3A3A3 (neutral-400)
- Text tertiary: #737373 (neutral-500)
- Breadcrumb text: #737373, active: #D4D4D4

### Typography
Google Fonts import: `Inter` (400, 500, 600, 700).
- All text: 'Inter', system-ui, sans-serif
- Lesson title: 2rem (32px), font-weight 700, text-white, leading-tight
- Sidebar module title: 1.125rem (18px), font-weight 600, text-white
- Sidebar lesson title: 0.875rem (14px), font-weight 400, text-neutral-400 (current: text-white)
- Description: 0.875rem (14px), font-weight 400, text-neutral-300, leading-relaxed
- Breadcrumb: 0.75rem (12px), text-neutral-500
- Duration badge: 0.75rem (12px), text-neutral-500
- Button text: 0.875rem (14px), font-weight 600

### Spacing
- Max content width: max-w-7xl (1280px), centered
- Page padding: py-4 lg:px-6
- Video border-radius: rounded-lg
- Card border-radius: rounded-lg
- Desktop layout: 70% left (video + info) / 30% right (sidebar)
- Gap between columns: gap-6

---

## 2. PAGE LAYOUT

```
[Breadcrumb]
[Two columns on desktop, stacked on mobile]
  Left (70%):
    [Video Player — 16:9 aspect ratio]
    [Lesson Info — title, bookmark, description, completion, attachments]
    [Navigation — prev/next buttons]
    [Comments section]
  Right (30%):
    [Lesson Sidebar — sticky, scrollable module lesson list]
```

This component renders only the MAIN CONTENT (no header/footer — those come from layout).

---

## 3. COMPONENT STRUCTURE

### Section 1: Breadcrumb
- Horizontal: Home › Método Completo de Calistenia › Módulo 3 - Avançado › Muscle Up Progressão
- Style: text-xs, text-neutral-500, flex items-center gap-1
- Clickable items: hover:text-neutral-300
- Last item (current): text-neutral-300, not clickable
- Separator: › (rsaquo)
- Margin bottom: mb-4

### Section 2: Video Player (left column)
- Aspect ratio: aspect-video (16:9)
- Background: bg-[#0A0A0A] rounded-lg overflow-hidden
- Center content: large play button (w-16 h-16, bg-white/10, rounded-full, backdrop-blur-sm)
  - Inside: play triangle (text-white, w-8 h-8)
  - Hover: bg-white/20, scale(1.05)
- Below play button: "Clique para reproduzir" (text-sm, text-neutral-400)
- Subtle loading spinner hidden by default (shown during "loading" state)
- Bottom gradient: subtle from-black/40 to-transparent (like video overlay)
- No actual video — just the placeholder with play button

### Section 3: Lesson Info (below video, left column)
- **Title row:** flex items-start gap-3
  - Left: lesson title "Muscle Up Progressão" (h1, 32px, font-bold, text-white, flex-1)
  - Right: bookmark heart icon button
    - Not bookmarked: outline heart, text-neutral-500, hover:text-neutral-300
    - Bookmarked: filled heart, text-red-500
    - Size: w-6 h-6, button padding p-2, rounded-full, hover:bg-[#1A1A1A]
    - Mock state: bookmarked = true (filled red heart)

- **Duration:** "15 min" (text-sm, text-neutral-500, mt-1)

- **Description:** (mt-3)
  - Collapsible: shows 3 lines by default (line-clamp-3)
  - Content (mock HTML): "Nesta aula você vai aprender a progressão completa do muscle up, desde os exercícios preparatórios até a execução perfeita. Vamos cobrir: força de puxada, transição, e técnica de kipping. Material complementar inclui o PDF com a rotina de treino semanal."
  - "ver mais" / "ver menos" toggle: text-xs, text-[#E50914], hover:text-[#F40612], mt-1
  - Expanded text color: text-neutral-300, text-sm, leading-relaxed

- **Action buttons:** (mt-4, flex gap-3)
  - "Marcar como concluída" button:
    - Not completed: bg-[#1A1A1A] text-white hover:bg-[#2A2A2A], with empty circle icon ○
    - Completed: bg-[#46D369] text-black, with checkmark ✓ icon
    - Size: min-h-[44px], rounded, px-5, font-semibold, text-sm
    - Mock state: not completed

- **Attachments:** (mt-5)
  - Title: "Material da Aula" (text-sm, font-semibold, text-neutral-400, mb-2)
  - List of files, each in a row:
    - Container: rounded-lg, border border-[#333333], bg-[#1A1A1A], p-3, flex items-center gap-3
    - Left: file type icon (PDF=red, image=blue, video=purple, other=gray), h-4 w-4
    - Middle: filename (text-sm, text-neutral-300, truncate, flex-1)
    - Right: "Baixar" button (border border-[#333333], bg-[#2A2A2A], text-neutral-300, rounded, px-3 py-1.5, text-sm, hover:bg-[#1A1A1A] hover:text-white) with download icon

  - Mock 3 files:
    1. 📄 "Rotina Semanal - Muscle Up.pdf" (application/pdf) — with "Visualizar" button instead of Baixar
    2. 🖼️ "Progressão Visual.png" (image/png) — Baixar
    3. 📄 "Checklist de Execução.pdf" (application/pdf) — Visualizar

### Section 4: Navigation (below lesson info)
- Flex justify-between, mt-6, pt-6, border-t border-[#2A2A2A]
- Left: "← Aula Anterior" button
  - Style: flex items-center gap-2, text-sm, text-neutral-400, hover:text-white, transition-colors
  - Arrow: ← (or SVG chevron-left)
  - Below button text: "Aula 11: Front Lever" (text-xs, text-neutral-600)
- Right: "Próxima Aula →" button
  - Same style but mirrored
  - Below: "Aula 13: Handstand Push-up" (text-xs, text-neutral-600)
- Both buttons: min-h-[44px], rounded-lg, hover:bg-[#1A1A1A], px-4 py-3

### Section 5: Comments (below navigation)
- Title: "Comentários" with count badge (mt-8)
  - "Comentários" (text-lg, font-semibold, text-white) + "(3)" (text-neutral-500)

- **New comment input:**
  - Container: flex gap-3, mt-4
  - Left: avatar circle (w-9 h-9, rounded-full, bg-[#2A2A2A], flex items-center justify-center, text-sm text-neutral-500: "JS")
  - Right: textarea
    - Style: w-full, bg-[#1A1A1A], border border-[#333333], rounded-lg, px-4 py-3, text-sm, text-white, placeholder-neutral-600, resize-none
    - Placeholder: "Escreva um comentário..."
    - Focus: ring-1 ring-[#E50914], border-[#E50914]
    - Rows: 2 (expands on focus to 4)
  - Submit button (below textarea, right-aligned): "Comentar" (bg-[#E50914], text-white, rounded, px-4, h-9, text-sm, font-semibold, hover:bg-[#F40612], disabled:opacity-50)

- **Comment list:** (mt-6, space-y-5)
  - Each comment:
    - Container: flex gap-3
    - Left: avatar (w-9 h-9, rounded-full, bg-[#2A2A2A], initials)
    - Right:
      - Name + time: "Maria Silva" (text-sm, font-medium, text-white) + "· há 2 horas" (text-xs, text-neutral-500)
      - Content: text-sm, text-neutral-300, mt-1
      - Actions: "Responder" (text-xs, text-neutral-500, hover:text-neutral-300, mt-2)

  - Mock 3 comments:
    1. "MS" Maria Silva · há 2h: "Essa progressão mudou meu treino. Finalmente entendi a transição!"
    2. "PO" Pedro Oliveira · há 1 dia: "Alguém mais sentiu dificuldade no kipping? Meu ombro direito fica desconfortável."
       - Reply (nested, ml-12): "AS" Anderson Silva · há 20h: "Pedro, tenta aquecer bem os ombros antes. Tem um exercício no Módulo 1, Aula 3."
    3. "LC" Lucas Costa · há 3 dias: "Material PDF excelente, muito completo. Obrigado!"

### Section 6: Lesson Sidebar (right column, sticky)
- Container: bg-[#1A1A1A], rounded-lg, lg:sticky lg:top-[80px], lg:max-h-[calc(100vh-100px)], lg:overflow-y-auto
- Custom scrollbar: thin, dark (scrollbar-width: thin, scrollbar-color: #404040 transparent)

- **Module header:** border-b border-[#333333], p-4
  - Module name: "Módulo 3 — Avançado" (text-lg, font-semibold, text-white)
  - Progress: "8/12 aulas concluídas" (text-xs, text-neutral-400, mt-1)
  - Progress bar: h-1 bg-[#2A2A2A] rounded-full, fill bg-[#46D369] at 66%, mt-2

- **Lesson list:** each lesson is a row
  - All rows: flex items-center gap-3, border-l-2, px-4 py-3, min-h-[44px], text-sm
  - Current lesson: border-l-[#E50914], bg-[#2A2A2A], text-white
  - Completed lesson: border-l-transparent, text-neutral-400, checkmark icon (#46D369)
  - Upcoming lesson: border-l-transparent, text-neutral-400, empty circle icon
  - Locked lesson: border-l-transparent, text-neutral-600, lock icon (#F59E0B), cursor-not-allowed
  - Hover (non-locked): bg-[#1A1A1A], text-neutral-200

  - Each row content:
    - Left: status icon (w-5 h-5, flex-shrink-0)
      - Current: play triangle (text-[#E50914])
      - Completed: checkmark (text-[#46D369])
      - Pending: empty circle (text-neutral-600)
      - Locked: lock (text-amber-500)
    - Middle: "N. Title" (flex-1, truncate) — number in text-neutral-500
    - Right: "15 min" (text-xs, text-neutral-500, flex-shrink-0)

  - Mock 12 lessons:
    1. ✓ Introdução ao Módulo | 8 min | completed
    2. ✓ Força de Puxada | 12 min | completed
    3. ✓ Exercícios de Transição | 10 min | completed
    4. ✓ Kipping Basics | 15 min | completed
    5. ✓ False Grip Training | 18 min | completed
    6. ✓ Band-Assisted Muscle Up | 14 min | completed
    7. ✓ Negative Muscle Ups | 12 min | completed
    8. ✓ Strict Muscle Up | 20 min | completed
    9. ▶ Muscle Up Progressão | 15 min | **CURRENT** (highlighted)
    10. ○ Ring Muscle Up | 18 min | pending
    11. 🔒 Competition Prep | 25 min | locked
    12. 🔒 Avaliação Final | 10 min | locked

- **Mobile behavior:** collapsible accordion
  - Button: "Outras aulas deste módulo (8/12)" (full-width, bg-[#1A1A1A], rounded-lg, px-4 py-3, text-white, text-sm)
  - Chevron rotates 180° when open
  - Content: max-h transition (0 → 2000px, duration 200ms)
  - Default: closed on mobile

---

## 4. ANIMATIONS & INTERACTIONS

**Entry animations:**
- Video player: fade-in (opacity 0→1, duration 0.6s)
- Lesson title + info: fade-up (y: 16→0), stagger 0.1s, delay 0.2s after video
- Sidebar: fade-in from right (x: 20→0, opacity 0→1), duration 0.5s, delay 0.3s
- Comments: fade-up, triggered on scroll into view (whileInView)
- Attachments: stagger fade-in, 0.05s between each

**Interactions:**
- Play button: hover scale(1.05), bg-white/10 → bg-white/20, transition 200ms
- Bookmark heart: click toggles fill, scale pop (0.8→1.1→1, 300ms spring)
- Completion button: on toggle, checkmark has spring animation (scale 0→1.3→0.9→1)
- Sidebar lessons: hover bg transition 150ms
- Current lesson: left border appears with slide-in (width 0→2px, 200ms)
- Navigation buttons: hover bg-[#1A1A1A], arrow shifts 4px in direction (translateX), 200ms
- Comment submit: button hover bg shift
- Mobile sidebar toggle: chevron rotation 200ms, content slide-down 200ms

**Scroll behavior:**
- Sidebar sticky: stays fixed at top-[80px] on desktop while scrolling main content
- Sidebar internal: smooth scroll with thin dark scrollbar

---

## 5. RESPONSIVE BEHAVIOR

- **Desktop (≥1024px):** 2-column layout (70/30), sidebar visible and sticky, full-size video
- **Tablet (768-1023px):** Single column, video full width, sidebar below as accordion (collapsed by default), navigation buttons side by side
- **Mobile (<768px):** Single column, video full width, compact lesson info, sidebar accordion, navigation stacked or side-by-side, comment avatars smaller (w-8 h-8), reduced padding
- Touch targets: all interactive elements min 44x44px
- Video: always aspect-video (16:9), responsive width

---

## 6. QUALITY RULES (CRITICAL)

- DO NOT use external images or video embeds. Use a dark gradient placeholder for the video area with a centered play button.
- DO NOT use placeholder.com or unsplash URLs.
- DO NOT add comments like "// Add more". Component must be COMPLETE.
- DO NOT use dependencies beyond React, Tailwind v4, and motion/react.
- DO NOT use Tailwind v3 syntax.
- DO use semantic HTML (main, section, nav, article, h1, aside).
- DO ensure all text contrast ≥ 4.5:1.
- DO respect `prefers-reduced-motion`.
- DO implement working mobile accordion toggle for sidebar.
- DO implement working "ver mais/ver menos" for description.
- DO implement working bookmark toggle (visual only, state toggle).
- ALL text in Brazilian Portuguese (pt-BR).
- Single .tsx file, COMPLETE, no placeholders.
- Export: `export default function LessonPlayer()`
