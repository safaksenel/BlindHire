const fs = require('fs');

['app/login/page.tsx', 'app/register/page.tsx'].forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  content = content.replace('import { AppLogo } from "@/components/AppLogo";`nimport {`n', 'import { AppLogo } from "@/components/AppLogo";\nimport {\n');
  fs.writeFileSync(file, content);
});
