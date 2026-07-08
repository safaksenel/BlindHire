const fs = require('fs');

let content = fs.readFileSync('app/hr/layout.tsx', 'utf8');
content = content.replace('import { PaletteSwitcher } from "@/components/PaletteSwitcher";`nimport { LayoutDashboard,', 'import { PaletteSwitcher } from "@/components/PaletteSwitcher";\nimport { LayoutDashboard,');
content = content.replace('<PaletteSwitcher />`n          <div className="flex items-center gap-3">', '<div className="flex items-center gap-3">\n            <PaletteSwitcher />');
fs.writeFileSync('app/hr/layout.tsx', content);
