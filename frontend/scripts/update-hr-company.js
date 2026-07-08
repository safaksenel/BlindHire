const fs = require('fs');
let content = fs.readFileSync('app/hr/layout.tsx', 'utf8');

// Add companyName state
content = content.replace(
  'const [userName, setUserName] = useState("Kullanıcı");',
  'const [userName, setUserName] = useState("Kullanıcı");\n  const [companyName, setCompanyName] = useState("");'
);

// Add company_name to cookie parsing
const oldCookieLogic = `      if (nameStr) {
        setUserName(decodeURIComponent(nameStr));
      }`;
const newCookieLogic = `      if (nameStr) {
        setUserName(decodeURIComponent(nameStr));
      }
      
      const compStr = document.cookie
        .split('; ')
        .find((row) => row.startsWith('company_name='))
        ?.split('=')[1];
        
      if (compStr) {
        setCompanyName(decodeURIComponent(compStr));
      }`;
content = content.replace(oldCookieLogic, newCookieLogic);

// Add companyName to handleLogout clear list
content = content.replace(
  'const cookiesToClear = ["auth_token", "hr_auth_token", "user_role", "user_id", "user_name"];',
  'const cookiesToClear = ["auth_token", "hr_auth_token", "user_role", "user_id", "user_name", "company_name"];'
);

// Add companyName to the UI
const oldUI = `<span className="text-xs font-medium text-white/90 truncate">
                {userName}
              </span>
              <span className="text-[10px] text-theme-1/80 font-medium">
                İK Yönetici
              </span>`;
const newUI = `{companyName && (
                <span className="text-[9px] font-bold text-white/40 uppercase tracking-widest truncate mb-0.5" title={companyName}>
                  {companyName}
                </span>
              )}
              <span className="text-xs font-medium text-white/90 truncate">
                {userName}
              </span>
              <span className="text-[10px] text-theme-1/80 font-medium">
                İK Yönetici
              </span>`;
content = content.replace(oldUI, newUI);

fs.writeFileSync('app/hr/layout.tsx', content);
