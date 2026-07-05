/**
 * Mock email service — simulates sending interview credentials.
 * Replace with a real transactional email provider (e.g., Resend, SendGrid).
 */

interface InterviewCredentials {
  readonly candidateId: number;
  readonly email: string;
  readonly fullName: string;
  readonly interviewPassword: string;
  readonly interviewLink: string;
}

function generatePassword(length: number = 8): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let result = "";
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

function generateInterviewLink(candidateId: number): string {
  const token = crypto.randomUUID().slice(0, 12);
  return `/interview/password-check?cid=${candidateId}&token=${token}`;
}

export function sendInterviewInvitation(
  candidateId: number,
  email: string,
  fullName: string
): InterviewCredentials {
  const interviewPassword = generatePassword();
  const interviewLink = generateInterviewLink(candidateId);

  const credentials: InterviewCredentials = {
    candidateId,
    email,
    fullName,
    interviewPassword,
    interviewLink,
  };

  // ── Mock: Log to console instead of sending a real email ──
  console.info("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.info("📧 MOCK EMAIL — Mülakat Daveti");
  console.info(`   Alıcı: ${fullName} <${email}>`);
  console.info(`   Aday ID: #${candidateId}`);
  console.info(`   Mülakat Şifresi: ${interviewPassword}`);
  console.info(`   Mülakat Linki: ${interviewLink}`);
  console.info("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");

  return credentials;
}

export type { InterviewCredentials };
