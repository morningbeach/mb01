// app/products/page.tsx - 重定向到新版樹狀分類系統
import { redirect } from "next/navigation";

export default function ProductsPage() {
  redirect("/catalog-tree");
}
