import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

export const translateStatus = (status: string) => {
  const map: Record<string, string> = {
    ACTIVE: "Aktif",
    INACTIVE: "Pasif",
    PENDING: "Değerlendirmede",
    REVIEWING: "İnceleniyor",
    INVITED: "Mülakata Davet Edildi",
    INTERVIEW_INVITED: "Mülakata Davet Edildi",
    INTERVIEW_COMPLETED: "Mülakat Tamamlandı",
    COMPLETED: "Tamamlandı",
    REJECTED: "Reddedildi",
    HIRED: "İşe Alındı",
    APPROVED: "Onaylandı",
    CLOSED: "Kapalı",
    DRAFT: "Taslak",
    SCHEDULED: "İleri Tarihli",
    EXPIRED: "Süresi Dolmuş",
    ARCHIVED: "Arşivlenmiş"
  };
  return map[status] || status;
};
