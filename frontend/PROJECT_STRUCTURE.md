# BlindHire Projesi - AI Geliştirici Kılavuzu

Bu belge, AI asistanlarının projeyi daha hızlı ve kolay kavrayabilmesi için oluşturulmuş bir yol haritasıdır.
**ÖNEMLİ:** Tüm çalışmalar "C:\Users\bedir\OneDrive\Desktop\BlindHire\frontend" dizininde yapılacaktır.

## 📂 Dizin ve Dosya Yapısı

- **`app/`**: Next.js App Router klasörü. Tüm sayfalar, layout'lar ve API route'ları buradadır.
  - **`app/admin/`**: Sistem yöneticisi (Admin) paneli arayüzleri.
  - **`app/hr/`**: İnsan Kaynakları (HR) paneli arayüzleri. Dashboard, Pipeline, Settings ve Aday Detayları sayfaları burada yer alır.
  - **`app/user/`**: Kullanıcı (Aday) paneli arayüzleri (Profil vb.).
  - **`app/api/`**: Tüm arka plan iş mantıkları, Prisma çağrıları ve REST API uç noktaları.
- **`components/`**: Yeniden kullanılabilir React bileşenleri (Butonlar, modallar, form elemanları).
- **`lib/`**: Yardımcı kütüphaneler. `prisma.ts` veritabanı bağlantısı için kullanılır.
- **`prisma/`**: Veritabanı modeli (`schema.prisma`), migrasyon dosyaları ve yerel SQLite veritabanı (`dev.db`). 
- **`public/`**: Statik varlıklar (resimler, ikonlar) ve CV yüklemeleri (`uploads/` dizini vb.).
- **`scratch/`** ve **`scripts/`**: Test, veri temizleme (delete_apps vb.) veya veritabanı manipülasyonu için geçici/yardımcı script dosyaları.

## ⚙️ Teknik Detaylar
- **Framework:** Next.js (App Router), React, TailwindCSS.
- **Veritabanı:** Prisma ORM, SQLite. (Kullanıcı, iş ilanları, başvuru süreçleri, ayarlar vb. tüm şemalar Prisma üzerinden yönetilir).
- **Roller:** `ADMIN`, `HR`, `USER`.
- **ATS Algoritması:** CV dosyalarından metin okuma (`pdf-parse`) ve LLM destekli (Groq API veya muadili) eşleştirme sistemi üzerinden aday değerlendirmesi.

## ⚠️ Kritik Uyarılar
- Asla veritabanı dosyaları (`*.db`), `.env` dosyaları, geçici loglar veya yüklenen özgeçmişler (`uploads/`) Git/Github ortamına gönderilmemelidir (`.gitignore` güncellenmiştir).
- Bu belgenin (`PROJECT_STRUCTURE.md`) kendisi de `.gitignore` içerisinde yer alır ve sunucuya gönderilmez.
- HR Paneli ayarlarında (`app/hr/settings`) yapılan threshold değer değişiklikleri tamamiyle `parseInt` ile sayısal (integer) olarak kaydedilmek zorundadır.
