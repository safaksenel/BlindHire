import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";

// Resend API Key should be stored in .env.local
// For now, we fallback to a mock process if no API key is provided
const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const { email, candidateName, interviewLink, interviewPassword } = await request.json();

    if (!email || !candidateName || !interviewLink || !interviewPassword) {
      return NextResponse.json({ message: "Eksik parametre." }, { status: 400 });
    }

    const htmlContent = `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; background-color: #09090b; color: #fff; padding: 32px; border-radius: 12px; border: 1px solid rgba(255,255,255,0.1);">
        <div style="text-align: center; margin-bottom: 32px;">
          <h1 style="font-size: 24px; font-weight: 800; margin: 0; background: linear-gradient(to right, #60a5fa, #c084fc); -webkit-background-clip: text; color: transparent;">
            AgenticHR<span style="color: #60a5fa; font-weight: 500;">.ai</span>
          </h1>
        </div>
        
        <h2 style="font-size: 20px; font-weight: 600; margin-top: 0;">Sayın ${candidateName},</h2>
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
    `;

    if (resend) {
        const { error } = await resend.emails.send({
            from: "AgenticHR <onboarding@resend.dev>", // Replace with verified domain in production
            to: email,
            subject: "Mülakat Daveti - AgenticHR.ai",
            html: htmlContent,
        });
        
        if (error) {
            console.error("Resend API Error:", error);
            return NextResponse.json({ message: "E-posta gönderimi başarısız oldu.", error: error.message }, { status: 400 });
        }
    } else {
        // Mock successful email send for dev environment without API key
        console.log(`[MOCK EMAIL] Sent to ${email} for candidate ${candidateName}. Link: ${interviewLink}, Password: ${interviewPassword}`);
    }

    return NextResponse.json({ message: "E-posta başarıyla gönderildi." });
  } catch (err: any) {
    console.error("Email send error:", err);
    return NextResponse.json({ message: "E-posta gönderimi başarısız oldu.", error: err.message }, { status: 500 });
  }
}
