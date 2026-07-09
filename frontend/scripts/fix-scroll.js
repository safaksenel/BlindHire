const fs = require('fs');

['app/login/page.tsx', 'app/register/page.tsx'].forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  content = content.replace(/min-h-screen/g, 'flex-1 w-full');
  fs.writeFileSync(file, content);
  console.log(`Updated ${file}`);
});
