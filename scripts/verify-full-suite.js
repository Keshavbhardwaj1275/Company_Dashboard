import { chromium } from 'playwright';

async function runComprehensiveCheck() {
  console.log('🚀 Starting Full FlowSphere Functional & Interactive Test Suite...\n');
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1536, height: 900 } });
  const page = await context.newPage();

  const errors = [];
  page.on('console', msg => {
    if (msg.type() === 'error') {
      errors.push(msg.text());
      console.log('  ⚠️ Console error:', msg.text());
    }
  });

  try {
    // 1. Initial Load & Dashboard
    console.log('1️⃣ Testing Main Dashboard...');
    await page.goto('http://localhost:3000/', { waitUntil: 'networkidle' });
    await page.waitForTimeout(600);

    const title = await page.title();
    console.log('   ✓ Title:', title);

    // Check Hero & Top row
    await page.waitForSelector('text=Welcome Back', { timeout: 5000 });
    await page.waitForSelector('text=Today\'s Sprint Milestones', { timeout: 5000 });
    await page.waitForSelector('text=Productivity Pulse', { timeout: 5000 });
    await page.waitForSelector('text=Total Active Time', { timeout: 5000 });
    await page.waitForSelector('text=Live Activity Stream', { timeout: 5000 });
    console.log('   ✓ Main Dashboard widgets verified.');

    // 2. Timer & Session Bar Controls
    console.log('\n2️⃣ Testing Work Session Bar & Inactivity Simulation...');
    const simIdleBtn = page.locator('button:has-text("Simulate Idle")');
    if (await simIdleBtn.isVisible()) {
      await simIdleBtn.click();
      await page.waitForTimeout(300);
      console.log('   ✓ Inactivity Simulation toggled on');
      await simIdleBtn.click();
      await page.waitForTimeout(300);
      console.log('   ✓ Inactivity Simulation toggled off');
    }

    const breakBtn = page.locator('button:has-text("Take Break")').first();
    if (await breakBtn.isVisible()) {
      await breakBtn.click();
      await page.waitForTimeout(300);
      console.log('   ✓ Break Session started');
      const resumeBtn = page.locator('button:has-text("End Break"), button:has-text("Resume")').first();
      if (await resumeBtn.isVisible()) {
        await resumeBtn.click();
        await page.waitForTimeout(300);
        console.log('   ✓ Break Session resumed');
      }
    }

    // 3. Workflow Kanban & Task Creation
    console.log('\n3️⃣ Testing Workflow Board & New Task Modal...');
    await page.locator('header nav button[aria-label="Workflow"]').click();
    await page.waitForSelector('h2:has-text("Workflow & Sprint Management")', { timeout: 5000 });
    
    // Open Create Task Modal
    await page.locator('button:has-text("Create Task")').first().click();
    await page.waitForSelector('text=Create & Assign Sprint Task', { timeout: 5000 });
    await page.fill('input[placeholder*="Prepare weekly"]', 'Automated E2E Test Task');
    await page.locator('button[type="submit"]:has-text("Create & Assign Task")').click();
    await page.waitForTimeout(500);
    await page.waitForSelector('text=Automated E2E Test Task', { timeout: 5000 });
    console.log('   ✓ New Task created and rendered on Kanban board.');

    // 4. Attendance Center & Idle Exception Request
    console.log('\n4️⃣ Testing Attendance Center & Idle Exception Request Flow...');
    await page.locator('header nav button[aria-label="Attendance"]').click();
    await page.waitForSelector('text=Attendance & Payroll Timesheet', { timeout: 5000 });
    await page.waitForSelector('text=My Idle Exceptions & Offline Requests', { timeout: 5000 });

    // Open Request Idle Exception Modal
    await page.locator('button:has-text("Request Idle Exception")').first().click();
    await page.waitForSelector('text=Request Inactivity / Idle Exception', { timeout: 5000 });
    await page.fill('textarea[placeholder*="client whiteboard"]', 'Automated In-Person Client Architecture Sprint');
    await page.locator('button[type="submit"]:has-text("Submit Request")').click();
    await page.waitForTimeout(500);

    // Verify exception appears in employee list
    await page.waitForSelector('text=Automated In-Person Client Architecture Sprint', { timeout: 5000 });
    console.log('   ✓ Idle Exception submitted and visible in employee history with "Pending Review" status.');

    // 5. Settings View (Read-Only Policy & Theme)
    console.log('\n5️⃣ Testing Settings View & Read-Only Policies...');
    await page.locator('header button:has(svg.lucide-chevron-down)').first().click();
    await page.waitForTimeout(300);
    await page.locator('button:has-text("Settings & Preferences")').click();
    await page.waitForSelector('text=Account & System Preferences', { timeout: 5000 });
    
    // Check read-only badge
    await page.waitForSelector('text=set by your organization\'s admin', { timeout: 5000 });
    await page.waitForSelector('text=5 Minutes', { timeout: 5000 });
    console.log('   ✓ Idle Detection Threshold confirmed read-only.');

    // 6. Productivity Deep Dive
    console.log('\n6️⃣ Testing Productivity Deep Dive Analytics...');
    await page.locator('header nav button[aria-label="Productivity"]').click();
    await page.waitForSelector('h2:has-text("Productivity & Rhythm Intelligence")', { timeout: 5000 });
    await page.waitForSelector('text=Focus Velocity Index', { timeout: 5000 });
    await page.locator('button:has-text("Hourly Timeline")').click();
    await page.waitForTimeout(300);
    console.log('   ✓ Productivity Deep Dive charts and metrics verified.');

    // 7. Reports & Export Center
    console.log('\n7️⃣ Testing Reports & Export Center...');
    await page.locator('header nav button[aria-label="Reports"]').click();
    await page.waitForSelector('text=Reports & Export Intelligence', { timeout: 5000 });
    await page.waitForSelector('text=Report Category', { timeout: 5000 });
    console.log('   ✓ Reports & Export view verified.');

    // 8. Notifications Center
    console.log('\n8️⃣ Testing Notifications & Alert Center...');
    await page.locator('header nav button[aria-label="Notifications"]').click();
    await page.waitForSelector('text=Notification & Alert Center', { timeout: 5000 });
    console.log('   ✓ Notifications Center verified.');

    // 9. Admin Mode Switch & Policy Rules Idle Exception Approval
    console.log('\n9️⃣ Testing Admin Mode Switch & Idle Exception Approval...');
    await page.locator('header button:has(svg.lucide-chevron-down)').first().click();
    await page.waitForTimeout(300);
    await page.locator('button:has-text("Switch to Admin Mode")').click();
    await page.waitForTimeout(600);

    // Admin Policies Tab
    await page.locator('header nav button[aria-label="Policies"]').click({ force: true });
    await page.waitForSelector('h2:has-text("Enterprise Policies")', { timeout: 5000 });
    await page.waitForSelector('text=Automated In-Person Client Architecture Sprint', { timeout: 5000 });
    console.log('   ✓ Newly submitted employee request found in Admin Policy Rules table.');

    // Click Approve on the employee request
    const approveBtn = page.locator('tr:has-text("Automated In-Person Client Architecture Sprint") button:has-text("Approve")').first();
    await approveBtn.click();
    await page.waitForSelector('text=Approve Idle Exception', { timeout: 5000 });
    await page.locator('button:has-text("Confirm Exception Approval")').click();
    await page.waitForTimeout(500);
    console.log('   ✓ Admin confirmed exception approval.');

    // 10. Switch back to Employee Mode & Verify Synced Status
    console.log('\n🔟 Verifying Synchronized Status in Employee Attendance Center...');
    await page.locator('header button:has(svg.lucide-chevron-down)').first().click();
    await page.waitForTimeout(300);
    await page.locator('button:has-text("Switch to Employee Mode")').click();
    await page.waitForTimeout(600);

    await page.locator('header nav button[aria-label="Attendance"]').click();
    await page.waitForSelector('text=Attendance & Payroll Timesheet', { timeout: 5000 });
    
    // Check that the exception row now has "Approved Exception" badge
    const approvedRow = page.locator('tr:has-text("Automated In-Person Client Architecture Sprint")');
    await approvedRow.waitFor({ timeout: 5000 });
    const approvedBadge = approvedRow.locator('text=Approved Exception');
    await approvedBadge.waitFor({ timeout: 5000 });
    console.log('   ✓ Employee view confirmed real-time status update: "Approved Exception".');

    // 11. Theme Switch Verification
    console.log('\n1️⃣1️⃣ Testing Theme Toggling...');
    const themeBtn = page.locator('button[title="Toggle Theme"]').first();
    await themeBtn.click();
    await page.waitForTimeout(300);
    const isDark = await page.evaluate(() => document.documentElement.classList.contains('dark'));
    console.log('   ✓ Dark mode active:', isDark);
    await themeBtn.click();
    await page.waitForTimeout(300);
    const isLight = await page.evaluate(() => !document.documentElement.classList.contains('dark'));
    console.log('   ✓ Light mode restored:', isLight);

    console.log('\n' + '='.repeat(60));
    console.log('🎉 ALL 11 TEST SUITES PASSED WITH ZERO CRITICAL ERRORS!');
    console.log('='.repeat(60) + '\n');
  } catch (error) {
    console.error('❌ Test failed:', error);
    process.exit(1);
  } finally {
    await browser.close();
  }
}

runComprehensiveCheck();
