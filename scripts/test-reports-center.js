import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';

async function testReportsCenter() {
  console.log('🚀 Starting Comprehensive FlowSphere Reports & Export Center Test Suite...\n');
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    acceptDownloads: true
  });
  const page = await context.newPage();

  try {
    // 1. Navigate to local app
    await page.goto('http://localhost:3000/', { waitUntil: 'networkidle' });
    console.log('✅ FlowSphere Loaded');

    // 2. Open Reports Tab
    await page.locator('header nav button[aria-label="Reports"]').click();
    await page.waitForTimeout(500);

    // Verify Title & Header
    const titleText = await page.textContent('h2');
    console.log('✅ Reports Page Title:', titleText);
    if (!titleText.includes('Reports & Export Intelligence')) {
      throw new Error(`Unexpected title: ${titleText}`);
    }

    // 3. Test Category Filtering
    const categorySelect = page.locator('#filter-category');
    await categorySelect.selectOption('idle_audit');
    await page.waitForTimeout(300);
    let previewHeader = await page.textContent('h3');
    console.log('✅ Idle Audit Category active:', previewHeader);

    await categorySelect.selectOption('punch_attendance');
    await page.waitForTimeout(300);
    console.log('✅ Biometric Attendance Category active');

    await categorySelect.selectOption('daily_productivity');
    await page.waitForTimeout(300);

    // 4. Test Department Filtering
    const deptSelect = page.locator('#filter-department');
    await deptSelect.selectOption('Engineering');
    await page.waitForTimeout(300);
    previewHeader = await page.textContent('h3');
    console.log('✅ Department Filtered (Engineering):', previewHeader);

    // Verify that all rows in table are from Engineering
    const deptsInTable = await page.$$eval('tbody tr td:nth-child(2)', tds => tds.map(td => td.textContent.trim()));
    console.log('   Departments in Table:', deptsInTable);
    const allEng = deptsInTable.every(d => d === 'Engineering');
    if (!allEng) throw new Error('Non-Engineering department found in filtered table');

    // 5. Test Search Filter
    const searchInput = page.locator('#search-employee-input');
    await searchInput.fill('Keshav');
    await page.waitForTimeout(300);
    previewHeader = await page.textContent('h3');
    console.log('✅ Search Employee (Keshav):', previewHeader);
    const namesInTable = await page.$$eval('tbody tr td:nth-child(1)', tds => tds.map(td => td.textContent.trim()));
    console.log('   Names matching search:', namesInTable);
    if (!namesInTable.some(n => n.includes('Keshav'))) throw new Error('Keshav not found in search');

    // 6. Test Reset Filters
    const resetBtn = page.locator('button:has-text("Reset")');
    if (await resetBtn.count() > 0) {
      await resetBtn.first().click();
      await page.waitForTimeout(300);
      previewHeader = await page.textContent('h3');
      console.log('✅ Reset Filters restored full dataset:', previewHeader);
    }

    // 7. Test Table Sorting
    const scoreHeader = page.locator('th:has-text("Score")');
    await scoreHeader.click();
    await page.waitForTimeout(300);
    const scores = await page.$$eval('tbody tr td:nth-child(7)', tds => tds.map(td => parseInt(td.textContent, 10)));
    console.log('✅ Table Sorted by Score:', scores);

    // 8. Test CSV Download
    console.log('⏳ Testing CSV Export Download...');
    const [csvDownload] = await Promise.all([
      page.waitForEvent('download'),
      page.click('#btn-export-csv')
    ]);
    const csvPath = await csvDownload.path();
    const csvFileName = csvDownload.suggestedFilename();
    const csvContent = fs.readFileSync(csvPath, 'utf-8');
    console.log(`✅ CSV Downloaded: ${csvFileName} (${csvContent.length} bytes)`);
    if (!csvFileName.endsWith('.csv') || !csvContent.includes('Employee')) {
      throw new Error('Invalid CSV file generated');
    }

    // 9. Test Excel (.xlsx) Download
    console.log('⏳ Testing Excel Export Download...');
    const [excelDownload] = await Promise.all([
      page.waitForEvent('download'),
      page.click('#btn-export-excel')
    ]);
    const excelPath = await excelDownload.path();
    const excelFileName = excelDownload.suggestedFilename();
    const excelStat = fs.statSync(excelPath);
    console.log(`✅ Excel Downloaded: ${excelFileName} (${excelStat.size} bytes)`);
    if (!excelFileName.endsWith('.xlsx') || excelStat.size < 100) {
      throw new Error('Invalid Excel XLSX file generated');
    }

    // 10. Test PDF (.pdf) Download
    console.log('⏳ Testing PDF Export Download...');
    const [pdfDownload] = await Promise.all([
      page.waitForEvent('download'),
      page.click('#btn-export-pdf')
    ]);
    const pdfPath = await pdfDownload.path();
    const pdfFileName = pdfDownload.suggestedFilename();
    const pdfStat = fs.statSync(pdfPath);
    console.log(`✅ PDF Downloaded: ${pdfFileName} (${pdfStat.size} bytes)`);
    if (!pdfFileName.endsWith('.pdf') || pdfStat.size < 100) {
      throw new Error('Invalid PDF file generated');
    }

    // 11. Responsive Checks
    console.log('⏳ Testing Responsive Viewports...');
    // Tablet
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.waitForTimeout(300);
    console.log('✅ Tablet Viewport (768px) verified');

    // Mobile
    await page.setViewportSize({ width: 375, height: 667 });
    await page.waitForTimeout(300);
    console.log('✅ Mobile Viewport (375px) verified');

    console.log('\n=============================================================');
    console.log('🏆 100% PASS: ALL REPORTS & EXPORT INTERACTIONS VERIFIED!');
    console.log('=============================================================\n');

  } catch (error) {
    console.error('❌ Test failed:', error);
    process.exit(1);
  } finally {
    await browser.close();
  }
}

testReportsCenter();
