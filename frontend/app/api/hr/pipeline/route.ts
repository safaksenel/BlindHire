import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const userId = request.cookies.get("user_id")?.value;
    if (!userId) return NextResponse.json({ message: "Oturum açılmamış." }, { status: 401 });

    const hrUser = await prisma.user.findUnique({ where: { id: userId } });
    if (!hrUser || hrUser.role !== "HR" || !hrUser.companyId) {
      return NextResponse.json({ pending: [], llm_review: [], manual_review: [], invited: [], completed: [], hired: [] });
    }

    const companyId = hrUser.companyId;

    const companyJobs = await prisma.jobPosting.findMany({
      where: { companyId },
      include: {
        company: true,
        applications: {
          include: { candidate: true }
        }
      }
    });

    const allApps = companyJobs.flatMap(job => 
        job.applications.map(app => ({ ...app, jobTitle: job.title, companyName: job.company?.name || "Şirket" }))
    );

    const formatCard = (app: any) => ({
        id: app.id,
        candidateId: app.candidate?.id,
        fullName: app.candidate?.fullName || "Bilinmeyen Aday",
        email: app.candidate?.email || "Email Yok",
        cvUrl: app.cvUrl,
        role: app.jobTitle || "Bilinmeyen Pozisyon",
        companyName: app.companyName || "Şirket",
        appliedAt: new Date(app.createdAt).toLocaleDateString("tr-TR"),
        techScore: app.techScore,
        reliability: app.reliability,
        interviewScore: app.interviewScore,
        overallScore: app.overallScore,
    });

    return NextResponse.json({
        pending: allApps.filter(a => a.status === "PENDING").map(formatCard),
        llm_review: allApps.filter(a => a.status === "LLM_REVIEW").map(formatCard),
        manual_review: allApps.filter(a => a.status === "MANUAL_REVIEW").map(formatCard),
        invited: allApps.filter(a => a.status === "INVITED" || a.status === "INTERVIEW_INVITED").map(formatCard),
        completed: allApps.filter(a => a.status === "COMPLETED").map(formatCard),
        hired: allApps.filter(a => a.status === "HIRED").map(formatCard)
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

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
        return NextResponse.json({ message: "Kullanıcı bulunamadı." }, { status: 401 });
    }

    const application = await prisma.application.findUnique({
        where: { id: applicationId },
        include: { jobPosting: { include: { company: true } }, candidate: true }
    });

    if (!application) return NextResponse.json({ message: "Başvuru bulunamadı." }, { status: 404 });

    const isCandidate = application.candidateId === userId;
    const isHR = user.role === "HR" && user.companyId === application.jobPosting.companyId;

    if (!isCandidate && !isHR) {
        return NextResponse.json({ message: "Yetkisiz." }, { status: 403 });
    }

    let finalStatus = newStatus;
    let interviewId = null;
    let pass = null;

    if ((newStatus === "INVITED" || newStatus === "INTERVIEW_INVITED") && application.status !== "INVITED" && application.status !== "INTERVIEW_INVITED") {
        finalStatus = "INTERVIEW_INVITED"; // standardize on INTERVIEW_INVITED
        interviewId = Math.random().toString(36).substring(2, 10);
        pass = Math.random().toString(36).substring(2, 8).toUpperCase();
    }

    await prisma.application.update({
        where: { id: applicationId },
        data: { 
            status: finalStatus,
            ...(interviewId && { interviewId }),
            ...(pass && { interviewPassword: pass })
        }
    });

    if (interviewId && pass) {
      const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
      try {
        fetch(`${baseUrl}/api/send-email`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: application.candidate?.email,
            candidateName: application.candidate?.fullName,
            companyName: application.jobPosting.company?.name || "Şirket",
            interviewLink: `${baseUrl}/interview/${interviewId}`,
            interviewPassword: pass,
            themeId: user.theme // Passing the user's saved theme!
          })
        }).catch(e => console.error("Pipeline manual Mail Error:", e));
      } catch (e) {
        console.error("Fetch API error:", e);
      }
    }

    return NextResponse.json({ message: `Aday statüsü ${finalStatus} olarak güncellendi.` });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ message: "Sunucu hatası." }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest): Promise<NextResponse> {
  try {
    const userId = request.cookies.get("user_id")?.value;
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    const deleteUser = searchParams.get("deleteUser") === "true";

    if (!userId) return NextResponse.json({ message: "Oturum açılmamış." }, { status: 401 });
    if (!id) return NextResponse.json({ message: "ID belirtilmedi." }, { status: 400 });

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      return NextResponse.json({ message: "Yetkisiz." }, { status: 403 });
    }

    const application = await prisma.application.findUnique({
      where: { id },
      include: { jobPosting: true }
    });

    if (!application) return NextResponse.json({ message: "Başvuru bulunamadı." }, { status: 404 });

    const isHr = user.role === "HR" && user.companyId === application.jobPosting.companyId;
    const isOwner = application.candidateId === userId;

    if (!isHr && !isOwner) {
      return NextResponse.json({ message: "Yetkisiz." }, { status: 403 });
    }

    await prisma.application.delete({ where: { id } });

    if (deleteUser && application.candidateId) {
       await prisma.user.delete({ where: { id: application.candidateId } });
    }

    return NextResponse.json({ message: "Başvuru başarıyla silindi." });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ message: "Sunucu hatası." }, { status: 500 });
  }
}
