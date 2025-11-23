// lib/r2.ts
import {
  S3Client,
  PutObjectCommand,
  ListObjectsV2Command,
} from "@aws-sdk/client-s3";

const accountId = process.env.R2_ACCOUNT_ID ?? "";           // 例如 c69e3d1a7fc9...
const accessKeyId = process.env.R2_ACCESS_KEY_ID ?? "";
const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY ?? "";
const bucketName = process.env.R2_BUCKET_NAME ?? "";
const publicBaseUrl = process.env.R2_PUBLIC_BASE_URL ?? "";  // 例如 https://img.mbpack.co

// 允許你在 .env 裡直接指定完整 endpoint；如果沒給，就用 accountId 組出預設的
const envEndpoint = process.env.R2_ENDPOINT;
const endpoint =
  envEndpoint && envEndpoint.trim().length > 0
    ? envEndpoint.trim()
    : accountId
    ? `https://${accountId}.r2.cloudflarestorage.com`
    : "";

if (!accountId || !accessKeyId || !secretAccessKey || !bucketName || !publicBaseUrl) {
  console.warn("[R2] Missing R2 env vars, please check .env");
}
if (!endpoint) {
  console.warn("[R2] Missing endpoint. Set R2_ACCOUNT_ID or R2_ENDPOINT.");
}

console.log("[R2] Using endpoint:", endpoint);

export const r2Client = new S3Client({
  region: "auto",
  endpoint,
  credentials: {
    accessKeyId,
    secretAccessKey,
  },
});

// 圖片 item 的共用型別（Library / API 共用）
export type R2ImageItem = {
  key: string;
  url: string;
  size: number;
  lastModified: Date | null;
};

// ✅ 上傳到 R2，回傳對外公開 URL
export async function uploadToR2(
  key: string,
  body: Buffer,
  contentType: string,
): Promise<string> {
  const command = new PutObjectCommand({
    Bucket: bucketName,
    Key: key,
    Body: body,
    ContentType: contentType,
  });

  await r2Client.send(command);

  const url = `${publicBaseUrl}/${key}`;
  return url;
}

// ✅ 列出 R2 圖片（給 /api/admin/images 或其他 API 用）
export async function listR2Images(options?: {
  prefix?: string;
  maxKeys?: number;
}): Promise<R2ImageItem[]> {
  const prefix = options?.prefix ?? "";
  const maxKeys = options?.maxKeys ?? 200;

  const command = new ListObjectsV2Command({
    Bucket: bucketName,
    Prefix: prefix,
    MaxKeys: maxKeys,
  });

  const res = await r2Client.send(command);

  const items: R2ImageItem[] =
    res.Contents?.filter((obj) => !!obj.Key).map((obj) => {
      const key = obj.Key!;
      const url = `${publicBaseUrl}/${key}`;
      return {
        key,
        url,
        size: Number(obj.Size ?? 0),
        lastModified: (obj.LastModified as Date) ?? null,
      };
    }) ?? [];

  return items;
}

// ✅ 列出 R2 物件（返回完整資訊，包含 size 和 lastModified 字串）
export async function listR2Objects(options?: {
  prefix?: string;
  maxKeys?: number;
}): Promise<Array<{ key: string; url: string; size: number; lastModified: string }>> {
  const prefix = options?.prefix ?? "";
  const maxKeys = options?.maxKeys ?? 1000;

  const command = new ListObjectsV2Command({
    Bucket: bucketName,
    Prefix: prefix,
    MaxKeys: maxKeys,
  });

  const res = await r2Client.send(command);

  const items =
    res.Contents?.filter((obj) => !!obj.Key).map((obj) => {
      const key = obj.Key!;
      const url = `${publicBaseUrl}/${key}`;
      return {
        key,
        url,
        size: Number(obj.Size ?? 0),
        lastModified: obj.LastModified?.toISOString() ?? new Date().toISOString(),
      };
    }) ?? [];

  return items;
}

export const R2_PUBLIC_BASE_URL = publicBaseUrl;
