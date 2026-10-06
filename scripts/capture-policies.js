import { chromium } from 'playwright';

async function capture() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await page.goto('http://localhost:3000/');
  await page.locator('header button:has(svg.lucide-chevron-down)').click();
  await page.waitForTimeout(300);
  await page.locator('button:has-text("Switch to Admin Mode")').click();
  await page.waitForTimeout(500);
  await page.locator('header nav button[aria-label="Policies"]').click({ force: true });
  await page.waitForTimeout(600);
  await page.screenshot({ path: 'policies_page_preview.png' });
  await browser.close();
  console.log('Saved policies_page_preview.png');
}

capture();
