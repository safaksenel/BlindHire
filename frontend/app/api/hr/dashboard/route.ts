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
      return NextResponse.json({ jobs: [], activeJobsCount: 0, totalCVs: 0, passedCount: 0 });
    }

    const companyId = hrUser.companyId;

    const companyJobs = await prisma.jobPosting.findMany({
      where: { companyId },
      include: {
        applications: true
      }
    });

    const activeJobsCount = companyJobs.filter(j => j.status === "ACTIVE").length;
    
    let totalCVs = 0;
    let passedCount = 0;
    
    const jobsTable = companyJobs.map(job => {
      const apps = job.applications;
      totalCVs += apps.length;
      
      const passed = apps.filter(a => a.status === "APPROVED" || a.status === "COMPLETED").length;
      passedCount += passed;

      const rate = apps.length > 0 ? ((passed / apps.length) * 100).toFixed(1) : "0.0";
      
      return {
        id: job.id,
        position: job.title,
        department: "Genel",
        credits: 100 - apps.length,
        successRate: `%${rate}`,
        trend: parseFloat(rate) > 0 ? "up" : "stable"
      };
    });

    return NextResponse.json({
      activeJobsCount,
      totalCVs,
      passedCount,
      jobs: jobsTable
    });

  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Internal Server Error", details: error instanceof Error ? error.message : "Unknown error" }, { status: 500 });
  }
}
