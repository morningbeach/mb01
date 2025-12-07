// lib/error-handler.ts
// 統一的 API 錯誤處理

/**
 * 檢查是否為資料庫連線錯誤
 */
export function isDatabaseConnectionError(error: any): boolean {
  const errorMessage = error?.message || '';
  return (
    errorMessage.includes('Too many database connections') ||
    errorMessage.includes('connection slots') ||
    errorMessage.includes('remaining connection slots are reserved') ||
    errorMessage.includes('FATAL:')
  );
}

/**
 * 取得使用者友善的錯誤訊息
 * @param error 原始錯誤物件
 * @param locale 語言 ('zh' 或 'en')
 * @returns 使用者友善的錯誤訊息
 */
export function getUserFriendlyErrorMessage(
  error: any,
  locale: 'zh' | 'en' = 'zh'
): string {
  // 資料庫連線錯誤
  if (isDatabaseConnectionError(error)) {
    return locale === 'zh' 
      ? '服務滿載中,請稍後再試' 
      : 'Service is busy, please try again later';
  }
  
  // 其他錯誤直接返回原始訊息
  return error?.message || (locale === 'zh' ? '發生錯誤' : 'An error occurred');
}

/**
 * 取得適當的 HTTP 狀態碼
 * @param error 原始錯誤物件
 * @returns HTTP 狀態碼
 */
export function getErrorStatusCode(error: any): number {
  // 資料庫連線錯誤使用 503 (Service Unavailable)
  if (isDatabaseConnectionError(error)) {
    return 503;
  }
  
  // 預設使用 500 (Internal Server Error)
  return 500;
}
