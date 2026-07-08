const fs = require('fs');
let content = fs.readFileSync('app/hr/layout.tsx', 'utf8');

const navItemsString = `const NAV_ITEMS: readonly NavItem[] = [
  { href: "/hr/dashboard", label: "Dashboard", icon: <LayoutDashboard className="h-4 w-4" /> },
  { href: "/hr/pipeline", label: "Aday Hunisi", icon: <Kanban className="h-4 w-4" /> },
  { href: "/hr/history/jobs", label: "İlan Geçmişi", icon: <Archive className="h-4 w-4" /> },
  { href: "/hr/history/applications", label: "Başvuru Geçmişi", icon: <FileText className="h-4 w-4" /> },
  { href: "/hr/settings", label: "Ayarlar", icon: <Settings className="h-4 w-4" /> },
] as const;`;

content = content.replace(
  /const NAV_ITEMS: readonly NavItem\[\] = \[\s*\{[^\}]+\},\s*\{[^\}]+\},\s*\{[^\}]+\},\s*\] as const;/g,
  navItemsString
);

// Add missing icon imports
content = content.replace(
  'import { LayoutDashboard, Kanban, Settings, User, ChevronRight, Shield, LogOut } from "lucide-react";',
  'import { LayoutDashboard, Kanban, Settings, User, ChevronRight, Shield, LogOut, Archive, FileText } from "lucide-react";'
);

fs.writeFileSync('app/hr/layout.tsx', content);
