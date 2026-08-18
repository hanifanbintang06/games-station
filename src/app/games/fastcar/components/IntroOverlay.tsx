'use client'

import React, { useState, useEffect } from 'react'
import { useProgress } from '@react-three/drei'
import { useRouter } from 'next/navigation' // Impor useRouter

const BACKGROUND_IMAGES = [
  '/games/game-icon/fastcar-banner2.png',
  '/games/game-icon/fastcar-banner3.png',
  '/games/game-icon/fastcar-banner4.png',
]

interface IntroOverlayProps {
  onStart: () => void
}

type SplashPhase = 'author' | 'gap' | 'title' | 'loading' | 'ready' | 'hidden'

export function IntroOverlay({ onStart }: IntroOverlayProps) {
  const [phase, setPhase] = useState<SplashPhase>('author')
  const [imgIndex, setImgIndex] = useState(0)
  const router = useRouter() // Inisialisasi router
  
  const { progress } = useProgress()

  useEffect(() => {
  if (phase === 'author') {
    const t = setTimeout(() => setPhase('gap'), 2000) // GANTI: dari langsung ke 'title', sekarang ke 'gap' dulu
    return () => clearTimeout(t)
  } else if (phase === 'gap') {
    // TAMBAHAN: fase jeda kosong 1 detik, tanpa teks apa pun ditampilkan
    const t = setTimeout(() => setPhase('title'), 1000)
    return () => clearTimeout(t)
  } else if (phase === 'title') {
    const t = setTimeout(() => setPhase('loading'), 4000)
    return () => clearTimeout(t)
  }
}, [phase])

  useEffect(() => {
    if (phase === 'loading' && progress >= 100) {
      const t = setTimeout(() => setPhase('ready'), 500)
      return () => clearTimeout(t)
    }
  }, [phase, progress])

  // Manajer Transisi Latar Belakang
  useEffect(() => {
    if (phase === 'loading' || phase === 'ready') {
      const interval = setInterval(() => {
        setImgIndex((prev) => (prev + 1) % BACKGROUND_IMAGES.length)
      }, 10000)
      return () => clearInterval(interval)
    }
  }, [phase])

  // PEMANTAU GAMEPAD (Mendukung Tombol B untuk Mulai & Tombol A untuk Kembali)
  useEffect(() => {
    let animationFrameId: number;
    let lastCheck = 0;

    const checkGamepadButton = (time: number) => {
  if (time - lastCheck > 100) {
    const gamepads = navigator.getGamepads();
    const pad = gamepads[0];

    if (pad) {
      if (pad.buttons[0] && pad.buttons[0].value > 0.5) {
        router.back();
        return;   // <-- BUG: return di sini, TANPA manggil requestAnimationFrame lagi
      }

      if (phase === 'ready' && pad.buttons[1] && pad.buttons[1].value > 0.5) {
        setPhase('hidden');
        onStart();
        return;   // <-- ini juga sama, tapi biasanya "selamat" karena phase berubah, effect di-re-run
      }
    }
    lastCheck = time;
  }

  animationFrameId = requestAnimationFrame(checkGamepadButton);  // <-- baris ini KELEWAT kalau kena return di atas
};

    animationFrameId = requestAnimationFrame(checkGamepadButton);

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [phase, onStart, router]);

  if (phase === 'hidden') return null;

  const handleScreenClick = () => {
    if (phase === 'ready') {
      setPhase('hidden')
      onStart()
    }
  }

  return (
    <div 
      onClick={handleScreenClick}
      className={`absolute inset-0 z-[9998] bg-[var(--background)] overflow-hidden flex flex-col items-center justify-center font-sans ${phase === 'ready' ? 'cursor-pointer' : ''}`}
    >
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes panImageRightToLeft {
          0% { transform: scale(1.1) translateX(5%); }
          100% { transform: scale(1.1) translateX(-5%); }
        }
        .animate-pan-rtl {
          animation: panImageRightToLeft 15s linear infinite alternate;
        }
      `}} />

      {(phase === 'loading' || phase === 'ready') && (
        <div className="absolute inset-0 z-0 pointer-events-none">
            <img 
            key={BACKGROUND_IMAGES[imgIndex]}
            src={BACKGROUND_IMAGES[imgIndex]} 
            alt="Background" 
            className="w-full h-full object-cover animate-pan-rtl transition-opacity duration-1000" 
            />
        </div>
        )}

      <div className="relative z-10 flex flex-col items-center justify-center w-full h-full pointer-events-none">
        
        <div className={`absolute transition-opacity duration-1000 ${phase === 'author' ? 'opacity-100' : 'opacity-0'}`}>
          <p className="text-[var(--foreground)]/60 tracking-[0.4em] text-xs uppercase text-center mb-3">Created By</p>
          <h2 className="text-[var(--foreground)] tracking-widest text-2xl font-light uppercase">hanifanbin</h2>
        </div>

        <div className={`absolute transition-opacity duration-1000 ${phase === 'title' ? 'opacity-100' : 'opacity-0'}`}>
          <h1 className="text-[var(--foreground)] text-6xl font-bold tracking-[0.4em] font-mono">FASTCAR</h1>
        </div>

        <div className={`absolute bottom-24 w-3/4 max-w-md flex flex-col items-center transition-opacity duration-1000 ${(phase === 'loading' || phase === 'ready') ? 'opacity-100' : 'opacity-0'}`}>
          <div className={`w-full transition-opacity duration-700 ${phase === 'ready' ? 'opacity-0' : 'opacity-100'}`}>
            <div className="h-[2px] w-full bg-white/20 overflow-hidden">
              <div className="h-full bg-white transition-all duration-300 ease-out" style={{ width: `${progress}%` }} />
            </div>
            <p className="text-white/80 text-[10px] tracking-[0.3em] mt-6 text-center uppercase">
              Memuat Aset Sirkuit — {Math.round(progress)}%
            </p>
          </div>

          <div 
            className={`absolute bottom-0 text-white font-medium tracking-[0.3em] uppercase text-xs transition-all duration-500 ${phase === 'ready' ? 'opacity-100 translate-y-0 animate-pulse' : 'opacity-0 translate-y-4'}`}
          >
            Mulai Game
          </div>
        </div>
      </div>
    </div>
  )
}