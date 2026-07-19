import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PUT(request: NextRequest): Promise<NextResponse> {
  try {
    const userId = request.cookies.get("user_id")?.value;
    if (!userId) {
      return NextResponse.json({ message: "Yetkisiz işlem." }, { status: 401 });
    }

    const { fullName } = await request.json();

    if (!fullName || !fullName.trim()) {
      return NextResponse.json({ message: "Geçersiz ad soyad." }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user) {
      return NextResponse.json({ message: "Kullanıcı bulunamadı." }, { status: 404 });
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { fullName: fullName.trim() }
    });

    const response = NextResponse.json({ message: "İsim güncellendi", fullName: updatedUser.fullName });
    
    // Update the cookie as well
    response.cookies.set("user_name", encodeURIComponent(updatedUser.fullName), {
      path: "/",
      maxAge: 86400,
    });

    return response;
  } catch (err) {
    console.error("Profile update error:", err);
    return NextResponse.json({ message: "Sunucu hatası." }, { status: 500 });
  }
}
