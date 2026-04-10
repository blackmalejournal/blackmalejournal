import { test, expect } from '@playwright/test';

test.describe('Contact form', () => {
  test('renders all required fields', async ({ page }) => {
    await page.goto('/contact');
    await expect(page.locator('input[name="name"]')).toBeVisible();
    await expect(page.locator('input[name="email"]')).toBeVisible();
    await expect(page.locator('textarea[name="message"]')).toBeVisible();
  });

  test('submits successfully and shows confirmation', async ({ page }) => {
    await page.goto('/contact');
    await page.locator('input[name="name"]').fill('E2E Test');
    await page.locator('input[name="email"]').fill('e2e@bmj.test');
    await page.locator('textarea[name="message"]').fill('Automated E2E contact form submission.');

    const subject = page.locator('input[name="subject"]');
    if (await subject.count()) await subject.fill('E2E Test Subject');

    await page.getByRole('button', { name: /send|submit/i }).click();

    // Expect a success message or redirect — not an error
    await expect(
      page.getByText(/thank you|message sent|received/i).or(page.locator('[data-success]'))
    ).toBeVisible({ timeout: 15_000 });
  });
});
