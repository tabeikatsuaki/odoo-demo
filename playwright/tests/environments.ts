import dotenv from 'dotenv';

dotenv.config({ path: `${__dirname}/../.env` });

/**
 * .env から LOGIN_URL を取得します。
 * @returns {string} LOGIN_URL
 */
export const getLoginUrl = () => {
  const url = process.env.LOGIN_URL;
  // console.log('ログインURL:', url);
  if (!url) {
    throw error('LOGIN_URL');
  }
  return url;
};

/**
 * .env から HOME_MENU_URL を取得します。
 * @returns {string} HOME_MENU_URL
 */
export const getHomeMenuUrl = () => {
  const url = process.env.HOME_MENU_URL;
  if (!url) {
    throw error('HOME_MENU_URL');
  }
  return url;
};

/**
 * .env から AUTH_EMAIL を取得します。
 * @returns {string} AUTH_EMAIL
 */
export const getAuthEmail = () => {
  const authEmail = process.env.AUTH_EMAIL;
  if (!authEmail) {
    throw error('AUTH_EMAIL');
  }
  return authEmail;
};

/**
 * .env から AUTH_PASSWORD を取得します。
 * @returns {string} AUTH_PASSWORD
 */
export const getAuthPassword = () => {
  const authPassword = process.env.AUTH_PASSWORD;
  if (!authPassword) {
    throw error('AUTH_PASSWORD');
  }
  return authPassword;
};

/**
 * エラー処理
 * @param {string} variable 環境変数名
 * @throws {Error} 環境変数が定義されていない場合
 */
const error = (variable: string) => {
  const errMsg = `${variable} が定義されていません`;
  console.error(errMsg);
  throw new Error(errMsg);
}