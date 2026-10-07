const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1540, height: 900 } });

  await page.goto('http://localhost:3000/');
  await page.evaluate(() => {
    localStorage.setItem('flowsphere-is-authenticated', 'true');
    localStorage.setItem('flowsphere-auth-emp-id', 'FS-1001');
  });
  await page.reload();
  await page.waitForTimeout(1000);

  // Click workflow button in header nav (second button)
  await page.locator('header nav button').nth(1).click();
  await page.waitForTimeout(1200);

  // Run exact measurement snippet
  const measurements = await page.evaluate(() => {
    return [...document.querySelectorAll('.glass-inner')]
      .filter(w => w.closest('main') && w.querySelector('[class*="glass-card"], .glass-card'))
      .map(w => ({
        wellHeight: w.offsetHeight,
        cardsHeight: [...w.children].reduce((s, c) => s + c.offsetHeight, 0)
      }));
  });

  console.log('CONSOLE_MEASUREMENTS_OUTPUT:');
  console.log(JSON.stringify(measurements, null, 2));

  // Employee screenshot
  await page.screenshot({ path: 'C:/Users/kesha/.gemini/antigravity-ide/brain/2713dfa1-c42c-44c9-8c65-e35f40a09ccf/employee_workflow_verified.png' });

  // Switch to Admin
  await page.evaluate(() => {
    localStorage.setItem('flowsphere-auth-emp-id', 'Admin01');
    localStorage.setItem('flowsphere-is-authenticated', 'true');
  });
  await page.reload();
  await page.waitForTimeout(1000);

  // Navigate to Workflow in Admin
  await page.locator('header nav button').nth(2).click();
  await page.waitForTimeout(1200);

  // Admin screenshot
  await page.screenshot({ path: 'C:/Users/kesha/.gemini/antigravity-ide/brain/2713dfa1-c42c-44c9-8c65-e35f40a09ccf/admin_workflow_verified.png' });

  await browser.close();
  process.exit(0);
})();
