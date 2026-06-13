/**
 * テスト用メディアサーバーのベースURLを取得する
 *
 * テスト内で `http://localhost:{PORT}/filename` 形式のURLを構築するためのヘルパー。
 * ポート番号は環境変数 TEST_MEDIA_PORT（globalSetup で設定）から取得する。
 * 設定がない場合はデフォルトポート 18921 を使用する。
 */
function getMediaBaseUrl(): string {
  const port = process.env.TEST_MEDIA_PORT || "18921";
  return `http://localhost:${port}`;
}

/**
 * テスト用メディアファイルの完全なURLを返す
 *
 * @example
 *   mediaUrl("photo.jpg") // → "http://localhost:18921/photo.jpg"
 */
export function mediaUrl(filename: string): string {
  return `${getMediaBaseUrl()}/${filename}`;
}

/**
 * テスト用メディアサーバーのベースURLを返す
 *
 * @example
 *   mediaBaseUrl() // → "http://localhost:18921"
 */
export function mediaBaseUrl(): string {
  return getMediaBaseUrl();
}
