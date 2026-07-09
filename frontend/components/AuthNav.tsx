"use client";

import Link from "next/link";
import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { User, LogOut } from "lucide-react";
import { useToast } from "./ToastContext";

export function AuthNav({ isAuth = false }: { readonly isAuth?: boolean }) {
  const [isAuthenticated, setIsAuthenticated] = useState(isAuth);
  const [userName, setUserName] = useState("");
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const { addToast } = useToast();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const checkAuth = async () => {
      const hasAuthToken = document.cookie.includes("auth_token=authenticated");
      const hasHrToken = document.cookie.includes("hr_auth_token=authenticated");
      setIsAuthenticated(hasAuthToken || hasHrToken || isAuth);

      const match = document.cookie.match(/(?:(?:^|.*;\s*)user_name\s*\=\s*([^;]*).*$)|^.*$/);
      if (match && match[1]) {
        try {
          setUserName(decodeURIComponent(match[1]));
        } catch {
          setUserName(match[1]);
        }
      } else {
        setUserName("");
      }

      if (hasAuthToken) {
        try {
          const res = await fetch("/api/users/profile");
          if (res.ok) {
            const data = await res.json();
            if (data.avatarUrl) {
              setAvatarUrl(data.avatarUrl);
            }
          }
        } catch {
          // ignore
        }
      }
    };
    checkAuth();
    window.addEventListener("focus", checkAuth);
    return () => window.removeEventListener("focus", checkAuth);
  }, [isAuth]);

  const handleLogout = () => {
    const cookiesToClear = ["auth_token", "hr_auth_token", "user_role", "user_id"];
    cookiesToClear.forEach((name) => {
      document.cookie = `${name}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
    });
    setIsAuthenticated(false);
    setDropdownOpen(false);
    addToast("Başarıyla çıkış yapıldı.", "info");
    router.push("/");
    router.refresh();
  };

  if (!isAuthenticated) {
    return (
      <div className="flex items-center gap-5 text-sm font-medium text-zinc-400">
        <Link href="/login" className="hover:text-white transition-colors py-1.5">
          Giriş Yap
        </Link>
        <Link
          href="/register"
          className="rounded-xl bg-white/[0.04] border border-white/[0.06] px-5 py-2 text-white hover:bg-white/[0.08] hover:border-white/[0.1] transition-all"
        >
          Kayıt Ol
        </Link>
      </div>
    );
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setDropdownOpen(!dropdownOpen)}
        aria-label="Kullanıcı Menüsü"
        aria-expanded={dropdownOpen}
        className="flex h-9 items-center justify-center gap-2 rounded-full bg-white/[0.05] border border-white/[0.1] px-3 hover:bg-white/[0.1] transition-all"
      >
        {userName && <span className="text-xs font-semibold text-zinc-300">{userName}</span>}
        {avatarUrl ? (
          <img src={avatarUrl} alt="Profil" className="h-6 w-6 rounded-full object-cover select-none pointer-events-none" draggable="false" onContextMenu={(e) => e.preventDefault()} />
        ) : (
          <User className="h-4 w-4 text-white/80" />
        )}
      </button>

      {dropdownOpen && (
        <div className="absolute right-0 mt-2 w-48 origin-top-right rounded-xl border border-white/[0.08] bg-zinc-900 shadow-2xl py-1 z-50">
          <Link
            href="/dashboard"
            className="flex w-full items-center gap-2 px-4 py-2 text-sm text-zinc-300 hover:bg-white/[0.04] hover:text-white transition-colors"
          >
            <User className="h-4 w-4 opacity-50" />
            Aday Paneli
          </Link>
          <Link
            href="/user/profile"
            className="flex w-full items-center gap-2 px-4 py-2 text-sm text-zinc-300 hover:bg-white/[0.04] hover:text-white transition-colors"
          >
            <User className="h-4 w-4 opacity-50" />
            Profil
          </Link>
          <div className="w-full h-px bg-white/[0.05] my-1" />
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
