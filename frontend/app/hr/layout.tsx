"use client";

import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import Link from "next/link";
import { PaletteSwitcher } from "@/components/PaletteSwitcher";
import { LayoutDashboard, Kanban, Settings, User, ChevronRight, Shield, LogOut, Archive, FileText } from "lucide-react";

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
  { href: "/hr/history/jobs", label: "İlan Geçmişi", icon: <Archive className="h-4 w-4" /> },
  { href: "/hr/history/applications", label: "Başvuru Geçmişi", icon: <FileText className="h-4 w-4" /> },
  { href: "/hr/settings", label: "Ayarlar", icon: <Settings className="h-4 w-4" /> },
] as const;

export default function HrLayout({ children }: HrLayoutProps): React.JSX.Element {
  
  const pathname = usePathname();
  const router = useRouter();
  const [userName, setUserName] = useState("Kullanıcı");
  const [companyName, setCompanyName] = useState("");

  useEffect(() => {
    try {
      const nameStr = document.cookie
        .split('; ')
        .find((row) => row.startsWith('user_name='))
        ?.split('=')[1];
        
      if (nameStr) {
        setUserName(decodeURIComponent(nameStr));
      }
      
      const compStr = document.cookie
        .split('; ')
        .find((row) => row.startsWith('company_name='))
        ?.split('=')[1];
        
      if (compStr) {
        setCompanyName(decodeURIComponent(compStr));
      }
    } catch(e) {
      console.error(e);
    }
  }, []);

  const handleLogout = () => {
    const cookiesToClear = ["auth_token", "hr_auth_token", "user_role", "user_id", "user_name", "company_name"];
    cookiesToClear.forEach((name) => {
      document.cookie = name + "=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
    });
    router.push("/");
    router.refresh();
  };

  return (
    <div className="flex h-screen overflow-hidden bg-[#050508]">
      {/* Sidebar */}
      <aside className="hidden w-64 shrink-0 flex-col border-r border-white/[0.06] bg-[#08080d] md:flex">
        {/* Logo */}
        <div className="flex h-16 items-center gap-2.5 border-b border-white/[0.06] px-6">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-theme-1/20 to-theme-2/20 ring-1 ring-white/[0.06]">
            <Shield className="h-4 w-4 text-theme-1" />
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-bold text-white">
              BlindHire<span className="text-theme-1">.ai</span>
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
                    isActive ? "text-theme-1" : "text-white/20 group-hover:text-white/40"
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
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-theme-1/20 to-theme-3/20 ring-1 ring-white/[0.06]">
              <User className="h-3.5 w-3.5 text-theme-1" />
            </div>
            <div className="flex flex-col flex-1 min-w-0">
              {companyName && (
                <span className="text-[9px] font-bold text-white/40 uppercase tracking-widest truncate mb-0.5" title={companyName}>
                  {companyName}
                </span>
              )}
              <span className="text-xs font-medium text-white/90 truncate">
                {userName}
              </span>
              <span className="text-[10px] text-theme-1/80 font-medium">
                İK Yönetici
              </span>
            </div>
            <button 
              onClick={handleLogout}
              className="p-1.5 shrink-0 hover:bg-red-500/10 rounded-lg group transition-colors"
              title="Çıkış Yap"
            >
              <LogOut className="w-4 h-4 text-white/40 group-hover:text-red-400 transition-colors" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Top bar */}
        <header className="flex h-16 shrink-0 items-center justify-between border-b border-white/[0.06] px-6 md:px-8">
          {/* Mobile logo */}
          <div className="flex items-center gap-2 md:hidden">
            <Shield className="h-4 w-4 text-theme-1" />
            <span className="text-sm font-bold text-white">BlindHire</span>
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
            <PaletteSwitcher />
            <div className="hidden md:flex items-center gap-1.5 rounded-full border border-theme-1/10 bg-theme-1/[0.04] px-3 py-1">
              <span className="relative flex h-1.5 w-1.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-theme-1 opacity-75" />
                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-theme-1" />
              </span>
              <span className="text-[10px] font-medium text-theme-1/70">
                Sistem Aktif
              </span>
            </div>
            <button 
              onClick={handleLogout}
              className="md:hidden flex items-center justify-center p-2 rounded-lg text-white/50 hover:text-red-400 hover:bg-red-500/10 transition-colors"
              title="Çıkış Yap"
            >
              <LogOut className="h-4 w-4" />
            </button>
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