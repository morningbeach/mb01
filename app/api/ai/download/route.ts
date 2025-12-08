import { NextRequest, NextResponse } from 'next/server';

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
    
    // 根據副檔名決定下載檔名
    const filename = `ai-design-${Date.now()}.${ext}`;
    
    console.log('[AI Download] Content-Type:', contentType, 'Extension:', ext);
    
    // Return the image with proper headers for download
    return new NextResponse(imageBuffer, {
      headers: {
        'Content-Type': contentType,
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
