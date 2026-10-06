import { chromium } from 'playwright';

async function testMultiEmployeeDataMapping() {
  console.log('🚀 Starting Comprehensive Multi-Employee Data Mapping Test Suite...\n');
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();

  const testAccounts = [
    {
      loginId: 'FS-1001',
      password: 'Pass@123',
      expectedName: 'Virat Sharma',
      expectedFirstName: 'Virat',
      expectedEmail: 'virat.s@flowsphere.internal',
      expectedRole: 'Senior Frontend Architect',
      expectedDept: 'Engineering',
    },
    {
      loginId: 'FS-1003',
      password: 'Pass@123',
      expectedName: 'Aarav Sharma',
      expectedFirstName: 'Aarav',
      expectedEmail: 'aarav.s@flowsphere.internal',
      expectedRole: 'Backend Platform Specialist',
      expectedDept: 'Engineering',
    },
    {
      loginId: 'FS-1004',
      password: 'Pass@123',
      expectedName: 'Priya Singh',
      expectedFirstName: 'Priya',
      expectedEmail: 'priya.s@flowsphere.internal',
      expectedRole: 'Principal Product Designer',
      expectedDept: 'Design',
    },
    {
      loginId: 'FS-1002',
      password: 'Admin@123',
      expectedName: 'Samta Tanwar',
      expectedFirstName: 'Samta',
      expectedEmail: 'samta.t@flowsphere.internal',
      expectedRole: 'Lead Full-Stack Engineer',
      expectedDept: 'Engineering',
    },
  ];

  try {
    for (let i = 0; i < testAccounts.length; i++) {
      const acc = testAccounts[i];
      console.log(`\n======================================================`);
      console.log(`Testing Employee ${i + 1}: ${acc.expectedName} (${acc.loginId})`);
      console.log(`======================================================`);

      await page.goto('http://localhost:3000/', { waitUntil: 'networkidle' });
      await page.waitForTimeout(400);

      // Sign in with credentials
      await page.fill('input[placeholder="e.g. Emp001 or FS-1001"]', acc.loginId);
      await page.fill('input[type="password"]', acc.password);
      await page.click('button:has-text("Launch Workspace")');
      await page.waitForTimeout(600);

      // 1. Check Header Greeting on Dashboard (for employees)
      if (acc.loginId !== 'FS-1002') {
        const greetingText = await page.textContent('h1:has-text("Welcome Back")');
        console.log(`✅ Header Greeting: "${greetingText}"`);
        if (!greetingText.includes(acc.expectedFirstName)) {
          throw new Error(`FAIL: Expected greeting to contain "${acc.expectedFirstName}", got "${greetingText}"`);
        }
      }

      // 2. Open Profile Dropdown & Check User Profile Details
      await page.click('[data-testid="profile-dropdown-btn"]');
      await page.waitForTimeout(300);

      const dropdownName = await page.textContent('.absolute.right-0 .text-\\[13px\\].font-bold');
      const dropdownEmail = await page.textContent('.absolute.right-0 .text-\\[11\\.5px\\]');
      console.log(`✅ Dropdown Profile Name: "${dropdownName}"`);
      console.log(`✅ Dropdown Profile Email: "${dropdownEmail}"`);

      if (dropdownName?.trim() !== acc.expectedName) {
        throw new Error(`FAIL: Expected profile name "${acc.expectedName}", got "${dropdownName}"`);
      }
      if (dropdownEmail?.trim() !== acc.expectedEmail) {
        throw new Error(`FAIL: Expected profile email "${acc.expectedEmail}", got "${dropdownEmail}"`);
      }

      // 3. Refresh Page & Verify Identity Persistence
      console.log(`🔄 Reloading page to verify authentication persistence...`);
      await page.reload({ waitUntil: 'networkidle' });
      await page.waitForTimeout(500);

      await page.click('[data-testid="profile-dropdown-btn"]');
      await page.waitForTimeout(300);
      const reloadedName = await page.textContent('.absolute.right-0 .text-\\[13px\\].font-bold');
      console.log(`✅ Post-Reload Profile Name: "${reloadedName}"`);
      if (reloadedName?.trim() !== acc.expectedName) {
        throw new Error(`FAIL: After reload expected "${acc.expectedName}", got "${reloadedName}"`);
      }

      // 4. Sign Out Cleanly
      await page.click('[data-testid="sign-out-btn"]');
      await page.waitForTimeout(500);
      console.log(`✅ Successfully signed out ${acc.expectedName}`);
    }

    console.log('\n🎉 ALL MULTI-EMPLOYEE DATA MAPPING TESTS PASSED FLAWLESSLY!');
  } catch (err) {
    console.error('❌ Test failed:', err);
  } finally {
    await browser.close();
  }
}

testMultiEmployeeDataMapping();
