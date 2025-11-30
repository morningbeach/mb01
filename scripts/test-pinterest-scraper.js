// scripts/test-pinterest-scraper.js
// 測試 Pinterest Search Scraper 整合

const { searchPinterest, savePinterestResultsToJSON, savePinterestResultsToCSV, getPinterestStats } = require("../lib/pinterest-scraper");

async function main() {
  console.log("========================================");
  console.log("Pinterest Search Scraper 測試");
  console.log("========================================\n");

  try {
    // 測試設定
    const testConfig = {
      queries: [
        "packaging design",
        "gift box"
      ],
      limit: 20, // 測試用小數量
      proxyConfiguration: {
        useApifyProxy: true,
        apifyProxyGroups: ["RESIDENTIAL"]
      }
    };

    console.log("測試設定:");
    console.log(JSON.stringify(testConfig, null, 2));
    console.log("\n");

    // 執行搜尋
    console.log("開始搜尋...\n");
    const results = await searchPinterest(testConfig);

    // 顯示結果
    console.log("\n========================================");
    console.log("搜尋結果");
    console.log("========================================\n");

    results.forEach((result, index) => {
      console.log(`${index + 1}. 查詢: "${result.query}"`);
      console.log(`   共 ${result.totalCount} 筆資料`);
      console.log(`   Actor Run ID: ${result.actorRunId || "N/A"}`);
      console.log(`   Dataset ID: ${result.datasetId || "N/A"}`);
      
      if (result.pins.length > 0) {
        console.log(`   範例 Pin:`);
        const pin = result.pins[0];
        console.log(`   - ID: ${pin.id}`);
        console.log(`   - 標題: ${pin.title}`);
        console.log(`   - 圖片: ${pin.imageUrl.substring(0, 60)}...`);
        console.log(`   - Repins: ${pin.repinCount || 0}`);
        console.log(`   - Comments: ${pin.commentCount || 0}`);
      }
      console.log("");
    });

    // 統計資訊
    const stats = getPinterestStats(results);
    console.log("========================================");
    console.log("統計資訊");
    console.log("========================================\n");
    console.log(`總查詢數: ${stats.totalQueries}`);
    console.log(`總 Pins 數: ${stats.totalPins}`);
    console.log(`平均每查詢: ${stats.avgPinsPerQuery}`);
    console.log(`總轉發數: ${stats.totalRepins}`);
    console.log(`總評論數: ${stats.totalComments}`);
    console.log(`總反應數: ${stats.totalReactions}\n`);

    // 儲存結果
    console.log("========================================");
    console.log("儲存結果");
    console.log("========================================\n");

    const jsonPath = await savePinterestResultsToJSON(results, "./data/pinterest-test");
    console.log(`✓ JSON 已儲存: ${jsonPath}`);

    const csvPath = await savePinterestResultsToCSV(results, "./data/pinterest-test");
    console.log(`✓ CSV 已儲存: ${csvPath}`);

    console.log("\n========================================");
    console.log("測試完成！");
    console.log("========================================\n");

  } catch (error) {
    console.error("\n❌ 測試失敗:", error);
    console.error(error.stack);
    process.exit(1);
  }
}

// 執行測試
main();
