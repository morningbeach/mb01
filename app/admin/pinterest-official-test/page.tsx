// app/admin/pinterest-official-test/page.tsx
import PinterestOfficialTestClient from "./PinterestOfficialTestClient";

export const metadata = {
  title: "Pinterest Official API 測試 | 管理後台",
  description: "測試 Pinterest Official API v5 連線和搜尋功能",
};

export default function PinterestOfficialTestPage() {
  return <PinterestOfficialTestClient />;
}
