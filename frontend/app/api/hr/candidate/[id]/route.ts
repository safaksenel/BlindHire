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

    // Attempt to find by application ID first, then by candidate ID
    let application = await prisma.application.findUnique({
      where: { id },
      include: { candidate: true, jobPosting: true }
    });

    if (!application) {
       application = await prisma.application.findFirst({
         where: { candidateId: id },
         include: { candidate: true, jobPosting: true }
       });
       if (!application) return NextResponse.json({ message: "Başvuru bulunamadı." }, { status: 404 });
    }

    if (application.jobPosting.companyId !== hrUser.companyId) {
       return NextResponse.json({ message: "Yetkisiz." }, { status: 403 });
    }

    const candidate = application.candidate;
    const baseScore = application.techScore || 85;
    
    return NextResponse.json({
        id: application.id,
        candidateId: candidate?.id,
        fullName: candidate?.fullName || "Bilinmeyen Aday",
        email: candidate?.email,
        role: application.jobPosting.title || "Bilinmeyen Pozisyon",
        status: application.status,
        techScore: baseScore,
        reliability: application.reliability || 95,
        cvUrl: application.cvUrl,
        radarData: [
            { subject: "Algoritma", score: Math.min(100, baseScore + 2), fullMark: 100 },
            { subject: "Mimari", score: Math.min(100, baseScore + 6), fullMark: 100 },
            { subject: "Stres Yönetimi", score: Math.max(0, baseScore - 11), fullMark: 100 },
            { subject: "İletişim", score: Math.min(100, baseScore + 3), fullMark: 100 },
            { subject: "Güvenilirlik", score: application.reliability || 98, fullMark: 100 },
        ]
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ message: "Sunucu hatası." }, { status: 500 });
  }
}
