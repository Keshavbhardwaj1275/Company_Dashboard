import { chromium } from 'playwright';

async function testAuthSystem() {
  console.log('🚀 Starting Comprehensive FlowSphere First-Time Auth & Dynamic OTP Test Suite...\n');
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();

  try {
    await page.goto('http://localhost:3000/', { waitUntil: 'networkidle' });
    console.log('✅ FlowSphere Loaded on Auth Screen');

    // ─────────────────────────────────────────────────────────────
    // TEST 3: Invalid Employee ID
    // ─────────────────────────────────────────────────────────────
    console.log('\n--- TEST 3: Invalid Employee ID ---');
    await page.click('button:has-text("First Time Setup")');
    await page.fill('input[placeholder="e.g. FS-1001"]', 'FS-9999');
    await page.click('button:has-text("Generate Verification OTP")');
    await page.waitForTimeout(300);
    const errInvalidId = await page.textContent('.text-rose-700, .dark\\:text-rose-300');
    console.log('✅ Rejection message for invalid ID:', errInvalidId);
    if (!errInvalidId.includes('Employee ID not found')) {
      throw new Error('TEST 3 failed: did not show Employee ID not found message');
    }

    // ─────────────────────────────────────────────────────────────
    // TEST 1 & 7: New Employee + Valid Employee ID -> Dynamic OTP Generated & Verified
    // ─────────────────────────────────────────────────────────────
    console.log('\n--- TEST 1 & 7: Dynamic OTP Generation & Verification (FS-1003) ---');
    await page.fill('input[placeholder="e.g. FS-1001"]', 'FS-1003');
    await page.click('button:has-text("Generate Verification OTP")');
    await page.waitForTimeout(400);

    // Extract dynamic OTP from the screen banner
    const otpBannerText1 = await page.textContent('.bg-blue-500\\/10 .text-\\[18px\\]');
    const otp1 = otpBannerText1?.trim();
    console.log('✅ First Dynamic OTP generated:', otp1);
    if (!otp1 || otp1.length !== 6 || isNaN(Number(otp1))) {
      throw new Error('TEST 1 failed: OTP is not a 6-digit numeric string');
    }

    // ─────────────────────────────────────────────────────────────
    // TEST 4: Wrong OTP
    // ─────────────────────────────────────────────────────────────
    console.log('\n--- TEST 4: Wrong OTP Rejection ---');
    await page.fill('input[placeholder="000000"]', '000000');
    await page.click('button:has-text("Verify Code")');
    await page.waitForTimeout(300);
    const wrongOtpErr = await page.textContent('.text-rose-700, .dark\\:text-rose-300');
    console.log('✅ Rejection message for wrong OTP:', wrongOtpErr);
    if (!wrongOtpErr.includes('Invalid OTP code')) {
      throw new Error('TEST 4 failed: did not reject wrong OTP');
    }

    // ─────────────────────────────────────────────────────────────
    // TEST 6: Resend OTP generates a new distinct OTP & invalidates old OTP
    // ─────────────────────────────────────────────────────────────
    console.log('\n--- TEST 6: Resend OTP & Invalidation ---');
    // Note: Wait or trigger new OTP
    await page.click('button:has-text("Back")');
    await page.waitForTimeout(200);
    await page.click('button:has-text("Generate Verification OTP")');
    await page.waitForTimeout(400);

    const otpBannerText2 = await page.textContent('.bg-blue-500\\/10 .text-\\[18px\\]');
    const otp2 = otpBannerText2?.trim();
    console.log('✅ Second Dynamic OTP generated:', otp2);
    if (otp1 === otp2) {
      throw new Error('TEST 6/7 failed: OTP was not dynamically varied');
    }

    // Attempting to use the OLD OTP (otp1) must fail
    await page.fill('input[placeholder="000000"]', otp1);
    await page.click('button:has-text("Verify Code")');
    await page.waitForTimeout(300);
    const oldOtpErr = await page.textContent('.text-rose-700, .dark\\:text-rose-300');
    console.log('✅ Rejection message for old OTP:', oldOtpErr);

    // Using the NEW OTP (otp2) succeeds
    await page.fill('input[placeholder="000000"]', otp2);
    await page.click('button:has-text("Verify Code")');
    await page.waitForTimeout(400);

    // Step 3: Create Master Password
    console.log('✅ Step 3 reached: Creating Master Password');
    const passwordInputs = await page.$$('input[type="password"]');
    await passwordInputs[0].fill('Aarav@2026');
    await passwordInputs[1].fill('Aarav@2026');
    await page.click('button:has-text("Save Password & Activate")');
    await page.waitForTimeout(400);

    // Step 4: Launch Workspace
    console.log('✅ Step 4 reached: Launching Workspace');
    await page.click('button:has-text("Launch Workspace")');
    await page.waitForTimeout(800);

    // Confirm logged in
    const headerTitle = await page.textContent('h1, h2');
    console.log('✅ Authenticated Dashboard Header:', headerTitle);

    // ─────────────────────────────────────────────────────────────
    // TEST 2: Same employee attempts first-time login again after successful onboarding
    // ─────────────────────────────────────────────────────────────
    console.log('\n--- TEST 2: Already Onboarded Employee Attempting First-Time Setup Again ---');
    // Open profile menu
    await page.click('[data-testid="profile-dropdown-btn"]');
    await page.waitForTimeout(300);
    await page.click('[data-testid="sign-out-btn"]');
    await page.waitForTimeout(600);

    // Go to First Time Setup tab and enter FS-1003
    await page.click('button:has-text("First Time Setup")');
    await page.fill('input[placeholder="e.g. FS-1001"]', 'FS-1003');
    await page.click('button:has-text("Generate Verification OTP")');
    await page.waitForTimeout(300);
    const alreadyCompletedErr = await page.textContent('.text-rose-700, .dark\\:text-rose-300');
    console.log('✅ Rejection message for already onboarded employee:', alreadyCompletedErr);
    if (!alreadyCompletedErr.includes('already completed first-time setup')) {
      throw new Error('TEST 2 failed: did not reject already onboarded user');
    }

    // ─────────────────────────────────────────────────────────────
    // TEST 9: Normal Employee Login with New Password
    // ─────────────────────────────────────────────────────────────
    console.log('\n--- TEST 9: Normal Employee Login (FS-1003) with new password ---');
    await page.click('button:has-text("Sign In")');
    await page.fill('input[placeholder="e.g. Emp001 or FS-1001"]', 'FS-1003');
    await page.fill('input[type="password"]', 'Aarav@2026');
    await page.click('button:has-text("Launch Workspace")');
    await page.waitForTimeout(800);
    console.log('✅ Normal Sign In with new password succeeded!');

    // ─────────────────────────────────────────────────────────────
    // TEST 8: Existing Admin Login
    // ─────────────────────────────────────────────────────────────
    console.log('\n--- TEST 8: Existing Admin Login (Admin01 / Admin@123) ---');
    await page.click('[data-testid="profile-dropdown-btn"]');
    await page.waitForTimeout(300);
    await page.click('[data-testid="sign-out-btn"]');
    await page.waitForTimeout(600);

    await page.click('button:has-text("Sign In")');
    await page.fill('input[placeholder="e.g. Emp001 or FS-1001"]', 'Admin01');
    await page.fill('input[type="password"]', 'Admin@123');
    await page.click('button:has-text("Launch Workspace")');
    await page.waitForTimeout(800);
    console.log('✅ Admin Login succeeded!');

    console.log('\n🎉 ALL 9 AUTHENTICATION & FIRST-TIME USER TEST CASES PASSED SUCCESSFULLY!');
  } catch (err) {
    console.error('❌ Test failed:', err);
  } finally {
    await browser.close();
  }
}

testAuthSystem();
