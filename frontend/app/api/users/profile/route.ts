import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";

export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const userId = cookieStore.get("user_id")?.value;

    if (!userId) {
      return NextResponse.json({ message: "Yetkisiz erişim." }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        educations: true,
        internshipPreferences: true,
        skills: true,
        experiences: true,
        documents: true,
        references: true,
      },
    });

    if (!user) {
      return NextResponse.json({ message: "Kullanıcı bulunamadı." }, { status: 404 });
    }

    return NextResponse.json(user);
  } catch (error) {
    console.error("Profile GET Error:", error);
    return NextResponse.json({ message: "Sunucu hatası." }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const userId = cookieStore.get("user_id")?.value;

    if (!userId) {
      return NextResponse.json({ message: "Yetkisiz erişim." }, { status: 401 });
    }

    const body = await request.json();
    
    // Yalnızca geçerli kullanıcı verilerini güvenli bir şekilde güncelle (Partial Update)
    const updateData: any = {};
    if (body.fullName !== undefined) updateData.fullName = body.fullName;
    if (body.email !== undefined) updateData.email = body.email;
    if (body.tcKimlikNo !== undefined) updateData.tcKimlikNo = body.tcKimlikNo;
    if (body.phone !== undefined) updateData.phone = body.phone;
    if (body.address !== undefined) updateData.address = body.address;
    if (body.dateOfBirth !== undefined) updateData.dateOfBirth = body.dateOfBirth ? new Date(body.dateOfBirth) : null;
    if (body.isProfileComplete !== undefined) updateData.isProfileComplete = body.isProfileComplete;
    if (body.avatarUrl !== undefined) updateData.avatarUrl = body.avatarUrl;

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: updateData,
    });

    // Education (Eğitimler)
    if (body.educations && Array.isArray(body.educations)) {
      // Önce mevcut eğitimleri sil
      await prisma.education.deleteMany({ where: { userId } });
      // Yenilerini ekle
      for (const edu of body.educations) {
        await prisma.education.create({
          data: {
            userId,
            university: edu.university,
            faculty: edu.faculty,
            degree: edu.degree,
            year: edu.year,
            gpa: edu.gpa,
            startDate: new Date(edu.startDate),
            endDate: edu.endDate ? new Date(edu.endDate) : null,
            isHighSchool: edu.isHighSchool || false,
          },
        });
      }
    }

    // InternshipPreferences
    if (body.internshipPreferences) {
      await prisma.internshipPreferences.upsert({
        where: { userId },
        update: body.internshipPreferences,
        create: { ...body.internshipPreferences, userId },
      });
    }

    // Skills
    if (body.skills) {
      await prisma.skills.upsert({
        where: { userId },
        update: {
          foreignLanguages: JSON.stringify(body.skills.foreignLanguages || []),
          technicalSkills: JSON.stringify(body.skills.technicalSkills || []),
          softSkills: JSON.stringify(body.skills.softSkills || []),
        },
        create: {
          userId,
          foreignLanguages: JSON.stringify(body.skills.foreignLanguages || []),
          technicalSkills: JSON.stringify(body.skills.technicalSkills || []),
          softSkills: JSON.stringify(body.skills.softSkills || []),
        },
      });
    }

    // Experience
    if (body.experiences && Array.isArray(body.experiences)) {
      await prisma.experience.deleteMany({ where: { userId } });
      for (const exp of body.experiences) {
        await prisma.experience.create({
          data: {
            userId,
            type: exp.type,
            title: exp.title,
            organization: exp.organization,
            description: exp.description,
            startDate: exp.startDate ? new Date(exp.startDate) : null,
            endDate: exp.endDate ? new Date(exp.endDate) : null,
          }
        });
      }
    }

    // Documents
    if (body.documents) {
      await prisma.documents.upsert({
        where: { userId },
        update: body.documents,
        create: { ...body.documents, userId },
      });
    }

    // References
    if (body.references && Array.isArray(body.references)) {
      await prisma.reference.deleteMany({ where: { userId } });
      for (const ref of body.references) {
        await prisma.reference.create({
          data: {
            userId,
            name: ref.name,
            title: ref.title,
            institution: ref.institution,
            contact: ref.contact,
            motivationLetter: ref.motivationLetter,
          }
        });
      }
    }

    return NextResponse.json({ message: "Profil başarıyla güncellendi.", user: updatedUser });
  } catch (error) {
    console.error("Profile PUT Error:", error);
    return NextResponse.json({ message: "Sunucu hatası." }, { status: 500 });
  }
}
