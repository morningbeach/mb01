// app/api/admin/file-upload/route.ts
// 管理後台 - 檔案上傳到 R2
import { NextRequest, NextResponse } from "next/server";
import { uploadToR2 } from "@/lib/r2";

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json(
        { success: false, error: '請選擇檔案' },
        { status: 400 }
      );
    }

    // 檢查檔案大小 (限制 100MB)
    const maxSize = 100 * 1024 * 1024; // 100MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { success: false, error: '檔案大小不能超過 100MB' },
        { status: 400 }
      );
    }

    // 取得檔案資訊
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const timestamp = Date.now();
    const ext = file.name.split('.').pop() || 'bin';
    const sanitizedName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
    
    // 根據檔案類型分類存放
    let folder = 'uploads/files';
    if (file.type.startsWith('video/')) {
      folder = 'uploads/videos';
    } else if (file.type.startsWith('image/')) {
      folder = 'uploads/images';
    }

    const filename = `${folder}/${timestamp}_${sanitizedName}`;

    console.log('[File Upload] Uploading:', filename, 'Size:', file.size, 'Type:', file.type);

    // 上傳到 R2
    const url = await uploadToR2(filename, buffer, file.type);

    console.log('[File Upload] Upload success:', url);

    return NextResponse.json({
      success: true,
      url,
      filename: file.name,
      size: file.size,
      type: file.type,
    });

  } catch (error: any) {
    console.error('[File Upload] Error:', error);
    return NextResponse.json(
      { success: false, error: error.message || '上傳失敗' },
      { status: 500 }
    );
  }
}
