import { NextRequest, NextResponse } from 'next/server';
import { S3Client, ListObjectsV2Command, GetObjectCommand, PutObjectCommand } from '@aws-sdk/client-s3';
import { GoogleGenerativeAI } from '@google/generative-ai';

const s3Client = new S3Client({
  region: 'auto',
  endpoint: process.env.R2_ENDPOINT as string,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID as string,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY as string,
  },
});

const BUCKET_NAME = process.env.R2_BUCKET_NAME as string;
const R2_PUBLIC_URL = process.env.R2_PUBLIC_URL as string;

// List images from /AItrend/ folder
async function listAItrendImages(folderPath?: string): Promise<string[]> {
  const prefix = folderPath ? `AItrend/${folderPath}/` : 'AItrend/';
  
  try {
    const command = new ListObjectsV2Command({
      Bucket: BUCKET_NAME,
      Prefix: prefix,
      MaxKeys: 1000,
    });

    const response = await s3Client.send(command);
    
    if (!response.Contents) {
      return [];
    }

    // Filter for image files only and exclude /ok/ subdirectories
    const imageUrls = response.Contents
      .filter(item => {
        if (!item.Key) return false;
        const key = item.Key;
        // Skip if it's in /ok/ subfolder
        if (key.includes('/ok/')) return false;
        // Only include image files
        return /\.(jpg|jpeg|png|gif|webp)$/i.test(key);
      })
      .map(item => `${R2_PUBLIC_URL}/${item.Key}`);

    return imageUrls;
  } catch (error) {
    console.error('Error listing AItrend images:', error);
    throw error;
  }
}

// List available date folders
async function listDateFolders(): Promise<string[]> {
  try {
    const command = new ListObjectsV2Command({
      Bucket: BUCKET_NAME,
      Prefix: 'AItrend/',
      Delimiter: '/',
    });

    const response = await s3Client.send(command);
    
    if (!response.CommonPrefixes) {
      return [];
    }

    const folders = response.CommonPrefixes
      .map(prefix => {
        const match = prefix.Prefix?.match(/AItrend\/(.+)\/$/);
        return match ? match[1] : null;
      })
      .filter((f): f is string => f !== null)
      .sort()
      .reverse(); // Most recent first

    return folders;
  } catch (error) {
    console.error('Error listing date folders:', error);
    return [];
  }
}

// Edit image with Gemini 2.0 Flash (Image Generation)
async function editImageWithGemini(
  imageUrl: string,
  prompt: string,
  geminiApiKey: string
): Promise<{ text?: string; imageBase64?: string; mimeType?: string }> {
  try {
    const genAI = new GoogleGenerativeAI(geminiApiKey);
    
    // Use gemini-2.0-flash-exp for image generation/editing
    const model = genAI.getGenerativeModel({ 
      model: 'gemini-2.0-flash-exp',
      generationConfig: {
        // @ts-ignore - responseModalities is available in newer API
        responseModalities: ['Text', 'Image'],
      },
    });

    // Download image
    const imageResponse = await fetch(imageUrl);
    if (!imageResponse.ok) {
      throw new Error('Failed to download image');
    }

    const imageBuffer = await imageResponse.arrayBuffer();
    const base64Image = Buffer.from(imageBuffer).toString('base64');

    // Get image mime type
    const contentType = imageResponse.headers.get('content-type') || 'image/jpeg';
    
    // Generate/Edit image with Gemini 2.0 Flash
    const result = await model.generateContent([
      {
        inlineData: {
          mimeType: contentType,
          data: base64Image,
        },
      },
      `Based on this image, ${prompt}. Generate an edited/improved version of the image.`,
    ]);

    const response = await result.response;
    
    // Check for generated image in response
    const parts = response.candidates?.[0]?.content?.parts || [];
    let resultText = '';
    let resultImage: { imageBase64?: string; mimeType?: string } = {};
    
    for (const part of parts) {
      if ('text' in part && part.text) {
        resultText = part.text;
      }
      if ('inlineData' in part && part.inlineData) {
        resultImage = {
          imageBase64: part.inlineData.data,
          mimeType: part.inlineData.mimeType,
        };
      }
    }

    return {
      text: resultText,
      ...resultImage,
    };
  } catch (error) {
    console.error('Error editing image with Gemini:', error);
    throw error;
  }
}

// Save edited image to R2
async function saveEditedImage(
  originalUrl: string,
  editedImageData: string,
  folderDate: string
): Promise<string> {
  try {
    // Extract original filename
    const urlParts = originalUrl.split('/');
    const originalFilename = urlParts[urlParts.length - 1];
    const timestamp = Date.now();
    const filename = `edited_${timestamp}_${originalFilename}`;
    
    const key = `AItrend/${folderDate}/ok/${filename}`;

    // Convert base64 to buffer if needed
    let buffer: Buffer;
    if (editedImageData.startsWith('data:')) {
      const base64Data = editedImageData.split(',')[1];
      buffer = Buffer.from(base64Data, 'base64');
    } else {
      buffer = Buffer.from(editedImageData, 'base64');
    }

    const command = new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
      Body: buffer,
      ContentType: 'image/jpeg',
    });

    await s3Client.send(command);

    return `${R2_PUBLIC_URL}/${key}`;
  } catch (error) {
    console.error('Error saving edited image:', error);
    throw error;
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');
    const folder = searchParams.get('folder');

    if (action === 'folders') {
      const folders = await listDateFolders();
      return NextResponse.json({ folders });
    }

    if (action === 'images') {
      const images = await listAItrendImages(folder || undefined);
      return NextResponse.json({ images });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    console.error('GET error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, geminiApiKey, imageUrl, prompt, folderDate, password } = body;

    if (action === 'analyze') {
      if (!geminiApiKey) {
        return NextResponse.json({ error: 'Gemini API Key is required' }, { status: 400 });
      }
      if (!imageUrl) {
        return NextResponse.json({ error: 'Image URL is required' }, { status: 400 });
      }
      if (!prompt) {
        return NextResponse.json({ error: 'Prompt is required' }, { status: 400 });
      }

      const result = await editImageWithGemini(imageUrl, prompt, geminiApiKey);

      return NextResponse.json({
        success: true,
        result,
      });
    }

    if (action === 'save') {
      if (!folderDate) {
        return NextResponse.json(
          { error: 'Folder date is required' },
          { status: 400 }
        );
      }

      const { imageBase64, originalUrl } = body;
      
      if (!imageBase64 && !originalUrl) {
        return NextResponse.json(
          { error: 'Image data or URL is required' },
          { status: 400 }
        );
      }

      // Save the edited/generated image to /ok/ folder
      const savedUrl = await saveEditedImage(
        originalUrl || 'generated_image.png',
        imageBase64 || '',
        folderDate
      );

      return NextResponse.json({
        success: true,
        savedUrl,
      });
    }

    if (action === 'validate-password') {
      const isValid = password === '35437316';
      return NextResponse.json({ valid: isValid });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    console.error('POST error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}
