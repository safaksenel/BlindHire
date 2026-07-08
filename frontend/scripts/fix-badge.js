const fs = require('fs');
let content = fs.readFileSync('app/page.tsx', 'utf8');
const badgeRegex = /\{\/\* Badge \*\/\}\s*<motion\.div[\s\S]*?Otonom Ise Alim Platformu\s*<\/motion\.div>/;
content = content.replace(badgeRegex, {/* Large Central Frameless Logo */}
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
        </motion.div>);
fs.writeFileSync('app/page.tsx', content);
