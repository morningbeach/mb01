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
    
    // Return the image with proper headers for download
    return new NextResponse(imageBuffer, {
      headers: {
        'Content-Type': 'image/png',
        'Content-Disposition': `attachment; filename="ai-design-${Date.now()}.png"`,
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
