# BlindHire Projesi - AI Geliştirici Kılavuzu (v4.0)

Bu belge, AI asistanlarının ve takım üyelerinin projeyi daha hızlı kavraması için oluşturulmuş güncel bir mimari yol haritasıdır.

## 📂 Ana Dizin ve Dosya Yapısı (`frontend/`)

- **`app/`**: Next.js App Router (Sayfalar ve API'ler).
  - **`app/admin/`**: Super Admin paneli. Tüm şirketleri, HR kullanıcılarını ve global ayarları yönetir.
  - **`app/company-manager/`**: Şirket Yöneticisi paneli. Kendi şirketindeki HR kullanıcılarını ve iş ilanlarını onaylar/yönetir (RBAC devrede).
  - **`app/hr/`**: İnsan Kaynakları (HR) paneli. İş ilanları açma, ATS (Aday Takip Sistemi) Pipeline'ı yönetme ve ayarlar sayfası.
  - **`app/interview/[id]/`**: **Mülakat Odası**. Adayların AI ile sesli mülakat yaptığı ana modüldür. `PreflightStage` (Kamera/Mikrofon izni) ve `ArenaStage` (Canlı mülakat, VAD, Ses barları) bileşenlerini barındırır.
  - **`app/user/`**: Kullanıcı (Aday) paneli arayüzleri.
  - **`app/api/`**: Güvenli REST API uç noktaları. Role-Based Access Control (RBAC) ile korunur. (`/admin`, `/company-manager`, `/hr`, `/interview`).

- **`components/`**: Yeniden kullanılabilir React bileşenleri. (Aday kartları, onay modalleri, dinamik renk paletine duyarlı butonlar).
- **`lib/`**: Yardımcı fonksiyonlar ve kütüphaneler (`prisma.ts`, `utils.ts`).
- **`prisma/`**: Veritabanı modeli (`schema.prisma`) ve yerel SQLite veritabanı (`dev.db`).
- **`public/`**: Statik varlıklar (AI avatarları: `avatar_male.png`, `avatar_female.png` vb.).

## ⚙️ Teknik Detaylar ve Mimariler

### 1. Temel Stack
- **Framework:** Next.js 15 (App Router), React, TailwindCSS.
- **Veritabanı:** Prisma ORM, SQLite. (Localize statü enum'ları ve dinamik UI tercihleri burada saklanır).
- **Roller (RBAC):** `ADMIN`, `COMPANY_MANAGER`, `HR`, `USER`.

### 2. Conversational AI & Ses Entegrasyonu (v4.0 Güncellemeleri)
- **Always-On Microphone:** Mülakat sırasında kullanıcı sürekli dinlenir. VAD (Voice Activity Detection) adayın susma süresini 5 saniye (5000ms) ölçerek AI'a söz hakkı verir.
- **AudioContext & Blob:** Tarayıcı güvenlik politikalarını aşmak için `audioCtx.resume()` kullanılır. Çok kısa yanıtların kaybolmaması için WebM paket sınırı 50 byte'a çekilmiştir.
- **Görsel Ses Barı (Audio Visualizer):** React re-render'ı yapmadan 60fps çalışan DOM referanslı (`useRef`) ses düzey göstergesi eklendi.
- **LLM Optimizasyonu (`orchestrator.py`):** Llama 3.3 üzerinden çalışan yapay zekanın girdi (input) token israfı, global kurallar (`GENEL KURALLAR`) oluşturularak %40 oranında düşürülmüştür. Adayın sözü kesildiğinde veya cevap verdiğinde, AI bir sonraki soruya geçmeden doğal, insani onaylama cümleleri kurar.

## ⚠️ Kritik Uyarılar
- Asla veritabanı dosyaları (`*.db` veya `dev.db`), `.env` dosyaları Git'e atılmamalıdır (`.gitignore` dosyasında güncellenmiştir).
- HR Paneli ayarlarındaki eşik (threshold) değerleri veritabanına her zaman `parseInt` / `parseFloat` ile sayısal gönderilmelidir.
- Dinamik renk (Color Palette) değişiklikleri veritabanında tutulur ve UI/UX bileşenlerinde sayfa yüklenirken kontrol edilerek anlık (real-time) işlenir.

