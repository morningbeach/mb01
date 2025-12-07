// 上傳浮水印到 R2
import { uploadToR2 } from "../lib/r2";
import * as fs from "fs";

async function upload() {
  const buffer = fs.readFileSync("public/watermark-cn.png");
  const result = await uploadToR2(buffer, "watermark-cn.png", "image/png");
  console.log("Uploaded to R2:", result);
}

upload().catch(console.error);
