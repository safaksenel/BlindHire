"""
BlindHire Lip-Sync Servisi — gradio_client + SadTalker Entegrasyonu

HuggingFace Space üzerinde çalışan SadTalker modeline bağlanarak
statik avatar görseli + TTS ses dosyasından konuşan yüz videosu üretir.

Fallback: HF Space çökerse veya timeout olursa, None döner ve
ana pipeline audio-only moduna geçer (avatar statik kalır, ses çalınır).

Kullanım:
    service = LipSyncService()
    video_path = await service.generate("avatar_male.png", "audio.mp3")
"""

import os
import asyncio
import hashlib
import logging
import shutil
from pathlib import Path
from typing import Optional, Literal

logger = logging.getLogger(__name__)

# Cache dizini
CACHE_DIR = Path(__file__).parent / "static" / "cache" / "lipsync"

# Statik avatar dizini
AVATAR_DIR = Path(__file__).parent / "static"

# Wav2Lip HuggingFace Space
WAV2LIP_SPACE = "shaqq61/blindhire"

# Timeout (saniye) — HF Space yanıt süresi
HF_TIMEOUT = 120


class LipSyncService:
    """
    gradio_client tabanlı Lip-Sync video üretim servisi.
    
    Attributes:
        cache_dir: Üretilen MP4 videoların önbellek dizini.
        avatar_dir: Avatar görsellerinin bulunduğu dizin.
        space_name: HuggingFace Space adı.
    """

    def __init__(
        self,
        cache_dir: Optional[Path] = None,
        avatar_dir: Optional[Path] = None,
        space_name: str = WAV2LIP_SPACE,
    ):
        self.cache_dir = cache_dir or CACHE_DIR
        self.cache_dir.mkdir(parents=True, exist_ok=True)
        self.avatar_dir = avatar_dir or AVATAR_DIR
        self.space_name = space_name
        self._client = None

    def _get_client(self):
        """gradio_client'ı lazy-load ile başlatır."""
        if getattr(self, "_space_is_down", False):
            raise Exception(f"HuggingFace Space ({self.space_name}) is down. Skipping LipSync.")
            
        if self._client is None:
            try:
                from gradio_client import Client
                # Düşük bir timeout ile başlatmayı dene
                self._client = Client(self.space_name)
                logger.info(f"[LipSync] HuggingFace Space bağlantısı kuruldu: {self.space_name}")
            except Exception as e:
                self._space_is_down = True
                logger.error(f"[LipSync] HuggingFace Space bağlantısı kurulamadı: {e}. Audio-only moda geçiliyor.")
                raise
        return self._client

    def _get_avatar_path(self, gender: Literal["male", "female"] = "male") -> str:
        """Avatar görsel dosyasının yolunu döner."""
        filename = f"avatar_{gender}.png"
        path = self.avatar_dir / filename
        if not path.exists():
            raise FileNotFoundError(f"Avatar dosyası bulunamadı: {path}")
        return str(path)

    def _get_cache_key(self, avatar_path: str, audio_path: str) -> str:
        """Avatar ve ses kombinasyonu için benzersiz hash üretir."""
        avatar_hash = hashlib.md5(Path(avatar_path).name.encode()).hexdigest()[:8]
        audio_hash = hashlib.md5(Path(audio_path).name.encode()).hexdigest()
        return f"{avatar_hash}_{audio_hash}"

    def _get_cache_path(self, cache_key: str) -> Path:
        """Hash anahtarından video dosya yolunu döner."""
        return self.cache_dir / f"{cache_key}.mp4"

    async def generate(
        self,
        audio_path: str,
        gender: Literal["male", "female"] = "male",
    ) -> Optional[str]:
        """
        Avatar görseli ve ses dosyasından lip-sync video üretir.

        Args:
            audio_path: TTS ile üretilmiş MP3 ses dosyasının yolu.
            gender: Avatar cinsiyeti — "male" veya "female".

        Returns:
            Optional[str]: Üretilen MP4 dosyasının mutlak yolu.
            HF Space çökerse veya timeout olursa None döner.
        """
        try:
            avatar_path = self._get_avatar_path(gender)
        except FileNotFoundError as e:
            logger.warning(f"[LipSync] {e}")
            return None

        if not Path(audio_path).exists():
            logger.warning(f"[LipSync] Ses dosyası bulunamadı: {audio_path}")
            return None

        # Önbellekte varsa doğrudan dön
        cache_key = self._get_cache_key(avatar_path, audio_path)
        cache_path = self._get_cache_path(cache_key)
        if cache_path.exists() and cache_path.stat().st_size > 0:
            logger.info(f"[LipSync] Önbellekten yüklendi: {cache_path.name}")
            return str(cache_path)

        # HuggingFace Space'e gönder
        try:
            result_path = await asyncio.wait_for(
                self._call_wav2lip(avatar_path, audio_path),
                timeout=HF_TIMEOUT,
            )

            if result_path and Path(result_path).exists():
                # Sonucu cache dizinine kopyala
                shutil.copy2(result_path, str(cache_path))
                logger.info(f"[LipSync] Video üretildi: {cache_path.name}")
                return str(cache_path)
            else:
                logger.warning("[LipSync] Wav2Lip boş sonuç döndürdü.")
                return None

        except asyncio.TimeoutError:
            logger.warning(f"[LipSync] HF Space {HF_TIMEOUT}sn timeout — audio-only moda geçiliyor.")
            return None
        except Exception as e:
            logger.warning(f"[LipSync] HF Space hatası: {e} — audio-only moda geçiliyor.")
            return None

    async def _call_wav2lip(self, avatar_path: str, audio_path: str) -> Optional[str]:
        """
        Wav2Lip Space'e senkron çağrıyı asyncio thread'inde çalıştırır.

        Returns:
            Optional[str]: Üretilen video dosyasının geçici yolu.
        """
        def _sync_call():
            try:
                from gradio_client import handle_file
                client = self._get_client()
                result = client.predict(
                    video=handle_file(avatar_path),
                    audio=handle_file(audio_path),
                    checkpoint="wav2lip_gan",
                    no_smooth=False,
                    resize_factor=1,
                    pad_top=0,
                    pad_bottom=10,
                    pad_left=0,
                    pad_right=0,
                    api_name="/predict"
                )
                
                # Gradio returns generated video dict or path
                if isinstance(result, dict) and "video" in result:
                    return result["video"]
                elif isinstance(result, str):
                    return result
                elif isinstance(result, (list, tuple)) and len(result) > 0:
                    item = result[0]
                    if isinstance(item, dict) and "video" in item:
                        return item["video"]
                    return item
                return None
            except Exception as e:
                logger.error(f"[LipSync] Wav2Lip predict hatası: {e}")
                return None

        return await asyncio.get_event_loop().run_in_executor(None, _sync_call)

    def get_relative_url(self, absolute_path: str) -> str:
        """
        Mutlak dosya yolunu frontend'in erişebileceği göreceli URL'ye çevirir.
        """
        path = Path(absolute_path)
        static_root = Path(__file__).parent / "static"
        try:
            relative = path.relative_to(static_root)
            return f"/static/{relative.as_posix()}"
        except ValueError:
            return f"/static/cache/lipsync/{path.name}"


# Modül doğrudan çalıştırıldığında basit test
if __name__ == "__main__":
    async def _test():
        service = LipSyncService()
        print(f"[TEST] LipSync servisi başlatıldı (Space: {service.space_name})")
        print(f"[TEST] Avatar dizini: {service.avatar_dir}")
        print(f"[TEST] Cache dizini: {service.cache_dir}")
        
        # Avatar dosyalarını kontrol et
        for gender in ["male", "female"]:
            try:
                path = service._get_avatar_path(gender)
                print(f"  Avatar ({gender}): {path} ✓")
            except FileNotFoundError as e:
                print(f"  Avatar ({gender}): {e} ✗")

    asyncio.run(_test())
