# BlindHire - AI Destekli İK Süreç Yönetimi

## Proje Hakkında
Bu proje, yapay zeka destekli teknik mülakatlar ve yetenek değerlendirmesi için geliştirilmiş yeni nesil bir İK Yönetim Panelidir. Adayların yetkinliklerini analiz eder, objektif puanlar ve mülakatı otomatikleştirir.

---

## 🚀 Kurulum Rehberi (Sıfır Ayar, Anında Çalışır)

Projemiz veritabanı olarak **Yerel (Local) SQLite** kullanmaktadır. Bu sayede hiçbir bulut (Supabase vb.) ayarı yapmanıza, şifre girmenize veya internet kısıtlamalarıyla (IP engelleriyle) uğraşmanıza gerek yoktur. **Veritabanı bilgisayarınızda kalıcı olarak depolanır ve asla sıfırlanmaz.** 

Projeyi bilgisayarınıza indirip anında çalıştırmak için aşağıdaki **3 adımı** sırasıyla izleyin.

### Adım 1: Projeyi Bilgisayarınıza İndirin
Terminalinizi açın ve projeyi klonlayın:
```bash
git clone <repo_url>
cd <repo_klasor_adi>/frontend
```

### Adım 2: Bağımlılıkları Yükleyin ve Yerel Veritabanını Kurun
Projenin çalışması için gereken paketleri kurun, ardından otomatik kurulum sihirbazını başlatın:
```bash
npm install
npm run setup
```
> **Bu adım ne yapıyor?**  
> `npm run setup` komutu, projenizdeki yerel veritabanını (`dev.db`) anında oluşturur ve sistem tablolarını eşitler. Sizden hiçbir şifre veya adres istemez, internet bağlantısından bağımsız çalışır. Projeyi her açtığınızda verileriniz `dev.db` dosyası içinde kalıcı olarak (sabit) saklanır.

### Adım 3: Projeyi Başlatın
Kurulum tamamlandıktan sonra, projeyi ayağa kaldırmak için:
```bash
npm run dev
```
> Projeniz anında **http://localhost:3000** adresinde çalışmaya başlayacaktır.

---

## 💡 Güvenlik ve Ortak Çalışma Notu
Bu projede şifreli dış bağlantılar (Supabase) devreden çıkarılmış olup, sistem %100 yerel ve otonom bir mimariye kavuşturulmuştur. 
GitHub'a projenizi yüklediğinizde `dev.db` dosyası projeyle birlikte aktarıldığı için, arkadaşlarınız veya hocalarınız projeyi klonladıklarında **sizin test amaçlı eklediğiniz tüm ilanları ve verileri anında bilgisayarlarında görebileceklerdir.** Herhangi bir ek ayar gerektirmez.
