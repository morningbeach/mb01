import { readFileSync } from "fs";
import { join } from "path";
import GuideClient from "./GuideClient";

// 簡易 Markdown 轉 HTML
function parseMarkdown(md: string): string {
  let html = md;

  // 程式碼區塊 (```language ... ```)
  html = html.replace(/```(\w+)?\n([\s\S]*?)```/g, (_, lang, code) => {
    return `<pre><code class="language-${lang || ""}">${escapeHtml(code.trim())}</code></pre>`;
  });

  // 行內程式碼 (`code`)
  html = html.replace(/`([^`]+)`/g, "<code>$1</code>");

  // 表格
  html = html.replace(
    /^\|(.+)\|\s*\n\|[-:\| ]+\|\s*\n((?:\|.+\|\s*\n?)+)/gm,
    (_, header, body) => {
      const headers = header.split("|").map((h: string) => h.trim()).filter(Boolean);
      const rows = body.trim().split("\n").map((row: string) => 
        row.split("|").map((c: string) => c.trim()).filter(Boolean)
      );
      
      let table = "<table><thead><tr>";
      headers.forEach((h: string) => {
        table += `<th>${h}</th>`;
      });
      table += "</tr></thead><tbody>";
      rows.forEach((row: string[]) => {
        table += "<tr>";
        row.forEach((cell: string) => {
          table += `<td>${cell}</td>`;
        });
        table += "</tr>";
      });
      table += "</tbody></table>";
      return table;
    }
  );

  // 標題
  html = html.replace(/^#### (.+)$/gm, "<h4>$1</h4>");
  html = html.replace(/^### (.+)$/gm, "<h3>$1</h3>");
  html = html.replace(/^## (.+)$/gm, "<h2>$1</h2>");
  html = html.replace(/^# (.+)$/gm, "<h1>$1</h1>");

  // 粗體和斜體
  html = html.replace(/\*\*\*(.+?)\*\*\*/g, "<strong><em>$1</em></strong>");
  html = html.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");
  html = html.replace(/\*(.+?)\*/g, "<em>$1</em>");

  // 連結
  html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>');

  // 圖片
  html = html.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img src="$2" alt="$1" />');

  // 水平線
  html = html.replace(/^---$/gm, "<hr />");

  // 引用
  html = html.replace(/^> (.+)$/gm, "<blockquote>$1</blockquote>");

  // 無序列表
  html = html.replace(/^- (.+)$/gm, "<li>$1</li>");
  html = html.replace(/(<li>.*<\/li>\n?)+/g, "<ul>$&</ul>");

  // 有序列表
  html = html.replace(/^\d+\. (.+)$/gm, "<li>$1</li>");

  // 勾選框
  html = html.replace(/\[ \]/g, "☐");
  html = html.replace(/\[x\]/gi, "☑");

  // 段落（將連續的非標籤文字包裝成段落）
  const lines = html.split("\n");
  const result: string[] = [];
  let inParagraph = false;
  let paragraphContent: string[] = [];

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) {
      if (inParagraph && paragraphContent.length > 0) {
        result.push(`<p>${paragraphContent.join(" ")}</p>`);
        paragraphContent = [];
        inParagraph = false;
      }
      continue;
    }

    // 檢查是否為 HTML 標籤開頭
    if (
      trimmed.startsWith("<h") ||
      trimmed.startsWith("<pre") ||
      trimmed.startsWith("<table") ||
      trimmed.startsWith("<ul") ||
      trimmed.startsWith("<ol") ||
      trimmed.startsWith("<blockquote") ||
      trimmed.startsWith("<hr") ||
      trimmed.startsWith("<li")
    ) {
      if (inParagraph && paragraphContent.length > 0) {
        result.push(`<p>${paragraphContent.join(" ")}</p>`);
        paragraphContent = [];
        inParagraph = false;
      }
      result.push(line);
    } else {
      inParagraph = true;
      paragraphContent.push(trimmed);
    }
  }

  if (paragraphContent.length > 0) {
    result.push(`<p>${paragraphContent.join(" ")}</p>`);
  }

  return result.join("\n");
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

export default function GuidePage() {
  // 讀取 Markdown 檔案
  let content = "";
  try {
    const filePath = join(process.cwd(), "SYSTEM_GUIDE.md");
    const markdown = readFileSync(filePath, "utf-8");
    content = parseMarkdown(markdown);
  } catch (error) {
    content = "<p>無法載入說明書內容</p>";
  }

  return <GuideClient content={content} />;
}

export const metadata = {
  title: "系統說明書 | MB Packaging",
  description: "MB Packaging 網站系統使用說明書",
  robots: "noindex, nofollow",
};
