/* eslint-disable @typescript-eslint/no-require-imports */
const { execSync } = require('child_process');

console.log('\n=============================================');
console.log('🤖 BlindHire Kurulum Sihirbazına Hoş Geldiniz');
console.log('=============================================\n');

try {
  console.log('⏳ Yerel veritabanı (SQLite) kuruluyor (npx prisma db push)...');
  execSync('npx prisma db push', { stdio: 'inherit' });
  console.log('✅ Veritabanı başarıyla oluşturuldu!');
  
  console.log('\n⏳ Veritabanı istemcisi güncelleniyor (npx prisma generate)...');
  execSync('npx prisma generate', { stdio: 'inherit' });

  console.log('\n🎉 Kurulum tamamlandı! Sistemi başlatmak için şu komutu çalıştırın:');
  console.log('\n👉  npm run dev\n');

} catch (err) {
  console.error('\n❌ Kurulum sırasında bir hata oluştu:');
  console.error(err.message);
}
