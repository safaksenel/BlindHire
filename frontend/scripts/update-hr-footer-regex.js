const fs = require('fs');

let content = fs.readFileSync('app/hr/layout.tsx', 'utf8');

const regex = /\{\/\* User footer \*\/\}.*?<\/aside>/s;
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
        </div>
      </aside>`;

content = content.replace(regex, newFooter);

fs.writeFileSync('app/hr/layout.tsx', content);
