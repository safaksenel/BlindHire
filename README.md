# **Takım İsmi**

Takım BlindHire

## 🚀 Kurulum ve Çalıştırma (Hızlı Başlangıç)

Projeyi bilgisayarınızda çalıştırmak için aşağıdaki adımları izleyin:

1. **Gereksinimler:** Sistemin çalışması için `.env` dosyasında `GROQ_API_KEY` ve (varsa) veritabanı ayarlarınızın tanımlı olması gerekir. (Örnek `.env.example` dosyasını kullanabilirsiniz).
2. **Backend (Python/FastAPI):**
   ```bash
   cd backend
   pip install -r requirements.txt
   uvicorn api.main:app --reload --port 8000
   ```
3. **Frontend (Next.js/React):**
   ```bash
   cd frontend
   npm install
   npx prisma db push  # Veritabanı şemasını eşitlemek için
   npm run dev
   ```
Sistem varsayılan olarak `http://localhost:3000` adresinde ayağa kalkacaktır.


# Ürün İle İlgili Bilgiler

## Takım Elemanları

- Şafak Şenel: Product Owner
- Simge Misli: Scrum Master
- Utku Ceylan: Team Member/Developer
- Bedirhan İhtiyar: Team Member/Developer
- Muhammed Melih Çam: Team Member/Developer

## Ürün İsmi

--BlindHire--

## Ürün Açıklaması

- BlindHire, adayın teknik bilgisini sesli mülakat üzerinden anonim olarak ölçen, proaktif bir işe alım mimarıdır. Mevcut Aday Takip Sistemleri (ATS) "kara delik" olarak adlandırılmakta ve yapay zekayı sadece anahtar kelime filtresi olarak kullanmaktadır. BlindHire, "Conversational AI" temeli üzerine kuruludur. Adaylara gönderilen bir link üzerinden, web tabanlı otonom bir sesli ajan adayla gerçek zamanlı bir teknik veya durumsal mülakat gerçekleştirir. Ajan, adayın sözünü kesmesini anlayabilen (interruptible) ve doğal sohbet akışını sürdürebilen gelişmiş bir duplex mimari kullanır. Mülakat bittiğinde, sistem adayın sesini, cinsiyetini, ismini veya etnik kökenini İK departmanına asla iletmez; sadece teknik yeterliliğe, analitik düşünme yeteneğine ve problem çözme yaklaşımına dair objektif bir karne (scorecard) oluşturur.

## Ürün Özellikleri

- Gerçek zamanlı sesli AI mülakat ajanı (Conversational AI)
- Adayın kimlik bilgilerini gizleyen anonim mülakat sistemi
- Yetkinlik bazlı objektif puanlama ve scorecard oluşturma
- İK uzmanları için yönetim paneli (dashboard)
- Mevcut ATS sistemleri ile webhook entegrasyonu (Greenhouse, Workable vb.)
- Netflix'te ve Prime'da bulunurluk benzeri yetkinlik puanları (teknik bilgi, analitik düşünme, problem çözme)

## Hedef Kitle

- İnsan Kaynakları Yöneticileri
- Teknik İşe Alım Uzmanları (Tech Recruiters)
- CTO'lar ve Teknik Liderler
- DEI (Çeşitlilik, Eşitlik, Kapsayıcılık) odaklı şirketler
- Uzaktan yazılımcı işe alan startup ve orta ölçekli şirketler
- Çok uluslu teknoloji ve kurumsal şirketler

---

## Sprint 1

### Ürün Ekran Görüntüsü

![Ürün Ekran Görüntüsü](WhatsApp%20Image%202026-07-01%20at%2023.06.13.jpeg)<img width="1902" height="777" alt="Ekran görüntüsü 2026-07-01 230127" src="https://github.com/user-attachments/assets/4cb49f10-3564-41ee-9add-57c2d315610d" />


### Sprint Board & Takım Toplantısı

<img width="1916" height="773" alt="Ekran görüntüsü 2026-07-01 225915" src="https://github.com/user-attachments/assets/1f8c288a-131f-465d-b514-8a29c7d791fe" />


## Sprint 1

### 1. Backlog Düzeni ve Story Seçimleri (Sprint Backlog)
Sprint 1 planlama toplantısında, BlindHire'ın MVP (Minimum Uygulanabilir Ürün) aşaması için en kritik iş kalemleri Trello üzerinde önceliklendirilmiş ve tüm mimarinin modern, tip güvenliği yüksek **TypeScript** tabanında yükselmesine karar verilmiştir:
* **Story 1 (Epic: Computer Vision / Görsel Analiz):** Bir yapay zeka geliştiricisi olarak, aday mülakat esnasındayken kamera üzerinden duygu analizi ve göz takibi (eye tracking) metriklerini toplayabilecek bilgisayarlı görü (Computer Vision) modellerini/kütüphanelerini kurmak ve backend altyapısını hazırlamak istiyorum. (Status: Done | Developer: Utku)
* **Story 2 (Epic: Conversational AI / LLM Senaryoları):** Bir yapay zeka geliştiricisi olarak, adayı karşılayan, mülakat akışını ve soru setlerini yöneten mantıksal LLM senaryolarını ve ilk prompt mühendisliği (Prompt Engineering) yapısını Python ve LangChain altyapısı kullanarak izole bir modül halinde hazırlamak istiyorum. (Status: Done | Developer: Melih)
* **Story 3 (Epic: Audio Analytics & Groq LLM Integration / Ses ve Entegrasyon):** Bir sistem mimarı ve entegratör olarak, adayın ses yüksekliğini, konuşma hızını ve duraksamalarını tarayıcıda JavaScript Web Audio API ile ölçen altyapıyı kurmak; **Groq API** üzerinden **Llama 3.3** modelini bağlamak ve Web Speech API ile sesli tepki mekanizmasını entegre etmek istiyorum. (Status: Done | Developer/Product Owner: Şafak)
* **Story 4 (Epic: Web UI / Frontend):** Bir frontend geliştiricisi olarak, adayın mülakata dahil olacağı web arayüzünün ilk komponent mimarisini, kamera/mikrofon erişim izinlerini ve tip tanımlamalarını (TypeScript Layout) ayağa kaldırmak istiyorum. (Status: Done | Developer: Bedirhan)
* **Story 5 (Epic: Agile Süreç Liderliği, Risk Yönetimi & Çapraz Fonksiyonel Koordinasyon):** Bir Scrum Master olarak, ekibin ilk sprintte dağılmasını önlemek adına GitHub organizasyon altyapısını kurgulamak; Trello sprint panosu üzerinden iş paketlerinin (Frontend, Python/LangChain LLM, Computer Vision, Ses Entegrasyonu) önceliklendirilmesini ve bağımlılık haritalarını (dependency mapping) yönetmek; mentor geri bildirimleri doğrultusunda Slack kanallarında asenkron iletişim disiplini oluşturmak ve teknik ekipler arasındaki entegrasyon blokajlarını proaktif olarak çözmek istiyorum. (Status: Done | Scrum Master: Simge)

### 2. Daily Scrum (Günlük Toplantı Özetleri)
Sprint boyunca Slack kanalları, Whatsapp ve anlık online toplantılar üzerinden iletişim sürdürülmüştür. Hafta sonu teslimine yaklaşırken takım içindeki kritik teknik diyaloglar ve durum özetleri şu şekildedir:
* **Bedirhan (Web UI):** Web sayfası demo olarak hazırlandı, genel bileşen dağıtımı yapıldı ve GitHub reposundaki ana yapı kurgulandı. Mikrofona ve kameraya erişim izinleri frontend arayüzüne başarıyla entegre edildi.
* **Utku (Görsel Analiz):** Kamera tabanlı duygu analizi modeli altyapısı TypeScript uyumlu mimaride ayağa kaldırıldı. Sistem kararlılığını artırmak adına göz takibi modülü üzerinde çalışmalar devam ediyor; ilk aşamada sistemin backend odaklı olarak repoya pushlanması kararlaştırıldı.
* **Melih (LLM/AI Senaryoları):** LLM tarafında adayı karşılayan, basit düzeyde giriş diyaloglarını yöneten prompt mimarisi ve aday havuzu senaryoları tamamlandı. Yerel testleri gerçekleştirilerek repoya pushlanmaya hazır hale getirildi. Ayrıca mülakatı mantıksal aşamalara (Karşılama, Teknik, Senaryo, Kapanış) bölen State Machine  mimarisi ve mülakat bitiminde otonom olarak JSON formatında Değerlendirme Skor Kartı üreten sistem Python LangChain ile başarıyla kodlandı. 
* **Şafak (Ses & Entegrasyon):** Geliştirilen bağımsız modüller (Web UI, LLM ve Görsel modüller) Şafak tarafından başarıyla entegre edildi. Üçüncü parti pahalı API'lar yerine JavaScript **Web Audio API** kullanılarak adayın konuşma hızı ve duraksamaları ölçülebilir hale getirildi. Bu verileri metin analizleriyle birleştirmek üzere **Groq altyapısı üzerinden Llama 3.3** entegrasyonu sağlandı ve **Web Speech API** ile uçtan uca konuşabilen ilk canlı demo ayağa kaldırıldı.
* **Simge (Scrum Master):** Mentorun Slack uyarısı sonrasında kriz yönetimi üstlenerek anında takım içi iletişim kanallarını yeniden yapılandırdı ve asenkron Daily Scrum disiplinini Slack'e taşıdı. Melih'in Python/LangChain ile geliştirdiği izole yapay zeka modülü, Utku'nun bilgisayarlı görü (CV) çıktıları ve Bedirhan'ın frontend mimarisi arasındaki çapraz fonksiyonel (cross-functional) bağımlılıkları yönetti. Şafak'ın entegrasyon sürecinde karşılaştığı blokajları çözerek, ekibin kaynaklarını doğru yönlendirdi ve ilk sprint bitmeden uçtan uca çalışan kararlı bir MVP prototipinin (Increment) başarıyla ortaya çıkmasını sağlayan süreç mimarı oldu.

### 3. Sprint Board SS
<img width="1913" height="768" alt="Ekran görüntüsü 2026-07-05 185910" src="https://github.com/user-attachments/assets/3b67356b-4115-4dc2-87a1-184879d81d99" />
<img width="1911" height="870" alt="Ekran görüntüsü 2026-07-05 185926" src="https://github.com/user-attachments/assets/ddf10e3a-d2b5-4169-8975-8558672ed75d" />

### 4. Ürün Durumu SS (Product Increment)

<img width="1902" height="777" alt="Ekran görüntüsü 2026-07-01 230127" src="https://github.com/user-attachments/assets/fe6245e0-dde1-48cc-9ea0-d1077ebf65b6" />
<img width="1912" height="782" alt="Ekran görüntüsü 2026-07-01 230146" src="https://github.com/user-attachments/assets/80ed766b-754f-4025-bb34-548354b17b14" />

<img width="672" height="651" alt="Ekran görüntüsü 2026-07-05 174211" src="https://github.com/user-attachments/assets/a1719903-4f43-4202-8f35-36de400c1e51" />

<img width="1297" height="642" alt="Ekran görüntüsü 2026-07-05 174244" src="https://github.com/user-attachments/assets/a6190e84-70f2-4de8-9d55-04d0d93f1b7a" />
<img width="1287" height="635" alt="Ekran görüntüsü 2026-07-05 174311" src="https://github.com/user-attachments/assets/03b9f622-7388-48a2-850a-151d8bed873d" />
<img width="710" height="637" alt="Ekran görüntüsü 2026-07-05 174334" src="https://github.com/user-attachments/assets/c5b62379-60fd-4282-bdf0-3b3e1df89ce4" />


### 5. Sprint Review (Sprint Değerlendirmesi)
* **Ne Hedeflendi?** İlk sprint için temel hedefimiz; projenin vizyonunu netleştirmek, tamamen TypeScript tabanlı ortak bir kod tabanı oluşturmak ve modüllerin (LLM, Görsel, Ses, Web) bağımsız prototiplerini üretmekti.
* **Ne Elde Edildi?** Hedeflerimizin üzerine çıkıldı! Bağımsız modüller üretilmekle kalınmadı; takım içi güçlü entegrasyon sayesinde **JavaScript Web Audio/Speech API + Groq Llama 3.3** kombinasyonu kullanılarak %100 ücretsiz, sıfır maliyetli ve ultra düşük gecikmeli bir ses/metin analizi altyapısı kuruldu. Frontend ve backend katmanları birleştirilerek **uçtan uca çalışan, sesli tepki verebilen ilk BlindHire MVP demosu** başarıyla ayağa kaldırıldı.

### 6. Sprint Retrospective (Sprint Özeleştirisi)
* **Neleri İyi Yaptık)**
    * Görev dağılımını uzmanlık alanlarımıza göre (Melih-LLM Senaryoları, Şafak-Ses/Entegrasyon, Utku-Görsel, Bedirhan-Web) çok net ayırdık ve herkes kendi modülünü başarıyla ayağa kaldırdı.
    * Harici ses API'lerinin maliyet/zaman bariyerini Web Audio API ve Groq/Llama 3.3 kullanarak çok zekice ve hızlı bir mimariyle aştık.
    * İlk sprint bitmeden uçtan uca konuşabilen, veri analiz edebilen canlı bir demo üretmeyi başardık.
* **Neleri Geliştirmeliyiz? **
    * Takım üyelerinin yerelde tamamladığı kod bloklarını ana repoya pushlama ve birleştirme (merge) zamanlamalarını biraz daha erkene çekmeliyiz.
    * Bootcamp mentorlarımızın geri bildirimlerini dikkate alarak, sonraki sprintte Slack kanallarındaki anlık durum güncellemelerini ve asenkron Daily paylaşımlarını daha sıkı bir disipline oturtmalıyız.
 
## Sprint 2

### 1. Backlog Düzeni ve Story Seçimleri (Sprint Backlog)

Sprint 2 planlama toplantısında, BlindHire platformunun prototip aşamasından çıkıp endüstriyel standartlarda bir yapay zeka ürününe evrilmesi hedeflenmiştir. Takım, otonom karar mekanizmaları, gelişmiş bilgisayarlı görü algoritmaları ve gerçek zamanlı senkronizasyon yetenekleri üzerinde yoğunlaşarak Trello üzerinde şu iş kalemlerini önceliklendirmiştir:

* **Story 1 (Epic: Computer Vision / Gelişmiş Görsel Analiz & Backend Entegrasyonu):** Bir yapay zeka geliştiricisi olarak, kamera tabanlı odak analizi modelinin doğruluğunu artırmak, adayın ekrana bakıp bakmadığını ve anlık göz hareketlerini (eye-tracking navigation) daha hassas algılayacak algoritmaları optimize etmek ve bu analiz çıktılarını backend katmanına yapılandırılmış veri (Structured JSON Logs) olarak aktarmak istiyorum. (Status: Done | Developer: Utku)
* **Story 2 (Epic: Conversational AI / Bilgi Tabanlı RAG & Söz Kesme Mimarisi):** Bir yapay zeka geliştiricisi olarak, LLM motorunun otonom karar verme ve objektif puanlama yeteneklerini artırmak için RAG (Retrieval-Augmented Generation) mimarisine geçiş yapmak, ajanın halüsinasyon (uydurma soru/cevap) üretmesini engellemek ve adayın konuşmayı kesmesi (interrupt) durumunda ajanın doğal, akıcı tepkiler verebileceği ses uyumlu altyapıyı Python/LangChain ile kurmak istiyorum. (Status: Done | Developer: Melih)
* **Story 3 (Epic: Ses ve Görü Senkronizasyonu & Lip-Sync Optimizasyonu):** Bir sistem mimarı ve entegratör olarak, adayın konuşma akışı ile yapay zeka ajanının sesli yanıtları arasındaki ağ gecikmelerini (latency) minimize edecek senkronizasyon düzenlemelerini yapmak ve ajan yanıt verirken yapay zekanın görsel bileşenleri ile ses çıktısını eş zamanlı yürüten dudak senkronizasyonu (Lip-sync) matematiksel motorunu entegre etmek istiyorum. (Status: Done | Developer/Product Owner: Şafak)
* **Story 4 (Epic: Web UI / Gelişmiş İK ve Aday Panelleri & Entegrasyon):** Bir frontend geliştiricisi olarak, mülakat bitiminde üretilen otonom Değerlendirme Skor Kartı (CV Scoring) ekranını zengin görsel bileşenlerle frontend arayüzüne taşımak, adaylara otomatik mülakat davetiyesi ve İK ekiplerine sonuç bildirim raporları ileten e-posta entegrasyonu (Mail Integration) altyapısını kurmak birtakım kullanıcı deneyimi iyileştirmeleri yapmak istiyorum. (Status: Done | Developer: Bedirhan)
* **Story 5 (Epic: Süreç Çevikliği, Blokaj Kaldırma & Çapraz Fonksiyonel Risk Yönetimi):** Bir Scrum Master olarak, Sprint 1 aksiyon planına sadık kalarak takımı yönlendirmek, Trello panosundaki yeni mimari iş paketlerinin bağımlılıklarını (Melih'in RAG veri setleri ile Utku'nun backend log mekanizması) haritalandırmak, takımın anlık koordine olduğu WhatsApp kanalı ile dokümantasyon takibinin yapıldığı Slack kanalları arasındaki asenkron iletişim akışını ve Daily Scrum disiplinini sağlamak; modüllerin birleştirilmesi esnasında ortaya çıkan entegrasyon krizlerini proaktif olarak çözmek istiyorum. (Status: Done | Scrum Master: Simge)

---

### 2. Daily Scrum (Günlük Toplantı Özetleri)
<img width="1917" height="952" alt="Ekran görüntüsü 2026-07-17 212603" src="https://github.com/user-attachments/assets/f826097f-b081-4aa3-8af1-7549ed6524fa" />

Sprint 2 boyunca iletişim kanalları en yüksek verimlilikte kullanılmış, operasyonel olarak ağırlıklı tercih edilen WhatsApp grupları ile resmi dökümantasyon kanalı olan Slack senkronize bir şekilde işletilmiştir. Kritik aşamalardaki teknik durum özetleri şu şekildedir:

* **Bedirhan (Web UI & Entegrasyon):** Yapay zeka ajanının ürettiği karmaşık metrikleri içeren "CV Scoring" (Aday Değerlendirme Karnesi) ekranını kullanıcı dostu, dinamik grafiklerle frontend arayüzünde inşa etti. Aday mülakat döngüsünün tetiklenmesi ve İK bilgilendirmeleri için e-posta servis şablonlarını (Mail Integration) sisteme başarıyla gömdü.
* **Utku (Görsel Analiz):** Göz algılama ve ekrana odaklanma (attention tracking) modelinin doğruluk oranını (accuracy) geometrik yüz haritalandırma teknikleriyle en üst seviyeye çıkardı. Adayın ekrandan uzaklaştığı veya odağını kaybettiği anları yakalayan modeli optimize ederek, bu verileri Şafak'ın entegrasyon katmanına besleyecek gerçek zamanlı backend veri çıktısını (Structured JSON output) başarıyla hazırladı.
* **Melih (LLM/AI & RAG Mimarisi):** Teknik mülakatların objektif değerlendirilmesi adına LangChain üzerinde RAG (Retrieval-Augmented Generation) mimarisini kurdu; böylece LLM ajanının önceden belirlenmiş teknik veri setlerine ve bilgi tabanına %100 bağlı kalarak uydurma cevaplar vermesini engelledi. Ayrıca ses modülüyle tam uyumlu çalışan, aday araya girdiğinde veya söz kestiğinde (interrupt) ajanın konuşmayı doğal bir şekilde durdurup adayı dinlemesini sağlayan otonom karar mekanizmasını Python altyapısında tamamladı.
* **Şafak (Ses & Entegrasyon):** Utku'nun geliştirdiği gelişmiş görsel analiz logları ile Melih'in bilgi tabanlı RAG motorunu ana entegrasyon hattında birleştirdi. Ajanın ses yanıt hızıyla eş zamanlı çalışan matematiksel dudak senkronizasyonu (Lip-sync) motorunu entegre ederek tarayıcı tabanlı yapay zeka avatarının tamamen doğal görünmesini sağladı; veri iletimindeki senkronizasyon kaymalarını sıfıra indirdi.
* **Simge (Scrum Master):** Takımın operasyonel olarak ağırlıklı kullandığı WhatsApp grupları ile resmi dökümantasyon kanalı olan Slack üzerindeki bilgi akışını senkronize ederek anlık iletişim kopukluklarını engelledi. Melih'in RAG mimarisine geçerken ihtiyaç duyduğu teknik veri kümesi entegrasyonu ile Şafak'ın dudak senkronizasyonu geliştirirken yaşadığı tarayıcı tabanlı gecikme (latency) krizlerinde araya girerek blokajları (blockers) çözdü. Çapraz fonksiyonel (cross-functional) ekiplerin kod birleştirme (merge) takvimini optimize ederek, kritik teslim öncesinde tüm teknik riskleri bertaraf etti ve sprint hedeflerine tam zamanında ulaşılmasını sağlayan stratejik lider oldu.

---

### 3. Sprint Board SS
<img width="1597" height="817" alt="Ekran görüntüsü 2026-07-19 174255" src="https://github.com/user-attachments/assets/48ecc86e-3e77-414a-a163-4285c4d98096" />
<img width="1911" height="790" alt="Ekran görüntüsü 2026-07-19 173941" src="https://github.com/user-attachments/assets/384d1c21-2a33-41da-8e63-e46c06b5e861" />


### 4. Ürün Durumu SS (Product Increment)
<img width="882" height="520" alt="Ekran görüntüsü 2026-07-19 174919" src="https://github.com/user-attachments/assets/419cb0c1-5bf2-4e2e-9856-1c29fc8ab02b" />

<img width="1477" height="939" alt="WhatsApp Image 2026-07-08 at 15 43 07" src="https://github.com/user-attachments/assets/437ff917-6bbb-4e70-ac53-b14695229911" />

<img width="447" height="549" alt="WhatsApp Image 2026-07-18 at 00 03 14" src="https://github.com/user-attachments/assets/641997fc-51c9-4da0-a689-fff249eea494" />

<img width="1567" height="891" alt="WhatsApp Image 2026-07-19 at 17 29 26" src="https://github.com/user-attachments/assets/e795ac78-ffeb-4bf7-92a4-6d712ab5af99" />

### 5. Sprint Review (Sprint Değerlendirmesi)

* **Ne Hedeflendi?** İkinci sprint için temel hedefimiz; yapay zeka ajanımızın uydurma cevaplar vermesini engelleyecek bir bilgi tabanı (RAG) kurmak, göz takibi modelinin kararlılığını artırarak backend bağlantısını kurmak, mülakat sonu karnesini görselleştirmek ve ajanın ses-dudak senkronizasyonunu kusursuzlaştırmaktı.
* **Ne Elde Edildi?** Planlanan tüm hedeflere eksiksiz ulaşıldı! BlindHire artık sadece konuşan bir yapay zeka değil; RAG mimarisi sayesinde kurumsal veri setlerine göre mülakat yapan, adayın sözünü kesmesini algılayabilen, dudak senkronizasyonuna sahip ve mülakat sonunda İK'ya otomatik mail ile detaylı karne sunabilen tam donanımlı bir B2B SaaS platformu haline geldi.

---

### 6. Sprint Retrospective (Sprint Özeleştirisi)

* **Neleri İyi Yaptık?**
  * Ağırlıklı olarak WhatsApp üzerinden yürüttüğümüz hızlı anlık mesajlaşma dinamizmini, Slack'teki resmi takiplere başarıyla yansıttık; böylece çift kanallı iletişimi verimli kullandık.
  * Modüller arası bağımlılıkları (RAG, CV Backend Logları, Lip-Sync) çok doğru analiz ederek entegrasyon sürecini son güne bırakmadan kademeli olarak tamamladık.
  * Platforma RAG ve otonom söz kesme yönetimi gibi ileri düzey AI yetenekleri ekleyerek projenin teknik değerini katladık.
* **Neleri Geliştirmeliyiz?**
  * RAG mimarisi için teknik veri setlerini hazırlarken harcadığımız zamanı optimize etmek adına sonraki aşamalarda veri toplama süreçlerini otomatikleştirmeliyiz.
  * Çoklu yapay zeka modelleri (CV + RAG LLM + Audio API) aynı anda çalıştığı için tarayıcı üzerindeki yükü hafifletecek performans optimizasyonlarına odaklanmalıyız.

* **Aksiyon Planı (Sprint 3 Hedefleri):**
  * **Yerel Optimizasyon ve Refactoring:** Birden fazla ağır modelin (Göz takibi, RAG motoru ve ses API'leri) yerel makinede (local environment) çalışırken yarattığı tarayıcı yükünü hafifletmek adına performans ve bellek optimizasyonlarını gerçekleştirmek.
  * **Yapay Zeka Çeşitliliği (DEI):** Mülakat değerlendirmelerinde yapay zekanın tarafsızlığını (bias check) ölçen algoritmaları devreye almak.
  * **Kullanıcı Testleri:** Yerelde hazırlanan bu kararlı ve bütünleşik yapıyı gerçek beta kullanıcılarıyla test ederek platformun ilk gerçek mülakat deneyimi raporlarını toplamak.
