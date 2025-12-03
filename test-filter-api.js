// 測試 bag 材質篩選器中是否有帆布和棉布
const https = require('http');

const url = 'http://localhost:3000/api/filter-dimensions?category=bag';

https.get(url, (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    const result = JSON.parse(data);
    
    // 找材質維度
    const materialDim = result.data?.find(d => d.slug === 'bag-material');
    
    if (!materialDim) {
      console.log('❌ 找不到 bag-material 維度');
      return;
    }
    
    console.log('=== bag-material 材質維度 ===\n');
    console.log('標籤數量:', materialDim.tags.length);
    console.log('\n所有標籤:');
    materialDim.tags.forEach(t => {
      console.log(`  - ${t.name_zh} (${t.slug}) - ${t.productCount} 個產品`);
    });
    
    // 檢查帆布和棉布
    const canvas = materialDim.tags.find(t => t.slug === 'canvas');
    const cotton = materialDim.tags.find(t => t.slug === 'cotton');
    
    console.log('\n=== 檢查結果 ===');
    console.log('帆布 (canvas):', canvas ? '✅ 有' : '❌ 沒有');
    console.log('棉布 (cotton):', cotton ? '✅ 有' : '❌ 沒有');
  });
}).on('error', (e) => {
  console.error('請求失敗:', e.message);
});
