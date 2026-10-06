import { chromium } from 'playwright';

const VIEWPORTS = [
  { name: '1920x1080', width: 1920, height: 1080 },
  { name: '1440x900', width: 1440, height: 900 },
  { name: '1280x720', width: 1280, height: 720 },
  { name: '1024x768', width: 1024, height: 768 },
  { name: '768x1024', width: 768, height: 1024 },
  { name: '390x844', width: 390, height: 844 },
];

const EMPLOYEE_ROUTES = [
  'dashboard',
  'workflow',
  'attendance',
  'productivity',
  'reports',
  'notifications',
  'settings',
];

const ADMIN_ROUTES = [
  'admin-overview',
  'admin-monitoring',
  'admin-analytics',
  'admin-attendance',
  'admin-policies',
];

const THEMES = ['light', 'dark'];

async function runAudit() {
  console.log('Starting FlowSphere Layout & Rectangle Clipping Audit across 6 Viewports x All Routes x Light/Dark...\n');

  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  const results = [];
  let totalTests = 0;
  let passedTests = 0;

  for (const vp of VIEWPORTS) {
    await page.setViewportSize({ width: vp.width, height: vp.height });

    for (const theme of THEMES) {
      // 1. Employee Routes
      for (const route of EMPLOYEE_ROUTES) {
        totalTests++;
        await page.goto(`http://localhost:3000`, { waitUntil: 'domcontentloaded' });
        await page.waitForTimeout(150);

        // Switch role, theme, route via app state helper
        await page.evaluate(
          ({ t, r }) => {
            if (window.__FLOWSPHERE__) {
              window.__FLOWSPHERE__.setRole('employee');
              window.__FLOWSPHERE__.setTheme(t);
              window.__FLOWSPHERE__.setActiveTab(r);
            }
          },
          { t: theme, r: route }
        );
        await page.waitForTimeout(200);

        const audit = await page.evaluate(() => {
          const header = document.querySelector('header');
          let headerClipped = false;
          if (header) {
            const hRect = header.getBoundingClientRect();
            const children = header.querySelectorAll('*');
            for (const el of children) {
              const r = el.getBoundingClientRect();
              if (r.width > 0 && r.height > 0) {
                // Allow 3px sub-pixel tolerance
                if (r.right > hRect.right + 3 || r.left < hRect.left - 3) {
                  headerClipped = true;
                  break;
                }
              }
            }
          }

          const cards = document.querySelectorAll('.glass-card');
          let cardsClipped = 0;
          for (const card of cards) {
            const cRect = card.getBoundingClientRect();
            const children = card.querySelectorAll('*');
            for (const el of children) {
              if (el.tagName.toLowerCase() === 'defs' || el.tagName.toLowerCase() === 'clippath') continue;
              const r = el.getBoundingClientRect();
              if (r.width > 0 && r.height > 0) {
                if (r.right > cRect.right + 5 || r.left < cRect.left - 5) {
                  cardsClipped++;
                  break;
                }
              }
            }
          }

          const main = document.querySelector('main');
          const scrollH = main ? main.scrollHeight : 0;
          const clientH = main ? main.clientHeight : 0;

          return { headerClipped, cardsClipped, scrollH, clientH };
        });

        const isPass = !audit.headerClipped && audit.cardsClipped === 0;
        if (isPass) passedTests++;

        results.push({
          viewport: vp.name,
          theme,
          route: `emp/${route}`,
          headerStatus: audit.headerClipped ? 'CLIPPED' : 'PASS',
          cardStatus: audit.cardsClipped > 0 ? `${audit.cardsClipped} clipped` : 'PASS',
          scrollMetric: `${audit.scrollH}/${audit.clientH}px`,
          verdict: isPass ? 'PASS' : 'FAIL',
        });
      }

      // 2. Admin Routes
      for (const route of ADMIN_ROUTES) {
        totalTests++;
        await page.goto(`http://localhost:3000`, { waitUntil: 'domcontentloaded' });
        await page.waitForTimeout(150);

        await page.evaluate(
          ({ t, r }) => {
            if (window.__FLOWSPHERE__) {
              window.__FLOWSPHERE__.setRole('admin');
              window.__FLOWSPHERE__.setTheme(t);
              window.__FLOWSPHERE__.setActiveTab(r);
            }
          },
          { t: theme, r: route }
        );
        await page.waitForTimeout(200);

        const audit = await page.evaluate(() => {
          const header = document.querySelector('header');
          let headerClipped = false;
          if (header) {
            const hRect = header.getBoundingClientRect();
            const children = header.querySelectorAll('*');
            for (const el of children) {
              const r = el.getBoundingClientRect();
              if (r.width > 0 && r.height > 0) {
                if (r.right > hRect.right + 3 || r.left < hRect.left - 3) {
                  headerClipped = true;
                  break;
                }
              }
            }
          }

          const cards = document.querySelectorAll('.glass-card');
          let cardsClipped = 0;
          for (const card of cards) {
            const cRect = card.getBoundingClientRect();
            const children = card.querySelectorAll('*');
            for (const el of children) {
              if (el.tagName.toLowerCase() === 'defs' || el.tagName.toLowerCase() === 'clippath') continue;
              const r = el.getBoundingClientRect();
              if (r.width > 0 && r.height > 0) {
                if (r.right > cRect.right + 5 || r.left < cRect.left - 5) {
                  cardsClipped++;
                  break;
                }
              }
            }
          }

          const main = document.querySelector('main');
          const scrollH = main ? main.scrollHeight : 0;
          const clientH = main ? main.clientHeight : 0;

          return { headerClipped, cardsClipped, scrollH, clientH };
        });

        const isPass = !audit.headerClipped && audit.cardsClipped === 0;
        if (isPass) passedTests++;

        results.push({
          viewport: vp.name,
          theme,
          route: `adm/${route}`,
          headerStatus: audit.headerClipped ? 'CLIPPED' : 'PASS',
          cardStatus: audit.cardsClipped > 0 ? `${audit.cardsClipped} clipped` : 'PASS',
          scrollMetric: `${audit.scrollH}/${audit.clientH}px`,
          verdict: isPass ? 'PASS' : 'FAIL',
        });
      }
    }
  }

  await browser.close();

  console.log('========================================================================================================');
  console.log('| Viewport   | Theme | Route                  | Header Clipping | Card Clipping | ScrollH/ClientH | Verdict |');
  console.log('========================================================================================================');
  for (const r of results) {
    console.log(
      `| ${r.viewport.padEnd(10)} | ${r.theme.padEnd(5)} | ${r.route.padEnd(22)} | ${r.headerStatus.padEnd(15)} | ${r.cardStatus.padEnd(13)} | ${r.scrollMetric.padEnd(15)} | ${r.verdict.padEnd(7)} |`
    );
  }
  console.log('========================================================================================================');
  console.log(`\nAudit Complete: ${passedTests}/${totalTests} checks passed (${Math.round((passedTests / totalTests) * 100)}%).\n`);
}

runAudit().catch((err) => {
  console.error('Audit failed with error:', err);
  process.exit(1);
});
