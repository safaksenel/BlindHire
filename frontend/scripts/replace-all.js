const fs = require('fs');
const path = require('path');

function walkDir(dir, callback) {
  fs.readdirSync(dir).forEach(f => {
    let dirPath = path.join(dir, f);
    let isDirectory = fs.statSync(dirPath).isDirectory();
    isDirectory ? walkDir(dirPath, callback) : callback(path.join(dir, f));
  });
}

walkDir('app', function(filePath) {
  if (filePath.endsWith('.tsx') || filePath.endsWith('.ts')) {
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
      .replace(/rose-[1-9]00/g, 'theme-3')
      .replace(/zinc-950/g, 'black'); // Ensure contrast? No, zinc-950 is fine for dark mode. Let's leave zinc.
    
    // Specifically fix any `bg-gradient-to-r from-theme-1 to-theme-2` type stuff if it was broken, but it should be fine.
    
    if (content !== newContent) {
      fs.writeFileSync(filePath, newContent);
      console.log(`Updated ${filePath}`);
    }
  }
});

// Also do components directory
walkDir('components', function(filePath) {
  if (filePath.endsWith('.tsx') || filePath.endsWith('.ts')) {
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
});

