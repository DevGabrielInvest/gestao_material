import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  timeout: 30000,
  retries: 1,
  use: {
    baseURL: 'http://localhost:3099',
    headless: true,
    screenshot: 'only-on-failure',
  },
  webServer: {
    command: 'NODE_ENV=test node server/index.js',
    url: 'http://localhost:3099/api/health',
    reuseExistingServer: !process.env.CI,
    timeout: 15000,
    cwd: '.',
    env: {
      PORT: '3099',
      NODE_ENV: 'test',
      JWT_SECRET: process.env.JWT_SECRET || 'super-secret-test-key-that-is-long-enough-32',
      TEST_DATABASE_URL: process.env.TEST_DATABASE_URL || '',
    },
  },
});
