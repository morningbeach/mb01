// 手動上傳浮水印到 R2
import { r2Client } from "../lib/r2.js";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import * as fs from "fs";

const bucketName = process.env.R2_BUCKET_NAME ?? "";
const publicBaseUrl = process.env.R2_PUBLIC_BASE_URL ?? "";

async function uploadWatermark() {
  try {
    const buffer = fs.readFileSync("public/watermark-cn.png");
    
    const command = new PutObjectCommand({
      Bucket: bucketName,
      Key: "watermark-cn.png",
      Body: buffer,
      ContentType: "image/png",
    });
    
    await r2Client.send(command);
    
    const url = `${publicBaseUrl}/watermark-cn.png`;
    console.log("✅ Watermark uploaded to R2:", url);
    console.log("File size:", buffer.length, "bytes");
    
    return url;
  } catch (error) {
    console.error("❌ Upload failed:", error);
    throw error;
  }
}

uploadWatermark();
