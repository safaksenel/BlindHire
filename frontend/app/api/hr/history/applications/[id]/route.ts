import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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
      return NextResponse.json({ error: "Yetkisiz erişim." }, { status: 403 });
    }

    // Verify application belongs to the HR's company
    const application = await prisma.application.findUnique({
      where: { id },
      include: { jobPosting: true }
    });

    if (!application || application.jobPosting.companyId !== hrUser.companyId) {
      return NextResponse.json({ error: "Başvuru bulunamadı veya yetkiniz yok." }, { status: 404 });
    }

    await prisma.application.delete({
      where: { id }
    });

    return NextResponse.json({ success: true, message: "Başvuru silindi." });

  } catch (error) {
    console.error("DELETE Application Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
