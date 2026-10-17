# camcamcam.cam — Single-Source-of-Truth Resume Platform

A bespoke, high-performance personal resume website and automated document generator for **Cam McOrist**.

Embodying an **Aesop-inspired Minimalist Editorial** aesthetic (warm parchment tones, crisp serif typography, generous whitespace, dark/light theme, and WCAG AA accessibility), the platform is powered by a **Single Source of Truth**:

```
                         src/data/resume.yaml
                                  │
         ┌────────────────────────┼────────────────────────┐
         ▼                        ▼                        ▼
  Interactive Web          Playwright PDF           docx-js DOCX
  (Astro + Tailwind)       (resume.pdf)             (resume.docx)
```

---

## 🌟 Key Features

1. **Single Source of Truth (`src/data/resume.yaml`)**:
   - Update your job title, experience, or metrics in `src/data/resume.yaml`.
   - The Website, vector PDF (`resume.pdf`), and ATS-compliant Word document (`resume.docx`) update simultaneously with zero manual syncing.
2. **Minimalist Editorial Web Experience**:
   - Warm stone/parchment palette with Aesop-inspired amber accents.
   - Dark mode toggle with persistent local preference and zero-flash loading.
   - Responsive, keyboard accessible (WCAG AA compliant).
   - High-impact metric callouts and tech skill tags.
3. **Flawless Vector PDF (`resume.pdf`)**:
   - Exactly 2 pages matching the original resume structure.
   - Vector typography, clickable email/website hyperlinks, and print-optimized page breaks.
4. **ATS-Compliant Word Document (`resume.docx`)**:
   - Generated programmatically with standard Microsoft Word styles (`Heading 1`, `Heading 2`, clean bullet hierarchies).
   - Effortlessly parsed by Applicant Tracking Systems (Workday, Greenhouse, Lever, etc.).

---

## 🛠️ Tech Stack

- **Framework**: [Astro 5](https://astro.build/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Icons**: [Lucide Astro](https://lucide.dev/)
- **PDF Engine**: [Playwright](https://playwright.dev/) (Headless Chromium)
- **DOCX Engine**: [`docx`](https://docx.js.org/)
- **Data Layer**: YAML + TypeScript

---

## 🚀 Quick Start

### 1. Install Dependencies
```bash
npm install
npx playwright install chromium
```

### 2. Start Local Development Server
```bash
npm run dev
```
Open [http://localhost:4321](http://localhost:4321) to view the site.

### 3. Build Everything (Docs + Site)
```bash
npm run build
```
This runs the full 3-step pipeline:
1. `npm run build:docx` ➔ Generates `public/resume.docx` & `dist/resume.docx`
2. `npm run build:site` ➔ Compiles the Astro website & `/print` route
3. `npm run build:pdf`  ➔ Headless Playwright renders `/print` into `public/resume.pdf` & `dist/resume.pdf`

---

## ✏️ How to Update Your Resume

You only ever need to edit **one file**:

```
src/data/resume.yaml
```

Whenever you push to GitHub, the automated GitHub Action will rebuild the site and re-render both the PDF and DOCX downloads!

---

## ☁️ Deployment to Cloudflare Pages (`camcamcam.cam`)

### Option A: Cloudflare Dashboard (Recommended & Easiest)
1. Push this repository to GitHub.
2. Log in to [Cloudflare Dashboard](https://dash.cloudflare.com/) ➔ **Workers & Pages** ➔ **Create application** ➔ **Pages** ➔ **Connect to Git**.
3. Select this repo and configure build settings:
   - **Framework preset**: `None` or `Astro`
   - **Build command**: `npm run build`
   - **Build output directory**: `dist`
   - **Environment Variables**:
     - `NODE_VERSION`: `22`
4. Click **Save and Deploy**.
5. Go to **Custom domains** in your Cloudflare Pages project and add `camcamcam.cam`. Cloudflare will automatically provision SSL certificates.

### Option B: GitHub Actions (Automated CI/CD)
The `.github/workflows/deploy.yml` workflow is pre-configured. Simply add two secrets in your GitHub repository (**Settings** ➔ **Secrets and variables** ➔ **Actions**):
- `CLOUDFLARE_API_TOKEN`
- `CLOUDFLARE_ACCOUNT_ID`

---

## 📄 License
Personal portfolio and resume of Cam McOrist. All rights reserved.
