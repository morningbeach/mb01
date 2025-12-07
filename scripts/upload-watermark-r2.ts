import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import * as fs from "fs";

const bucketName = process.env.R2_BUCKET_NAME!;
const publicBaseUrl = process.env.R2_PUBLIC_BASE_URL!;
const endpoint = process.env.R2_ENDPOINT!;
const accessKeyId = process.env.R2_ACCESS_KEY!;
const secretAccessKey = process.env.R2_SECRET_KEY!;

const client = new S3Client({
  region: "auto",
  endpoint,
  credentials: {
    accessKeyId,
    secretAccessKey,
  },
});

async function uploadWatermark() {
  const buffer = fs.readFileSync("public/watermark-cn.png");
  
  const command = new PutObjectCommand({
    Bucket: bucketName,
    Key: "watermark-cn.png",
    Body: buffer,
    ContentType: "image/png",
  });
  
  await client.send(command);
  
  const url = `${publicBaseUrl}/watermark-cn.png`;
  console.log("✅ Watermark uploaded to R2:", url);
  console.log("File size:", buffer.length, "bytes");
}

uploadWatermark().catch(console.error);
