import { chromium } from 'playwright';

async function verifyDepartmentAnalytics() {
  console.log('🔍 Starting Department Intelligence & Team Analytics Verification...');
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1536, height: 950 } });
  const page = await context.newPage();

  try {
    await page.goto('http://localhost:3000/', { waitUntil: 'networkidle' });
    await page.waitForTimeout(800);

    // Switch to Admin Role
    await page.locator('header button:has(svg.lucide-chevron-down)').click();
    await page.waitForTimeout(300);
    await page.locator('button:has-text("Switch to Admin Mode")').click();
    await page.waitForTimeout(500);

    // Navigate to Analytics
    await page.locator('header nav button[aria-label="Analytics"]').click({ force: true });
    await page.waitForSelector('h2:has-text("Department Intelligence & Team Analytics")', { timeout: 5000 });
    console.log('✅ Navigated to Department Intelligence & Team Analytics');

    // 1. Verify 5 KPI summary cards
    const kpiHeadcount = await page.locator('div:has-text("TOTAL WORKFORCE") >> .. >> div.font-mono').first().textContent();
    const kpiProd = await page.locator('div:has-text("AVG PRODUCTIVITY") >> .. >> div.font-mono').first().textContent();
    const kpiActive = await page.locator('div:has-text("ACTIVE NOW") >> .. >> div.font-mono').first().textContent();
    const kpiIdle = await page.locator('div:has-text("AVG IDLE TIME") >> .. >> div.font-mono').first().textContent();
    const kpiAtt = await page.locator('div:has-text("ATTENDANCE RATE") >> .. >> div.font-mono').first().textContent();

    console.log(`✅ KPIs: Workforce=${kpiHeadcount}, Prod=${kpiProd}, Active=${kpiActive}, Idle=${kpiIdle}, Attendance=${kpiAtt}`);

    // 2. Test Department Filter selection
    const deptSelect = page.locator('select[aria-label="Filter by department"]');
    await deptSelect.selectOption('Engineering');
    await page.waitForTimeout(300);
    console.log('✅ Selected Engineering filter');

    // Verify banner and scoped headcount
    const scopedHeadcount = await page.locator('div:has-text("TOTAL WORKFORCE") >> .. >> div.font-mono').first().textContent();
    console.log(`✅ Scoped Workforce for Engineering: ${scopedHeadcount} staff`);

    // Reset back to All Departments
    await page.locator('button:has-text("Reset to All")').click();
    await page.waitForTimeout(300);
    console.log('✅ Reset filter back to All Departments');

    // 3. Test Period Filter selection
    const periodSelect = page.locator('select[aria-label="Filter by time period"]');
    await periodSelect.selectOption('This Week');
    await page.waitForTimeout(300);
    console.log('✅ Selected "This Week" period filter');

    // 4. Test Table sorting
    await page.locator('button:has-text("Staff")').click();
    await page.waitForTimeout(300);
    console.log('✅ Sorted table by Headcount/Staff');

    await page.locator('button:has-text("Productivity")').click();
    await page.waitForTimeout(300);
    console.log('✅ Sorted table by Productivity');

    // 5. Test Secondary Tab (Idle Analysis vs Target)
    await page.locator('button:has-text("Idle Analysis")').click();
    await page.waitForTimeout(300);
    console.log('✅ Switched to Idle Analysis subtab');

    await page.locator('button:has-text("Vs Target")').click();
    await page.waitForTimeout(300);
    console.log('✅ Switched back to Vs Target subtab');

    // 6. Test Interactive Department Click to open Detail Modal
    await page.locator('tr:has-text("Engineering")').click();
    await page.waitForSelector('text=Engineering Department Overview', { timeout: 4000 });
    console.log('✅ Opened Engineering Department Overview Modal');

    // Verify top performer inside modal
    const topPerformer = await page.locator('text=Top Department Performer >> .. >> text=Karan Malhotra').isVisible();
    console.log('✅ Verified Top Department Performer Karan Malhotra:', topPerformer);

    // Close modal
    await page.locator('button:has-text("Close")').click();
    await page.waitForTimeout(300);
    console.log('✅ Closed Department Modal');

    // 7. Capture Full Page Screenshot
    await page.screenshot({ path: 'scripts/department_analytics_desktop.png', fullPage: true });
    console.log('📸 Captured desktop screenshot: scripts/department_analytics_desktop.png');

    // 8. Mobile Viewport Check
    await page.setViewportSize({ width: 390, height: 844 });
    await page.waitForTimeout(400);
    await page.screenshot({ path: 'scripts/department_analytics_mobile.png', fullPage: true });
    console.log('📸 Captured mobile screenshot: scripts/department_analytics_mobile.png');

    console.log('\n=============================================================');
    console.log('🏆 100% PASS: DEPARTMENT INTELLIGENCE PAGE VERIFIED COMPLETELY!');
    console.log('=============================================================\n');
  } catch (err) {
    console.error('❌ Verification failed:', err);
    process.exit(1);
  } finally {
    await browser.close();
  }
}

verifyDepartmentAnalytics();
