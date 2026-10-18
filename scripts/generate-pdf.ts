import fs from 'node:fs';
import path from 'node:path';
import { chromium } from 'playwright';

export async function generatePdf(outputPath?: string): Promise<string> {
  const targetPath = outputPath || path.resolve(process.cwd(), 'public/resume.pdf');
  const targetDir = path.dirname(targetPath);
  if (!fs.existsSync(targetDir)) {
    fs.mkdirSync(targetDir, { recursive: true });
  }

  const distPath = path.resolve(process.cwd(), 'dist/resume.pdf');
  const printHtmlPath = path.resolve(process.cwd(), 'dist/print/index.html');

  // Option 1: Cloudflare Browser Run (CDP) if credentials are provided in Pages environment
  if (process.env.CF_ACCOUNT_ID && process.env.CF_API_TOKEN) {
    try {
      console.log('Connecting to Cloudflare Browser Rendering over CDP...');
      const endpoint = `wss://api.cloudflare.com/client/v4/accounts/${process.env.CF_ACCOUNT_ID}/browser-run/devtools/browser`;
      const browser = await chromium.connectOverCDP(endpoint, {
        headers: {
          Authorization: `Bearer ${process.env.CF_API_TOKEN}`,
        },
      });
      const page = await browser.newPage();
      await page.setViewportSize({ width: 794, height: 1123 });
      await page.emulateMedia({ media: 'print' });
      
      const htmlContent = fs.readFileSync(printHtmlPath, 'utf8');
      await page.setContent(htmlContent, { waitUntil: 'networkidle' });
      await page.waitForTimeout(600);

      await page.pdf({
        path: targetPath,
        format: 'A4',
        printBackground: true,
        preferCSSPageSize: true,
        margin: { top: '0mm', bottom: '0mm', left: '0mm', right: '0mm' },
      });

      await browser.close();

      if (fs.existsSync(path.dirname(distPath))) {
        fs.copyFileSync(targetPath, distPath);
      }
      console.log(`Successfully generated PDF via Cloudflare Browser Run at: ${targetPath}`);
      return targetPath;
    } catch (cfErr) {
      console.warn(`[WARN] Cloudflare Browser Run failed, falling back to local: ${(cfErr as Error).message}`);
    }
  }

  // Option 2: Local Playwright headless Chromium
  try {
    if (!fs.existsSync(printHtmlPath)) {
      throw new Error(
        `Print HTML not found at ${printHtmlPath}. Please run 'npm run build:site' before generating the PDF.`
      );
    }

    console.log('Launching headless Chromium to render PDF...');
    const browser = await chromium.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox', '--font-render-hinting=none'],
    });

    const page = await browser.newPage();
    
    // Set A4 print media viewport
    await page.setViewportSize({ width: 794, height: 1123 });
    await page.emulateMedia({ media: 'print' });

    // Navigate to local build output
    const fileUrl = `file://${printHtmlPath}`;
    await page.goto(fileUrl, { waitUntil: 'networkidle' });

    // Pause for web fonts to settle
    await page.waitForTimeout(600);

    // Generate vector PDF
    await page.pdf({
      path: targetPath,
      format: 'A4',
      printBackground: true,
      preferCSSPageSize: true,
      margin: {
        top: '0mm',
        bottom: '0mm',
        left: '0mm',
        right: '0mm',
      },
    });

    await browser.close();

    const stats = fs.statSync(targetPath);
    console.log(`Successfully generated PDF at: ${targetPath} (${stats.size} bytes)`);

    // Mirror to dist if dist exists
    if (fs.existsSync(path.dirname(distPath))) {
      fs.copyFileSync(targetPath, distPath);
    }

    return targetPath;
  } catch (err) {
    const errorMsg = (err as Error).message;
    console.warn(`\n[NOTICE] Local Chromium execution was unavailable in this container: ${errorMsg}`);

    // Option 3: Graceful fallback for Cloudflare Pages build containers
    // Use the synchronized pre-built public/resume.pdf tracked in the repository
    if (fs.existsSync(targetPath)) {
      console.log(`[INFO] Using repository's synchronized PDF at: ${targetPath}`);
      if (fs.existsSync(path.dirname(distPath))) {
        fs.copyFileSync(targetPath, distPath);
        console.log(`[INFO] Successfully mirrored to ${distPath}`);
      }
      return targetPath;
    }

    throw new Error(
      `No Chromium executable found and no pre-built PDF exists at ${targetPath}. Please run 'npx playwright install chromium' locally or in CI.`
    );
  }
}

// Allow direct CLI execution
if (import.meta.url === `file://${process.argv[1]}`) {
  generatePdf().catch((err) => {
    console.error('Failed to generate PDF:', err);
    process.exit(1);
  });
}
