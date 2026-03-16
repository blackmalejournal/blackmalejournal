import { test, expect } from '@playwright/test';

test.describe('Home Page', () => {
  test('loads and shows hero', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/Black Male Journal/);
  });

  test('has navigation links', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('nav')).toBeVisible();
  });

  test('has footer', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('footer')).toBeVisible();
  });
});
