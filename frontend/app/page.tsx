"use client";

import Link from "next/link";
import { useEffect, useState, useRef } from "react";
import { motion } from "framer-motion";
import { ArrowRight, Shield, Brain, Zap } from "lucide-react";
import { AppLogo } from "@/components/AppLogo";

export default function Home() {
  const [isAuth, setIsAuth] = useState(false);
  const [showEasterEgg, setShowEasterEgg] = useState(false);
  const [typedText, setTypedText] = useState("");
  const [clickCount, setClickCount] = useState(0);
  const [isFallen, setIsFallen] = useState(false);
  const [isRed, setIsRed] = useState(false);
  const [userName, setUserName] = useState("");
  const [showButtons, setShowButtons] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [showHeart, setShowHeart] = useState(false);
  
  const logoRef = useRef<HTMLDivElement>(null);
  const typingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const bubbleTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const saveState = (count: number, red: boolean) => {
    localStorage.setItem("blindhire_egg_state", JSON.stringify({ count, red }));
  };

  const typeMessage = (messages: string[], keepBubble: boolean, onComplete?: () => void) => {
    let msgIndex = 0;
    let charIndex = 0;
    let currentMsg = messages[msgIndex];
    setIsTyping(true);
    setShowEasterEgg(true);

    const typeNextChar = () => {
      if (charIndex < currentMsg.length) {
        setTypedText(currentMsg.slice(0, charIndex + 1));
        charIndex++;
      } else {
        if (typingIntervalRef.current) clearInterval(typingIntervalRef.current);
        bubbleTimeoutRef.current = setTimeout(() => {
          msgIndex++;
          if (msgIndex < messages.length) {
            currentMsg = messages[msgIndex];
            charIndex = 0;
            setTypedText("");
            typingIntervalRef.current = setInterval(typeNextChar, 50);
          } else {
            bubbleTimeoutRef.current = setTimeout(() => {
              setIsTyping(false);
              if (onComplete) onComplete();
              if (!keepBubble) {
                setShowEasterEgg(false);
                setTypedText("");
              }
            }, 800);
          }
        }, 600);
      }
    };

    if (typingIntervalRef.current) clearInterval(typingIntervalRef.current);
    typingIntervalRef.current = setInterval(typeNextChar, 50);
  };

  const triggerEasterEgg = (isAuto = false) => {
    if (isFallen || isTyping || showButtons) return;

    if (typingIntervalRef.current) clearInterval(typingIntervalRef.current);
    if (bubbleTimeoutRef.current) clearTimeout(bubbleTimeoutRef.current);

    if (isRed) {
      setTypedText("");
      typeMessage(
        ["Biraz dinleniyordum...", "Ama seninle çalışmak her zaman keyifli.", "Kaldığımız yerden yetenekleri keşfetmeye devam edelim mi?"],
        true,
        () => setShowButtons(true)
      );
      return;
    }

    if (!isAuto && clickCount === 4) {
      setIsRed(true);
      setClickCount(5);
      saveState(5, true);
      setShowEasterEgg(false);
      return;
    }

    if (!isAuto && clickCount >= 5 && !isAuth) {
      setIsFallen(true);
      return;
    }

    setTypedText("");
    
    let messages: string[];
    
    if (isAuto) {
      messages = [
        `Merhaba, ${userName}!`,
        "Seni tekrar buralarda görmek harika.",
        "Özgeçmişin ve mülakatların için ben hep buradayım!"
      ];
    } else {
      const stage0 = userName ? [
        `Selam, ${userName}!`,
        "Başvurularını analiz etmek için sabırsızlanıyorum.",
        "Bugün yeteneklerini sergilemek için harika bir gün!"
      ] : [
        "Merhaba, hoş geldin!",
        "Ben BlindHire.",
        "Umarım günün çok güzel geçiyordur!"
      ];

      const stage1 = userName ? [
        "Yine karşılaştık!",
        "Profilindeki yetenekler gerçekten etkileyici.",
        "Mülakatlarında bol şans!"
      ] : [
        "Tekrar merhaba!",
        "Seni yeniden görmek güzel.",
        "Yardımcı olabileceğim bir şey var mı?"
      ];

      const stage2 = userName ? [
        "Sürekli ilgilenmen ne güzel!",
        "Ama biliyor musun, biraz yoruldum.",
        "Beraber kısa bir mola verelim mi?"
      ] : [
        "Eee... biz az önce selamlaşmamış mıydık?",
        "Sanırım biraz dalgınsın.",
        "Neyse, hoş geldin tekrardan!"
      ];

      const stage3 = userName ? [
        `Biraz dinlenmeye ihtiyacım var ${userName}.`,
        "Enerjimi toplayıp senin için çalışmaya devam edeceğim.",
        "Şimdilik gözlerimi dinlendiriyorum..."
      ] : [
        "Lütfen...",
        "Beni meşgul etme. :(",
        "Çalışmam gereken mülakatlar var."
      ];

      const stages = [stage0, stage1, stage2, stage3];
      messages = stages[clickCount < 4 ? clickCount : 3];
    }
    
    typeMessage(messages, false, () => {
      if (!isAuto) {
        const nextCount = clickCount + 1;
        setClickCount(nextCount);
        saveState(nextCount, isRed);
      } else {
        setClickCount(1);
        saveState(1, isRed);
      }
    });
  };

  const handleYes = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowButtons(false);
    setShowHeart(true);
    typeMessage([":)"], false, () => {
      setIsRed(false);
      setClickCount(0);
      saveState(0, false);
      setTimeout(() => setShowHeart(false), 1500);
    });
  };

  const handleNo = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowButtons(false);
    typeMessage([":("], false);
  };

  useEffect(() => {
    const cookies = document.cookie.split(";");
    const hasAuthToken = cookies.some(c => c.trim().startsWith("auth_token="));
    const hasHrToken = cookies.some(c => c.trim().startsWith("hr_auth_token="));
    setIsAuth(hasAuthToken || hasHrToken);

    const nameCookie = cookies.find(c => c.trim().startsWith("user_name="));
    let fetchedName = "";
    if (nameCookie) {
      fetchedName = decodeURIComponent(nameCookie.split("=")[1]).split(" ")[0];
      setUserName(fetchedName);
    }

    const savedState = localStorage.getItem("blindhire_egg_state");
    if (savedState) {
      try {
        const { count, red } = JSON.parse(savedState);
        setClickCount(count || 0);
        setIsRed(red || false);
      } catch (e) {}
    }

    if ((hasAuthToken || hasHrToken) && fetchedName && !sessionStorage.getItem("welcomed")) {
      sessionStorage.setItem("welcomed", "true");
      setTimeout(() => {
        // Use functional state setter or wait until state is settled? 
        // We'll just call it right away. The state variables might be empty in the initial closure,
        // so `triggerEasterEgg(true)` might use empty `userName`.
      }, 500);
    }
  }, []);

  // For the initial auto trigger to have the correct userName
  useEffect(() => {
    if (isAuth && userName && !sessionStorage.getItem("welcomed_auto")) {
      sessionStorage.setItem("welcomed_auto", "true");
      setTimeout(() => {
        triggerEasterEgg(true);
      }, 500);
    }
  }, [isAuth, userName]);

  useEffect(() => {
    // Sohbetin boşluğa tıklanınca kapanmasını iptal ettik
  }, [showButtons, showEasterEgg]);
  return (
    <main className="relative flex flex-1 flex-col items-center justify-center overflow-hidden px-4 py-20">
      {/* ── Background Elements ── */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0">
        
        
        {/* Cyan accent — center */}
        <div className="absolute left-1/2 top-1/2 h-[300px] w-[300px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-theme-1/[0.04] blur-[80px]" />
        {/* Subtle grid overlay */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)",
            backgroundSize: "60px 60px",
          }}
        />
      </div>

      {/* ── Hero content ── */}
      <div className="relative z-10 mx-auto max-w-3xl text-center">
        {/* Large Central Frameless Logo */}
        <motion.div
          initial={{ opacity: 0, y: -20, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.7, ease: "easeOut" }}
          className="mx-auto flex justify-center mb-10 -mt-6"
        >
          <div 
            ref={logoRef}
            onClick={() => triggerEasterEgg(false)}
            className={`relative flex h-28 w-28 items-center justify-center select-none ${isFallen ? 'translate-y-[800px] rotate-[180deg] opacity-0 pointer-events-none transition-all duration-1000 ease-in' : ''} ${isTyping || showButtons ? 'cursor-default' : 'cursor-pointer group'}`}
            style={isRed ? { '--theme-c1': '#ef4444', '--theme-c2': '#dc2626' } as React.CSSProperties : undefined}
          >
            {/* Ambient Glow behind the logo */}
            <div className={`absolute inset-0 rounded-full blur-xl transition-all duration-500 group-hover:bg-theme-1/30 ${isRed ? 'bg-red-500/30' : 'bg-theme-1/10'}`} />
            <AppLogo className={`relative h-24 w-24 transition-transform duration-500 ${showEasterEgg && clickCount < 4 ? 'scale-125 rotate-12' : 'group-hover:scale-110'} ${isRed ? 'drop-shadow-[0_0_20px_rgba(239,68,68,0.8)]' : 'drop-shadow-[0_0_15px_var(--theme-c1)]'}`} />
            
            {showHeart && (
              <motion.div
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: [0, 1.5, 1], opacity: [0, 1, 0] }}
                transition={{ duration: 1.5, ease: "easeInOut" }}
                className="absolute -right-4 -top-6 text-4xl z-50 pointer-events-none"
              >
                ❤️
              </motion.div>
            )}

            {showEasterEgg && (
              <div className="absolute top-full mt-2 left-1/2 -translate-x-1/2 w-max min-w-[320px] z-50 flex flex-col items-center gap-4 cursor-default select-none pointer-events-none" style={{ color: isRed ? '#ef4444' : 'var(--theme-c1)' }}>
                <p className={`whitespace-nowrap font-bold text-center text-sm md:text-base tracking-wide ${isRed ? 'drop-shadow-[0_0_10px_rgba(239,68,68,0.8)]' : 'drop-shadow-[0_0_10px_var(--theme-c1)]'}`}>
                  {typedText}
                  {!showButtons && <span className="animate-pulse ml-0.5 opacity-70">|</span>}
                </p>
              </div>
            )}
            
            {showButtons && (
              <>
                <div className="absolute top-1/2 right-full mr-8 -translate-y-1/2 z-50">
                  <button onClick={handleNo} className="px-6 py-2 rounded-full bg-red-500/10 hover:bg-red-500/20 text-red-400 text-sm font-bold transition-all border border-red-500/20 hover:border-red-500/40 hover:scale-105 shadow-lg backdrop-blur-md">Hayır</button>
                </div>
                <div className="absolute top-1/2 left-full ml-8 -translate-y-1/2 z-50">
                  <button onClick={handleYes} className="px-6 py-2 rounded-full bg-green-500/10 hover:bg-green-500/20 text-green-400 text-sm font-bold transition-all border border-green-500/20 hover:border-green-500/40 hover:scale-105 shadow-lg backdrop-blur-md">Evet</button>
                </div>
              </>
            )}
          </div>
        </motion.div>

        {/* Title */}
        <motion.h1
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.1, ease: "easeOut" }}
          className="mb-6 text-4xl font-bold leading-tight tracking-tight text-foreground sm:text-5xl md:text-6xl select-none"
        >
          İşe Alımda{" "}
          <span className="bg-gradient-to-r from-theme-1 via-theme-2 to-theme-3 bg-clip-text text-transparent">
            Sıfır Önyargı
          </span>
          ,<br />
          Kusursuz Eşleşme.
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.25, ease: "easeOut" }}
          className="mx-auto mb-10 max-w-xl text-base leading-relaxed text-foreground/60 sm:text-lg select-none"
        >
          BlindHire ile tanışın. Sadece yeteneğe odaklanan, insan
          müdahalesiz, gerçek zamanlı AI mülakat ajanı.
        </motion.p>

        {/* CTA Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4, ease: "easeOut" }}
          className="flex flex-col items-center justify-center gap-4 sm:flex-row"
        >
          <Link
            href={isAuth ? "/dashboard" : "/login"}
            id="cta-candidate"
            className="group inline-flex items-center gap-2 rounded-xl bg-theme-1/10 px-7 py-3.5 text-sm font-semibold text-theme-1 shadow-[0_0_15px_var(--theme-c1)]/20 ring-1 ring-theme-1/30 transition-all duration-300 hover:bg-theme-1/20 hover:shadow-[0_0_20px_var(--theme-c1)]/40 hover:ring-theme-1/50 select-none"
          >
            {isAuth ? "Aday Paneline Git" : "Aday Girişi"}
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </motion.div>

        {/* Features grid */}
        {!isAuth && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.5, ease: "easeOut" }}
            className="mt-16 grid grid-cols-1 gap-4 sm:grid-cols-3"
          >
            {[
              {
                icon: Brain,
                title: "AI Destekli",
                desc: "Bağlamdan kopmayan mülakat",
              },
              {
                icon: Shield,
                title: "Önyargısız",
                desc: "100% liyakat odaklı",
              },
              {
                icon: Zap,
                title: "Gerçek Zamanlı",
                desc: "Anında analiz ve skorlama",
              },
            ].map((feature, idx) => (
              <div
                key={idx}
                className="group flex flex-col items-center rounded-2xl border border-foreground/10 bg-foreground/5 p-5 transition-all hover:bg-foreground/10"
              >
                <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-theme-2/10 text-theme-2 transition-transform group-hover:scale-110">
                  <feature.icon className="h-5 w-5" />
                </div>
                <h3 className="mb-1 text-sm font-semibold text-foreground/90">
                  {feature.title}
                </h3>
                <p className="text-xs text-foreground/60">{feature.desc}</p>
              </div>
            ))}
          </motion.div>
        )}
      </div>
    </main>
  );
}
