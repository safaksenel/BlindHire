import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const userId = request.cookies.get("user_id")?.value;
    if (!userId) {
      return NextResponse.json({ message: "Oturum açılmamış." }, { status: 401 });
    }

    const hrUser = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!hrUser || hrUser.role !== "HR" || !hrUser.companyId) {
      return NextResponse.json({ pending: [], manual_review: [], invited: [], completed: [] });
    }

    const companyId = hrUser.companyId;

    const companyJobs = await prisma.jobPosting.findMany({
      where: { companyId },
      include: {
        applications: {
          include: {
            candidate: true
          }
        }
      }
    });

    const allApps = companyJobs.flatMap(job => 
        job.applications.map(app => ({
            ...app,
            jobTitle: job.title
        }))
    );

    const formatCard = (app: any) => ({
        id: app.id,
        candidateId: app.candidate?.id,
        fullName: app.candidate?.fullName || "Bilinmeyen Aday",
        email: app.candidate?.email || "Email Yok",
        cvUrl: app.cvUrl,
        role: app.jobTitle || "Bilinmeyen Pozisyon",
        appliedAt: new Date(app.createdAt).toLocaleDateString("tr-TR"),
        techScore: app.techScore || Math.floor(Math.random() * (90 - 60) + 60),
        reliability: app.reliability || Math.floor(Math.random() * (100 - 80) + 80),
    });

    return NextResponse.json({
        pending: allApps.filter(a => a.status === "PENDING").map(formatCard),
        manual_review: allApps.filter(a => a.status === "MANUAL_REVIEW").map(formatCard),
        invited: allApps.filter(a => a.status === "INVITED").map(formatCard),
        completed: allApps.filter(a => a.status === "COMPLETED").map(formatCard)
    });

  } catch (err) {
    console.error(err);
    return NextResponse.json({ message: "Sunucu hatası." }, { status: 500 });
  }
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const userId = request.cookies.get("user_id")?.value;
    const { applicationId, newStatus } = await request.json();

    if (!userId) return NextResponse.json({ message: "Oturum açılmamış." }, { status: 401 });

    const hrUser = await prisma.user.findUnique({ where: { id: userId } });
    if (!hrUser || hrUser.role !== "HR" || !hrUser.companyId) {
        return NextResponse.json({ message: "Yetkisiz." }, { status: 403 });
    }

    const application = await prisma.application.findUnique({
        where: { id: applicationId },
        include: { jobPosting: true }
    });

    if (!application) return NextResponse.json({ message: "Başvuru bulunamadı." }, { status: 404 });
    if (application.jobPosting.companyId !== hrUser.companyId) {
        return NextResponse.json({ message: "Yetkisiz." }, { status: 403 });
    }

    await prisma.application.update({
        where: { id: applicationId },
        data: { status: newStatus }
    });

    return NextResponse.json({ message: `Aday statüsü ${newStatus} olarak güncellendi.` });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ message: "Sunucu hatası." }, { status: 500 });
  }
}
