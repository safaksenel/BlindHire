const fs = require('fs');
let content = fs.readFileSync('prisma/schema.prisma', 'utf8');

content = content.replace(
  'status       String        @default("ACTIVE")',
  'status       String        @default("ACTIVE")\n  startDate    DateTime?\n  endDate      DateTime?'
);

fs.writeFileSync('prisma/schema.prisma', content);
