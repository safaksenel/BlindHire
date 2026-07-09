const fs = require('fs');
let content = fs.readFileSync('app/api/auth/login/route.ts', 'utf8');

content = content.replace(
  'where: { email: email.trim().toLowerCase() }',
  'where: { email: email.trim().toLowerCase() },\n      include: { company: true }'
);

content = content.replace(
  'role: matchedUser.role,',
  'role: matchedUser.role,\n      companyName: matchedUser.company?.name || null,'
);

fs.writeFileSync('app/api/auth/login/route.ts', content);
