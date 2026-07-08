const fs = require('fs');

// 1. Remove the top-right and bottom-left bloom from page.tsx
let pageContent = fs.readFileSync('app/page.tsx', 'utf8');
pageContent = pageContent.replace(/\{\/\* Main purple glow[^\n]*\n\s*<div className="absolute -right-40 -top-40 h-\[600px\] w-\[600px\] rounded-full bg-theme-2\/\[0\.08\] blur-\[120px\]" \/>/g, '');
pageContent = pageContent.replace(/\{\/\* Secondary purple glow[^\n]*\n\s*<div className="absolute -bottom-48 -left-48 h-\[500px\] w-\[500px\] rounded-full bg-theme-2\/\[0\.08\] blur-\[100px\]" \/>/g, '');
fs.writeFileSync('app/page.tsx', pageContent);

// 2. Adjust the top-left logo in layout.tsx to shift slightly right for visual centering
let layoutContent = fs.readFileSync('app/layout.tsx', 'utf8');
layoutContent = layoutContent.replace('<AppLogo className="h-8 w-8 drop-shadow', '<AppLogo className="h-8 w-8 translate-x-[2px] drop-shadow');
fs.writeFileSync('app/layout.tsx', layoutContent);
