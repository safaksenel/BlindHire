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
      return NextResponse.json({ jobs: [] });
    }

    const companyId = hrUser.companyId;

    const allJobs = await prisma.jobPosting.findMany({
      where: { companyId },
      include: {
        applications: true
      },
      orderBy: {
        updatedAt: "desc"
      }
    });

    const now = new Date();

    const jobsTable = allJobs.map(job => {
      let computedStatus = job.status;
      
      if (job.status !== "ARCHIVED") {
        if (job.startDate && job.endDate) {
          const s = new Date(job.startDate);
          const e = new Date(job.endDate);
          if (now < s) computedStatus = "SCHEDULED";
          else if (now > e) computedStatus = "EXPIRED";
          else computedStatus = "ACTIVE";
        } else if (job.startDate && !job.endDate) {
          if (now < new Date(job.startDate)) computedStatus = "SCHEDULED";
          else computedStatus = "ACTIVE";
        } else if (!job.startDate && job.endDate) {
          if (now > new Date(job.endDate)) computedStatus = "EXPIRED";
          else computedStatus = "ACTIVE";
        } else {
           computedStatus = "ACTIVE";
        }
      }

      const apps = job.applications;
      const passed = apps.filter(a => a.status === "APPROVED" || a.status === "COMPLETED").length;
      const rate = apps.length > 0 ? ((passed / apps.length) * 100).toFixed(1) : "0.0";
      
      return {
        id: job.id,
        position: job.title,
        department: "Genel",
        description: job.description,
        totalApplications: apps.length,
        successRate: `%${rate}`,
        archivedAt: new Date(job.updatedAt).toLocaleDateString("tr-TR"),
        startDate: job.startDate ? new Date(job.startDate).toLocaleString("tr-TR") : "Belirtilmemiş",
        endDate: job.endDate ? new Date(job.endDate).toLocaleString("tr-TR") : "Belirsiz",
        computedStatus
      };
    });

    return NextResponse.json({ jobs: jobsTable });

  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
