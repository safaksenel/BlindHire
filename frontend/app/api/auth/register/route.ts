import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const { fullName, email, password } = await request.json();

    if (!fullName || !email || !password) {
      return NextResponse.json({ message: "Eksik parametre." }, { status: 400 });
    }

    const existingUser = await prisma.user.findUnique({
      where: { email: email.trim().toLowerCase() }
    });

    if (existingUser) {
      return NextResponse.json(
        { message: "Bu e-posta adresi ile zaten kayıtlı bir hesap bulunuyor." },
        { status: 400 }
      );
    }

    const newUser = await prisma.user.create({
      data: {
        fullName: fullName.trim(),
        email: email.trim().toLowerCase(),
        passwordHash: password, // Plain text for mock
        role: "CANDIDATE",
      }
    });

    return NextResponse.json(
      { message: "Kayıt başarılı.", id: newUser.id },
      { status: 201 }
    );
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Internal Server Error", details: error instanceof Error ? error.message : "Unknown error" }, { status: 500 });
  }
}
