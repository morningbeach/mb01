// scripts/create-watermark.js
// 創建浮水印 PNG 並儲存到 public

require('dotenv').config({ path: '.env.local' });
const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

async function createWatermark() {
  // 浮水印文字
  const text = 'mbpack.co | 清晨沙攤 AI包裝工廠';
  
  // 創建 SVG - 黑色文字，無描邊，透明背景
  const width = 380;
  const height = 30;
  const svg = `
    <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
      <text 
        x="${width / 2}" 
        y="${height / 2 + 5}" 
        font-family="Microsoft JhengHei, PingFang TC, Noto Sans TC, sans-serif"
        font-size="14"
        font-weight="500"
        text-anchor="middle"
        fill="rgba(0,0,0,0.7)"
      >${text}</text>
    </svg>
  `;
  
  // 轉換為 PNG
  const pngBuffer = await sharp(Buffer.from(svg))
    .png()
    .toBuffer();
  
  // 儲存到本地
  const outputPath = path.join(__dirname, '../public/watermark.png');
  fs.writeFileSync(outputPath, pngBuffer);
  
  console.log('Watermark PNG created at:', outputPath);
  console.log('Size:', pngBuffer.length, 'bytes');
}

createWatermark().catch(console.error);
