import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PUT(request: NextRequest): Promise<NextResponse> {
  try {
    const userId = request.cookies.get("user_id")?.value;
    if (!userId) {
      return NextResponse.json({ message: "Not logged in" }, { status: 401 });
    }

    const { theme } = await request.json();
    if (!theme) {
      return NextResponse.json({ message: "Theme missing" }, { status: 400 });
    }

    await prisma.user.update({
      where: { id: userId },
      data: { theme },
    });

    return NextResponse.json({ message: "Theme updated" });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}
