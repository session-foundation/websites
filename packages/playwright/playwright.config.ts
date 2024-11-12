import { defineConfig } from '@playwright/test';

export default defineConfig({
  timeout: 30000,
  globalTimeout: 600000,
  reporter: 'list',
  testDir: './tests',
  use: {
    baseURL: 'https://stake-dev.getsession.org',
    screenshot: 'only-on-failure',
    httpCredentials: {
      username: 'dev',
      password: 'yoyo-FAD-ivory',
    },
  },
});

export const BASE_URL = 'https://stake-dev.getsession.org';
