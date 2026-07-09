const fs = require('fs');
let content = fs.readFileSync('app/api/hr/dashboard/route.ts', 'utf8');

content = content.replace(
  'id: job.id,',
  'id: job.id,\n        description: job.description,'
);

fs.writeFileSync('app/api/hr/dashboard/route.ts', content);
