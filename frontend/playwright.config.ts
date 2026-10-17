import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  testMatch: 'login.playwright.spec.ts',

  fullyParallel: false,
  workers: 1,
  retries: 0,

  timeout: 30000,
  expect: {
    timeout: 10000,
  },

  outputDir: 'test-results',

  reporter: [
    ['list'],
    ['html', { outputFolder: 'playwright-report', open: 'never' }],
  ],

  use: {
    browserName: 'chromium',
    baseURL: 'http://localhost:4200',
    viewport: { width: 1280, height: 900 },

    screenshot: 'off',
    trace: 'off',
    video: 'off',
  },
});