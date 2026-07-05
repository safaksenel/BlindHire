import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json({ message: "Eksik parametre." }, { status: 400 });
    }

    // Direct check for super admin
    if (email === "admin" && password === "admin") {
      return NextResponse.json({
        message: "Giriş başarılı.",
        role: "SUPER_ADMIN",
      });
    }

    const matchedUser = await prisma.user.findUnique({
      where: { email: email.trim().toLowerCase() }
    });

    if (!matchedUser || matchedUser.passwordHash !== password) {
      return NextResponse.json({ message: "E-posta veya şifre hatalı." }, { status: 401 });
    }

    return NextResponse.json({
      message: "Giriş başarılı.",
      id: matchedUser.id,
      fullName: matchedUser.fullName,
      email: matchedUser.email,
      role: matchedUser.role,
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Internal Server Error", details: error instanceof Error ? error.message : "Unknown error" }, { status: 500 });
  }
}
