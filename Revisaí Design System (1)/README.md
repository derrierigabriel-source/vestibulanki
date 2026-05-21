# Revisaí Design System

> Sophisticated, dark-first redesign of **Revisaí** (formerly *FlashCard Pro / Vestibulanki*) — a Brazilian flashcard study app with spaced repetition, ICE scoring, and a UFPR vestibular simulator. Visual direction inspired by **Linear.app** and **Vercel Dashboard**: minimalist, premium, dark, with a quiet **terracotta** brand accent.

---

## Sources

- **Codebase** — `derrierigabriel-source/vestibulanki` (private GitHub repo, branch `main`). Imported files are at `src/` and `public/` in this project. Stack: React 18 + Vite, Tailwind CSS, Firebase Auth/Firestore, React Router v6, lucide-react, Recharts.
- **Brand reference image** — `uploads/Gemini_Generated_Image_w26wimw26wimw26w.png` (Gemini-generated logo concept, "Refine 1" — open-book mark in terracotta + navy with the wordmark "Revisaí"). Copied to `assets/revisai-logo-original.png`.
- **Original repo theme tokens** — Tailwind config `teal.*` palette + `Satoshi` / `Instrument Serif` fonts. The redesign **swaps Satoshi → Inter** (per spec) and **swaps the teal primary → terracotta `#D45C3A`** while keeping teal as a secondary chart accent.
- **Spec** — pasted brief calling for Linear/Vercel-style dark UI (`#08090E` bg, `#0F1017` cards, `#1E2030` borders), with Inter typography and the terracotta primary defined in "Additional notes".

---

## Index

| File / Folder | Purpose |
|---|---|
| `README.md` | This file — context, content, visual foundations, iconography, manifest |
| `SKILL.md` | Agent-skill manifest (cross-compatible with Claude Code skills) |
| `colors_and_type.css` | All design tokens — colors, type, radii, shadows, motion, mesh |
| `assets/` | Logos, marks, favicon, icon sprite |
| `preview/` | Design-system tab cards (Type, Colors, Spacing, Components, Brand) |
| `ui_kits/app/` | Revisaí app UI kit — login, dashboard, decks, flashcard, exam |
| `src/` | Imported original codebase (read-only reference) |

---

## Product context

**Revisaí** (project codename "FlashCard Pro" / "Vestibulanki") is a study companion for Brazilian high-school students preparing for vestibular exams — particularly **UFPR**. Core surfaces:

1. **Login** — Google + email/senha (Firebase Auth)
2. **Dashboard** — streak (🔥), daily goal, 7-day chart, queue donut, top problematic cards
3. **Baralhos (Decks)** — color-coded decks, categories, urgency badges, CRUD + AI card generator
4. **Estudo (Study)** — 3D flip flashcard, ✅/❌ + 😰/😐/😊 self-rating, ICE score
5. **Modo Vestibular** — UFPR-style timed simulator (+1.00 / -0.25 / 0.00 scoring), flag questions, locked gabarito
6. **Estatísticas** — historical performance, deck-by-deck breakdown

The app is **mobile-first** (375px target), supports **dark/light mode**, and uses **spaced repetition** with three queues: `urgent` / `soon` / `consolidated`.

---

## Content fundamentals

**Language: Portuguese (pt-BR)**, second-person plural / informal. The app speaks **directly to the student** but with quiet authority — like a study coach, not a cheerleader.

- **Tone**: confident, encouraging, never condescending. Avoid hype. Avoid exclamation points except for genuine wins.
- **Casing**: sentence case for everything except product proper nouns (Revisaí, UFPR, ICE).
- **Person**: implicit second-person ("Estude de forma inteligente", "Você respondeu 12 de 30"). Rarely uses "eu". Often imperative ("Estudar", "Entregar", "Cancelar").
- **Length**: terse on buttons (1–2 words: *Entrar*, *Estudar*, *Anterior*, *Entregar*), explanatory in helper copy.
- **No emoji** in marketing/UI chrome. Emoji **are** used semantically as data labels: ✅❌ for result, 😰😐😊 for perceived difficulty, 🔥 for streak, 🚩 for flagged questions. Treat these as iconographic primitives, not decoration.
- **Numbers and metrics**: always with a unit or qualifier ("12 cards", "5h restantes", "ICE 87%").
- **Empty states**: short, action-forward — *"Nenhum baralho ainda. Crie seu primeiro."*

Examples lifted from source:
- *"Estude de forma inteligente"* (login subtitle)
- *"Como foi para você?"* (perceived-difficulty prompt)
- *"Você respondeu **12** de **30** questões. As questões em branco valem 0 pontos."* (submit modal)
- *"Top 5 cards mais problemáticos"* (dashboard section)

---

## Visual foundations

### Colors

- **Background**: `#08090E` (true near-black). The app sits on a deep, slightly warm-leaning black.
- **Card surface**: `#0F1017`, with a 1px `#1E2030` border. Cards never carry shadows in the dark theme — borders + raised inner highlight do the work (cf. Linear).
- **Primary accent**: terracotta `#D45C3A`. Used **sparingly**: primary CTAs, active nav indicator, focus rings, brand mark. Never as a full background fill.
- **Secondary accent**: teal `#0D9488` — kept from the original brand for chart fills, "consolidated" status, and contrast against terracotta where two accents are needed.
- **Text hierarchy**: `#F8FAFC` (primary) → `#94A3B8` (secondary) → `#475569` (tertiary). Body copy uses an in-between `#CBD5E1` for comfort.
- **Light mode**: surfaces flip to `#FFFFFF` on `#F8FAFC`, but the **terracotta primary stays exactly the same** — this is the brand anchor across modes.

### Type

- **Inter** for everything (replaces Satoshi from original). Weights 400 / 500 / 700, with OpenType features `cv11 ss01 ss03` enabled for Linear-like number rendering.
- **Instrument Serif** kept as a quiet display accent — used **only** on the front and back of flashcards (the pedagogical "voice" of the card content), never in chrome. This is the one classical/literary touch in an otherwise sans-serif system.
- **Tracking**: tight (`-0.02em`) on display/h1/h2; normal on body; wide (`0.10em` uppercase) for eyebrows.
- **Numbers feel financial** — tabular figures via `font-feature-settings`, used on streak counts, timers, scores.

### Spacing & rhythm

- 4px base scale: `4 / 8 / 12 / 16 / 20 / 24 / 32 / 40 / 48 / 64`.
- Card padding defaults to `20px` on mobile, `24px` on desktop.
- Page gutters: `16px` mobile, `24px` desktop, with content max-width `1024px`.

### Borders & corners

- **Radii**: `8px` (chips, inputs) → `12px` (buttons, dense cards) → `16px` (default card) → `20px` (hero / focus card) → `28px` (modal).
- Borders are **1px solid** `#1E2030` in dark, `#E2E8F0` in light. **No drop shadows in dark mode** — instead a subtle inner top highlight `inset 0 1px 0 rgba(255,255,255,0.03)` keeps cards feeling lit.
- Cards on hover: gain a **gradient border** (mask-composite trick) that fades the terracotta accent across the top edge, plus `translateY(-4px)` and a colored glow `0 12px 40px rgba(212,92,58,0.18)`.

### Backgrounds & textures

- The login screen uses an animated **mesh gradient** — three radial blobs (terracotta, teal, faint violet) drifting on a 22-second loop over `#08090E`.
- Dashboard hero areas can opt into the same mesh at lower opacity.
- No hand-drawn illustrations, no patterns, no grain. The visual "texture" comes from elevation contrast and the mesh.

### Motion

- **Easing**: `cubic-bezier(0.16, 1, 0.3, 1)` for enters, `cubic-bezier(0.4, 0, 0.2, 1)` for the flip animation.
- **Durations**: 120ms (micro/hover), 200ms (page transition fade+slide), 500ms (card flip).
- **Press**: every interactive element scales to `0.97` on click — keep this consistent (cf. spec).
- **Number reveals**: dashboard stats count up from 0 over 800ms with `ease-out`.
- **Streak fire**: subtle flicker animation on the 🔥 glyph when streak ≥ 3.

### Hover / press / focus states

- **Hover** (buttons): 8% lighter background OR an inner ring; never a darker color in dark mode.
- **Hover** (cards): lift `translateY(-4px)` + gradient border accent + colored shadow.
- **Press**: `scale(0.97)` over 80ms.
- **Focus**: 2px outline in `rgba(212,92,58,0.40)`, offset 2px. Always visible for keyboard users.
- **Disabled**: `opacity 0.4`, no other state changes.

### Glass / transparency

- **Login card** uses true glassmorphism: `backdrop-filter: blur(20px) saturate(140%)` over a `rgba(15,16,23,0.55)` fill, with a `rgba(255,255,255,0.08)` border.
- **Bottom nav (mobile)** uses the same blur over `rgba(8,9,14,0.72)`.
- **Modals** dim the background `rgba(0,0,0,0.6)` + 8px blur.
- Glass is reserved for **floating** surfaces (login, mobile nav, modals). Inline cards never use blur.

### Layout rules

- **Sidebar (desktop, ≥1024px)**: 224px fixed width, sticky full-height, `#0B0C13` with `#1E2030` right border.
- **Bottom nav (mobile)**: 64px tall, glass blur, fixed bottom.
- **Content max-width**: 1024px, gutters scale with viewport.
- **Vestibular mode** is fullscreen — sidebar is hidden, header is fixed with the timer prominently centered/right.

---

## Iconography

- **Source**: `lucide-react` (already a dependency in the codebase). All chrome icons are 1.5px stroke Lucide glyphs. We render them via the **Lucide CDN** in static HTML previews rather than inlining SVGs.
- **Sizes**: 14px (inline), 16px (default in buttons), 20px (nav), 24px (hero / empty states).
- **Color**: `currentColor` — icons inherit the text color of their context. Active nav icons take the accent.
- **Brand mark**: `assets/revisai-mark.svg` — an open-book glyph (terracotta left page + navy right page) recreated as a clean SVG from the Gemini-generated reference. Use the mark alone in tight chrome (favicon, app launch); use `assets/revisai-wordmark.svg` (mark + "Revisaí" in Inter Bold) for headers.
- **Emoji as iconography**: ✅ ❌ 😰 😐 😊 🔥 🚩 are used as **first-class data icons** in the study/exam flows (carried over from the original spec). They are not decoration; they encode user input states. Render with `font-variant-emoji: emoji` to keep system rendering consistent.
- **Original repo sprite** at `assets/icons-original.svg` is preserved for reference but is not used by the new system.

---

## Caveats

- **Logo recreation**: the Gemini-generated PNG was redrawn as an SVG. The original PNG's exact letterforms and decorative book-spine details are not preserved 1:1 — flag for review with a designer.
- **Inter substitution**: Spec calls for Inter (Google Fonts CDN). Original codebase shipped Satoshi via Fontshare. We've gone with Inter as instructed. If you want to keep Satoshi for body and only swap display, let me know.
- **Terracotta primary vs. spec's #6C63FF purple**: The pasted brief had two conflicting primaries — Linear-style `#6C63FF` electric purple in the body, then a "Additional notes" override pinning the brand to terracotta `#D45C3A`. We took the override as the source of truth (the Revisaí logo is terracotta + navy, so this matches). If you wanted the purple, we can fork.
- The PUBLIC `icons.svg` sprite from the original repo wasn't read in detail — we rely on Lucide via CDN per the original `lucide-react` dependency.

---

**👉 Help me iterate**: review the cards in the Design System tab and tell me which directions to push further — softer or harder borders, more or less terracotta, mesh gradient too loud, type scale, etc. The biggest dial to consider is **how much the terracotta should appear** — right now it's reserved for the primary CTA + brand mark + active states. Want it more present (gradient borders on every card, accent on chart fills, terracotta-tinted icons)? Or keep it monastic?
