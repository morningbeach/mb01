// app/api/admin/contact-inquiries/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const inquiry = await prisma.contactInquiry.findUnique({
      where: { id: params.id },
    });

    if (!inquiry) {
      return NextResponse.json(
        { success: false, error: "Inquiry not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      inquiry,
    });
  } catch (error: any) {
    console.error("[Get Inquiry Error]", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch inquiry" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const { status, notes, assignedTo, repliedAt } = body;

    const updateData: any = {};
    if (status) updateData.status = status;
    if (notes !== undefined) updateData.notes = notes;
    if (assignedTo !== undefined) updateData.assignedTo = assignedTo;
    if (repliedAt !== undefined) updateData.repliedAt = repliedAt;

    const inquiry = await prisma.contactInquiry.update({
      where: { id: params.id },
      data: updateData,
    });

    return NextResponse.json({
      success: true,
      inquiry,
    });
  } catch (error: any) {
    console.error("[Update Inquiry Error]", error);
    return NextResponse.json(
      { success: false, error: "Failed to update inquiry" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await prisma.contactInquiry.delete({
      where: { id: params.id },
    });

    return NextResponse.json({
      success: true,
      message: "Inquiry deleted successfully",
    });
  } catch (error: any) {
    console.error("[Delete Inquiry Error]", error);
    return NextResponse.json(
      { success: false, error: "Failed to delete inquiry" },
      { status: 500 }
    );
  }
}
