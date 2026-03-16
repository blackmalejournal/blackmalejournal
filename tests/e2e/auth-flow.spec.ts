import { test, expect } from '@playwright/test';

test.describe('Auth Flow', () => {
  test('login page renders form', async ({ page }) => {
    await page.goto('/login');
    await expect(page.locator('input[name="email"]')).toBeVisible();
  });

  test('signup page renders form', async ({ page }) => {
    await page.goto('/signup');
    await expect(page.locator('input[name="email"]')).toBeVisible();
  });
});
