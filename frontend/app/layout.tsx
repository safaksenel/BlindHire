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
  title: "AgenticHR.ai — Otonom AI İşe Alım Platformu",
  description:
    "Sıfır önyargılı, otonom liyakat tabanlı AI mülakat ajanı. İnsan müdahalesiz, gerçek zamanlı işe alım.",
  robots: { index: true, follow: true },
};

import Link from "next/link";

import { AuthNav } from "@/components/AuthNav";

import { cookies } from "next/headers";

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const cookieStore = await cookies();
  const hasAuthToken = cookieStore.get("auth_token")?.value === "authenticated";
  const hasHrToken = cookieStore.get("hr_auth_token")?.value === "authenticated";
  const isAuth = hasAuthToken || hasHrToken;

  return (
    <html
      lang="tr"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased dark`}
    >
      <body className="min-h-full flex flex-col bg-zinc-950 text-foreground">
        <header className="sticky top-0 z-50 w-full border-b border-white/[0.06] bg-zinc-950/60 backdrop-blur-md">
          <div className="mx-auto flex max-w-7xl h-16 items-center justify-between px-6">
            <Link href="/" className="flex items-center gap-2 group">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500/20 to-purple-500/20 ring-1 ring-white/[0.08] transition-all group-hover:ring-blue-500/30">
                <span className="text-sm font-black bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">A</span>
              </div>
              <span className="font-bold tracking-tight text-white transition-colors group-hover:text-white/95">AgenticHR<span className="text-blue-400 font-medium">.ai</span></span>
            </Link>
            <AuthNav isAuth={isAuth} />
          </div>
        </header>
        <div className="flex-1 flex flex-col">
          {children}
        </div>
      </body>
    </html>
  );
}
