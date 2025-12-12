// test-r2.js - Test R2 connection
require('dotenv').config({ path: '.env.local' });

const { S3Client, ListObjectsV2Command } = require('@aws-sdk/client-s3');

const accountId = process.env.R2_ACCOUNT_ID;
const endpoint = process.env.R2_ENDPOINT || `https://${accountId}.r2.cloudflarestorage.com`;

console.log('R2_ACCOUNT_ID:', accountId ? 'SET' : 'MISSING');
console.log('R2_ACCESS_KEY:', process.env.R2_ACCESS_KEY ? 'SET' : 'MISSING');
console.log('R2_SECRET_KEY:', process.env.R2_SECRET_KEY ? 'SET' : 'MISSING');
console.log('R2_BUCKET_NAME:', process.env.R2_BUCKET_NAME);
console.log('R2_PUBLIC_BASE_URL:', process.env.R2_PUBLIC_BASE_URL);
console.log('Endpoint:', endpoint);
console.log('---');

const client = new S3Client({
  region: 'auto',
  endpoint,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY,
    secretAccessKey: process.env.R2_SECRET_KEY,
  },
});

async function test() {
  let allKeys = [];
  let continuationToken;
  
  do {
    const cmd = new ListObjectsV2Command({
      Bucket: process.env.R2_BUCKET_NAME,
      MaxKeys: 1000,
      ContinuationToken: continuationToken,
    });
    
    const res = await client.send(cmd);
    const keys = res.Contents?.map(o => o.Key) || [];
    allKeys.push(...keys);
    
    continuationToken = res.IsTruncated ? res.NextContinuationToken : undefined;
    console.log(`Fetched ${keys.length} objects, total: ${allKeys.length}, more: ${!!continuationToken}`);
  } while (continuationToken);
  
  console.log('\n--- Total objects:', allKeys.length);
  
  // Group by folder
  const folders = {};
  allKeys.forEach(key => {
    const parts = key.split('/');
    const folder = parts.length > 1 ? parts[0] : '(root)';
    folders[folder] = (folders[folder] || 0) + 1;
  });
  
  console.log('\n--- Files per folder:');
  Object.entries(folders).sort((a, b) => b[1] - a[1]).forEach(([folder, count]) => {
    console.log(`  ${folder}: ${count}`);
  });
}

test().catch(console.error);
