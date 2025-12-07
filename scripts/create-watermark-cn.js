const { createCanvas } = require("canvas");
const fs = require("fs");

// 創建透明背景的浮水印
const text = "mbpack.co | 清晨沙灘 AI包裝工廠";
const fontSize = 14;
const padding = 8;

// 測量文字寬度
const tempCanvas = createCanvas(100, 100);
const tempCtx = tempCanvas.getContext("2d");
tempCtx.font = `${fontSize}px "Microsoft JhengHei", Arial, sans-serif`;
const textWidth = tempCtx.measureText(text).width;

const canvasWidth = Math.ceil(textWidth + padding * 2);
const canvasHeight = Math.ceil(fontSize * 1.5 + padding * 2);

console.log("Canvas size:", canvasWidth, "x", canvasHeight);
console.log("Text width:", textWidth);

const canvas = createCanvas(canvasWidth, canvasHeight);
const ctx = canvas.getContext("2d");

// 確保透明背景
ctx.clearRect(0, 0, canvasWidth, canvasHeight);

// 設定字體（使用 Windows 系統中文字體）
ctx.font = `${fontSize}px "Microsoft JhengHei", Arial, sans-serif`;
ctx.fillStyle = "rgba(0, 0, 0, 0.6)";  // 稍微深一點的黑色
ctx.textAlign = "left";
ctx.textBaseline = "middle";

// 繪製文字
ctx.fillText(text, padding, canvasHeight / 2);

// 儲存為 PNG
const buffer = canvas.toBuffer("image/png");
fs.writeFileSync("public/watermark-cn.png", buffer);
console.log("✅ Watermark created! Size:", buffer.length, "bytes");
console.log("File saved to: public/watermark-cn.png");
