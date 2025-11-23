import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const page = await prisma.sitePage.findUnique({
      where: { slug: "factory" },
    });

    if (!page || !page.isEnabled) {
      return NextResponse.json(null, { status: 404 });
    }

    return NextResponse.json(page);
  } catch (error) {
    return NextResponse.json(null, { status: 500 });
  }
}
