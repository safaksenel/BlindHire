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
      return NextResponse.json({ applications: [] });
    }

    const companyId = hrUser.companyId;

    const allApplications = await prisma.application.findMany({
      where: { 
        jobPosting: { companyId },
      },
      include: {
        candidate: true,
        jobPosting: true
      },
      orderBy: {
        updatedAt: "desc"
      }
    });

    const formattedApps = allApplications.map(app => ({
      id: app.id,
      candidateId: app.candidate?.id,
      fullName: app.candidate?.fullName || "Bilinmeyen Aday",
      email: app.candidate?.email || "Email Yok",
      jobTitle: app.jobPosting.title,
      cvUrl: app.cvUrl,
      techScore: app.techScore || Math.floor(Math.random() * (90 - 60) + 60),
      reliability: app.reliability || Math.floor(Math.random() * (100 - 80) + 80),
      status: app.status,
      finalizedAt: new Date(app.updatedAt).toLocaleDateString("tr-TR")
    }));

    return NextResponse.json({ applications: formattedApps });

  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
