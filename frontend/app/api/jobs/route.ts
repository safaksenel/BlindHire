import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const userId = request.cookies.get("user_id")?.value;

    const activeJobs = await prisma.jobPosting.findMany({
      where: { status: "ACTIVE" },
      include: { company: true }
    });
    
    let userApplications: Record<string, any> = {};
    if (userId) {
      const apps = await prisma.application.findMany({
        where: { candidateId: userId }
      });
      for (const app of apps) {
        userApplications[app.jobPostingId] = app;
      }
    }
    
    const jobsWithCompany = activeJobs.map(job => ({
      ...job,
      companyName: job.company?.name || "Bilinmeyen Firma",
      userApplication: userApplications[job.id] || null
    }));

    return NextResponse.json(jobsWithCompany);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ message: "Sunucu hatası." }, { status: 500 });
  }
}
