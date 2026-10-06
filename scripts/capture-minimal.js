import { chromium } from 'playwright';

async function captureMinimalAnalytics() {
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

    // Navigate to Analytics
    await page.locator('header nav button[aria-label="Analytics"]').click({ force: true });
    await page.waitForSelector('h2:has-text("Department Intelligence")', { timeout: 5000 });
    await page.waitForTimeout(600);

    // Capture desktop full page
    await page.screenshot({ path: 'scripts/department_minimal_desktop.png', fullPage: true });
    console.log('📸 Captured desktop screenshot: scripts/department_minimal_desktop.png');

    // Click on Engineering row to open modal
    await page.locator('div:has-text("Engineering")').nth(2).click();
    await page.waitForTimeout(400);
    await page.screenshot({ path: 'scripts/department_minimal_modal.png' });
    console.log('📸 Captured modal screenshot: scripts/department_minimal_modal.png');

    // Close modal
    await page.locator('button:has-text("Close")').click();
    await page.waitForTimeout(200);

    // Mobile Viewport Check
    await page.setViewportSize({ width: 390, height: 844 });
    await page.waitForTimeout(400);
    await page.screenshot({ path: 'scripts/department_minimal_mobile.png', fullPage: true });
    console.log('📸 Captured mobile screenshot: scripts/department_minimal_mobile.png');

    console.log('✅ Minimal Analytics Captured Successfully!');
  } catch (err) {
    console.error('Capture error:', err);
  } finally {
    await browser.close();
  }
}

captureMinimalAnalytics();
