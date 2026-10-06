import { chromium } from 'playwright';

async function captureFinal() {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1536, height: 860 } });
  await page.goto('http://localhost:3000/', { waitUntil: 'networkidle' });
  await page.reload({ waitUntil: 'networkidle' });
  await page.waitForTimeout(1000);

  // 1. Open Profile Dropdown
  await page.locator('header button:has(svg.lucide-chevron-down)').click();
  await page.waitForTimeout(600);
  await page.screenshot({ path: 'dropdown_opaque_preview.png' });
  console.log('Saved dropdown_opaque_preview.png');

  // Close dropdown by clicking the backdrop
  await page.locator('div.fixed.inset-0').first().click();
  await page.waitForTimeout(400);

  // Navigate to Productivity
  await page.locator('header nav button').nth(3).click();
  await page.waitForSelector('text=Productivity & Rhythm Intelligence', { timeout: 5000 });
  await page.waitForTimeout(600);
  await page.screenshot({ path: 'productivity_vertical_space_preview.png' });
  console.log('Saved productivity_vertical_space_preview.png');

  await browser.close();
}

captureFinal();
