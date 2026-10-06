import { chromium } from 'playwright';

async function testAdminTabs() {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1536, height: 900 } });
  
  page.on('console', msg => console.log('BROWSER LOG:', msg.text()));
  page.on('pageerror', err => console.log('BROWSER ERROR:', err.message));
  
  await page.goto('http://localhost:3000/');
  await page.waitForTimeout(600);

  // Switch to admin
  await page.locator('header button:has(svg.lucide-chevron-down)').click();
  await page.waitForTimeout(300);
  await page.locator('button:has-text("Switch to Admin Mode")').click();
  await page.waitForTimeout(600);
  
  console.log('--- Checking Admin Tabs ---');

  // 1. Overview
  console.log('1. Admin Overview heading:', await page.locator('h2').first().textContent());

  // 2. Live Monitor
  await page.locator('header nav button[aria-label="Live Monitor"]').click();
  await page.waitForTimeout(600);
  console.log('2. Live Monitor heading:', await page.locator('h2').first().textContent());

  // 3. Analytics
  await page.locator('header nav button[aria-label="Analytics"]').click();
  await page.waitForTimeout(600);
  console.log('3. Analytics heading:', await page.locator('h2').first().textContent());

  // 4. Attendance
  await page.locator('header nav button[aria-label="Attendance"]').click();
  await page.waitForTimeout(600);
  console.log('4. Attendance heading:', await page.locator('h2').first().textContent());

  // 5. Policies
  await page.locator('header nav button[aria-label="Policies"]').click();
  await page.waitForTimeout(600);
  console.log('5. Policies heading:', await page.locator('h2').first().textContent());

  await page.screenshot({ path: 'debug_admin_policies.png' });
  await browser.close();
}

testAdminTabs();
