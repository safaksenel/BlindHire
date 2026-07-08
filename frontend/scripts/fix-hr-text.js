const fs = require('fs');

let content = fs.readFileSync('app/hr/layout.tsx', 'utf8');

// Fix encoding issues
content = content.replace('IK Ynetici', 'İK Yönetici');
content = content.replace('ikis Yap', 'Çıkış Yap');
content = content.replace('Kullanici', 'Kullanıcı');

// Fix cookie reading
const oldUseEffect = `  useEffect(() => {
    const cookies = document.cookie.split(';');
    for (let c of cookies) {
      const [name, val] = c.trim().split('=');
      if (name === 'user_name' && val) {
        setUserName(decodeURIComponent(val));
      }
    }
  }, []);`;

const newUseEffect = `  useEffect(() => {
    try {
      const nameStr = document.cookie
        .split('; ')
        .find((row) => row.startsWith('user_name='))
        ?.split('=')[1];
        
      if (nameStr) {
        setUserName(decodeURIComponent(nameStr));
      }
    } catch(e) {
      console.error(e);
    }
  }, []);`;

content = content.replace(oldUseEffect, newUseEffect);

fs.writeFileSync('app/hr/layout.tsx', content);
