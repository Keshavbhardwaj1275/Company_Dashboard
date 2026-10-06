import { chromium } from 'playwright';

async function testProductivityPulse() {
  console.log('🚀 Starting Comprehensive FlowSphere Productivity Pulse Test Suite...\n');
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();

  try {
    // 1. Open Employee Dashboard
    await page.goto('http://localhost:3000/', { waitUntil: 'networkidle' });
    console.log('✅ FlowSphere Loaded on Employee Dashboard');
    await page.waitForTimeout(600);

    // 2. Check initial Productivity Pulse telemetry status
    const cardTitle = await page.textContent('h3:has-text("Productivity Pulse")');
    console.log('✅ Productivity Pulse rendered:', cardTitle);

    let coreHoursText = await page.textContent('.grid-cols-3 > div:nth-child(1) span:nth-child(2)');
    let idleLimitText = await page.textContent('.grid-cols-3 > div:nth-child(2) span:nth-child(2)');
    let breakTargetText = await page.textContent('.grid-cols-3 > div:nth-child(3) span:nth-child(2)');

    console.log(`   Initial Status: Core Hours="${coreHoursText}", Idle Limit="${idleLimitText}", Break Target="${breakTargetText}"`);
    if (coreHoursText !== 'Active' || breakTargetText !== 'Optimal') {
      throw new Error(`Unexpected initial state: Core=${coreHoursText}, Break=${breakTargetText}`);
    }

    // 3. Test "Take Break" interaction
    console.log('⏳ Clicking "Take Break"...');
    await page.click('#btn-quick-toggle-break');
    await page.waitForTimeout(600);

    // Verify button text changed to "Resume Work"
    const breakBtnText = await page.textContent('#btn-quick-toggle-break');
    console.log('✅ Break Button text updated to:', breakBtnText.trim());
    if (!breakBtnText.includes('Resume Work')) {
      throw new Error('Break button did not change to Resume Work');
    }

    // Verify Telemetry updated immediately
    coreHoursText = await page.textContent('.grid-cols-3 > div:nth-child(1) span:nth-child(2)');
    breakTargetText = await page.textContent('.grid-cols-3 > div:nth-child(3) span:nth-child(2)');
    console.log(`✅ On-Break Telemetry Verified: Core Hours="${coreHoursText}", Break Target="${breakTargetText}"`);
    if (coreHoursText !== 'On Break' || breakTargetText !== 'In Progress') {
      throw new Error(`On-Break state failed: Core=${coreHoursText}, Break=${breakTargetText}`);
    }

    // 4. Test "Resume Work" interaction
    console.log('⏳ Clicking "Resume Work"...');
    await page.click('#btn-quick-toggle-break');
    await page.waitForTimeout(600);

    // Verify Telemetry restored to Active
    coreHoursText = await page.textContent('.grid-cols-3 > div:nth-child(1) span:nth-child(2)');
    breakTargetText = await page.textContent('.grid-cols-3 > div:nth-child(3) span:nth-child(2)');
    console.log(`✅ Resumed Telemetry Verified: Core Hours="${coreHoursText}", Break Target="${breakTargetText}"`);
    if (coreHoursText !== 'Active' || (breakTargetText !== 'Optimal' && breakTargetText !== 'Target Reached')) {
      throw new Error(`Resumed state failed: Core=${coreHoursText}, Break=${breakTargetText}`);
    }

    // 5. Test Simulate Idle interaction
    console.log('⏳ Testing Inactivity / Idle telemetry...');
    await page.click('button:has-text("Simulate Idle")');
    await page.waitForTimeout(600);

    coreHoursText = await page.textContent('.grid-cols-3 > div:nth-child(1) span:nth-child(2)');
    console.log(`✅ Idle Telemetry Verified: Core Hours="${coreHoursText}"`);
    if (coreHoursText !== 'Idle') {
      throw new Error(`Idle state failed: Core=${coreHoursText}`);
    }

    // Wake up
    await page.click('button:has-text("Wake Up (Active)")');
    await page.waitForTimeout(400);

    console.log('\n=============================================================');
    console.log('🏆 100% PASS: ALL PRODUCTIVITY PULSE INTERACTIONS VERIFIED!');
    console.log('=============================================================\n');

  } catch (err) {
    console.error('❌ Productivity Pulse test failed:', err);
    process.exit(1);
  } finally {
    await browser.close();
  }
}

testProductivityPulse();
