import { chromium } from 'playwright';

async function capture() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await page.goto('http://localhost:3000/');
  await page.locator('header nav button[aria-label="Reports"]').click();
  await page.waitForTimeout(600);
  await page.screenshot({ path: 'reports_center_preview.png' });
  await browser.close();
  console.log('Saved reports_center_preview.png');
}

capture();
