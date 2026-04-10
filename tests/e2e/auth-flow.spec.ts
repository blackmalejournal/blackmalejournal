import { test, expect } from '@playwright/test';

test.describe('Authentication', () => {
  test('valid login redirects to portal', async ({ page }) => {
    await page.goto('/login');
    // Password form + magic-link form both use name="email" — target the password field (#email).
    await page.locator('#email').fill(process.env.E2E_MEMBER_EMAIL ?? 'free@bmj.test');
    await page.locator('input[name="password"]').fill(process.env.E2E_MEMBER_PASSWORD ?? 'TestOnly!1');
    await page.getByRole('button', { name: /^log in$/i }).click();
    await expect(page).toHaveURL(/\/portal/, { timeout: 30_000 });
  });

  test('invalid credentials shows error', async ({ page }) => {
    await page.goto('/login');
    await page.locator('#email').fill('nobody@bmj.test');
    await page.locator('input[name="password"]').fill('wrongpassword');
    await page.getByRole('button', { name: /^log in$/i }).click();
    await expect(page.getByRole('alert').or(page.locator('[data-error]'))).toBeVisible({ timeout: 10_000 });
    await expect(page).toHaveURL(/\/login/);
  });

  test('signup page renders form fields', async ({ page }) => {
    await page.goto('/signup');
    await expect(page.locator('#email')).toBeVisible();
    await expect(page.locator('#password')).toBeVisible();
  });
});
