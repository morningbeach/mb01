// app/api/admin/images/folders/route.ts
import { NextResponse } from "next/server";
import { listR2Objects } from "@/lib/r2";

export const dynamic = "force-dynamic";

interface FolderInfo {
  name: string;
  path: string;
  count: number;
}

export async function GET() {
  try {
    // 列出 uploads/ 下的所有檔案
    const r2Files = await listR2Objects({ prefix: "uploads/", maxKeys: 1000 });
    
    // 建立資料夾統計 Map
    const folderMap = new Map<string, number>();
    
    // 圖片副檔名
    const imageExts = ["jpg", "jpeg", "png", "gif", "webp", "svg"];
    
    for (const file of r2Files) {
      // 取得相對路徑（移除 uploads/ 前綴）
      const relativePath = file.key.replace(/^uploads\//, "");
      
      // 檢查是否為圖片檔案
      const ext = file.key.split(".").pop()?.toLowerCase();
      if (!ext || !imageExts.includes(ext)) continue;
      
      // 取得資料夾名稱（第一層）
      const parts = relativePath.split("/");
      if (parts.length >= 2) {
        // 有子資料夾
        const folderName = parts[0];
        folderMap.set(folderName, (folderMap.get(folderName) || 0) + 1);
      } else {
        // 根目錄檔案
        folderMap.set("(根目錄)", (folderMap.get("(根目錄)") || 0) + 1);
      }
    }
    
    // 轉換為陣列
    const folders: FolderInfo[] = [];
    
    // 先加入根目錄
    if (folderMap.has("(根目錄)")) {
      folders.push({
        name: "(根目錄)",
        path: "",
        count: folderMap.get("(根目錄)") || 0,
      });
      folderMap.delete("(根目錄)");
    }
    
    // 加入其他資料夾（排序）
    const sortedFolders = Array.from(folderMap.entries())
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([name, count]) => ({
        name,
        path: name,
        count,
      }));
    
    folders.push(...sortedFolders);
    
    return NextResponse.json({ folders });
  } catch (error) {
    console.error("列出資料夾失敗:", error);
    return NextResponse.json(
      { error: "列出資料夾失敗" },
      { status: 500 }
    );
  }
}
