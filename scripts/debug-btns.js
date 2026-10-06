import { chromium } from 'playwright';

async function inspectButtons() {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1536, height: 900 } });
  await page.goto('http://localhost:3000/', { waitUntil: 'networkidle' });
  const buttons = await page.evaluate(() => {
    return Array.from(document.querySelectorAll('button')).map((b) => ({
      text: b.innerText.trim(),
      aria: b.getAttribute('aria-label'),
      title: b.getAttribute('title'),
      className: b.className,
      rect: b.getBoundingClientRect()
    }));
  });
  console.log('Total buttons found:', buttons.length);
  console.log('Navigation buttons:', buttons.slice(0, 10));
  await browser.close();
}

inspectButtons();
