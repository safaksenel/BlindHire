const fs = require('fs');

// Fix page.tsx logo size
let pageContent = fs.readFileSync('app/page.tsx', 'utf8');
pageContent = pageContent.replace('className="relative flex h-24 w-24', 'className="relative flex h-28 w-28');
pageContent = pageContent.replace('<AppLogo className="relative h-20 w-20', '<AppLogo className="relative h-24 w-24');
fs.writeFileSync('app/page.tsx', pageContent);

// Fix layout.tsx logo size
let layoutContent = fs.readFileSync('app/layout.tsx', 'utf8');
layoutContent = layoutContent.replace('<AppLogo className="h-6 w-6 drop-shadow', '<AppLogo className="h-8 w-8 drop-shadow');
fs.writeFileSync('app/layout.tsx', layoutContent);
