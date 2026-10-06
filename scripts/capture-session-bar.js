import { chromium } from 'playwright';

async function capture() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await page.goto('http://localhost:3000/');
  await page.waitForTimeout(600);
  await page.screenshot({ path: 'session_bar_preview.png' });
  await browser.close();
  console.log('Saved session_bar_preview.png');
}

capture();
