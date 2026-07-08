import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import fs from "fs";
import path from "path";

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const token = request.cookies.get("auth_token")?.value;
    const role = request.cookies.get("user_role")?.value;
    
    if (token !== "authenticated" || role !== "CANDIDATE") {
         return NextResponse.json({ message: "Oturum açmanız gerekiyor." }, { status: 401 });
    }

    const userId = request.cookies.get("user_id")?.value;
    if (!userId) {
      return NextResponse.json({ message: "Geçersiz oturum." }, { status: 401 });
    }

    const formData = await request.formData();
    const jobId = formData.get("jobId") as string;
    const file = formData.get("file") as File | null;

    if (!jobId || !file) {
      return NextResponse.json({ message: "Eksik parametre veya dosya." }, { status: 400 });
    }

    const candidate = await prisma.user.findUnique({
      where: { id: userId, role: "CANDIDATE" }
    });

    if (!candidate) {
      return NextResponse.json({ message: "Geçerli aday bulunamadı." }, { status: 400 });
    }

    const existingApplication = await prisma.application.findFirst({
      where: {
        candidateId: candidate.id,
        jobPostingId: jobId
      }
    });

    if (existingApplication) {
      return NextResponse.json({ message: "Bu ilana zaten başvurdunuz." }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const uploadsDir = path.join(process.cwd(), "public", "uploads");
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }

    const safeFilename = `${Date.now()}_${file.name.replace(/[^a-zA-Z0-9.-]/g, "_")}`;
    const filePath = path.join(uploadsDir, safeFilename);
    fs.writeFileSync(filePath, buffer);

    const cvUrl = `/uploads/${safeFilename}`;

    // Generate simulated AI Evaluation Score
    const techScore = Math.floor(Math.random() * (100 - 65 + 1)) + 65; // 65-100
    const reliability = Math.floor(Math.random() * (100 - 75 + 1)) + 75; // 75-100

    let status = "PENDING";
    
    let finalInterviewId: string | undefined = undefined;
    let finalInterviewPassword: string | undefined = undefined;
    
    // Check Auto-Invite Threshold
    const hrSettings = await prisma.hRSettings.findFirst({
      where: { companyId: (candidate as any).companyId || undefined }
    });
    
    if (hrSettings && techScore >= hrSettings.autoInviteThreshold) {
      status = "INTERVIEW_INVITED";
      
      const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
      finalInterviewId = Math.random().toString(36).substring(2, 10);
      finalInterviewPassword = Math.random().toString(36).substring(2, 8).toUpperCase();
      
      try {
        fetch(`${baseUrl}/api/send-email`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: candidate.email,
            candidateName: candidate.fullName,
            interviewLink: `${baseUrl}/interview/${finalInterviewId}`,
            interviewPassword: finalInterviewPassword,
          })
        }).catch(e => console.error("Mail Error:", e));
      } catch (e) {
        console.error("Fetch API error:", e);
      }
      
      console.log(`[AI-AGENT] Aday ${candidate.fullName} eşiği aştı (${techScore} >= ${hrSettings.autoInviteThreshold}). Otomatik mülakat maili gönderiliyor...`);
    }

    const newApp = await prisma.application.create({
      data: {
        candidateId: candidate.id,
        jobPostingId: jobId,
        cvUrl: cvUrl,
        techScore,
        reliability,
        status,
        interviewId: finalInterviewId,
        interviewPassword: finalInterviewPassword
      }
    });

    return NextResponse.json({ message: "BaYvuru alnd", applicationId: newApp.id, status, techScore }, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Internal Server Error", details: error instanceof Error ? error.message : "Unknown error" }, { status: 500 });
  }
}
