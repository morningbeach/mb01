const { createCanvas } = require("canvas");
const fs = require("fs");

// 創建透明背景的浮水印
const text = "mbpack.co | 清晨沙灘 AI包裝工廠";
const fontSize = 18;
const padding = 12;

const canvas = createCanvas(450, 50);
const ctx = canvas.getContext("2d");

// 設定字體（使用 Windows 系統中文字體）
ctx.font = `${fontSize}px "Microsoft JhengHei", "Noto Sans TC", sans-serif`;
ctx.fillStyle = "rgba(0, 0, 0, 0.55)";
ctx.textAlign = "right";
ctx.textBaseline = "middle";

// 繪製文字
ctx.fillText(text, 450 - padding, 25);

// 儲存為 PNG
const buffer = canvas.toBuffer("image/png");
fs.writeFileSync("public/watermark-cn.png", buffer);
console.log("Watermark created! Size:", buffer.length, "bytes");
console.log("File saved to: public/watermark-cn.png");
