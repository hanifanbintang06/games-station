'use client'

import React, { useState, useEffect, useRef } from 'react';
import MainMenu from './components/MainMenu';
import { IntroOverlay } from './components/IntroOverlay'; 
import GameLoader from '@/app/components/GameLoader/GameLoader';
import { useGameStore } from './hooks/useGameStore';
import Game from './Game';

export default function FastCarPage() {
  const { gameState, setGameState, musicVolume } = useGameStore();

  const [isLoaderActive, setIsLoaderActive] = useState(true);
  const [isIntroActive, setIsIntroActive] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoaderActive(false);
      setIsIntroActive(true);
    }, 4000);

    return () => clearTimeout(timer);
  }, []);

  // MESIN PENGENDALI AUDIO GLOBAL
  useEffect(() => {
    const bgm = audioRef.current;
    if (!bgm) return;

    // Terapkan volume secara dinamis dari Zustand
    bgm.volume = musicVolume;

    const playAudio = () => {
      if (gameState !== 'PLAYING') {
        bgm.play().catch((error) => {
          console.warn("Menunggu interaksi pengguna untuk memutar audio...");
        });
      }
    };

    // 1. Eksekusi Pemutaran dengan Jeda (Timeout)
    // Angka 1500 mewakili 1.5 detik. Silakan ubah angka ini untuk memperlama/mempercepat jeda.
    const audioTimer = setTimeout(() => {
      playAudio();
    }, 2200); 

    // 2. Fungsi Pembuka Kunci Interaksi
    const unlockAudio = () => {
      playAudio();
      document.removeEventListener('click', unlockAudio);
      document.removeEventListener('keydown', unlockAudio);
    };

    document.addEventListener('click', unlockAudio);
    document.addEventListener('keydown', unlockAudio);

    // 3. Logika Penghentian
    if (gameState === 'PLAYING') {
      bgm.pause();
    }

    // Fungsi pembersihan (cleanup) untuk mencegah kebocoran memori
    return () => {
      clearTimeout(audioTimer); // Hapus timer jika komponen dibongkar sebelum jeda selesai
      document.removeEventListener('click', unlockAudio);
      document.removeEventListener('keydown', unlockAudio);
    };
  }, [gameState]);

  const handleStartIntro = () => {
    setIsIntroActive(false);
    setGameState('MENU');
    
    // Pemutaran eksplisit tambahan untuk memastikan keamanan ganda
    if (audioRef.current) {
      audioRef.current.play().catch(console.error);
    }
  };

  return (
    <main className="relative w-screen h-screen overflow-hidden bg-black">
      
      <audio 
        ref={audioRef} 
        src="/games/fast-car/audio/Aventure - Coffee & Vinyl (freetouse.com).mp3" 
        loop 
        preload="auto"
      />

      {isLoaderActive && <GameLoader />}

      {isIntroActive && (
        <IntroOverlay onStart={handleStartIntro} />
      )}

      {!isLoaderActive && !isIntroActive && gameState === 'MENU' && (
        <MainMenu />
      )}

      {!isLoaderActive && !isIntroActive && gameState === 'PLAYING' && (
        <Game />
      )}

    </main>
  );
}