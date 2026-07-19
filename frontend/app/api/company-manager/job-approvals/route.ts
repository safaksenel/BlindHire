import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const userId = request.cookies.get("user_id")?.value;
    const role = request.cookies.get("user_role")?.value;

    if (!userId || role !== "COMPANY_MANAGER") {
      return NextResponse.json({ message: "Yetkisiz erişim." }, { status: 403 });
    }

    const manager = await prisma.user.findUnique({
      where: { id: userId },
      select: { companyId: true }
    });

    if (!manager?.companyId) {
      return NextResponse.json({ message: "Firmanız bulunamadı." }, { status: 404 });
    }

    // Get jobs that are PENDING for this company
    const pendingJobs = await prisma.jobPosting.findMany({
      where: { 
        companyId: manager.companyId,
        status: "PENDING"
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ jobs: pendingJobs });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ message: "Sunucu hatası." }, { status: 500 });
  }
}

export async function PUT(request: NextRequest): Promise<NextResponse> {
  try {
    const userId = request.cookies.get("user_id")?.value;
    const role = request.cookies.get("user_role")?.value;

    if (!userId || role !== "COMPANY_MANAGER") {
      return NextResponse.json({ message: "Yetkisiz erişim." }, { status: 403 });
    }

    const { jobId, action } = await request.json(); // action is 'APPROVE' or 'REJECT'
    
    if (!jobId || !["APPROVE", "REJECT"].includes(action)) {
      return NextResponse.json({ message: "Geçersiz istek parametreleri." }, { status: 400 });
    }

    const manager = await prisma.user.findUnique({
      where: { id: userId },
      select: { companyId: true }
    });

    if (!manager?.companyId) {
      return NextResponse.json({ message: "Firmanız bulunamadı." }, { status: 404 });
    }

    const job = await prisma.jobPosting.findUnique({
      where: { id: jobId }
    });

    if (!job) {
      return NextResponse.json({ message: "İlan bulunamadı." }, { status: 404 });
    }

    if (job.companyId !== manager.companyId) {
      return NextResponse.json({ message: "Bu işlem için yetkiniz yok." }, { status: 403 });
    }

    if (job.status !== "PENDING") {
      return NextResponse.json({ message: "Bu ilan artık onay beklemiyor." }, { status: 400 });
    }

    const newStatus = action === "APPROVE" ? "ACTIVE" : "REJECTED";

    const updatedJob = await prisma.jobPosting.update({
      where: { id: jobId },
      data: { status: newStatus }
    });

    return NextResponse.json({ message: `İlan başarıyla ${action === "APPROVE" ? "onaylandı" : "reddedildi"}.`, job: updatedJob });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ message: "Sunucu hatası." }, { status: 500 });
  }
}
