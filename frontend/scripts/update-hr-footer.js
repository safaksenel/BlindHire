const fs = require('fs');

let content = fs.readFileSync('app/hr/layout.tsx', 'utf8');

// 1. Add LogOut to imports
content = content.replace('User, ChevronRight, Shield', 'User, ChevronRight, Shield, LogOut');

// 2. Add useRouter, useState, useEffect to imports if not there
if (!content.includes('import { useRouter }')) {
  content = content.replace('import { usePathname } from "next/navigation";', 'import { usePathname, useRouter } from "next/navigation";\nimport { useState, useEffect } from "react";');
}

// 3. Inject userName state and handleLogout function into HrLayout
const hookInjection = `
  const pathname = usePathname();
  const router = useRouter();
  const [userName, setUserName] = useState("Kullanici");

  useEffect(() => {
    const cookies = document.cookie.split(';');
    for (let c of cookies) {
      const [name, val] = c.trim().split('=');
      if (name === 'user_name' && val) {
        setUserName(decodeURIComponent(val));
      }
    }
  }, []);

  const handleLogout = () => {
    const cookiesToClear = ["auth_token", "hr_auth_token", "user_role", "user_id", "user_name"];
    cookiesToClear.forEach((name) => {
      document.cookie = name + "=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
    });
    router.push("/");
    router.refresh();
  };
`;
content = content.replace('const pathname = usePathname();', hookInjection);

// 4. Update User footer
const oldFooter = `{/* User footer */}
        <div className="border-t border-white/[0.06] p-4">
          <div className="flex items-center gap-3 rounded-xl bg-white/[0.02] px-3 py-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-theme-1/20 to-theme-3/20 ring-1 ring-white/[0.06]">
              <User className="h-3.5 w-3.5 text-theme-1" />
            </div>
            <div className="flex flex-col">
              <span className="text-xs font-medium text-white/60">
                Tech Recruiter
              </span>
              <span className="text-[10px] text-white/20">YA netici</span>
            </div>
          </div>
        </div>`;

const newFooter = `{/* User footer */}
        <div className="border-t border-white/[0.06] p-4">
          <div className="flex items-center gap-3 rounded-xl bg-white/[0.02] px-3 py-2.5">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-theme-1/20 to-theme-3/20 ring-1 ring-white/[0.06]">
              <User className="h-3.5 w-3.5 text-theme-1" />
            </div>
            <div className="flex flex-col flex-1 min-w-0">
              <span className="text-xs font-medium text-white/90 truncate">
                {userName}
              </span>
              <span className="text-[10px] text-theme-1/80 font-medium">
                IK Yönetici
              </span>
            </div>
            <button 
              onClick={handleLogout}
              className="p-1.5 shrink-0 hover:bg-red-500/10 rounded-lg group transition-colors"
              title="Çikis Yap"
            >
              <LogOut className="w-4 h-4 text-white/40 group-hover:text-red-400 transition-colors" />
            </button>
          </div>
        </div>`;

content = content.replace(oldFooter, newFooter);

fs.writeFileSync('app/hr/layout.tsx', content);
