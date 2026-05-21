---
name: revisai-design
description: Use this skill to generate well-branded interfaces and assets for Revisaí (a Brazilian flashcard study app, formerly FlashCard Pro / Vestibulanki) — for production code or for throwaway prototypes, mocks, slides, marketing pages. Contains essential design guidelines, terracotta + dark colors, Inter type, fonts, logos, and a UI kit of reusable React components covering login, dashboard, decks, flashcards, and the UFPR vestibular simulator.
user-invocable: true
---

Read the README.md file within this skill, and explore the other available files. Key files: `colors_and_type.css` (all design tokens), `assets/` (logos and icon sprite), `ui_kits/app/` (React components for login, dashboard, decks, flashcard, exam mode), `preview/` (design-system specimen cards).

If creating visual artifacts (slides, mocks, throwaway prototypes, marketing pages, etc.), copy the assets out and create static HTML files for the user to view — link `colors_and_type.css` for tokens, copy logos from `assets/`, and reference UI-kit components from `ui_kits/app/`.

If working on production code (the underlying app is React 18 + Vite + Tailwind + Firebase), copy the assets and design tokens; map them onto Tailwind config (`darkMode: 'class'`); replicate the component structure documented in the kit. The brand primary is terracotta `#D45C3A` (NOT the purple `#6C63FF` from the original Linear/Vercel-style brief — see README caveats); the secondary is teal `#0D9488` for charts.

If the user invokes this skill without any other guidance, ask them what they want to build or design (a marketing landing page? a new app screen? a slide deck? an email?), ask 5–10 focused questions about audience and tone, and act as an expert designer who outputs HTML artifacts or production code, depending on the need. Default to dark mode unless asked otherwise — that's the brand's primary mode.
