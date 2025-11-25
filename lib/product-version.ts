// 商品系統版本控制
// 1 = 舊版本（現有系統）
// 2 = 新版本（優化框架）

import { cookies } from "next/headers";

export type ProductVersion = 1 | 2;

const COOKIE_NAME = "product_version";

/**
 * 取得當前後台編輯版本
 */
export async function getAdminProductVersion(): Promise<ProductVersion> {
  const cookieStore = await cookies();
  const version = cookieStore.get(COOKIE_NAME)?.value;
  return version === "2" ? 2 : 1;
}

/**
 * 取得前台顯示版本（固定為 V2）
 */
export function getFrontendProductVersion(): ProductVersion {
  return 2; // 前台固定顯示新版本
}

/**
 * 設定後台編輯版本（在 Server Action 中使用）
 */
export async function setAdminProductVersion(version: ProductVersion) {
  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, version.toString(), {
    path: "/",
    maxAge: 60 * 60 * 24 * 365, // 1 year
  });
}
