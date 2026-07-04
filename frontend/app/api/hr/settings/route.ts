import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const userId = request.cookies.get("user_id")?.value;
    if (!userId) {
      return NextResponse.json({ message: "Oturum açılmamış." }, { status: 401 });
    }

    const hrUser = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!hrUser || hrUser.role !== "HR" || !hrUser.companyId) {
      return NextResponse.json({ message: "Yetkisiz veya geçersiz şirket." }, { status: 403 });
    }

    const companyId = hrUser.companyId;
    let settings = await prisma.hRSettings.findUnique({
      where: { companyId }
    });

    if (!settings) {
      settings = {
        id: "default",
        companyId,
        autoInviteThreshold: 80,
        manualReviewThreshold: 60,
        autoRejectThreshold: 59,
        createdAt: new Date(),
        updatedAt: new Date()
      };
    }

    return NextResponse.json(settings);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ message: "Sunucu hatası." }, { status: 500 });
  }
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const userId = request.cookies.get("user_id")?.value;
    if (!userId) {
      return NextResponse.json({ message: "Oturum açılmamış." }, { status: 401 });
    }

    const { autoInviteThreshold, manualReviewThreshold, autoRejectThreshold } = await request.json();

    const hrUser = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!hrUser || hrUser.role !== "HR" || !hrUser.companyId) {
      return NextResponse.json({ message: "Yetkisiz veya geçersiz şirket." }, { status: 403 });
    }

    const companyId = hrUser.companyId;

    const newSettings = await prisma.hRSettings.upsert({
      where: { companyId },
      update: {
        autoInviteThreshold,
        manualReviewThreshold,
        autoRejectThreshold
      },
      create: {
        companyId,
        autoInviteThreshold,
        manualReviewThreshold,
        autoRejectThreshold
      }
    });

    return NextResponse.json({ message: "Ayarlar güncellendi.", settings: newSettings });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ message: "Sunucu hatası." }, { status: 500 });
  }
}
