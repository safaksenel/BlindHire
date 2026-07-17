"""
BlindHire ASR Servisi — Groq Whisper Entegrasyonu

Groq API üzerinden whisper-large-v3-turbo modelini kullanarak
adayın ses kaydını metne çevirir (Speech-to-Text).

Kullanım:
    service = ASRService()
    transcript = await service.transcribe(audio_bytes, filename="recording.webm")
"""

import os
import asyncio
import tempfile
from pathlib import Path
from typing import Optional

from dotenv import load_dotenv
from groq import AsyncGroq

load_dotenv()


class ASRService:
    """
    Groq Whisper tabanlı Speech-to-Text servisi.
    
    Attributes:
        client: Groq async API istemcisi.
        model: Kullanılacak Whisper modeli.
    """

    DEFAULT_MODEL = "whisper-large-v3-turbo"

    def __init__(self, model: Optional[str] = None):
        api_key = os.getenv("GROQ_API_KEY")
        if not api_key:
            raise ValueError("GROQ_API_KEY environment variable is not set.")
        
        self.client = AsyncGroq(api_key=api_key)
        self.model = model or self.DEFAULT_MODEL

    async def transcribe(
        self,
        audio_bytes: bytes,
        filename: str = "recording.webm",
        language: str = "tr",
    ) -> str:
        """
        Ses verisini metne çevirir.

        Args:
            audio_bytes: Ham ses verisi (webm, wav, mp3, ogg formatlarında).
            filename: Dosya adı (uzantı formatı belirlemek için kullanılır).
            language: Transkript dili (varsayılan: Türkçe).

        Returns:
            str: Transkript metni.
        """
        if not audio_bytes or len(audio_bytes) < 100:
            raise ValueError("Geçersiz veya çok kısa ses verisi.")

        # Groq API dosya nesnesi olarak göndermek için geçici dosya oluştur
        suffix = Path(filename).suffix or ".webm"
        
        with tempfile.NamedTemporaryFile(suffix=suffix, delete=False) as tmp:
            tmp.write(audio_bytes)
            tmp_path = tmp.name

        try:
            with open(tmp_path, "rb") as audio_file:
                transcription = await self.client.audio.transcriptions.create(
                    file=(filename, audio_file.read()),
                    model=self.model,
                    language=language,
                    response_format="text",
                )

            # Groq text formatında döndüğünde string olarak gelir
            result = str(transcription).strip()
            return result

        finally:
            # Geçici dosyayı temizle
            try:
                os.unlink(tmp_path)
            except OSError:
                pass

    async def transcribe_file(
        self,
        file_path: str,
        language: str = "tr",
    ) -> str:
        """
        Bir ses dosyasını metne çevirir.

        Args:
            file_path: Ses dosyasının yolu.
            language: Transkript dili.

        Returns:
            str: Transkript metni.
        """
        path = Path(file_path)
        if not path.exists():
            raise FileNotFoundError(f"Ses dosyası bulunamadı: {file_path}")

        with open(path, "rb") as f:
            audio_bytes = f.read()

        return await self.transcribe(
            audio_bytes=audio_bytes,
            filename=path.name,
            language=language,
        )


# Modül doğrudan çalıştırıldığında basit test
if __name__ == "__main__":
    async def _test():
        service = ASRService()
        print(f"[TEST] ASR servisi başlatıldı (model: {service.model})")
        print("[TEST] Gerçek bir ses dosyası ile test etmek için:")
        print("  transcript = await service.transcribe_file('test.webm')")

    asyncio.run(_test())
