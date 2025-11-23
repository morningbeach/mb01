// app/api/pages/contact/route.ts
import { NextResponse } from "next/server";
import { prisma } from "../../../../lib/prisma";

export async function GET() {
  try {
    const page = await prisma.sitePage.findUnique({
      where: { slug: "contact" },
    });

    if (!page) {
      return NextResponse.json({ error: "Page not found" }, { status: 404 });
    }

    return NextResponse.json(page);
  } catch (error) {
    console.error("Error fetching contact page:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
