import { NextRequest, NextResponse } from "next/server";
import nodemailer from "nodemailer";

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const { email, candidateName, interviewLink, interviewPassword } = await request.json();

    if (!email || !candidateName || !interviewLink || !interviewPassword) {
      return NextResponse.json({ message: "Eksik parametre." }, { status: 400 });
    }

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
      </head>
      <body style="margin: 0; padding: 0; background-color: #09090b;">
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; background-color: #09090b; color: #fff; padding: 32px; border-radius: 12px; border: 1px solid rgba(255,255,255,0.1);">
          <div style="text-align: center; margin-bottom: 32px;">
            <h1 style="font-size: 24px; font-weight: 800; margin: 0; color: #60a5fa;">
              AgenticHR<span style="color: #c084fc; font-weight: 500;">.ai</span>
            </h1>
          </div>
          
          <h2 style="font-size: 20px; font-weight: 600; margin-top: 0; color: #ffffff;">Sayın ${candidateName},</h2>
          <p style="color: #a1a1aa; font-size: 15px; line-height: 1.6;">
            CV'niz ve başvurunuz başarıyla incelendi. Sizi otonom yapay zeka mülakat sistemimize davet etmekten mutluluk duyuyoruz.
          </p>
          
          <div style="background-color: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.05); border-radius: 8px; padding: 20px; margin: 24px 0;">
            <p style="margin: 0 0 12px 0; font-size: 14px; color: #a1a1aa;">Mülakat Bağlantınız:</p>
            <a href="${interviewLink}" style="color: #34d399; text-decoration: none; font-weight: 600; word-break: break-all;">${interviewLink}</a>
            
            <div style="margin-top: 20px; padding-top: 20px; border-top: 1px solid rgba(255,255,255,0.05);">
              <p style="margin: 0 0 8px 0; font-size: 14px; color: #a1a1aa;">Mülakat Giriş Şifreniz:</p>
              <div style="background-color: #000; padding: 12px; border-radius: 6px; border: 1px solid rgba(255,255,255,0.1); font-family: monospace; font-size: 18px; letter-spacing: 2px; text-align: center; color: #e4e4e7;">
                ${interviewPassword}
              </div>
            </div>
          </div>

          <div style="margin-top: 32px; padding: 16px; background-color: rgba(248, 113, 113, 0.1); border-left: 4px solid #f87171; border-radius: 4px;">
            <p style="margin: 0; font-size: 14px; color: #fca5a5; line-height: 1.5;">
              <strong>Önemli Not:</strong> Mülakat esnasında kamera ve mikrofon erişimine izin vermeniz gerekmektedir. Lütfen sessiz bir ortamda bulununuz.
            </p>
          </div>

          <p style="margin-top: 32px; font-size: 13px; color: #52525b; text-align: center;">
            Bu e-posta otomatik olarak oluşturulmuştur, lütfen yanıtlamayınız.<br>
            © ${new Date().getFullYear()} AgenticHR.ai Tüm Hakları Saklıdır.
          </p>
        </div>
      </body>
      </html>
    `;

    const userEmail = process.env.SMTP_EMAIL;
    const userPass = process.env.SMTP_PASSWORD;

    if (!userEmail || !userPass || userEmail === "example@gmail.com") {
      console.log(`[MOCK EMAIL] Sent to ${email} for candidate ${candidateName}. Link: ${interviewLink}, Password: ${interviewPassword}`);
      return NextResponse.json({ message: "E-posta başarıyla gönderildi (MOCK MODU)." });
    }

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: userEmail,
        pass: userPass,
      },
    });

    await transporter.sendMail({
      from: `"AgenticHR.ai" <${userEmail}>`,
      to: email,
      subject: "Mülakat Daveti - AgenticHR.ai",
      html: htmlContent,
    });

    return NextResponse.json({ message: "E-posta başarıyla gönderildi." });
  } catch (err) {
    console.error("Email send error:", err);
    return NextResponse.json({ message: "E-posta gönderimi başarısız oldu.", error: err instanceof Error ? err.message : String(err) }, { status: 500 });
  }
}
