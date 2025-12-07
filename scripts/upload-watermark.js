// scripts/upload-watermark.js
// 使用現有的 R2 上傳功能上傳浮水印

require('dotenv').config({ path: '.env.local' });
const fs = require('fs');
const path = require('path');

// 複製 lib/r2.ts 的邏輯
const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');

const R2_ENDPOINT = `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`;
const R2_BUCKET = process.env.R2_BUCKET_NAME || 'mbpack-images';

const r2Client = new S3Client({
  region: 'auto',
  endpoint: R2_ENDPOINT,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
  },
});

async function uploadWatermark() {
  const filePath = path.join(__dirname, '../public/watermark.png');
  const fileBuffer = fs.readFileSync(filePath);
  
  console.log('Uploading watermark.png to R2...');
  console.log('Endpoint:', R2_ENDPOINT);
  console.log('Bucket:', R2_BUCKET);
  console.log('File size:', fileBuffer.length);
  
  const command = new PutObjectCommand({
    Bucket: R2_BUCKET,
    Key: 'assets/watermark.png',
    Body: fileBuffer,
    ContentType: 'image/png',
    CacheControl: 'public, max-age=31536000',
  });
  
  try {
    await r2Client.send(command);
    console.log('\n✅ Upload successful!');
    console.log('URL: https://img.mbpack.co/assets/watermark.png');
  } catch (error) {
    console.error('Upload failed:', error.message);
    console.log('\nPlease upload manually via Cloudflare R2 dashboard');
  }
}

uploadWatermark();
