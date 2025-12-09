import { NextRequest, NextResponse } from 'next/server';
import sharp from 'sharp';

export async function GET(req: NextRequest) {
  try {
    const imageUrl = req.nextUrl.searchParams.get('url');
    
    if (!imageUrl) {
      return NextResponse.json(
        { error: 'Missing image URL' },
        { status: 400 }
      );
    }

    console.log('[AI Download] Fetching image:', imageUrl);

    // Fetch the image from R2
    const response = await fetch(imageUrl);
    
    if (!response.ok) {
      console.error('[AI Download] Failed to fetch image:', response.status);
      return NextResponse.json(
        { error: 'Failed to fetch image' },
        { status: response.status }
      );
    }

    const imageBuffer = await response.arrayBuffer();
    
    // 從 URL 取得副檔名
    const urlPath = new URL(imageUrl).pathname;
    const ext = urlPath.split('.').pop()?.toLowerCase() || 'png';
    
    // 從 response 取得實際的 content-type
    const contentType = response.headers.get('content-type') || `image/${ext}`;
    
    console.log('[AI Download] Original Content-Type:', contentType, 'Extension:', ext);
    
    // 如果是 AVIF 或 WebP，轉換為 PNG
    const needsConversion = ext === 'avif' || ext === 'webp' || 
                           contentType.includes('avif') || contentType.includes('webp');
    
    let finalBuffer: ArrayBuffer | Buffer = imageBuffer;
    let finalContentType = contentType;
    let finalExt = ext;
    
    if (needsConversion) {
      console.log('[AI Download] Converting to PNG...');
      try {
        finalBuffer = await sharp(Buffer.from(imageBuffer))
          .png({ quality: 95 })
          .toBuffer();
        finalContentType = 'image/png';
        finalExt = 'png';
        console.log('[AI Download] Conversion successful');
      } catch (convError) {
        console.error('[AI Download] Conversion failed, using original:', convError);
        // 轉換失敗就用原始格式
      }
    }
    
    // 根據副檔名決定下載檔名
    const filename = `ai-design-${Date.now()}.${finalExt}`;
    
    console.log('[AI Download] Final Content-Type:', finalContentType, 'Filename:', filename);
    
    // Return the image with proper headers for download
    return new NextResponse(finalBuffer, {
      headers: {
        'Content-Type': finalContentType,
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Cache-Control': 'no-cache',
      },
    });
  } catch (error) {
    console.error('[AI Download] Error:', error);
    return NextResponse.json(
      { error: 'Download failed' },
      { status: 500 }
    );
  }
}
