import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  try {
    const { id } = await params;
    const userId = request.cookies.get("user_id")?.value;
    if (!userId) {
      return NextResponse.json({ message: "Oturum açılmamış." }, { status: 401 });
    }

    const hrUser = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!hrUser || hrUser.role !== "HR" || !hrUser.companyId) {
      return NextResponse.json({ message: "Yetkisiz." }, { status: 403 });
    }

    if (id.startsWith("cand-") || id.startsWith("app-")) {
       return NextResponse.json({
         id: id.startsWith("app-") ? id : `app-${id.replace("cand-", "")}`,
         candidateId: id.startsWith("cand-") ? id : `cand-${id.replace("app-", "")}`,
         fullName: "Sahte Aday Detayı",
         email: "sahte.aday@test.com",
         role: "Yazılım Geliştirici",
         status: "COMPLETED",
         techScore: 85,
         reliability: 92,
         interviewScore: 88,
         overallScore: 89,
         cvUrl: "/1783547632872_Bedirhan_ihtiyar_CV_TR.pdf",
         radarData: [
             { subject: "Anahtar Kelime Eşleşmesi", score: 85, fullMark: 100 },
             { subject: "Semantik Analiz (AI)", score: 92, fullMark: 100 }
         ]
       });
    }

    // Attempt to find by application ID first, then by candidate ID
    let application = await prisma.application.findUnique({
      where: { id },
      include: { 
        candidate: {
          include: {
            educations: true,
            experiences: true,
            skills: true
          }
        }, 
        jobPosting: true 
      }
    });

    if (!application) {
       application = await prisma.application.findFirst({
         where: { candidateId: id },
         include: { 
           candidate: {
             include: {
               educations: true,
               experiences: true,
               skills: true
             }
           }, 
           jobPosting: true 
         }
       });
       if (!application) return NextResponse.json({ message: "Başvuru bulunamadı." }, { status: 404 });
    }

    if (application.jobPosting.companyId !== hrUser.companyId) {
       return NextResponse.json({ message: "Yetkisiz." }, { status: 403 });
    }

    const candidate = application.candidate;
    return NextResponse.json({
        id: application.id,
        candidateId: candidate?.id,
        fullName: candidate?.fullName || "Bilinmeyen Aday",
        email: candidate?.email,
        role: application.jobPosting.title || "Bilinmeyen Pozisyon",
        status: application.status,
        techScore: application.techScore || 0,
        reliability: application.reliability || 0,
        interviewScore: application.interviewScore || 0,
        overallScore: application.overallScore || 0,
        cvUrl: application.cvUrl,
        educations: candidate?.educations || [],
        experiences: candidate?.experiences || [],
        skills: candidate?.skills || null,
        radarData: [
            { subject: "Anahtar Kelime Eşleşmesi", score: application.techScore || 0, fullMark: 100 },
            { subject: "Semantik Analiz (AI)", score: application.reliability || 0, fullMark: 100 }
        ]
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ message: "Sunucu hatası." }, { status: 500 });
  }
}
