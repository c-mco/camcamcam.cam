import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { chromium } from 'playwright';

function createStaticServer(distDir: string): Promise<{ server: http.Server; url: string }> {
  const mimeTypes: Record<string, string> = {
    '.html': 'text/html; charset=utf-8',
    '.css': 'text/css; charset=utf-8',
    '.js': 'application/javascript; charset=utf-8',
    '.svg': 'image/svg+xml',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.woff2': 'font/woff2',
    '.woff': 'font/woff',
    '.ttf': 'font/ttf',
  };

  return new Promise((resolve, reject) => {
    const server = http.createServer((req, res) => {
      let reqPath = decodeURIComponent(req.url?.split('?')[0] || '/');
      if (reqPath === '/' || reqPath === '/print' || reqPath === '/print/') {
        reqPath = reqPath === '/' ? '/index.html' : '/print/index.html';
      }
      const safePath = path.normalize(reqPath).replace(/^(\.\.[\/\\])+/, '');
      const filePath = path.join(distDir, safePath);

      if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
        const ext = path.extname(filePath).toLowerCase();
        const contentType = mimeTypes[ext] || 'application/octet-stream';
        res.writeHead(200, { 'Content-Type': contentType });
        fs.createReadStream(filePath).pipe(res);
      } else {
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        res.end('Not Found');
      }
    });

    server.listen(0, '127.0.0.1', () => {
      const addr = server.address();
      if (!addr || typeof addr === 'string') {
        reject(new Error('Failed to bind server address'));
        return;
      }
      resolve({ server, url: `http://127.0.0.1:${addr.port}` });
    });

    server.on('error', reject);
  });
}

export async function generatePdf(outputPath?: string): Promise<string> {
  const targetPath = outputPath || path.resolve(process.cwd(), 'public/resume.pdf');
  const targetDir = path.dirname(targetPath);
  if (!fs.existsSync(targetDir)) {
    fs.mkdirSync(targetDir, { recursive: true });
  }

  const distPath = path.resolve(process.cwd(), 'dist/resume.pdf');
  const rootPdfPath = path.resolve(process.cwd(), 'Cam McOrist - Resume.pdf');
  const distDir = path.resolve(process.cwd(), 'dist');
  const printHtmlPath = path.resolve(distDir, 'print/index.html');

  if (!fs.existsSync(printHtmlPath)) {
    throw new Error(
      `Print HTML not found at ${printHtmlPath}. Please run 'npm run build:site' before generating the PDF.`
    );
  }

  // Spin up local static server so root-relative assets (/_astro/...) and web fonts load properly
  const { server, url: serverUrl } = await createStaticServer(distDir);

  try {
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
        
        await page.goto(`${serverUrl}/print`, { waitUntil: 'networkidle' });
        await page.evaluate(() => document.fonts.ready);
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
        if (fs.existsSync(rootPdfPath)) {
          fs.copyFileSync(targetPath, rootPdfPath);
        }
        console.log(`Successfully generated PDF via Cloudflare Browser Run at: ${targetPath}`);
        return targetPath;
      } catch (cfErr) {
        console.warn(`[WARN] Cloudflare Browser Run failed, falling back to local: ${(cfErr as Error).message}`);
      }
    }

    // Option 2: Local Playwright headless Chromium
    console.log('Launching headless Chromium to render PDF...');
    const browser = await chromium.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox', '--font-render-hinting=none'],
    });

    const page = await browser.newPage();
    
    // Set A4 print media viewport
    await page.setViewportSize({ width: 794, height: 1123 });
    await page.emulateMedia({ media: 'print' });

    // Navigate to local HTTP server
    await page.goto(`${serverUrl}/print`, { waitUntil: 'networkidle' });

    // Ensure web fonts are loaded
    await page.evaluate(() => document.fonts.ready);
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

    // Mirror to dist and root if present
    if (fs.existsSync(path.dirname(distPath))) {
      fs.copyFileSync(targetPath, distPath);
    }
    if (fs.existsSync(rootPdfPath)) {
      fs.copyFileSync(targetPath, rootPdfPath);
    }

    return targetPath;
  } catch (err) {
    const errorMsg = (err as Error).message;
    console.warn(`\n[NOTICE] Local Chromium execution was unavailable in this container: ${errorMsg}`);

    // Option 3: Graceful fallback for Cloudflare Pages build containers
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
  } finally {
    server.close();
  }
}

// Allow direct CLI execution
if (import.meta.url === `file://${process.argv[1]}`) {
  generatePdf().catch((err) => {
    console.error('Failed to generate PDF:', err);
    process.exit(1);
  });
}
