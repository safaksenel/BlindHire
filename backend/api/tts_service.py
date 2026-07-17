"""
BlindHire TTS Servisi — edge-tts Entegrasyonu

Microsoft Edge'in ücretsiz TTS altyapısını kullanarak metni sese çevirir.
Türkçe erkek (AhmetNeural) ve kadın (EmelNeural) ses desteği sunar.
Hash bazlı önbellekleme ile aynı cümleyi tekrar sentezlemekten kaçınır.

Kullanım:
    service = TTSService()
    audio_path = await service.synthesize("Merhaba, mülakata hoş geldiniz.", voice="male")
"""

import os
import hashlib
import asyncio
from pathlib import Path
from typing import Optional, Literal

import edge_tts

# Ses seçenekleri
VOICE_MAP = {
    "male": "tr-TR-AhmetNeural",
    "female": "tr-TR-EmelNeural",
}

# Cache dizini
CACHE_DIR = Path(__file__).parent / "static" / "cache" / "tts"


class TTSService:
    """
    edge-tts tabanlı Text-to-Speech servisi.
    
    Attributes:
        cache_dir: TTS MP3 dosyalarının önbellek dizini.
    """

    def __init__(self, cache_dir: Optional[Path] = None):
        self.cache_dir = cache_dir or CACHE_DIR
        self.cache_dir.mkdir(parents=True, exist_ok=True)

    def _get_cache_key(self, text: str, voice: str) -> str:
        """Metin ve ses kombinasyonu için benzersiz hash üretir."""
        content = f"{voice}:{text}"
        return hashlib.md5(content.encode("utf-8")).hexdigest()

    def _get_cache_path(self, cache_key: str) -> Path:
        """Hash anahtarından dosya yolunu döner."""
        return self.cache_dir / f"{cache_key}.mp3"

    async def synthesize(
        self,
        text: str,
        voice: Literal["male", "female"] = "male",
        rate: str = "+0%",
        pitch: str = "+0Hz",
    ) -> str:
        """
        Metni MP3 ses dosyasına çevirir.

        Args:
            text: Sentezlenecek metin.
            voice: Ses tipi — "male" veya "female".
            rate: Konuşma hızı (ör: "+10%", "-5%").
            pitch: Ses tonu (ör: "+2Hz", "-1Hz").

        Returns:
            str: Üretilen MP3 dosyasının mutlak yolu.
        """
        if not text or not text.strip():
            raise ValueError("TTS için boş metin gönderilemez.")

        voice_name = VOICE_MAP.get(voice, VOICE_MAP["male"])
        cache_key = self._get_cache_key(text.strip(), voice_name)
        cache_path = self._get_cache_path(cache_key)

        # Önbellekte varsa doğrudan dön
        if cache_path.exists() and cache_path.stat().st_size > 0:
            return str(cache_path)

        # edge-tts ile sentezle
        communicate = edge_tts.Communicate(
            text=text.strip(),
            voice=voice_name,
            rate=rate,
            pitch=pitch,
        )

        await communicate.save(str(cache_path))

        if not cache_path.exists() or cache_path.stat().st_size == 0:
            raise RuntimeError(f"TTS sentezi başarısız oldu: {cache_path}")

        return str(cache_path)

    async def synthesize_batch(
        self,
        sentences: list[str],
        voice: Literal["male", "female"] = "male",
    ) -> list[str]:
        """
        Birden fazla cümleyi paralel olarak sentezler.

        Args:
            sentences: Sentezlenecek cümle listesi.
            voice: Ses tipi.

        Returns:
            list[str]: Üretilen MP3 dosya yollarının listesi.
        """
        tasks = [self.synthesize(s, voice=voice) for s in sentences if s.strip()]
        return await asyncio.gather(*tasks)

    def get_relative_url(self, absolute_path: str) -> str:
        """
        Mutlak dosya yolunu frontend'in erişebileceği göreceli URL'ye çevirir.
        
        Args:
            absolute_path: MP3 dosyasının mutlak yolu.
            
        Returns:
            str: /static/cache/tts/xxx.mp3 formatında URL.
        """
        path = Path(absolute_path)
        static_root = Path(__file__).parent / "static"
        try:
            relative = path.relative_to(static_root)
            return f"/static/{relative.as_posix()}"
        except ValueError:
            return f"/static/cache/tts/{path.name}"


# Modül doğrudan çalıştırıldığında basit test
if __name__ == "__main__":
    async def _test():
        service = TTSService()
        print("[TEST] Erkek ses ile sentezleniyor...")
        path_m = await service.synthesize("Merhaba, BlindHire teknik mülakat sistemine hoş geldiniz.", voice="male")
        print(f"  Erkek: {path_m}")
        
        print("[TEST] Kadın ses ile sentezleniyor...")
        path_f = await service.synthesize("Merhaba, BlindHire teknik mülakat sistemine hoş geldiniz.", voice="female")
        print(f"  Kadın: {path_f}")
        
        print("[TEST] Tamamlandı.")

    asyncio.run(_test())
