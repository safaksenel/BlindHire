import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const candidates = await prisma.user.findMany({
      where: { role: "CANDIDATE" },
      select: {
        id: true,
        fullName: true,
        email: true,
        createdAt: true,
      },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(candidates);
  } catch (error) {
    return NextResponse.json({ message: "Adaylar alınamadı." }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    
    if (!id) {
      return NextResponse.json({ message: "Aday ID gerekli." }, { status: 400 });
    }

    await prisma.user.delete({
      where: { id }
    });

    return NextResponse.json({ message: "Aday silindi." });
  } catch (error) {
    return NextResponse.json({ message: "Aday silinemedi." }, { status: 500 });
  }
}
