import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const userId = request.cookies.get("user_id")?.value;
    if (!userId) return NextResponse.json({ message: "Oturum açılmamış." }, { status: 401 });

    const hrUser = await prisma.user.findUnique({ where: { id: userId } });
    if (!hrUser || hrUser.role !== "HR" || !hrUser.companyId) {
      return NextResponse.json({ message: "Yetkisiz erişim." }, { status: 403 });
    }

    const { title, description, startDate, endDate } = await request.json();
    if (!title || !description) return NextResponse.json({ message: "Eksik parametre." }, { status: 400 });

    const job = await prisma.jobPosting.create({
      data: {
        title,
        description,
        companyId: hrUser.companyId,
        startDate: startDate ? new Date(startDate) : null,
        endDate: endDate ? new Date(endDate) : null,
      }
    });

    return NextResponse.json(job, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: "Sunucu hatası." }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest): Promise<NextResponse> {
  try {
    const userId = request.cookies.get("user_id")?.value;
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!userId) return NextResponse.json({ message: "Oturum açılmamış." }, { status: 401 });
    if (!id) return NextResponse.json({ message: "ID belirtilmedi." }, { status: 400 });

    const hrUser = await prisma.user.findUnique({ where: { id: userId } });
    if (!hrUser || hrUser.role !== "HR" || !hrUser.companyId) {
      return NextResponse.json({ message: "Yetkisiz erişim." }, { status: 403 });
    }

    const job = await prisma.jobPosting.findUnique({ where: { id } });
    if (!job) return NextResponse.json({ message: "İlan bulunamadı." }, { status: 404 });
    if (job.companyId !== hrUser.companyId) return NextResponse.json({ message: "Yetkisiz erişim." }, { status: 403 });

    await prisma.jobPosting.delete({ where: { id } });
    return NextResponse.json({ message: "İlan başarıyla silindi." });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: "Sunucu hatası." }, { status: 500 });
  }
}

export async function PUT(request: NextRequest): Promise<NextResponse> {
  try {
    const userId = request.cookies.get("user_id")?.value;
    if (!userId) return NextResponse.json({ message: "Oturum açılmamış." }, { status: 401 });

    const hrUser = await prisma.user.findUnique({ where: { id: userId } });
    if (!hrUser || hrUser.role !== "HR" || !hrUser.companyId) {
      return NextResponse.json({ message: "Yetkisiz erişim." }, { status: 403 });
    }

    const { id, title, description, status, startDate, endDate } = await request.json();
    if (!id) return NextResponse.json({ message: "İlan ID eksik." }, { status: 400 });

    const job = await prisma.jobPosting.findUnique({ where: { id } });
    if (!job) return NextResponse.json({ message: "İlan bulunamadı." }, { status: 404 });
    if (job.companyId !== hrUser.companyId) return NextResponse.json({ message: "Yetkisiz erişim." }, { status: 403 });

    const dataToUpdate: any = {};
    if (title) dataToUpdate.title = title;
    if (description) dataToUpdate.description = description;
    if (status) dataToUpdate.status = status;
    if (startDate !== undefined) dataToUpdate.startDate = startDate ? new Date(startDate) : null;
    if (endDate !== undefined) dataToUpdate.endDate = endDate ? new Date(endDate) : null;

    const updatedJob = await prisma.jobPosting.update({
      where: { id },
      data: dataToUpdate
    });

    return NextResponse.json(updatedJob, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: "Sunucu hatası." }, { status: 500 });
  }
}
