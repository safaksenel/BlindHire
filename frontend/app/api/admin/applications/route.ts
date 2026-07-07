import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(): Promise<NextResponse> {
  try {
    const applications = await prisma.application.findMany({
      include: {
        candidate: true,
        jobPosting: { include: { company: true } },
      },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(applications);
  } catch (err) {
    return NextResponse.json({ message: "Sunucu hatası." }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest): Promise<NextResponse> {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    const deleteUser = searchParams.get("deleteUser") === "true"; // Adayı da silme bayrağı

    if (!id) {
      return NextResponse.json({ message: "ID belirtilmedi." }, { status: 400 });
    }

    const application = await prisma.application.findUnique({
      where: { id },
      select: { candidateId: true }
    });

    if (!application) {
       return NextResponse.json({ message: "Başvuru bulunamadı." }, { status: 404 });
    }

    await prisma.application.delete({
      where: { id },
    });

    if (deleteUser && application.candidateId) {
       await prisma.user.delete({
          where: { id: application.candidateId }
       });
    }

    return NextResponse.json({ message: "Başvuru silindi." });
  } catch (err) {
    return NextResponse.json({ message: "Sunucu hatası." }, { status: 500 });
  }
}
