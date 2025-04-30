import { test, expect, Page } from '@playwright/test';
import fs from 'fs';
import path from 'path';

import { getLoginUrl, getHomeMenuUrl, getAuthEmail, getAuthPassword } from './environments';

// 入荷番号
let receiptNumber: number = 1;

// スクリーンショットのディレクトリを確保
const screenshotDir = path.join(__dirname, '../test-results/screenshots');
if (!fs.existsSync(screenshotDir)) {
  fs.mkdirSync(screenshotDir, { recursive: true });
};

/**
 * エントリーポイント
 */
test('GS1バーコードスキャン', async ({ page }) => {
  // ログイン処理
  await login(page);

  // 管理設定での設定
  await setSettings(page);

  // // テスト用製品を登録
  // await registerTestProducts(page);

  // // テスト用入荷情報の処理準備を行う
  // await prepareTestReceipt(page);

  // // // テスト用入荷情報の利用可能確認を行う
  // await checkTestReceipt(page);

  // // バーコードスキャンのシミュレート
  // await simulateBarcodeScan(page);

  // await page.screenshot({ path: 'screenshot.png' });
});

/**
 * ログイン処理
 *
 * @param page Playwrightのページオブジェクト
 * @returns {Promise<void>}
 */
const login = async (page: Page): Promise<void> => {
  // ログイン画面に遷移
  const loginUrl = getLoginUrl();
  await page.goto(loginUrl);

  // 「メールアドレス」を入力
  const authEmail = getAuthEmail();
  await page.fill('input[name="login"]', authEmail);
  // 「パスワード」を入力
  const authPassword = getAuthPassword();
  await page.fill('input[name="password"]', authPassword);

  // 「ログイン」ボタンをクリック
  await page.click('button[type="submit"]');
};

/**
 * 管理設定での設定
 *
 * @param page Playwrightのページオブジェクト
 * @returns {Promise<void>}
 * @description
 * ・開発者モードを有効化\n
 * ・バーコード表現規則を「Default GS1 Nomenclature」に設定\n
 * ・ロット/シリアル番号のチェックボックスをオン
 */
const setSettings = async (page: Page): Promise<void> => {
  // 「管理設定」画面に遷移
  await page.click('a[href="/odoo/settings"]');

  // 「開発者モードを有効化」をクリック
  await page.getByText(/^開発者モードを有効化$/).click();

  // 「在庫」メニューをクリック
  await page.click('a[href="#stock"]');

  // 「バーコード表現規則」コンボボックスに「Default GS1 Nomenclature」を入力
  const barcodeNomenclature = page.locator('#barcode_nomenclature_id_0');
  await barcodeNomenclature.fill('Default GS1 Nomenclature');
  await barcodeNomenclature.press('Enter');

  await page.screenshot({ path: 'test-results/screenshots/バーコード表現規則を変更.png' });
  // await page.screenshot({ path: 'バーコード表現規則を変更.png' });

  // 「ロット/シリアル番号」チェックボックスをオン
  await page.locator('#group_stock_production_lot_0').check();

  // 「保存」ボタンをクリック
  await page.getByRole('button', { name: '保存' }).click();
};

/**
 * テスト用製品を登録
 * @page page Playwrightのページオブジェクト
 * @returns {Promise<void>}
 */
const registerTestProducts = async (page: Page): Promise<void> => {
  const homeMenuUrl = getHomeMenuUrl();

  const products = [
    {
      'productName': 'テスト製品',
      'barcode': '12345678901234',
    },
    {
      'productName': 'ふじりんご',
      'barcode': '20611628936004',
    },
  ];

  products.forEach(async (product) => {
    // 「プロダクト」新規登録画面に遷移
    await page.goto(`${homeMenuUrl}/action-380/new`);

    // 「プロダクト名」を入力
    await page.locator(`#name_0`).fill(product.productName);
    // 「バーコード」を入力
    await page.locator(`#barcode_0`).fill(product.barcode);
    // 「在庫追跡」を「ロット」に変更
    await page.locator('#tracking_1').selectOption('ロット');

    // 「手動で保存」ボタンをクリック
    await page.getByRole('button', { name: 'Save manually' }).click();
  });
};

// /**
//  * テスト用入荷情報の処理準備を行う
//  * @page page Playwrightのページオブジェクト
//  * @returns {Promise<void>}
//  */
// const prepareTestReceipt = async (page: Page): Promise<void> => {
//   // 「入荷」画面に遷移
//   const homeUrl = getHomeUrl();
//   await page.goto(`${homeUrl}/receipts`);
//   // 「新規」ボタンをクリック
//   await page.getByRole('button', { name: /新規/ }).click();

//   // 「入荷元」コンボボックスに「My Company」を入力
//   await page.locator('#partner_id_0').fill('My Company');
//   // 「明細追加」をクリック
//   await page.getByText('明細追加').click();

//   let parentDiv = page.locator('div[name="move_ids_without_package"]');
//   // 「プロダクト名」を入力
//   await parentDiv.getByRole('combobox').fill('テスト製品');
//   await parentDiv.getByRole('combobox').press('Enter');
//   // 「要求」を入力
//   await parentDiv.locator('input[type="text"][inputmode="decimal"]').fill('1.00');

//   await page.screenshot({ path: 'テスト用入荷情報の処理準備.png' });

//   // 「処理準備」ボタンをクリック
//   await page.locator('button[name="action_confirm"][type="object"]').click();
// };

// /**
//  * テスト用入荷情報の利用可能確認を行う
//  * @page page Playwrightのページオブジェクト
//  * @returns {Promise<void>}
//  */
// const checkTestReceipt = async (page: Page): Promise<void> => {
//   // 「入荷」画面に遷移
//   const homeUrl = getHomeUrl();
//   await page.goto(`${homeUrl}/receipts/${receiptNumber}`);

//   let parentDiv = page.locator('div[name="move_ids_without_package"]');
//   // 「数量」をクリック（クリックしないと入力できないため）
//   await parentDiv.locator('td[name="quantity"]').click();
//   // 「数量」を入力
//   await parentDiv.locator('input[type="text"][inputmode="decimal"]').fill('1.00');

//   await page.screenshot({ path: 'テスト用入荷情報の利用可能確認.png' });

//   // 「利用可能確認」ボタンをクリック
//   await page.locator('button[name="action_assign"][type="object"]').click();
// };

// /**
//  * バーコードスキャンのシミュレート
//  * @page page Playwrightのページオブジェクト
//  * @returns {Promise<void>}
//  */
// const simulateBarcodeScan = async (page: Page): Promise<void> => {
//   const barcode = '011234567890123410LOT12317251231';

//   const homeUrl = getHomeUrl();
//   // // 「バーコード」画面に遷移
//   // await page.goto(`${homeUrl}/barcode`);
//   // // 「バーコード入出荷選択」画面に遷移
//   // await page.goto(`${homeUrl}/barcode/action-434`);
//   // // 「バーコード入荷オペレーション」画面に遷移
//   // await page.goto(`${homeUrl}/barcode/action-434/1/barcode-operations`);
//   // テスト製品スキャン画面に遷移
//   await page.goto(`${homeUrl}/barcode/action-434/1/barcode-operations/${receiptNumber}/action-438?debug=1`);

//   // await page.screenshot({ path: 'バーコードスキャンのシミュレート1.png' });
//   // await page.waitForTimeout(2000);

//   // カメラスキャンUIを少しだけ表示させるためにバーコードボタンをクリックして再クリックによりすぐに閉じる
//   const barcodeButton = page.locator('header >> div:nth-child(1) >> nav:nth-child(2) >> button:nth-child(1)');
//   await barcodeButton.click();
//   await barcodeButton.click();

//   // // 開発者モードのチェック
//   // const isDebugAvailable = await page.evaluate(() => !!window.odoo.__WOWL_DEBUG__);
//   // if (!isDebugAvailable) {
//   //   console.error('開発者モードが無効です。URLに ?debug=1 を確認、または設定で有効化してください。');
//   //   throw new Error('開発者モードが無効');
//   // }

//   // コントローラが利用可能になるまで待つ
//   console.log('バーコードコントローラのロードを待機');
//   let controllerLoaded = false;
//   try {
//     await page.waitForFunction(
//       () => {
//         try {
//           const controller = window.odoo.__WOWL_DEBUG__?.root.widget;
//           return !!(controller && controller.onBarcodeScanned);
//         } catch (e) {
//           return false;
//         }
//       },
//       { timeout: 60000, polling: 1000 }
//     );
//     controllerLoaded = true;
//     console.log('バーコードコントローラのロード完了');
//   } catch (err) {
//     console.error(`コントローラのロードに失敗: ${err.message}`);
//     await page.content().then(content => fs.writeFileSync(path.join(screenshotDir, 'page_timeout.html'), content));
//     await page.screenshot({ path: path.join(screenshotDir, 'screenshot_barcode_timeout.png') });
//   }

//   // コントローラが見つかった場合、バーコード処理
//   if (controllerLoaded) {
//     console.log('バーコード処理を直接呼び出し');
//     try {
//       await page.evaluate((barcode) => {
//         const controller = window.odoo.__WOWL_DEBUG__.root.widget;
//         controller.onBarcodeScanned(barcode);
//       }, barcode);
//     } catch (err) {
//       console.error(`バーコード処理エラー: ${err.message}`);
//       await page.screenshot({ path: path.join(screenshotDir, 'screenshot_barcode_error.png') });
//       throw new Error(`バーコード処理に失敗: ${err.message}`);
//     }
//   } else {
//     // フォールバック：擬似イベントを送信
//     console.log('フォールバック：擬似イベントを送信');
//     try {
//       await page.evaluate((barcode) => {
//         window.dispatchEvent(new CustomEvent('barcode_scanned', { detail: { barcode } }));
//       }, barcode);
//     } catch (err) {
//       console.error(`擬似イベントエラー: ${err.message}`);
//       await page.screenshot({ path: path.join(screenshotDir, 'screenshot_event_error.png') });
//       throw new Error(`擬似イベントの送信に失敗: ${err.message}`);
//     }
//   }

//   // スクリーンショット（スキャン処理後）
//   await page.screenshot({ path: 'バーコード入力.png' });
//   // スキャン処理を待つ
//   await page.waitForTimeout(2000);
//   // await page.screenshot({ path: 'バーコードスキャンのシミュレート2.png' });
// };

// /**
//  * 登録したテスト製品を削除
//  * @page page Playwrightのページオブジェクト
//  * @returns {Promise<void>}
//  */
// const deleteTestProduct = async (page: Page): Promise<void> => {
//   // 「プロダクト」画面に遷移
//   const homeUrl = getHomeUrl();
//   await page.goto(`${homeUrl}/action-380`);

//   // 「テスト製品」を選択
//   await page.locator('text=テスト製品').click();

//   // 「削除」ボタンをクリック
//   await page.getByRole('button', { name: 'Delete' }).click();

//   // 「OK」ボタンをクリック
//   await page.getByRole('button', { name: 'OK' }).click();
// };