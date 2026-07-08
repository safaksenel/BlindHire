import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(): Promise<NextResponse> {
  try {
    const jobs = await prisma.jobPosting.findMany({
      include: { company: true },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(jobs);
  } catch (err) {
    return NextResponse.json({ message: "Sunucu hatası." }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest): Promise<NextResponse> {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ message: "ID belirtilmedi." }, { status: 400 });
    }

    await prisma.jobPosting.delete({
      where: { id },
    });

    return NextResponse.json({ message: "İlan silindi." });
  } catch (err) {
    return NextResponse.json({ message: "Sunucu hatası." }, { status: 500 });
  }
}
