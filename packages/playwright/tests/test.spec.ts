import { expect, test } from '@playwright/test';
import { BASE_URL } from 'playwright.config';
import { clickOnTestIdWithText } from './utils';
import {ButtonDataTestId} from '@session/staking/testing/data-test-ids';

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

test('Click on participate', async ({ page }) => {
  await page.goto(BASE_URL);

  

  await clickOnTestIdWithText(page, ButtonDataTestId.My_Stakes_Stake_Now , undefined, false, 8000);
  expect(page.url()).toBe(`${BASE_URL}/stake`);
});
