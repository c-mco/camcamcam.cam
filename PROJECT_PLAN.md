# System Architecture Plan: camcamcam.cam Single-Source-of-Truth Resume Platform

## 1. Executive Summary
This project delivers a bespoke, high-performance personal resume website and automated document generation pipeline for **Cam McOrist** (`camcamcam.cam`). 

The core requirement is a **Single Source of Truth (SSOT)**:
A single structured data file (`src/content/resume.yaml`) drives:
1. **The Interactive Website**: A fast, responsive, and accessible personal site embodying an **Aesop-inspired Minimalist Editorial** aesthetic (refined typography, warm earth/stone tones, generous whitespace, pristine hierarchy, WCAG AA compliance).
2. **The Print & PDF Download (`resume.pdf`)**: A pixel-perfect, beautifully typeset 2-page document rendered directly from the website's dedicated print engine using Playwright.
3. **The Word Download (`resume.docx`)**: A native, professionally formatted, ATS-compliant Microsoft Word document generated programmatically via the `docx` library in TypeScript with identical styling rules, typographic hierarchy, and bullet formatting.

Both downloadable documents are generated automatically during the build process, ensuring zero drift between the web experience and offline application files.

---

## 2. Architecture & Design Decisions

### 2.1 Single Source of Truth (SSOT) Pipeline
```
                      ┌────────────────────────┐
                      │  src/data/resume.yaml  │
                      │  (Validated with Zod)  │
                      └───────────┬────────────┘
                                  │
         ┌────────────────────────┼────────────────────────┐
         ▼                        ▼                        ▼
┌──────────────────┐    ┌──────────────────┐    ┌──────────────────┐
│   Astro Web UI   │    │  Playwright PDF  │    │  Docx Generator  │
│  (Tailwind CSS)  │    │  (/print route)  │    │  (docx in TS)    │
└────────┬─────────┘    └────────┬─────────┘    └────────┬─────────┘
         │                       │                       │
         ▼                       ▼                       ▼
   dist/index.html        dist/resume.pdf        dist/resume.docx
         │                       │                       │
         └───────────────────────┴───────────────────────┘
                                 │
                                 ▼
                     Cloudflare Pages Edge CDN
```

### 2.2 Aesthetic & Vibe System ("Minimalist Editorial / Aesop Warmth")
Cam's leadership at Aesop and dedication to quality/accessibility call for an aesthetic that marries literary restraint with modern engineering precision:
- **Typography**: 
  - Primary Display/Serif: *Newsreader* or *Playfair / EB Garamond* (or self-hosted Editorial New / Fraunces styling) for headings and section titles.
  - Body/Sans: *Plus Jakarta Sans* or *Inter* (high legibility, balanced geometry).
  - Accents/Metadata: *JetBrains Mono* for dates, pills, and metric badges.
- **Palette**:
  - Light Mode: Warm alabaster (`#FBF9F5`), Deep basalt charcoal (`#1F2124`), Aesop-inspired ochre/amber accent (`#B87333` / `#A3662A`), Muted stone borders (`#E5E0D8`).
  - Dark Mode: Charcoal/obsidian (`#121315`), Warm eggshell text (`#ECE8E1`), Subtle stone borders (`#2A2C30`).
- **Interactive Nuance**:
  - Sticky editorial header with quick navigation and direct one-click download buttons (`Download PDF`, `Download DOCX`).
  - Expandable experience deep-dives with highlighted metrics (e.g., "1 day saved per 2-week sprint", "Tens of millions of records").
  - Accessible theme toggle with keyboard shortcuts.
- **Accessibility Mandate (WCAG 2.1 AA)**:
  - Minimum 4.5:1 contrast ratios.
  - Full keyboard focus rings (`focus-visible:ring-2`).
  - Proper ARIA landmarks (`header`, `main`, `section`, `nav`).
  - Zero hydration blocking / zero layout shift (CLS = 0).

### 2.3 Document Generation Strategy
1. **PDF Generation**:
   - Playwright headless Chromium renders a dedicated `/print` route in Astro.
   - The `/print` route uses strict `@page` CSS margins (`margin: 1.5cm 1.8cm`), `break-inside: avoid` on job roles, and exact typography matching the web design.
   - Outputs a clean, crisp, vectorized 2-page PDF to `dist/resume.pdf` during build.
2. **DOCX Generation**:
   - Uses the official `docx` npm library (`docx-js`).
   - Programmatically sets page margins, custom paragraph styles, font hierarchies (e.g. Garamond or Aptos/Calibri for broad Word compatibility), borders, bullet indentations, and hyperlinks.
   - ATS (Applicant Tracking System) friendly: standard semantic Word styles (`Heading 1`, `Heading 2`, `Normal`, standard bullet points) ensure candidate parsers extract all data effortlessly.
   - Outputs to `dist/resume.docx` during build.

---

## 3. Technology Stack & Dependencies

| Layer | Choice | Rationale |
|---|---|---|
| **Framework** | **Astro 4.x / 5.x** | Blazingly fast static site generation, 0kb client JS by default, native markdown & YAML support with Zod schema validation. |
| **Styling** | **Tailwind CSS + Tailwind Typography** | Rapid utility-first styling, consistent spacing tokens, dark mode, print media queries. |
| **Icons** | **Lucide Icons** (`lucide-astro`) | Clean, modern, accessible SVG iconography (PDF icon, DOCX icon, Github, LinkedIn, Mail, Phone). |
| **DOCX Generation** | **`docx` (npm)** | Industry standard for programmatic Word generation. Fully typed, zero binary dependencies, cross-platform. |
| **PDF Generation** | **Playwright** | Flawless headless rendering of CSS `@page` and print media styles into vector PDF. |
| **Schema Validation** | **Zod** | Guarantees type-safety for contact info, employment history, accomplishments, and skills. |
| **Hosting & CI/CD** | **Cloudflare Pages** | Worldwide edge CDN, unlimited bandwidth, instant git push deployments, native custom domain integration for `camcamcam.cam`. |

---

## 4. File Structure & Implementation Layout

```
camcamcam.cam/
├── .github/
│   └── workflows/
│       └── deploy.yml              # CI workflow (builds docs, tests, deploys to CF Pages)
├── public/
│   ├── favicon.svg                 # Custom minimalist monogram favicon
│   ├── og-image.png                # Social share card
│   └── robots.txt
├── scripts/
│   ├── generate-docx.ts            # Programmatic DOCX builder from resume.yaml
│   └── generate-pdf.ts             # Playwright script rendering /print to resume.pdf
├── src/
│   ├── content/
│   │   ├── config.ts               # Zod schema definitions for resume data
│   │   └── resume.yaml             # THE SINGLE SOURCE OF TRUTH (All resume text & data)
│   ├── components/
│   │   ├── Header.astro            # Minimalist brand header + quick actions
│   │   ├── Summary.astro           # Executive overview & value proposition
│   │   ├── ExperienceItem.astro    # Structured role breakdown with key impact highlights
│   │   ├── HistoryList.astro       # Previous roles (2007-2015) condensed clean view
│   │   ├── SkillsGrid.astro        # Certifications (ISTQB) and technical expertise
│   │   ├── DownloadBar.astro       # Prominent PDF / DOCX download actions
│   │   ├── ThemeToggle.astro       # Dark / Light mode toggle
│   │   └── Footer.astro            # Copyright, metadata, and colophon
│   ├── layouts/
│   │   ├── Layout.astro            # Base web layout (SEO meta, fonts, analytics ready)
│   │   └── PrintLayout.astro       # Specialized 2-page print layout for PDF generation
│   ├── pages/
│   │   ├── index.astro             # Full interactive website
│   │   └── print.astro             # Print-optimized resume page for Playwright & Ctrl+P
│   └── styles/
│       └── global.css              # Custom font faces, print rules, smooth scrolling
├── astro.config.mjs
├── tailwind.config.mjs
├── tsconfig.json
├── package.json
└── README.md
```

---

## 5. Step-by-Step Implementation Roadmap

### Phase 1: Project Scaffolding & Data Modeling
1. Initialize Astro project with TypeScript and Tailwind CSS.
2. Define the strict TypeScript/Zod schema for the resume in `src/content/config.ts`:
   - Personal info (Name, title, location, citizenship, email, phone, website, socials).
   - Executive summary.
   - Lead experience (company, location, dates, role, impact sections: *Strategy & CI/CD*, *E2E Validation*, *Integration*, *AI & Migration*, *Culture*).
   - Prior history (condensed summary roles).
   - Professional development, certifications, and technical proficiencies.
3. Migrate the complete text from `Cam McOrist - Resume.pdf` into `src/content/resume.yaml` with 100% accuracy and fidelity.

### Phase 2: Web Experience Design & Development
1. Configure custom typography (Google Fonts or local fonts: serif display + sans body + mono metadata).
2. Build responsive, accessible layout (`Layout.astro`) with dark/light theme support.
3. Implement modular components:
   - Hero / Bio header with status indicator (e.g. "Melbourne, Australia").
   - Summary section.
   - Deep-dive Experience timeline with collapsible/expandable project achievements.
   - Concise historical experience cards.
   - Professional development & certifications banner.
   - Fixed / Sticky Quick Action bar with instant PDF & DOCX download buttons.
4. Ensure full WCAG AA compliance (semantic tags, high contrast, keyboard focus indicators).

### Phase 3: Single-Source Document Generation Pipeline
1. **DOCX Generator (`scripts/generate-docx.ts`)**:
   - Read and parse `resume.yaml`.
   - Build document using `docx` package:
     - Document metadata (Title, Author: Cam McOrist).
     - Standard 1-inch margins.
     - Custom paragraph and character styles (Name: 24pt Bold, Section Headings: 13pt Bold with underline/bottom border, Subheadings: 11pt Bold, Body: 10pt Regular).
     - Semantic bullet points with consistent left indents.
     - Save to `public/resume.docx` and `dist/resume.docx`.
2. **Print Route & PDF Generator (`src/pages/print.astro` + `scripts/generate-pdf.ts`)**:
   - Build a dedicated `/print` page rendering `resume.yaml` in an uncompromised 2-page editorial print format.
   - Implement `@media print` rules: exact page breaks, no web navigation/footers, optimized font sizing for A4/Letter paper.
   - Playwright script launches headless Chromium, navigates to local preview of `/print`, and runs `page.pdf({ path: 'dist/resume.pdf', format: 'A4', printBackground: true })`.

### Phase 4: Build Script Orchestration & Verification
1. Create unified npm scripts in `package.json`:
   - `build:docs`: runs `generate-docx.ts` and `generate-pdf.ts`.
   - `build`: compiles Astro and bundles generated documents into `dist/`.
   - `preview`: starts local preview server to verify web UI and downloads.
2. Verify downloaded PDF matches visual standards and page budget (exact 2 pages).
3. Verify downloaded DOCX opens smoothly in Word/Google Docs with flawless styling and ATS readability.

### Phase 5: Deployment Configuration for `camcamcam.cam`
1. Configure Cloudflare Pages adapter / static output.
2. Provide setup instructions for connecting `camcamcam.cam` DNS in Cloudflare.
3. Set up GitHub Actions CI workflow for automatic builds and deployments on push.

---

## 6. Build, Test & CI/CD Pipeline

### Build Workflow:
```bash
npm run build
  ├─ 1. astro check (Type check schema & components)
  ├─ 2. tsx scripts/generate-docx.ts (Builds dist/resume.docx)
  ├─ 3. astro build (Generates static site and /print route)
  └─ 4. tsx scripts/generate-pdf.ts (Renders /print -> dist/resume.pdf)
```

### Deployment (Cloudflare Pages):
- **Build command**: `npm run build`
- **Output directory**: `dist`
- **Node version**: 20.x or 22.x
- Cloudflare Pages serves static assets over global CDN edge with HTTP/3 and Brotli compression.

---

## 7. Quality Gates & Acceptance Criteria

| Area | Criteria |
|---|---|
| **Single Source of Truth** | Editing a single line in `resume.yaml` updates the Website, `resume.pdf`, and `resume.docx` without touching any other code. |
| **Website Aesthetics** | Aesop-inspired minimalist editorial vibe, beautiful typography, crisp dark/light themes, fully responsive on mobile/desktop. |
| **PDF Quality** | Vector text, crisp typography, exactly 2 pages without overflow or orphaned headers, clickable hyperlinks. |
| **DOCX Quality** | Standard Word formatting, cleanly styled headings, valid bullet list hierarchy, 100% ATS-friendly. |
| **Accessibility** | Semantic HTML5, WCAG 2.1 AA compliant contrast and keyboard accessibility. |
| **Performance** | 100 Lighthouse score across Performance, Accessibility, Best Practices, and SEO. |

---

## 8. Verification & Validation Plan
1. **Automated Verification**:
   - `npm run check` (TypeScript + Astro compilation validation).
   - Check file existence and non-zero byte size of `dist/resume.pdf` and `dist/resume.docx`.
2. **Visual Inspection**:
   - Local web preview on mobile and desktop viewports.
   - PDF rendering inspection (page budget, margins, typographic balance).
   - DOCX file structure inspection.
3. **Download Links**:
   - Verify that clicking "Download PDF" downloads `resume.pdf`.
   - Verify that clicking "Download DOCX" downloads `resume.docx`.
