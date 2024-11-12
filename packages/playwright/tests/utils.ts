import { Page } from '@playwright/test';
import { ButtonDataTestId } from '@session/staking/testing/data-test-ids';
import { DataTestId } from './types/testing';

export async function clickOnTestIdWithText(
  window: Page,
  dataTestId: DataTestId | ButtonDataTestId,
  text?: string,
  rightButton?: boolean,
  maxWait?: number
) {
  const sharedOpts = { timeout: maxWait, strict: true };
  console.info(`clickOnTestIdWithText with testId:${dataTestId} and text:${text || 'none'}`);

  const builtSelector = !text
    ? `css=[data-testid='${dataTestId}']`
    : `css=[data-testid=${dataTestId}]:has-text("${text}")`;

  await window.click(builtSelector, rightButton ? { ...sharedOpts, button: 'right' } : sharedOpts);
  console.info(`clickOnTestIdWithText:clicked! testId:${dataTestId} and text:${text || 'none'}`);
}
