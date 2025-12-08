// app/api/admin/upload-video/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { uploadToR2 } from '@/lib/r2';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('video') as File;
    
    if (!file) {
      return NextResponse.json(
        { success: false, error: '請選擇影片檔案' },
        { status: 400 }
      );
    }

    // 檢查檔案類型
    if (!file.type.startsWith('video/')) {
      return NextResponse.json(
        { success: false, error: '請上傳影片檔案（MP4, WebM 等）' },
        { status: 400 }
      );
    }

    // 檢查檔案大小（限制 100MB）
    const maxSize = 100 * 1024 * 1024; // 100MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { success: false, error: '影片檔案不能超過 100MB' },
        { status: 400 }
      );
    }

    console.log('[Upload Video] Uploading:', file.name, 'Size:', file.size);

    // 讀取檔案內容
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // 產生檔案名稱
    const timestamp = Date.now();
    const ext = file.name.split('.').pop() || 'mp4';
    const filename = `videos/${timestamp}-${file.name}`;

    // 上傳到 R2
    const url = await uploadToR2(filename, buffer, file.type);

    console.log('[Upload Video] Success:', url);

    return NextResponse.json({
      success: true,
      url,
      filename: file.name,
      size: file.size,
    });

  } catch (error: any) {
    console.error('[Upload Video] Error:', error);
    return NextResponse.json(
      { success: false, error: error.message || '上傳失敗' },
      { status: 500 }
    );
  }
}
