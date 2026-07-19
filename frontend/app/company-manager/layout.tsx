"use client";

import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import Link from "next/link";
import { LayoutDashboard, Settings, User, ChevronRight, ShieldCheck, LogOut, Briefcase, FileText, Edit2, Loader2, Check, X } from "lucide-react";

interface CompanyManagerLayoutProps {
  readonly children: React.ReactNode;
}

interface NavItem {
  readonly href: string;
  readonly label: string;
  readonly icon: React.ReactNode;
}

const NAV_ITEMS: readonly NavItem[] = [
  { href: "/company-manager/dashboard", label: "Dashboard", icon: <LayoutDashboard className="h-4 w-4" /> },
  { href: "/company-manager/job-approvals", label: "İlan Onayları", icon: <Briefcase className="h-4 w-4" /> },
  { href: "/company-manager/settings", label: "Firma Ayarları", icon: <Settings className="h-4 w-4" /> },
] as const;

export default function CompanyManagerLayout({ children }: CompanyManagerLayoutProps): React.JSX.Element {
  
  const pathname = usePathname();
  const router = useRouter();
  const [userName, setUserName] = useState("Yönetici");
  const [companyName, setCompanyName] = useState("");
  const [isEditingName, setIsEditingName] = useState(false);
  const [editNameValue, setEditNameValue] = useState("");
  const [isSavingName, setIsSavingName] = useState(false);

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
    document.cookie = "token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;";
    document.cookie = "user_role=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;";
    document.cookie = "user_id=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;";
    document.cookie = "user_name=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;";
    document.cookie = "company_name=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;";
    router.push("/login");
  };

  const handleSaveName = async () => {
    if (!editNameValue.trim()) return;
    setIsSavingName(true);
    try {
      const res = await fetch("/api/users/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fullName: editNameValue.trim() })
      });
      if (!res.ok) throw new Error();
      
      document.cookie = `user_name=${encodeURIComponent(editNameValue.trim())}; path=/; max-age=86400`;
      setUserName(editNameValue.trim());
      setIsEditingName(false);
    } catch (e) {
      alert("İsim güncellenirken hata oluştu.");
    } finally {
      setIsSavingName(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-[#0a0a0a]">
      {/* Sidebar */}
      <aside className="fixed inset-y-0 left-0 z-50 flex w-72 flex-col border-r border-[#222] bg-[#0a0a0a]">
        {/* Header */}
        <div className="flex h-16 items-center px-6 border-b border-[#222]">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-theme-1/10 text-theme-1">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <span className="text-lg font-bold text-white tracking-tight">Firma Paneli</span>
          </div>
        </div>

        {/* Navigation */}
        <div className="flex-1 overflow-y-auto py-6 px-4">
          <div className="mb-6 px-2">
            <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Menü</p>
          </div>
          <nav className="space-y-1">
            {NAV_ITEMS.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200 ${
                    isActive 
                      ? "bg-theme-1/10 text-theme-1" 
                      : "text-zinc-400 hover:bg-[#111] hover:text-zinc-200"
                  }`}
                >
                  <span className={`flex items-center justify-center ${isActive ? 'text-theme-1' : 'text-zinc-500 group-hover:text-zinc-400'}`}>
                    {item.icon}
                  </span>
                  {item.label}
                  {isActive && (
                    <ChevronRight className="ml-auto h-4 w-4 text-theme-1" />
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* User Profile Area */}
        <div className="border-t border-[#222] p-4 bg-[#0d0d0d]">
          <div className="flex flex-col gap-3 rounded-xl border border-[#222] bg-[#111] p-3 shadow-lg">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-theme-1/20 to-theme-2/20 border border-[#222]">
                <User className="h-5 w-5 text-theme-1" />
              </div>
              <div className="flex min-w-0 flex-col flex-1">
                {isEditingName ? (
                  <div className="flex items-center gap-1">
                    <input
                      type="text"
                      className="w-full bg-[#222] text-white text-xs px-2 py-1 rounded outline-none focus:ring-1 focus:ring-theme-1 border border-[#333]"
                      value={editNameValue}
                      onChange={(e) => setEditNameValue(e.target.value)}
                      autoFocus
                      onKeyDown={(e) => e.key === "Enter" && handleSaveName()}
                    />
                    <button onClick={handleSaveName} disabled={isSavingName} className="text-green-500 hover:text-green-400 p-1">
                      {isSavingName ? <Loader2 className="w-3 h-3 animate-spin" /> : <Check className="w-3 h-3" />}
                    </button>
                    <button onClick={() => setIsEditingName(false)} disabled={isSavingName} className="text-red-500 hover:text-red-400 p-1">
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <span className="truncate text-sm font-semibold text-white">{userName}</span>
                    <button 
                      onClick={() => { setEditNameValue(userName); setIsEditingName(true); }}
                      className="text-zinc-500 hover:text-theme-1 transition-colors"
                      title="İsmi Düzenle"
                    >
                      <Edit2 className="w-3 h-3" />
                    </button>
                  </div>
                )}
                <span className="truncate text-xs text-zinc-500">
                  {companyName ? companyName : "Şirket Yöneticisi"}
                </span>
              </div>
            </div>
            
            <div className="h-[1px] w-full bg-[#222]" />
            
            <div className="flex items-center justify-end">
              <button
                onClick={handleLogout}
                className="flex items-center justify-center rounded-lg p-2 text-red-500 hover:bg-red-500/10 transition-colors w-full"
                title="Çıkış Yap"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Çıkış Yap
              </button>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 pl-72">
        <div className="h-full w-full p-8">
          {children}
        </div>
      </main>
    </div>
  );
}
