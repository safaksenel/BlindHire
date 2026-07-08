const fs = require('fs');
const path = require('path');

function replaceColors(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let newContent = content
    .replace(/blue-[1-9]00/g, 'theme-1')
    .replace(/emerald-[1-9]00/g, 'theme-1')
    .replace(/cyan-[1-9]00/g, 'theme-3')
    .replace(/purple-[1-9]00/g, 'theme-2')
    .replace(/teal-[1-9]00/g, 'theme-1')
    .replace(/indigo-[1-9]00/g, 'theme-2')
    .replace(/amber-[1-9]00/g, 'theme-2')
    .replace(/orange-[1-9]00/g, 'theme-2')
    .replace(/rose-[1-9]00/g, 'theme-3');
    
  if (content !== newContent) {
    fs.writeFileSync(filePath, newContent);
    console.log(`Updated ${filePath}`);
  }
}

replaceColors('app/login/page.tsx');
replaceColors('app/register/page.tsx');
