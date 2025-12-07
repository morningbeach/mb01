// scripts/create-watermark.js
// 創建浮水印 PNG 並上傳到 R2

require('dotenv').config({ path: '.env.local' });
const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

async function createWatermark() {
  // 浮水印文字
  const text = 'mbpack.co | 清晨沙攤 AI包裝工廠';
  
  // 創建 SVG（這會在本地運行，有中文字體支援）
  const width = 500;
  const height = 40;
  const svg = `
    <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
      <style>
        .watermark {
          font-family: 'Microsoft JhengHei', 'PingFang TC', 'Noto Sans TC', sans-serif;
          font-size: 18px;
          font-weight: 500;
        }
      </style>
      <text 
        x="${width - 10}" 
        y="${height / 2 + 6}" 
        class="watermark"
        text-anchor="end"
        fill="rgba(255,255,255,0.9)"
        filter="drop-shadow(1px 1px 2px rgba(0,0,0,0.6))"
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
  console.log('\nNow upload this file to R2 manually:');
  console.log('  Key: assets/watermark.png');
  console.log('  URL will be: https://img.mbpack.co/assets/watermark.png');
}

createWatermark().catch(console.error);
