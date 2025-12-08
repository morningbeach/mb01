// scripts/check-r2-structure.js
const { S3Client, ListObjectsV2Command } = require('@aws-sdk/client-s3');
require('dotenv').config();

const r2Client = new S3Client({
  region: 'auto',
  endpoint: process.env.R2_ENDPOINT,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
  },
});

const bucketName = process.env.R2_BUCKET_NAME;

async function checkStructure() {
  console.log('Checking R2 structure...');
  console.log('Bucket:', bucketName);
  
  // 列出根目錄
  const rootCommand = new ListObjectsV2Command({
    Bucket: bucketName,
    Delimiter: '/',
    MaxKeys: 100,
  });
  
  const rootRes = await r2Client.send(rootCommand);
  
  console.log('\n=== Root Level Folders ===');
  if (rootRes.CommonPrefixes) {
    rootRes.CommonPrefixes.forEach(p => console.log('📁', p.Prefix));
  }
  
  console.log('\n=== Root Level Files (first 10) ===');
  if (rootRes.Contents) {
    rootRes.Contents.slice(0, 10).forEach(f => console.log('📄', f.Key));
  }
  
  // 列出 uploads/ 下的結構
  const uploadsCommand = new ListObjectsV2Command({
    Bucket: bucketName,
    Prefix: 'uploads/',
    Delimiter: '/',
    MaxKeys: 100,
  });
  
  const uploadsRes = await r2Client.send(uploadsCommand);
  
  console.log('\n=== uploads/ Folders ===');
  if (uploadsRes.CommonPrefixes) {
    uploadsRes.CommonPrefixes.forEach(p => console.log('📁', p.Prefix));
  }
  
  // 統計所有檔案數量
  let totalCount = 0;
  let continuationToken;
  
  do {
    const countCommand = new ListObjectsV2Command({
      Bucket: bucketName,
      MaxKeys: 1000,
      ContinuationToken: continuationToken,
    });
    
    const countRes = await r2Client.send(countCommand);
    totalCount += countRes.Contents?.length || 0;
    continuationToken = countRes.IsTruncated ? countRes.NextContinuationToken : undefined;
  } while (continuationToken);
  
  console.log('\n=== Total Files in Bucket ===');
  console.log('Total:', totalCount);
}

checkStructure().catch(console.error);
