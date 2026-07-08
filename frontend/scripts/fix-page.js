const fs = require('fs');
let content = fs.readFileSync('app/page.tsx', 'utf8');

content = content.replace(
  'import { ArrowRight, Shield, Brain, Zap } from "lucide-react";',
  'import { ArrowRight, Shield, Brain, Zap } from "lucide-react";\nimport { AppLogo } from "@/components/AppLogo";'
);

content = content.replace(/from-blue-400/g, 'from-theme-1')
       .replace(/via-purple-400/g, 'via-theme-2')
       .replace(/to-cyan-400/g, 'to-theme-3')
       .replace(/text-emerald-400/g, 'text-theme-1')
       .replace(/text-cyan-400/g, 'text-theme-1')
       .replace(/text-blue-400/g, 'text-theme-2')
       .replace(/bg-emerald-500/g, 'bg-theme-1')
       .replace(/bg-emerald-400/g, 'bg-theme-2')
       .replace(/Otonom Liyakat\./g, 'Kusursuz Eslesme.');

content = content.replace(
  /<motion\.div\s*initial=\{\{ opacity: 0, scale: 0\.9 \}\}\s*animate=\{\{ opacity: 1, scale: 1 \}\}\s*transition=\{\{ duration: 0\.5 \}\}\s*className="mb-8 inline-flex items-center gap-2 rounded-full border border-white\/\[0\.08\] bg-white\/\[0\.03\] px-4 py-1\.5 text-xs font-medium text-white\/60 backdrop-blur-sm"\s*>\s*<span className="relative flex h-2 w-2">\s*<span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" \/>\s*<span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" \/>\s*<\/span>\s*Otonom Ise Alim Platformu\s*<\/motion\.div>/,
  `{/* Large Central Frameless Logo */}
        <motion.div
          initial={{ opacity: 0, y: -20, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.7, ease: "easeOut" }}
          className="mx-auto flex justify-center mb-8 pointer-events-none"
        >
          <div className="relative flex h-24 w-24 items-center justify-center">
            <div className="absolute inset-0 rounded-full bg-theme-1/10 blur-xl" />
            <AppLogo className="relative h-20 w-20 drop-shadow-[0_0_15px_var(--theme-c1)]" />
          </div>
        </motion.div>`
);

fs.writeFileSync('app/page.tsx', content);
