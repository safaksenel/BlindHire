import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(): Promise<NextResponse> {
  try {
    const activeJobs = await prisma.jobPosting.findMany({
      where: { status: "ACTIVE" },
      include: { company: true }
    });
    
    const jobsWithCompany = activeJobs.map(job => ({
      ...job,
      companyName: job.company?.name || "Bilinmeyen Firma",
    }));

    return NextResponse.json(jobsWithCompany);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ message: "Sunucu hatası." }, { status: 500 });
  }
}
