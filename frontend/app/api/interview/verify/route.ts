import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const { id, password } = await request.json();

    if (!id || !password) {
      return NextResponse.json({ message: "Eksik bilgi." }, { status: 400 });
    }

    const applications = await prisma.$queryRaw<any[]>`
      SELECT id FROM "Application" 
      WHERE ("interviewId" = ${id} OR ${id} = 'default')
        AND "interviewPassword" = ${password} 
      LIMIT 1
    `;

    if (!applications || !Array.isArray(applications) || applications.length === 0) {
      return NextResponse.json({ message: "Geçersiz şifre veya mülakat bağlantısı." }, { status: 401 });
    }

    // Set a cookie or return success so the client knows they can proceed
    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error(err);
    return NextResponse.json({ message: "Sunucu hatası.", error: err.message }, { status: 500 });
  }
}
