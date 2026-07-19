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

    const companyId = manager.companyId;

    // 1. HR Users
    const hrUsers = await prisma.user.findMany({
      where: { companyId, role: "HR" },
      orderBy: { createdAt: "desc" },
      select: { id: true, fullName: true, email: true, createdAt: true }
    });

    // 2. Settings
    let settings = await prisma.hRSettings.findUnique({
      where: { companyId }
    });

    if (!settings) {
      settings = {
        id: "default",
        companyId,
        stage1AutoProceedThreshold: 75,
        stage1AutoRejectThreshold: 50,
        stage2AutoInviteThreshold: 75,
        stage2AutoRejectThreshold: 60,
        stage3AutoProceedThreshold: 75,
        stage3AutoRejectThreshold: 50,
        stage4AutoHireThreshold: 80,
        stage4AutoRejectThreshold: 50,
        autoApproveJobs: true,
        createdAt: new Date(),
        updatedAt: new Date()
      };
    }

    // 3. Jobs with nested applications
    const jobs = await prisma.jobPosting.findMany({
      where: { companyId },
      orderBy: { createdAt: "desc" },
      select: { 
        id: true, 
        title: true, 
        status: true, 
        applications: { 
          orderBy: { createdAt: "desc" },
          select: { 
            id: true, 
            status: true, 
            techScore: true, 
            reliability: true,
            cvUrl: true,
            candidate: { select: { fullName: true } }
          }
        } 
      }
    });

    return NextResponse.json({
      hrUsers,
      settings,
      jobs
    }, {
      headers: {
        'Cache-Control': 'no-store, max-age=0, must-revalidate',
      }
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ message: "Sunucu hatası." }, { status: 500 });
  }
}
