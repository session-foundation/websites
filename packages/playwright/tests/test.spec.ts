import { expect, test } from '@playwright/test';
import { BASE_URL } from 'playwright.config';
import { agreeToTOS, clickOnTestIdWithText, clickOnVisibleElement } from './utils';

// const token = '';
// await page.evaluate(token => localStorage.setItem('tosAccepted', 'true'), token)

// const url = `https://stake-dev.getsession.org`;
// if (!url) {
//   throw new Error('URL not defined');
// }

test('Open page', async ({ page }) => {
  const homePage = `${BASE_URL}/mystakes`;
  await page.goto(homePage);
  const title = await page.title();
  expect(title).toBe('My Stakes | Session Staking Portal');
});

test('TAC - participate', async ({ page }) => {
  await page.goto(BASE_URL);
  await clickOnVisibleElement(page, 'button:home-primary', 'Participate in Incentivised Testnet');
  const dialog = page.locator('div[role="dialog"][data-state="open"]');
  await expect(dialog).toBeVisible();
  await agreeToTOS(page);
  const toast = page.locator('li[data-sonner-toast][data-visible="true"]');
  await expect(toast).toBeVisible();
  expect(page.url()).toBe(`${BASE_URL}/stake`);
});

test('TAC - Stake now', async ({ page }) => {
  await page.goto(BASE_URL);
  await clickOnTestIdWithText(page, 'link:header-nav-link-item', 'Stake Now');
  const dialog = page.locator('div[role="dialog"][data-state="open"]');
  await expect(dialog).toBeVisible({ timeout: 8000 });
  await agreeToTOS(page);
  const toast = page.locator('li[data-sonner-toast][data-visible="true"]');
  await expect(toast).toBeVisible();
});
