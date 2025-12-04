import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";

export async function POST(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const path = searchParams.get("path");

    if (!path) {
      return NextResponse.json({ error: "Path is required" }, { status: 400 });
    }

    // Revalidate the specified path
    revalidatePath(path);

    return NextResponse.json({ 
      success: true, 
      revalidated: true, 
      path,
      timestamp: Date.now() 
    });
  } catch (error) {
    console.error("Error revalidating:", error);
    return NextResponse.json({ error: "Failed to revalidate" }, { status: 500 });
  }
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const path = searchParams.get("path");

  if (!path) {
    return NextResponse.json({ error: "Path is required" }, { status: 400 });
  }

  revalidatePath(path);

  return NextResponse.json({ 
    success: true, 
    revalidated: true, 
    path,
    timestamp: Date.now() 
  });
}
