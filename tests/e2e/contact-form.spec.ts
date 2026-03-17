import { test, expect } from '@playwright/test';

test.describe('Contact Form', () => {
  test('contact page loads with form', async ({ page }) => {
    await page.goto('/contact');
    await expect(page.locator('main form')).toBeVisible();
  });

  test('form has required fields', async ({ page }) => {
    await page.goto('/contact');
    await expect(page.locator('input[name="name"]')).toBeVisible();
    await expect(page.locator('input[name="email"]')).toBeVisible();
    await expect(page.locator('textarea[name="message"]')).toBeVisible();
  });
});
