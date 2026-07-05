import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const userId = request.cookies.get("user_id")?.value;
    if (!userId) {
      return NextResponse.json({ message: "Oturum açılmamış." }, { status: 401 });
    }

    const hrUser = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!hrUser || hrUser.role !== "HR" || !hrUser.companyId) {
      return NextResponse.json({ message: "Yetkisiz erişim." }, { status: 403 });
    }

    const { title, description } = await request.json();
    if (!title || !description) {
      return NextResponse.json({ message: "Eksik parametre." }, { status: 400 });
    }

    const job = await prisma.jobPosting.create({
      data: {
        title,
        description,
        companyId: hrUser.companyId,
      }
    });

    return NextResponse.json(job, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: "Sunucu hatası." }, { status: 500 });
  }
}
