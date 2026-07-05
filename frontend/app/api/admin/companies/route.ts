import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(): Promise<NextResponse> {
  try {
    const companies = await prisma.company.findMany();
    return NextResponse.json(companies);
  } catch (err) {
    return NextResponse.json({ message: "Sunucu hatası." }, { status: 500 });
  }
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const { name } = await request.json();
    if (!name || !name.trim()) {
      return NextResponse.json({ message: "Firma adı geçersiz." }, { status: 400 });
    }

    const exists = await prisma.company.findUnique({
      where: { name: name.trim() }
    });

    if (exists) {
      return NextResponse.json({ message: "Bu firma zaten kayıtlı." }, { status: 400 });
    }

    const newCompany = await prisma.company.create({
      data: { name: name.trim() }
    });

    return NextResponse.json(newCompany, { status: 201 });
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

    await prisma.company.delete({
      where: { id }
    });

    return NextResponse.json({ message: "Firma silindi." });
  } catch (err) {
    return NextResponse.json({ message: "Sunucu hatası." }, { status: 500 });
  }
}
