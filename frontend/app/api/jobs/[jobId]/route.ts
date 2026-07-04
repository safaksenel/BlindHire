import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: Request,
  props: { params: Promise<{ jobId: string }> }
): Promise<NextResponse> {
  try {
    const { jobId } = await props.params;
    
    const job = await prisma.jobPosting.findUnique({
      where: { id: jobId, status: "ACTIVE" },
      include: { company: true },
    });
    
    if (!job) {
      return NextResponse.json({ message: "İlan bulunamadı veya pasif durumda." }, { status: 404 });
    }

    return NextResponse.json({
      ...job,
      companyName: job.company?.name || "Bilinmeyen Firma",
    });
  } catch {
    return NextResponse.json({ message: "Sunucu hatası." }, { status: 500 });
  }
}
