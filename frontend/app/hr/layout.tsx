"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { LayoutDashboard, Kanban, Settings, User, ChevronRight, Shield } from "lucide-react";

interface HrLayoutProps {
  readonly children: React.ReactNode;
}

interface NavItem {
  readonly href: string;
  readonly label: string;
  readonly icon: React.ReactNode;
}

const NAV_ITEMS: readonly NavItem[] = [
  { href: "/hr/dashboard", label: "Dashboard", icon: <LayoutDashboard className="h-4 w-4" /> },
  { href: "/hr/pipeline", label: "Aday Hunisi", icon: <Kanban className="h-4 w-4" /> },
  { href: "#", label: "Ayarlar", icon: <Settings className="h-4 w-4" /> },
] as const;

export default function HrLayout({ children }: HrLayoutProps): React.JSX.Element {
  const pathname = usePathname();

  return (
    <div className="flex h-screen overflow-hidden bg-[#050508]">
      {/* ── Sidebar ── */}
      <aside className="hidden w-64 shrink-0 flex-col border-r border-white/[0.06] bg-[#08080d] md:flex">
        {/* Logo */}
        <div className="flex h-16 items-center gap-2.5 border-b border-white/[0.06] px-6">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500/20 to-purple-500/20 ring-1 ring-white/[0.06]">
            <Shield className="h-4 w-4 text-blue-400" />
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-bold text-white">
              AgenticHR<span className="text-blue-400">.ai</span>
            </span>
            <span className="text-[10px] font-medium uppercase tracking-widest text-white/20">
              Admin
            </span>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex flex-1 flex-col gap-1 px-3 py-4">
          <p className="mb-2 px-3 text-[10px] font-semibold uppercase tracking-widest text-white/15">
            Ana Menü
          </p>
          {NAV_ITEMS.map((item) => {
            const isActive =
              item.href !== "#" && pathname.startsWith(item.href);
            return (
              <Link
                key={item.href + item.label}
                href={item.href}
                className={`group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-all duration-200 ${
                  isActive
                    ? "bg-white/[0.06] font-medium text-white"
                    : "text-white/35 hover:bg-white/[0.03] hover:text-white/60"
                }`}
              >
                <span
                  className={`transition-colors ${
                    isActive ? "text-blue-400" : "text-white/20 group-hover:text-white/40"
                  }`}
                >
                  {item.icon}
                </span>
                {item.label}
                {isActive && (
                  <ChevronRight className="ml-auto h-3.5 w-3.5 text-white/15" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* User footer */}
        <div className="border-t border-white/[0.06] p-4">
          <div className="flex items-center gap-3 rounded-xl bg-white/[0.02] px-3 py-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-emerald-500/20 to-cyan-500/20 ring-1 ring-white/[0.06]">
              <User className="h-3.5 w-3.5 text-emerald-400" />
            </div>
            <div className="flex flex-col">
              <span className="text-xs font-medium text-white/60">
                Tech Recruiter
              </span>
              <span className="text-[10px] text-white/20">Yönetici</span>
            </div>
          </div>
        </div>
      </aside>

      {/* ── Main content ── */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Top bar */}
        <header className="flex h-16 shrink-0 items-center justify-between border-b border-white/[0.06] px-6 md:px-8">
          {/* Mobile logo */}
          <div className="flex items-center gap-2 md:hidden">
            <Shield className="h-4 w-4 text-blue-400" />
            <span className="text-sm font-bold text-white">AgenticHR</span>
          </div>

          {/* Breadcrumb area */}
          <div className="hidden items-center gap-2 text-sm md:flex">
            <span className="text-white/20">İK Paneli</span>
            <ChevronRight className="h-3 w-3 text-white/10" />
            <span className="font-medium text-white/50">
              {NAV_ITEMS.find((n) => n.href !== "#" && pathname.startsWith(n.href))?.label ?? "Sayfa"}
            </span>
          </div>

          {/* Right side */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 rounded-full border border-emerald-500/10 bg-emerald-500/[0.04] px-3 py-1">
              <span className="relative flex h-1.5 w-1.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-500" />
              </span>
              <span className="text-[10px] font-medium text-emerald-400/70">
                Sistem Aktif
              </span>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto">
          <div className="p-6 md:p-8">{children}</div>
        </main>
      </div>
    </div>
  );
}
