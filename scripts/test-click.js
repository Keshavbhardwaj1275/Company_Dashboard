import { chromium } from 'playwright';

async function testNav() {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1536, height: 900 } });
  await page.goto('http://localhost:3000/');
  await page.waitForTimeout(600);

  const navButtons = await page.$$('header nav button');
  console.log('Found nav buttons:', navButtons.length);

  // Click Workflow
  await navButtons[1].click();
  await page.waitForTimeout(600);
  const text = await page.textContent('body');
  console.log('Workflow text snippet:', text.slice(0, 200).replace(/\s+/g, ' '));
  console.log('Workflow visible:', text.includes('Workflow & Sprint Management'));

  // Click Attendance
  await navButtons[2].click();
  await page.waitForTimeout(600);
  const textAtt = await page.textContent('body');
  console.log('Attendance visible:', textAtt.includes('Attendance & Payroll Timesheet'));

  // Click Productivity
  await navButtons[3].click();
  await page.waitForTimeout(600);
  const textProd = await page.textContent('body');
  console.log('Productivity visible:', textProd.includes('Productivity & Rhythm Intelligence'));

  // Click Reports
  await navButtons[4].click();
  await page.waitForTimeout(600);
  const textRep = await page.textContent('body');
  console.log('Reports visible:', textRep.includes('Reports & Export Intelligence'));

  // Click Notifications
  await navButtons[5].click();
  await page.waitForTimeout(600);
  const textNot = await page.textContent('body');
  console.log('Notifications visible:', textNot.includes('Notification & Alert Center'));

  await page.screenshot({ path: 'debug_tabs.png' });
  await browser.close();
}

testNav();
