import fs from 'node:fs';
import path from 'node:path';
import { chromium } from 'playwright';

export async function generatePdf(outputPath?: string): Promise<string> {
  const targetPath = outputPath || path.resolve(process.cwd(), 'public/resume.pdf');
  const targetDir = path.dirname(targetPath);
  if (!fs.existsSync(targetDir)) {
    fs.mkdirSync(targetDir, { recursive: true });
  }

  const printHtmlPath = path.resolve(process.cwd(), 'dist/print/index.html');
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
  await page.setViewportSize({ width: 794, height: 1123 }); // standard 96dpi A4 pixel dimensions
  await page.emulateMedia({ media: 'print' });

  // Navigate to local build output
  const fileUrl = `file://${printHtmlPath}`;
  await page.goto(fileUrl, { waitUntil: 'networkidle' });

  // Brief pause for web fonts to settle
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

  // Also mirror to dist if dist exists
  const distPath = path.resolve(process.cwd(), 'dist/resume.pdf');
  if (fs.existsSync(path.dirname(distPath))) {
    fs.copyFileSync(targetPath, distPath);
  }

  return targetPath;
}

// Allow direct CLI execution
if (import.meta.url === `file://${process.argv[1]}`) {
  generatePdf().catch((err) => {
    console.error('Failed to generate PDF:', err);
    process.exit(1);
  });
}
