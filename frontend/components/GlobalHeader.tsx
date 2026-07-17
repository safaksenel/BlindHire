"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { AuthNav } from "./AuthNav";
import { PaletteSwitcher } from "./PaletteSwitcher";
import { AppLogo } from "./AppLogo";

export function GlobalHeader({ isAuth }: { readonly isAuth?: boolean }) {
  const pathname = usePathname();
  
  // Hide global marketing header on hr and admin panels
  const isDashboard = pathname?.startsWith('/hr') || pathname?.startsWith('/admin') || pathname?.startsWith('/interview');

  if (isDashboard) {
    return null;
  }

  return (
    <div className="fixed top-4 z-50 w-full px-4 sm:px-8 xl:px-12 pointer-events-none">
      <header className="w-full flex items-center justify-between">
        <Link href="/" className="pointer-events-auto flex items-center gap-3 group rounded-2xl border border-white/[0.06] bg-white/[0.02] pr-5 pl-2 py-2 backdrop-blur-md transition-all hover:bg-white/[0.04]">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[var(--theme-c1)]/10 to-[var(--theme-c3)]/10 ring-1 ring-white/[0.08] transition-all group-hover:ring-[var(--theme-c1)]/30">
            <AppLogo className="h-8 w-8 translate-x-[2px] drop-shadow-[0_0_8px_var(--theme-c1)]" />
          </div>
          <span className="font-bold tracking-tight text-white transition-colors group-hover:text-white/95">
            BlindHire<span className="font-medium" style={{ color: "var(--theme-c1)" }}>.ai</span>
          </span>
        </Link>
        <div className="pointer-events-auto flex items-center gap-3">
          <PaletteSwitcher />
          <AuthNav isAuth={isAuth} />
        </div>
      </header>
    </div>
  );
}
