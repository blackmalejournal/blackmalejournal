import path from 'node:path';
import { defineConfig, devices } from '@playwright/test';

const e2eAdminAuth = Boolean(
  process.env.E2E_ADMIN_EMAIL?.trim() && process.env.E2E_ADMIN_PASSWORD?.trim(),
);
const e2eMemberAuth = Boolean(
  process.env.E2E_MEMBER_EMAIL?.trim() && process.env.E2E_MEMBER_PASSWORD?.trim(),
);

const adminStoragePath = path.join(process.cwd(), '.auth', 'admin.json');
const memberStoragePath = path.join(process.cwd(), '.auth', 'member.json');

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
      testIgnore: 'authenticated/**',
    },
    ...(e2eAdminAuth
      ? [
          {
            name: 'setup-admin',
            testMatch: 'authenticated/admin.setup.ts',
          },
          {
            name: 'chromium-admin',
            dependencies: ['setup-admin'],
            testMatch: 'authenticated/admin-article.spec.ts',
            use: {
              ...devices['Desktop Chrome'],
              storageState: adminStoragePath,
            },
          },
        ]
      : []),
    ...(e2eMemberAuth
      ? [
          {
            name: 'setup-member',
            testMatch: 'authenticated/member.setup.ts',
          },
          {
            name: 'chromium-member',
            dependencies: ['setup-member'],
            testMatch: 'authenticated/portal.spec.ts',
            use: {
              ...devices['Desktop Chrome'],
              storageState: memberStoragePath,
            },
          },
        ]
      : []),
  ],
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
    timeout: 180 * 1000,
  },
});
