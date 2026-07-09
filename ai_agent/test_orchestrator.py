import time
import json
from orchestrator import InterviewOrchestrator, InterviewState

def simulate_interview():
    print("=" * 60)
    print("BLINDHIRE OTONOM MÜLAKAT AJANI SIMÜLASYONU BAŞLIYOR")
    print("=" * 60)

    try:
        # Orkestratörü başlat
        orchestrator = InterviewOrchestrator()
    except Exception as e:
        print(f"Orkestratör başlatılırken hata oluştu: {e}")
        return

    # Aday cevaplarının simülasyonu
    candidate_responses = [
        "",  # Mülakatı başlatır
        "Merhaba, hazırım, başlayabiliriz.",
        "Yaklaşık 4 yıldır backend ve veri mühendisliği yapıyorum. Python, FastAPI, PostgreSQL ve LangChain ile yapay zeka entegrasyonları üzerinde çalıştım.",
        "Python'daki decorator'lar, sarmaladıkları fonksiyonların kodunu değiştirmeden onlara yeni özellikler eklememizi sağlar. @ işareti ile kullanılırlar.",
        "Mikroservisler arası iletişimde genellikle REST API veya asenkron kuyruk sistemleri kullanırız. Veritabanı ölçeklemesi için okuma yükünü azaltmak amacıyla read replikalar ve Redis önbellekleme kullanırım.",
        "Öncelikle cProfile ve memory_profiler gibi araçlarla kodun hangi kısmında bellek sızıntısı veya gecikme olduğunu tespit ederim. Sorgu optimizasyonu yapar ve gerekiyorsa verileri asenkron işlerim.",
        "Hayır, bir sorum yok. Her şey çok netti. Teşekkürler."
    ]

    for i, response in enumerate(candidate_responses):
        print(f"\n[AŞAMA]: {orchestrator.current_state.value}")
        
        # Eğer bu aşama için bir soru seçilmişse (process_input öncesinde veya sonrasında) debug bilgisini yazdır
        # current_state process_input çağrısı sonrasında bir sonraki duruma geçeceği için, process_input öncesinde kontrol ediyoruz.
        if orchestrator.current_state in orchestrator.selected_questions:
            q_info = orchestrator.selected_questions[orchestrator.current_state]
            print(f"[DEBUG - RAG]: Secilen Soru: {q_info['id']} ({q_info['category']})")

        if response:
            print(f"Aday: {response}")
        else:
            print("Aday: <Mülakatı Başlat>")
        
        # Süreyi ölç
        start_time = time.time()
        ai_reply = orchestrator.process_input(response)
        duration = time.time() - start_time
        
        print(f"BlindHire ({duration:.2f}sn): {ai_reply}")
        print("-" * 50)
        
        # Rate limit engellemek için kısa bir gecikme ekle
        time.sleep(2.0)

    print("\n[DEBUG] Mülakat Geçmişi Mesajları:")
    for idx, msg in enumerate(orchestrator.chat_history):
        print(f"  {idx}: {type(msg).__name__} -> {repr(msg.content[:50])}")
        
    print("\n[AŞAMA]: Değerlendirme & Skor Kartı Üretimi")
    # Groq'un ücretsiz katmanındaki 6000 TPM limitinin sıfırlanması için 16 saniye bekliyoruz
    print("Groq API rate limit (TPM) penceresinin sıfırlanması için 16 saniye bekleniyor...")
    time.sleep(16.0)
    start_time = time.time()
    scorecard = orchestrator.generate_scorecard()
    duration = time.time() - start_time
    print(f"Değerlendirme Süresi: {duration:.2f}sn")
    
    print("\n[ÜRETİLEN SKOR KARTI]:")
    print(json.dumps(scorecard, indent=2, ensure_ascii=False))
    print("=" * 60)

if __name__ == "__main__":
    simulate_interview()
