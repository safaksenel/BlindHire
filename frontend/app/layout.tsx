import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "BlindHire — Otonom AI İşe Alım Platformu",
  description:
    "Sıfır önyargılı, otonom liyakat tabanlı AI mülakat ajanı. İnsan müdahalesiz, gerçek zamanlı işe alım.",
  robots: { index: true, follow: true },
};

import Link from "next/link";

import { GlobalHeader } from "@/components/GlobalHeader";
import { AmbientBackgrounds } from "@/components/AmbientBackgrounds";
import { PaletteProvider } from "@/components/PaletteContext";
import { ToastProvider } from "@/components/ToastContext";
import { cookies } from "next/headers";

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) { /* FORCE_RELOAD */
  const cookieStore = await cookies();
  const hasAuthToken = cookieStore.get("auth_token")?.value === "authenticated";
  const hasHrToken = cookieStore.get("hr_auth_token")?.value === "authenticated";
  const isAuth = hasAuthToken || hasHrToken;

  return (
    <html
      lang="tr"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased dark`}
    >
      <body className="min-h-full flex flex-col bg-[var(--theme-c5)] text-foreground relative transition-colors duration-1000">
        <svg style={{ display: 'none' }}>
          <defs>
            <filter id="protanopia">
              <feColorMatrix type="matrix" values="0.567, 0.433, 0, 0, 0  0.558, 0.442, 0, 0, 0  0, 0.242, 0.758, 0, 0  0, 0, 0, 1, 0" />
            </filter>
            <filter id="deuteranopia">
              <feColorMatrix type="matrix" values="0.625, 0.375, 0, 0, 0  0.7, 0.3, 0, 0, 0  0, 0.3, 0.7, 0, 0  0, 0, 0, 1, 0" />
            </filter>
            <filter id="tritanopia">
              <feColorMatrix type="matrix" values="0.95, 0.05, 0, 0, 0  0, 0.433, 0.567, 0, 0  0, 0.475, 0.525, 0, 0  0, 0, 0, 1, 0" />
            </filter>
          </defs>
        </svg>
        <PaletteProvider>
          <ToastProvider>
            <AmbientBackgrounds />
            <GlobalHeader isAuth={isAuth} />
            <div className="flex-1 flex flex-col">
              {children}
            </div>
          </ToastProvider>
        </PaletteProvider>
      </body>
    </html>
  );
}





