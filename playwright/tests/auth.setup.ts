import { test as setup, expect } from '@playwright/test';
import { authFile } from '../config/auth.config';
import { getLoginUrl, getHomeMenuUrl, getAuthEmail, getAuthPassword } from './environments';

setup('認証', async ({ page }) => {
  // ログイン画面を表示
  const loginUrl = getLoginUrl();
  await page.goto(loginUrl);

  // Emailとパスワードを入力
  const authEmail = getAuthEmail();
  const authPassword = getAuthPassword();
  await page.fill('input[name="login"]', authEmail);
  await page.fill('input[name="password"]', authPassword);

  // ログインボタンをクリック
  await page.click('button[type="submit"]');

  // ホームメニュー画面を表示
  const homeMenuUrl = getHomeMenuUrl();
  await page.waitForURL(homeMenuUrl);

  // ホームメニュー画面が表示されていることを確認
  expect(page.url()).toBe(homeMenuUrl);

  // 認証情報を保存
  await page.context().storageState({ path: authFile });
});