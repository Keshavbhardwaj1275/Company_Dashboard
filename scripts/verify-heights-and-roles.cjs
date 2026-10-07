const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1540, height: 900 } });

  // 1. Open app and authenticate as Employee (Virat Sharma FS-1001)
  await page.goto('http://localhost:3000/');
  await page.evaluate(() => {
    localStorage.setItem('flowsphere-is-authenticated', 'true');
    localStorage.setItem('flowsphere-auth-emp-id', 'FS-1001');
  });
  await page.reload();
  await page.waitForTimeout(1000);

  // Navigate to Workflow
  await page.locator('button[aria-label="Workflow"], button[title="Workflow"]').first().click();
  await page.waitForTimeout(1200);

  // 2. Measure heights with exact requested snippet
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

  // Check buttons on Employee Pending Approval Card
  const pendingWell = page.locator('.glass-inner').nth(2);
  const empApproveCount = await pendingWell.locator('button:has-text("Approve")').count();
  const empRejectCount = await pendingWell.locator('button:has-text("Reject")').count();
  const empWithdrawCount = await pendingWell.locator('button:has-text("Withdraw")').count();
  console.log('EMPLOYEE_BUTTONS_CHECK:', {
    approveCount: empApproveCount,
    rejectCount: empRejectCount,
    withdrawCount: empWithdrawCount
  });

  // Save screenshot of Employee view
  await page.screenshot({ path: 'C:/Users/kesha/.gemini/antigravity-ide/brain/2713dfa1-c42c-44c9-8c65-e35f40a09ccf/employee_workflow_verified.png' });

  // 3. Switch to Admin (Admin01)
  await page.evaluate(() => {
    localStorage.setItem('flowsphere-auth-emp-id', 'Admin01');
    localStorage.setItem('flowsphere-is-authenticated', 'true');
  });
  await page.reload();
  await page.waitForTimeout(1200);

  // Navigate to Workflow (as Admin, workflow tab is admin-workflow or workflow)
  const adminWorkflowBtn = page.locator('button[aria-label="Workflow"], button[title="Workflow"]').first();
  await adminWorkflowBtn.click();
  await page.waitForTimeout(1200);

  // Save screenshot of Admin view
  await page.screenshot({ path: 'C:/Users/kesha/.gemini/antigravity-ide/brain/2713dfa1-c42c-44c9-8c65-e35f40a09ccf/admin_workflow_verified.png' });

  await browser.close();
  process.exit(0);
})();
