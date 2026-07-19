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

export async function PUT(request: NextRequest): Promise<NextResponse> {
  try {
    const { id, name } = await request.json();

    if (!id || !name || !name.trim()) {
      return NextResponse.json({ message: "ID veya yeni ad geçersiz." }, { status: 400 });
    }

    const exists = await prisma.company.findUnique({
      where: { name: name.trim() }
    });

    if (exists && exists.id !== id) {
      return NextResponse.json({ message: "Bu ada sahip başka bir firma zaten var." }, { status: 400 });
    }

    const updatedCompany = await prisma.company.update({
      where: { id },
      data: { name: name.trim() }
    });

    return NextResponse.json(updatedCompany);
  } catch (err) {
    return NextResponse.json({ message: "Sunucu hatası." }, { status: 500 });
  }
}
