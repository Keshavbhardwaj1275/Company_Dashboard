import { chromium } from 'playwright';

async function testPolicies() {
  console.log('🚀 Starting Comprehensive FlowSphere Enterprise Policies Test Suite...\n');
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();

  try {
    // 1. Open App
    await page.goto('http://localhost:3000/', { waitUntil: 'networkidle' });
    console.log('✅ FlowSphere Loaded');

    // 2. Switch to Admin Mode
    await page.locator('header button:has(svg.lucide-chevron-down)').click();
    await page.waitForTimeout(300);
    await page.locator('button:has-text("Switch to Admin Mode")').click();
    await page.waitForTimeout(500);
    console.log('✅ Switched to Admin Role');

    // 3. Open Policies Tab
    await page.locator('header nav button[aria-label="Policies"]').click({ force: true });
    await page.waitForTimeout(500);

    const title = await page.textContent('h2');
    console.log('✅ Page Title:', title);
    if (!title.includes('Enterprise Policies')) throw new Error('Policies page did not open');

    // 4. Check initial default values
    const shiftInput = page.locator('#input-shift-hours');
    const idleInput = page.locator('#input-allowed-idle');
    const triggerSelect = page.locator('#select-idle-trigger');
    const graceSelect = page.locator('#select-grace-period');

    console.log('   Initial Shift Hours:', await shiftInput.inputValue());
    console.log('   Initial Allowed Idle:', await idleInput.inputValue());
    console.log('   Initial Idle Trigger:', await triggerSelect.inputValue());
    console.log('   Initial Grace Period:', await graceSelect.inputValue());

    // 5. Change values & verify unsaved changes indicator
    await shiftInput.fill('9');
    await idleInput.fill('60');
    await triggerSelect.selectOption('10');
    await graceSelect.selectOption('30');
    await page.waitForTimeout(300);

    const unsavedBadge = page.locator('text=Unsaved changes');
    const isUnsavedVisible = await unsavedBadge.isVisible();
    console.log('✅ Unsaved changes indicator visible:', isUnsavedVisible);
    if (!isUnsavedVisible) throw new Error('Unsaved changes indicator not visible');

    // 6. Verify Dynamic Formula Card text
    const rightCardText = await page.locator('.lg\\:col-span-4').textContent();
    console.log('   Dynamic Formula content verified:');
    if (!rightCardText.includes('9') || !rightCardText.includes('60') || !rightCardText.includes('10') || !rightCardText.includes('30')) {
      throw new Error('Formula card did not dynamically update values');
    }
    console.log('✅ Formula card dynamically updated with live form values');

    // 7. Click Save Rules
    await page.click('#btn-save-policy-rules');
    await page.waitForTimeout(600);
    console.log('✅ Policy Rules Saved');

    // 8. Test Persistence via Page Reload
    await page.reload({ waitUntil: 'networkidle' });
    await page.waitForTimeout(800);

    // Switch to Admin & Navigate to Policies again
    await page.locator('header button:has(svg.lucide-chevron-down)').click();
    await page.waitForTimeout(300);
    await page.locator('button:has-text("Switch to Admin Mode")').click();
    await page.waitForTimeout(500);
    await page.locator('header nav button[aria-label="Policies"]').click({ force: true });
    await page.waitForTimeout(500);

    const reloadedShift = await page.locator('#input-shift-hours').inputValue();
    const reloadedIdle = await page.locator('#input-allowed-idle').inputValue();
    console.log(`✅ Persisted Values Verified after reload: Shift=${reloadedShift}h, Idle=${reloadedIdle}m`);
    if (reloadedShift !== '9' || reloadedIdle !== '60') {
      throw new Error(`Persistence failed: expected 9 and 60, got ${reloadedShift} and ${reloadedIdle}`);
    }

    // 9. Test Invalid Validation (Shift = 30)
    await page.locator('#input-shift-hours').fill('30');
    await page.waitForTimeout(200);
    const shiftError = await page.textContent('text=Daily shift duration must be between 1 and 24 hours.');
    const isSaveDisabled = await page.locator('#btn-save-policy-rules').isDisabled();
    console.log('✅ Validation Error Shown on Invalid Shift (30h):', shiftError.trim());
    console.log('✅ Save Rules Disabled during validation error:', isSaveDisabled);
    if (!isSaveDisabled) throw new Error('Save button should be disabled when validation fails');

    // 10. Test Reset to Defaults
    await page.click('#btn-reset-policy-defaults');
    await page.waitForTimeout(300);
    const resetShift = await page.locator('#input-shift-hours').inputValue();
    const resetIdle = await page.locator('#input-allowed-idle').inputValue();
    console.log(`✅ Reset Defaults Verified: Shift=${resetShift}h, Idle=${resetIdle}m`);
    if (resetShift !== '8.5' || resetIdle !== '45') {
      throw new Error(`Reset failed: expected 8.5 and 45, got ${resetShift} and ${resetIdle}`);
    }

    console.log('\n=============================================================');
    console.log('🏆 100% PASS: ALL ENTERPRISE POLICIES INTERACTIONS VERIFIED!');
    console.log('=============================================================\n');

  } catch (err) {
    console.error('❌ Policy test failed:', err);
    process.exit(1);
  } finally {
    await browser.close();
  }
}

testPolicies();
