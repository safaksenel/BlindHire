"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { User, LogOut } from "lucide-react";

export function AuthNav() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const checkAuth = () => {
      const hasAuthToken = document.cookie.includes("auth_token=authenticated");
      const hasHrToken = document.cookie.includes("hr_auth_token=authenticated");
      setIsAuthenticated(hasAuthToken || hasHrToken);
    };
    checkAuth();
    // Optional: listen to custom events if needed, but simple check is fine here
    window.addEventListener("focus", checkAuth);
    return () => window.removeEventListener("focus", checkAuth);
  }, []);

  const handleLogout = () => {
    const cookiesToClear = ["auth_token", "hr_auth_token", "user_role", "user_id"];
    cookiesToClear.forEach((name) => {
      document.cookie = `${name}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
    });
    setIsAuthenticated(false);
    setDropdownOpen(false);
    router.push("/");
    router.refresh();
  };

  if (!isAuthenticated) {
    return (
      <div className="flex items-center gap-4 text-xs font-medium text-zinc-400">
        <Link href="/login" className="hover:text-white transition-colors">
          Giriş Yap
        </Link>
        <Link
          href="/register"
          className="rounded-lg bg-white/[0.04] border border-white/[0.06] px-3.5 py-1.5 text-white hover:bg-white/[0.08] hover:border-white/[0.1] transition-all"
        >
          Kayıt Ol
        </Link>
      </div>
    );
  }

  return (
    <div className="relative">
      <button
        onClick={() => setDropdownOpen(!dropdownOpen)}
        className="flex h-9 w-9 items-center justify-center rounded-full bg-white/[0.05] border border-white/[0.1] hover:bg-white/[0.1] transition-all"
      >
        <User className="h-4 w-4 text-white/80" />
      </button>

      {dropdownOpen && (
        <div className="absolute right-0 mt-2 w-48 origin-top-right rounded-xl border border-white/[0.08] bg-zinc-900 shadow-2xl py-1 z-50">
          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-2 px-4 py-2 text-sm text-red-400 hover:bg-white/[0.04] transition-colors"
          >
            <LogOut className="h-4 w-4" />
            Çıkış Yap
          </button>
        </div>
      )}
    </div>
  );
}
