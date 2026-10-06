import { chromium } from 'playwright';

async function captureModal() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1536, height: 950 } });
  const page = await context.newPage();

  try {
    await page.goto('http://localhost:3000/', { waitUntil: 'networkidle' });
    await page.waitForTimeout(600);

    // Switch to Admin
    await page.locator('header button:has(svg.lucide-chevron-down)').click();
    await page.waitForTimeout(200);
    await page.locator('button:has-text("Switch to Admin Mode")').click();
    await page.waitForTimeout(400);

    // Analytics tab
    await page.locator('header nav button[aria-label="Analytics"]').click({ force: true });
    await page.waitForSelector('h2:has-text("Department Intelligence & Team Analytics")', { timeout: 5000 });

    // Click Engineering row to open modal
    await page.locator('tr:has-text("Engineering")').click();
    await page.waitForSelector('text=Engineering Department Overview', { timeout: 4000 });
    await page.waitForTimeout(400);

    // Capture modal screenshot
    await page.screenshot({ path: 'scripts/department_modal_preview.png' });
    console.log('📸 Captured modal screenshot: scripts/department_modal_preview.png');
  } catch (err) {
    console.error('Modal capture error:', err);
  } finally {
    await browser.close();
  }
}

captureModal();
