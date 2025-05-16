import { Page } from '@playwright/test';
import { ButtonDataTestId } from '@session/staking/testing/data-test-ids';
import { DataTestId } from './types/testing';

export async function clickOnTestIdWithText(
  window: Page,
  dataTestId: DataTestId | ButtonDataTestId,
  text?: string,
  maxWait?: number,
  rightButton?: boolean
) {
  const sharedOpts = { timeout: maxWait, strict: true };
  console.info(`clickOnTestIdWithText with testId:${dataTestId} and text:${text || 'none'}`);

  const builtSelector = !text
    ? `css=[data-testid='${dataTestId}']`
    : `css=[data-testid='${dataTestId}']:has-text("${text}")`;

  await window.click(builtSelector, rightButton ? { ...sharedOpts, button: 'right' } : sharedOpts);
  console.info(`clickOnTestIdWithText:clicked! testId:${dataTestId} and text:${text || 'none'}`);
}

export async function clickOnVisibleElement(
  window: Page,
  dataTestId: DataTestId | ButtonDataTestId,
  text?: string
) {
  const builtSelector = !text
    ? `css=[data-testid='${dataTestId}']:visible`
    : `css=[data-testid='${dataTestId}']:has-text("${text}"):visible`;
  await window.click(builtSelector);
  console.info(`clickOnVisibleElement:clicked! testId:${dataTestId}`);
}

// export async function waitForElement(
//   window: Page,
//   element: any,
//   selector: string,
//   maxWaitMs?: number,
//   text?: string,
// ) {
//   const builtSelector = !text
//     ? `css=[${element}=${selector}]`
//     : `css=[${element}=${selector}]:has-text("${text.replace(/"/g, '\\"')}")`;

//   return window.waitForSelector(builtSelector, { timeout: maxWaitMs });
// }

export async function agreeToTOS(page: Page) {
  await page.getByLabel('Incentivised Testnet Terms').click();
  await page.getByLabel('I have read, understand, and').click();
  await page.getByTestId('button:agree-tos').click();
}
