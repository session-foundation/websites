import { defineConfig } from '@playwright/test';

export default defineConfig({
  timeout: 30000,
  globalTimeout: 600000,
  reporter: 'list',
  testDir: './tests',
  use: {
    baseURL: 'http://localhost:3000',
    screenshot: 'only-on-failure',
    headless: false,
    // httpCredentials: {
    //   username: process.env.HTTP_CREDENTIALS_USERNAME,
    //   password: process.env.HTTP_CREDENTIALS_PASSWORD,
    // },
  },
});

export const BASE_URL = 'http://localhost:3000';
