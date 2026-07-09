const fs = require('fs');
let content = fs.readFileSync('app/api/hr/dashboard/route.ts', 'utf8');

// Filter active jobs
content = content.replace(
  'const jobsTable = companyJobs.map(job => {',
  'const activeJobs = companyJobs.filter(j => j.status === "ACTIVE" || !j.status);\n    const jobsTable = activeJobs.map(job => {'
);

fs.writeFileSync('app/api/hr/dashboard/route.ts', content);
