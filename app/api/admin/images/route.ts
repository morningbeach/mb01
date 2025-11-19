import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
export async function GET(){
  const items = await prisma.imageAsset.findMany({orderBy:{createdAt:"desc"}, take:200});
  return NextResponse.json(items);
}
