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

// 創建 RGBA canvas 確保支援透明度
const canvas = createCanvas(canvasWidth, canvasHeight, 'image');
const ctx = canvas.getContext("2d", { alpha: true });

// 完全清除背景，確保所有像素都是透明的
ctx.clearRect(0, 0, canvasWidth, canvasHeight);

// 設定字體（使用 Windows 系統中文字體）
ctx.font = `${fontSize}px "Microsoft JhengHei", Arial, sans-serif`;
ctx.fillStyle = "rgba(0, 0, 0, 0.65)";  // 純黑色，65% 不透明度
ctx.textAlign = "left";
ctx.textBaseline = "middle";

// 繪製文字
ctx.fillText(text, padding, canvasHeight / 2);

// 儲存為 PNG with alpha channel
const buffer = canvas.toBuffer("image/png", { 
  compressionLevel: 6,
  filters: canvas.PNG_FILTER_NONE 
});

fs.writeFileSync("public/watermark-cn.png", buffer);
console.log("✅ Watermark created! Size:", buffer.length, "bytes");
console.log("File saved to: public/watermark-cn.png");

// 驗證透明度
const { createCanvas: cc2, Image } = require("canvas");
const img = new Image();
img.src = buffer;
const testCanvas = cc2(img.width, img.height);
const testCtx = testCanvas.getContext("2d");
testCtx.drawImage(img, 0, 0);
const imageData = testCtx.getImageData(0, 0, img.width, img.height);
let transparentPixels = 0;
let opaquePixels = 0;
for(let i = 3; i < imageData.data.length; i += 4) {
  if(imageData.data[i] === 0) transparentPixels++;
  else opaquePixels++;
}
console.log("Transparent pixels:", transparentPixels, "Opaque pixels:", opaquePixels);
