import { chromium } from '@playwright/test';

async function run() {
  console.log('Launching browser...');
  const browser = await chromium.launch({ headless: true, channel: 'chrome' });
  const context = await browser.newContext();
  const page = await context.newPage();

  page.on('console', msg => console.log('BROWSER_CONSOLE:', msg.text()));
  page.on('pageerror', err => console.log('BROWSER_ERROR:', err.message));

  page.on('request', req => {
    const url = req.url();
    if (url.includes('graphql') || url.includes('services/data')) {
      console.log(`REQ: [${req.method()}] ${url}`);
      console.log('REQ HEADERS:', req.headers());
    }
  });

  page.on('response', async res => {
    const url = res.url();
    if (url.includes('graphql') || url.includes('services/data')) {
      console.log(`RES: [${res.status()}] ${url}`);
      try {
        const text = await res.text();
        console.log('RES BODY:', text.slice(0, 1000));
      } catch (e) {
        console.log('Could not read response body:', e.message);
      }
    }
  });

  console.log('Navigating to login page...');
  await page.goto('https://momentum-fun-8796-dev-ed.scratch.my.site.com/TestingApp/');

  console.log('Waiting for login form to load...');
  await page.waitForSelector('#username');

  console.log('Filling credentials...');
  await page.fill('#username', 'demo_nakranibhakti61_1781603627263@example.com');
  await page.fill('#password', 'Comm@2026!');

  await page.click('button[type="submit"]');

  console.log('Waiting for final home page URL...');
  try {
    await page.waitForURL('**/home', { timeout: 25000 });
    console.log('Successfully redirected to Home!');
  } catch (err) {
    console.log('Timeout waiting for Home page. Current URL is:', page.url());
  }

  // Log cookies
  const cookies = await context.cookies();
  console.log('COOKIES AT HOME:', JSON.stringify(cookies, null, 2));

  // Wait 5 seconds for any async checks/APIs on home page to settle
  await page.waitForTimeout(5000);
  console.log('Final URL:', page.url());

  // Take a screenshot to verify visual state
  await page.screenshot({ path: 'C:/Users/Bhakt/.gemini/antigravity-ide/brain/a7b4829d-33d1-448d-9b77-7444e4e37fff/scratch/login-result.png' });
  console.log('Screenshot saved to login-result.png');

  await browser.close();
}

run().catch(err => {
  console.error('Script error:', err);
});
