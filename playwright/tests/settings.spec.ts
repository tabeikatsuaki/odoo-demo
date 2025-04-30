import { test, expect, Page } from '@playwright/test';

import { getLoginUrl, getHomeMenuUrl, getAuthEmail, getAuthPassword } from './environments';
import { authFile } from '../config/auth.config';
import { screenshotDir } from '../config/screenshot.config';
import path from 'path';

test.use({ storageState: authFile });

test('時間帯を"Asia/Tokyo"に設定', async ({ page }) => {
  // // ホームメニュー画面に遷移
  // const homeUrl = getHomeMenuUrl();
  // await page.goto(homeUrl);

  // // ユーザーボタンを取得
  // const userButton = page.getByRole('button').filter({ has: page.getByAltText('ユーザ') });
  // // ユーザーボタンがあるかどうかチェック
  // expect(userButton).toBeTruthy();

  // await page.screenshot({ path: path.join(screenshotDir, 'ホームメニュー画面.png') });

  // ユーザーボタンをクリック
  // await userButton.click();
  await clickUserButton(page);
});

/**
 * ホームメニュー画面にてユーザーボタンをクリックします。
 * @param page Playwrightのページオブジェクト
 * @returns {Promise<void>}
 */
const clickUserButton = async (page: Page): Promise<void> => {
  // ホームメニュー画面に遷移
  const homeUrl = getHomeMenuUrl();
  await page.goto(homeUrl);

  // ユーザーボタンを取得
  const userButton = page.getByRole('button').filter({ has: page.getByAltText('ユーザ') });
  // ユーザーボタンがあるかどうかチェック
  expect(userButton).toBeTruthy();

  // ユーザーボタンをクリック
  await userButton.click();
}