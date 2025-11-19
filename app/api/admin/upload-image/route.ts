// updated for R2
import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import path from "path";
import { prisma } from "@/lib/prisma";
import { uploadToR2 } from "@/lib/r2";

export const runtime="nodejs";
export const dynamic="force-dynamic";

export async function POST(req: NextRequest){
  try{
    const formData = await req.formData();
    const file = formData.get("file");
    if(!(file instanceof File)){
      return NextResponse.json({error:"No file"}, {status:400});
    }
    const buf = Buffer.from(await file.arrayBuffer());
    const original = file.name||"upload";
    const ext = path.extname(original)||".jpg";
    const hash = crypto.randomBytes(8).toString("hex");
    const fileName = `${Date.now()}-${hash}${ext}`;
    const key = `uploads/${fileName}`;
    const url = await uploadToR2(key, buf, file.type||"application/octet-stream");

    const image = await prisma.imageAsset.create({
      data:{ url, label: original }
    });

    return NextResponse.json({ok:true, id:image.id, url:image.url, label:image.label});
  }catch(e){
    return NextResponse.json({error:String(e)}, {status:500});
  }
}
export async function GET(){return NextResponse.json({ok:false})}
