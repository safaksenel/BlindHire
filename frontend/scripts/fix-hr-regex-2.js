const fs = require('fs');

let content = fs.readFileSync('app/hr/layout.tsx', 'utf8');

// Fix garbled text using regex
content = content.replace(/IK Y\S+netici/g, 'İK Yönetici');
content = content.replace(/ikis Yap/g, 'Çıkış Yap');
content = content.replace(/Ana MenA/g, 'Ana Menü');
content = content.replace(/K Paneli/g, 'İK Paneli');

fs.writeFileSync('app/hr/layout.tsx', content);
