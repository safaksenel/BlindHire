# AgenticHR.ai 🤖👔

Otonom AI İşe Alım Platformu. Sıfır önyargılı, liyakat tabanlı ve tamamen otomatik mülakat/değerlendirme süreçleri sunar.

## Kurulum ve Çalıştırma

Projeyi bilgisayarınıza klonladıktan sonra, geliştirme ortamını hazırlamak ve uygulamayı başlatmak için aşağıdaki adımları sırasıyla izleyin.

### 1. Bağımlılıkların Kurulması
Projenin çalışması için gereken tüm paketleri indirmek üzere aşağıdaki komutu çalıştırın:
```bash
npm install
```

### 2. Veritabanı İstemcisinin Hazırlanması
Prisma şemasını baz alarak veritabanı istemcisini oluşturmak ve tipleri derlemek için bu komutu kullanın:
```bash
npx prisma generate
```

### 3. Geliştirme Sunucusunun Başlatılması
Her şey hazır! Uygulamayı geliştirici modunda (development) başlatmak için son olarak şu komutu girin:
```bash
npm run dev
```

Uygulama başarıyla başlatıldıktan sonra tarayıcınız üzerinden [http://localhost:3000](http://localhost:3000) adresine giderek projeyi görüntüleyebilirsiniz.
