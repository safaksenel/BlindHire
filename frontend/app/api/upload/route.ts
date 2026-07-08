import { NextRequest, NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { cookies } from "next/headers";

export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const userId = cookieStore.get("user_id")?.value;

    if (!userId) {
      return NextResponse.json({ message: "Yetkisiz erişim." }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const type = formData.get("type") as string; // 'cv' or 'transcript'

    if (!file) {
      return NextResponse.json({ message: "Dosya bulunamadı." }, { status: 400 });
    }

    // MIME type check based on upload type
    if (type === "avatar") {
      const validImageTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
      if (!validImageTypes.includes(file.type)) {
        return NextResponse.json({ message: "Profil fotoğrafı için sadece JPG, PNG veya WEBP formatları desteklenmektedir." }, { status: 400 });
      }
    } else {
      // cv or transcript
      const validDocTypes = [
        "application/pdf", 
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document", // .docx
        "application/msword" // .doc
      ];
      if (!validDocTypes.includes(file.type)) {
        return NextResponse.json({ message: "Özgeçmiş/Transkript için sadece PDF veya DOCX formatları desteklenmektedir." }, { status: 400 });
      }
    }

    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json({ message: "Dosya boyutu en fazla 5MB olabilir." }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Create unique filename
    const ext = file.name.split('.').pop();
    let fileName = `${type || 'doc'}_${userId}_${crypto.randomUUID()}.${ext}`;
    let processedBuffer = buffer;

    if (type === "avatar") {
      const sharp = (await import("sharp")).default;
      processedBuffer = await sharp(buffer)
        .resize(256, 256, { fit: "cover" })
        .webp({ quality: 80 })
        .toBuffer();
      
      fileName = `${type}_${userId}_${crypto.randomUUID()}.webp`;
    }

    // Upload directory logic (Public folder for now, easy to migrate to S3)
    const uploadDir = path.join(process.cwd(), "public", "uploads");
    await mkdir(uploadDir, { recursive: true });

    const filePath = path.join(uploadDir, fileName);
    await writeFile(filePath, processedBuffer);

    const fileUrl = `/uploads/${fileName}`;

    return NextResponse.json({ 
      message: "Dosya başarıyla yüklendi.", 
      url: fileUrl 
    }, { status: 201 });

  } catch (error) {
    console.error("Upload Error:", error);
    return NextResponse.json({ message: "Dosya yüklenirken bir hata oluştu." }, { status: 500 });
  }
}
