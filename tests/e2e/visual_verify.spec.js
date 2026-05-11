import { test, expect } from '@playwright/test';

test('verify landing and subpages', async ({ page }) => {
  await page.goto('http://localhost:5173/');
  await page.waitForLoadState('networkidle');
  await page.screenshot({ path: 'home_optimized.png', fullPage: true });

  await page.goto('http://localhost:5173/tours');
  await page.waitForLoadState('networkidle');
  await page.screenshot({ path: 'tours_optimized.png', fullPage: true });

  await page.goto('http://localhost:5173/about');
  await page.waitForLoadState('networkidle');
  await page.screenshot({ path: 'about_optimized.png', fullPage: true });

  await page.goto('http://localhost:5173/terms');
  await page.waitForLoadState('networkidle');
  await page.screenshot({ path: 'terms_optimized.png', fullPage: true });
});
