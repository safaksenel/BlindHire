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
        applications: {
          include: {
            candidate: true
          }
        }
      }
    });

    const now = new Date();

    const jobsWithDynamicStatus = companyJobs.map(job => {
      let computedStatus = job.status;
      
      if (job.status !== "ARCHIVED") {
        if (job.startDate && job.endDate) {
          const s = new Date(job.startDate);
          const e = new Date(job.endDate);
          if (now < s) computedStatus = "SCHEDULED";
          else if (now > e) computedStatus = "EXPIRED";
          else computedStatus = "ACTIVE";
        } else if (job.startDate && !job.endDate) {
          const s = new Date(job.startDate);
          if (now < s) computedStatus = "SCHEDULED";
          else computedStatus = "ACTIVE";
        } else if (!job.startDate && job.endDate) {
          const e = new Date(job.endDate);
          if (now > e) computedStatus = "EXPIRED";
          else computedStatus = "ACTIVE";
        } else {
           computedStatus = "ACTIVE";
        }
      }

      return {
        ...job,
        computedStatus
      };
    });

    const activeJobsCount = jobsWithDynamicStatus.filter(j => j.computedStatus === "ACTIVE").length;
    
    let totalCVs = 0;
    let passedCount = 0;
    
    const visibleJobs = jobsWithDynamicStatus.filter(j => j.computedStatus !== "ARCHIVED");
    
    const jobsTable = visibleJobs.map(job => {
      const apps = job.applications;
      totalCVs += apps.length;
      
      const accepted = apps.filter(a => a.status === "APPROVED" || a.status === "COMPLETED").length;
      const rejected = apps.filter(a => a.status === "REJECTED").length;
      const interviewCount = apps.filter(a => a.status === "INVITED").length;
      passedCount += accepted;

      const applicants = apps.map(a => ({
        id: a.id,
        fullName: a.candidate?.fullName || "Bilinmeyen Aday",
        email: a.candidate?.email || "Email Yok",
        status: a.status,
        techScore: a.techScore || 0,
        reliability: a.reliability || 0
      }));
      
      return {
        id: job.id,
        position: job.title,
        description: job.description,
        startDate: job.startDate ? new Date(job.startDate).toLocaleString("tr-TR") : "Belirtilmemiş",
        endDate: job.endDate ? new Date(job.endDate).toLocaleString("tr-TR") : "Belirsiz",
        rawStartDate: job.startDate ? new Date(job.startDate).toISOString() : null,
        rawEndDate: job.endDate ? new Date(job.endDate).toISOString() : null,
        totalApplicants: apps.length,
        acceptedCount: accepted,
        rejectedCount: rejected,
        interviewCount: interviewCount,
        computedStatus: job.computedStatus,
        applicants: applicants
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
