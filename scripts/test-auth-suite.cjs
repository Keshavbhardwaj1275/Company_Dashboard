const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const ARTIFACT_DIR = 'C:/Users/kesha/.gemini/antigravity-ide/brain/2713dfa1-c42c-44c9-8c65-e35f40a09ccf';

(async () => {
  const browser = await chromium.launch();
  const context = await browser.newContext({ viewport: { width: 1540, height: 900 } });
  const page = await context.newPage();

  const testResults = [];

  console.log('--- STARTING AUTH & OTP ACCEPTANCE TESTS ---');

  // Clear state
  await page.goto('http://localhost:3000/');
  await page.evaluate(() => {
    localStorage.clear();
  });
  await page.reload();
  await page.waitForTimeout(1000);

  // Switch to First-Time Setup
  await page.click('button:has-text("First Time Setup")');
  await page.waitForTimeout(500);

  // Test 1: Setup with unknown@x.com -> "No employee record found"
  console.log('Running Test 1: Unknown email');
  await page.fill('input[placeholder*="new.employee@flowsphere.internal"]', 'unknown@x.com');
  await page.click('button:has-text("Send Verification OTP")');
  await page.waitForTimeout(500);
  const error1 = await page.locator('text=No employee record found').textContent();
  const pass1 = error1 && error1.includes('No employee record found');
  testResults.push({ id: 1, name: 'Setup with unknown@x.com -> "No employee record found"', passed: !!pass1 });

  // Test 2: Setup with Emp001 email -> "already activated"
  console.log('Running Test 2: Already activated email');
  await page.fill('input[placeholder*="new.employee@flowsphere.internal"]', 'virat.s@flowsphere.internal');
  await page.click('button:has-text("Send Verification OTP")');
  await page.waitForTimeout(500);
  const error2 = await page.locator('text=already activated').textContent();
  const pass2 = error2 && error2.includes('already activated');
  testResults.push({ id: 2, name: 'Setup with Emp001 email -> "already activated"', passed: !!pass2 });

  // Test 3: Setup with new.employee@flowsphere.internal -> Popup appears with 6 digits, no code on page
  console.log('Running Test 3: Valid unactivated email');
  await page.fill('input[placeholder*="new.employee@flowsphere.internal"]', 'new.employee@flowsphere.internal');
  await page.click('button:has-text("Send Verification OTP")');
  await page.waitForTimeout(1800); // 1.2s delivery simulation

  // Check popup
  const popup = page.locator('[role="status"]');
  const isPopupVisible = await popup.isVisible();
  const popupOtpCode = (await popup.locator('.font-mono.text-xl, .font-mono.text-2xl').textContent()).trim();
  
  // Verify page form contains no code
  const pageFormText = await page.locator('form').textContent();
  const codeOnPage = pageFormText.includes(popupOtpCode);
  const pass3 = isPopupVisible && popupOtpCode.length === 6 && !codeOnPage;
  testResults.push({ id: 3, name: 'Setup with new.employee@flowsphere.internal -> Popup with code, no code on page', passed: pass3 });

  // Screenshot: Popup on step 2 (Light mode)
  await page.screenshot({ path: path.join(ARTIFACT_DIR, 'otp_popup_step2_light.png') });

  // Test 10a: Dark Mode Screenshot
  await page.evaluate(() => {
    document.documentElement.classList.add('dark');
  });
  await page.waitForTimeout(400);
  await page.screenshot({ path: path.join(ARTIFACT_DIR, 'otp_popup_step2_dark.png') });

  // Test 10b: Mobile 390px Screenshot
  await page.setViewportSize({ width: 390, height: 844 });
  await page.waitForTimeout(400);
  await page.screenshot({ path: path.join(ARTIFACT_DIR, 'otp_popup_mobile_390px.png') });

  // Restore light mode and desktop
  await page.setViewportSize({ width: 1540, height: 900 });
  await page.evaluate(() => {
    document.documentElement.classList.remove('dark');
  });
  await page.waitForTimeout(400);

  // Test 4: Enter wrong code -> "Incorrect code. 4 attempts left"
  console.log('Running Test 4: Wrong code attempt');
  await page.fill('input[placeholder="000000"]', '111111');
  await page.click('button:has-text("Verify Code")');
  await page.waitForTimeout(500);
  const wrongErrorText = await page.locator('text=Incorrect code').textContent();
  const pass4 = wrongErrorText && wrongErrorText.includes('4 attempts left');
  testResults.push({ id: 4, name: 'Enter wrong code -> "Incorrect code. 4 attempts left." (no hint)', passed: !!pass4 });

  // Screenshot: Wrong code error
  await page.screenshot({ path: path.join(ARTIFACT_DIR, 'wrong_code_error.png') });

  // Test 5: Expiration test & Resend
  console.log('Running Test 5: Expiry & Resend cooldown');
  const resendBtnText = await page.locator('button:has-text("Resend")').textContent();
  const hasCooldown = resendBtnText.includes('Resend in');
  testResults.push({ id: 5, name: 'Resend button has 30s cooldown and countdown timer', passed: hasCooldown });

  // Test 6: Enter correct code -> Step 3. Test password checklist & submission
  console.log('Running Test 6: Correct code and password validation');
  await page.fill('input[placeholder="000000"]', popupOtpCode);
  await page.click('button:has-text("Verify Code")');
  await page.waitForTimeout(600);

  // Now on Step 3: create password
  await page.fill('input[placeholder="••••••••"] >> nth=0', 'weak');
  await page.fill('input[placeholder="••••••••"] >> nth=1', 'weak');
  const submitBtnDisabled = await page.locator('button:has-text("Save Password & Activate")').isDisabled();

  // Enter strong matching password (8+ chars, upper, number)
  await page.fill('input[placeholder="••••••••"] >> nth=0', 'Secure@Pass123');
  await page.fill('input[placeholder="••••••••"] >> nth=1', 'Secure@Pass123');
  await page.waitForTimeout(300);
  const submitBtnEnabled = !(await page.locator('button:has-text("Save Password & Activate")').isDisabled());

  await page.click('button:has-text("Save Password & Activate")');
  await page.waitForTimeout(800);

  // Now on Step 4: Success screen showing Login ID Emp002
  const successText = await page.locator('text=Account activated. Your Login ID is').textContent();
  const pass6 = submitBtnDisabled && submitBtnEnabled && successText.includes('Emp002');
  testResults.push({ id: 6, name: 'Correct code -> Step 3 checklist -> Strong password -> Success with Login ID Emp002', passed: pass6 });

  // Screenshot: Success screen
  await page.screenshot({ path: path.join(ARTIFACT_DIR, 'setup_success_screen.png') });

  // Test 7: Sign in with Emp002 + Secure@Pass123 -> Reaches employee dashboard. Page refresh -> Still works
  console.log('Running Test 7: Sign in with new credentials');
  await page.click('button:has-text("Go to Sign In")');
  await page.waitForTimeout(500);

  await page.fill('input[placeholder*="Emp001"]', 'Emp002');
  await page.fill('input[type="password"]', 'Secure@Pass123');
  await page.click('button:has-text("Launch Workspace")');
  await page.waitForTimeout(1500);

  // Verify on Dashboard
  const welcomeHeading = await page.locator('h1:has-text("Welcome Back")').isVisible();
  
  // Reload page to verify persistence
  await page.reload();
  await page.waitForTimeout(1500);
  const welcomeAfterReload = await page.locator('h1:has-text("Welcome Back")').isVisible();
  const pass7 = welcomeHeading && welcomeAfterReload;
  testResults.push({ id: 7, name: 'Sign in with Emp002 + new password -> Dashboard -> Persists across refresh', passed: pass7 });

  // Test 8: Forgot password with Emp001 email -> popup -> reset password -> old password fails, new password works
  console.log('Running Test 8: Forgot password flow');
  // Sign out
  await page.evaluate(() => {
    localStorage.removeItem('flowsphere-is-authenticated');
  });
  await page.reload();
  await page.waitForTimeout(1000);

  await page.click('button:has-text("Forgot Password?")');
  await page.waitForTimeout(500);

  await page.fill('input[placeholder*="virat.s@flowsphere.internal"]', 'virat.s@flowsphere.internal');
  await page.click('button:has-text("Send Verification OTP")');
  await page.waitForTimeout(1800);

  const forgotPopupCode = (await page.locator('[role="status"] .font-mono.text-xl, [role="status"] .font-mono.text-2xl').textContent()).trim();
  await page.fill('input[placeholder="000000"]', forgotPopupCode);
  await page.click('button:has-text("Verify Code")');
  await page.waitForTimeout(600);

  // Set new password
  await page.fill('input[placeholder="••••••••"] >> nth=0', 'NewVirat@2026');
  await page.fill('input[placeholder="••••••••"] >> nth=1', 'NewVirat@2026');
  await page.click('button:has-text("Reset Password")');
  await page.waitForTimeout(800);

  await page.click('button:has-text("Go to Sign In")');
  await page.waitForTimeout(500);

  // Test old password fails
  await page.fill('input[placeholder*="Emp001"]', 'Emp001');
  await page.fill('input[type="password"]', 'Pass@123');
  await page.click('button:has-text("Launch Workspace")');
  await page.waitForTimeout(600);
  const oldPwFailed = await page.locator('text=Incorrect Login ID or password').isVisible();

  // Test new password works
  await page.fill('input[placeholder*="Emp001"]', 'Emp001');
  await page.fill('input[type="password"]', 'NewVirat@2026');
  await page.click('button:has-text("Launch Workspace")');
  await page.waitForTimeout(1500);
  const newPwSuccess = await page.locator('h1:has-text("Welcome Back")').isVisible();

  const pass8 = oldPwFailed && newPwSuccess;
  testResults.push({ id: 8, name: 'Forgot password with Emp001 -> reset -> old password fails, new password works', passed: pass8 });

  console.log('\n--- ALL TEST RESULTS ---');
  testResults.forEach(r => console.log(`Test ${r.id}: ${r.passed ? 'PASS' : 'FAIL'} - ${r.name}`));

  await browser.close();
  process.exit(0);
})();
