const fs = require('fs');
let content = fs.readFileSync('app/login/page.tsx', 'utf8');

content = content.replace(
  'document.cookie = `user_name=${encodeURIComponent(data.fullName)}; path=/; SameSite=Lax`;',
  'document.cookie = `user_name=${encodeURIComponent(data.fullName)}; path=/; SameSite=Lax`;\n  if (data.companyName) document.cookie = `company_name=${encodeURIComponent(data.companyName)}; path=/; SameSite=Lax`;'
);

content = content.replace(
  'document.cookie = "user_name=Admin; path=/; SameSite=Lax";',
  'document.cookie = "user_name=Admin; path=/; SameSite=Lax";\n      document.cookie = "company_name=Sistem Yönetimi; path=/; SameSite=Lax";'
);

fs.writeFileSync('app/login/page.tsx', content);
