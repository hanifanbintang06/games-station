'use client'

import React, { useEffect, useRef, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Sky, Environment } from '@react-three/drei';
import { GameScene } from './components/GameScene';
import { Minimap } from './components/MiniMap';
import { FastLapController } from './components/FastLapController';
import { FastLapUI } from './components/FastLapUI';
import { Physics } from '@react-three/rapier';
import { useGameStore } from './hooks/useGameStore';
import { useFastLapStore } from './hooks/useFastLapStore';

export default function Game() {
  const { isPaused, setPaused, setGameState } = useGameStore();
  
  const [focusedPauseIndex, setFocusedPauseIndex] = useState(0);
  const focusedIndexRef = useRef(0);
  
  const setFocus = (index: number) => {
    setFocusedPauseIndex(index);
    focusedIndexRef.current = index;
  };
  
  const lastActionTime = useRef(0);
  const stickNeutral = useRef(true);
  const bButtonHeld = useRef(false);

  // --- PENAMBAHAN: STATUS HITUNG MUNDUR (COUNTDOWN) ---
  const [resumeCountdown, setResumeCountdownState] = useState<number | null>(null);
  const countdownRef = useRef<number | null>(null);
  
  const setResumeCountdown = (val: number | null) => {
    setResumeCountdownState(val);
    countdownRef.current = val;
  };

  // Fungsi Cerdas untuk Melanjutkan Game Berdasarkan Status Putaran
  const handleResume = () => {
    const fastLapStatus = useFastLapStore.getState().status;
    // Jika timer balapan sedang berjalan atau bersiap, beri aba-aba 3 detik
    if (fastLapStatus === 'ARMED' || fastLapStatus === 'HOT_LAP') {
      setResumeCountdown(3);
    } else {
      // Jika mode bebas atau sudah selesai, langsung lanjutkan
      setPaused(false);
    }
  };

  // --- MESIN EFEK HITUNG MUNDUR ---
  useEffect(() => {
    if (resumeCountdown === null) return;

    if (resumeCountdown > 0) {
      const timer = setTimeout(() => {
        setResumeCountdown(resumeCountdown - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (resumeCountdown === 0) {
      // Angka menyentuh 0, selesaikan hitung mundur dan cairkan (unpause) dunia fisika
      setResumeCountdown(null);
      setPaused(false);
    }
  }, [resumeCountdown, setPaused]);


  // --- MESIN PEMINDAI INPUT (KEYBOARD & GAMEPAD) ---
  useEffect(() => {
    
    // 1. PENDETEKSI KEYBOARD
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        const currentPauseState = useGameStore.getState().isPaused;
        const currentCountdown = countdownRef.current;

        if (!currentPauseState) {
          setPaused(true);
          setFocus(0);
          bButtonHeld.current = false;
        } else {
          // Jika ditekan saat hitung mundur, batalkan hitung mundur
          if (currentCountdown !== null) {
            setResumeCountdown(null);
          } else {
            handleResume();
          }
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);

    // 2. PENDETEKSI GAMEPAD
    let requestRef: number;
    const loop = () => {
      const pad = navigator.getGamepads()[0];
      
      if (pad) {
        const now = performance.now();
        const deadzone = 0.4;
        const currentPauseState = useGameStore.getState().isPaused;
        const currentCountdown = countdownRef.current;

        // Tombol Jeda (Joy11 atau Joy9)
        const isPauseButtonPressed = pad.buttons[11]?.value > 0.5 || pad.buttons[9]?.value > 0.5;

        if (isPauseButtonPressed && now - lastActionTime.current > 300) {
          if (!currentPauseState) {
            setPaused(true);
            setFocus(0); 
            bButtonHeld.current = false; 
          } else {
            if (currentCountdown !== null) {
              setResumeCountdown(null); // Batal hitung mundur jika ditekan
            } else {
              handleResume();
            }
          }
          lastActionTime.current = now;
        }

        // Navigasi Menu Jeda (Hanya berfungsi jika TIDAK sedang hitung mundur)
        if (currentPauseState && currentCountdown === null) {
          const axisY = pad.axes[1]; 

          if (Math.abs(axisY) > deadzone) {
            if (stickNeutral.current) {
              if (axisY > 0) setFocus(1);
              else if (axisY < 0) setFocus(0);
              stickNeutral.current = false;
            }
          } else {
            stickNeutral.current = true;
          }

          // Tombol B (Indeks 1) untuk OK
          const isBPressed = pad.buttons[1]?.value > 0.5;
          if (isBPressed) {
            bButtonHeld.current = true;
          } else if (!isBPressed && bButtonHeld.current) {
            bButtonHeld.current = false;
            const currentIndex = focusedIndexRef.current;
            
            if (currentIndex === 0) {
              handleResume(); // Diganti agar melewati filter logika resume
            } else if (currentIndex === 1) {
              setPaused(false);
              setGameState('MENU');
              useFastLapStore.getState().setStatus('EXPLORATION');
            }
            lastActionTime.current = now;
          }
        } else {
          // Kunci tombol agar tidak bocor saat hitung mundur atau saat game berjalan
          bButtonHeld.current = false; 
        }
      }

      requestRef = requestAnimationFrame(loop);
    };

    requestRef = requestAnimationFrame(loop);
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      cancelAnimationFrame(requestRef);
    };
  }, [setPaused, setGameState]); 

  return (
    <div style={{ width: '100vw', height: '100vh', background: '#000', overflow: 'hidden' }} className="relative">
      
      {/* Animasi Kustom untuk Angka Hitung Mundur */}
      <style>{`
        @keyframes popIn {
          0% { transform: scale(0.5); opacity: 0; }
          50% { transform: scale(1.2); }
          100% { transform: scale(1); opacity: 1; }
        }
        .animate-pop-in {
          animation: popIn 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
        }
      `}</style>

      {!isPaused && (
        <>
          <div className="absolute bottom-10 flex items-center right-10 z-50 flex items-baseline gap-4 pointer-events-none">
            <div className="flex items-center justify-center w-16 h-16 bg-white rounded">
               <span id="gear-text" className="text-4xl font-bold text-black font-mono">1</span>
            </div>
            <div className="flex items-baseline gap-1">
              <span id="speed-text" className="text-6xl font-bold tracking-tighter text-white font-mono">0</span>
              <span className="text-xl font-medium text-zinc-300 tracking-wide">km/h</span>
            </div>
          </div>
          <Minimap />
        </>
      )}
          
      <FastLapUI />

      {/* TAMPILAN MENU JEDA: Muncul jika isPaused true & Tidak Sedang Hitung Mundur */}
      {isPaused && resumeCountdown === null && (
        <div className="absolute inset-0 z-[999] flex items-center justify-center bg-black/40 backdrop-blur-md">
          <div className="flex flex-col items-center gap-8 p-12 border border-white/10 bg-black/60 shadow-2xl min-w-[400px]">
             
             <h2 className="text-4xl font-bold tracking-[0.3em] uppercase text-white mb-4">DIJEDA</h2>
             
             <div className="flex flex-col gap-4 w-full">
                <button 
                  onMouseEnter={() => setFocus(0)}
                  onClick={() => handleResume()} // Diganti agar memanggil fungsi filter
                  className={`w-full py-4 text-sm font-bold tracking-widest uppercase border transition-colors outline-none cursor-pointer ${
                    focusedPauseIndex === 0 
                      ? 'bg-white text-black border-white' 
                      : 'text-white border-white/20 hover:bg-white/10'
                  }`}
                >
                  Lanjutkan
                </button>

                <button 
                  onMouseEnter={() => setFocus(1)}
                  onClick={() => {
                    setPaused(false);
                    setGameState('MENU');
                    useFastLapStore.getState().setStatus('EXPLORATION');
                  }}
                  className={`w-full py-4 text-sm font-bold tracking-widest uppercase border transition-colors outline-none cursor-pointer mt-4 ${
                    focusedPauseIndex === 1 
                      ? 'bg-red-500 text-white border-red-500' 
                      : 'text-red-500 border-transparent hover:bg-red-500/10'
                  }`}
                >
                  Kembali ke Menu
                </button>
             </div>

             <div className="mt-8 flex items-center gap-4 text-xs font-bold text-gray-500 tracking-widest uppercase">
               <span>[KIRI ATAS/BAWAH] Navigasi</span>
               <span className="text-white ml-2">[B] Pilih</span>
             </div>

          </div>
        </div>
      )}

      {/* TAMPILAN HITUNG MUNDUR: Muncul jika resumeCountdown aktif */}
      {isPaused && resumeCountdown !== null && resumeCountdown > 0 && (
        // Menghapus bg-black/40 dan backdrop-blur-md agar background game terlihat jelas
        <div className="absolute inset-0 z-[1000] flex flex-col items-center justify-center">
           
           {/* Menambahkan bayangan (drop-shadow) agar teks tetap terbaca meski berlatar langit terang */}
           <span className="text-white text-sm font-bold tracking-[0.3em] uppercase mb-4 drop-shadow-[0_4px_4px_rgba(0,0,0,0.8)]">
              Bersiap...
           </span>
           
           <span key={resumeCountdown} className="text-9xl font-bold text-white font-mono animate-pop-in drop-shadow-[0_0_40px_rgba(0,0,0,1)]">
              {resumeCountdown}
           </span>
           
           <span className="text-white/90 text-xs mt-12 tracking-widest uppercase drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)]">
              [ESC] / [START] Batal
           </span>
           
        </div>
      )}

      <Canvas 
        shadows={false} 
        dpr={[1, 1.5]} 
        camera={{ position: [-300, 5, 1210], fov: 45 }}
      >
        <ambientLight intensity={0.5} />
        <directionalLight position={[10, 10, 5]} intensity={1} />
        <Sky distance={450000} sunPosition={[2000, 400, 1200]} turbidity={1} rayleigh={0.5} mieCoefficient={0.001} mieDirectionalG={100} />
        <Environment preset="city" />
        <OrbitControls makeDefault />

        <Physics paused={isPaused}>
          <FastLapController />
          <GameScene />
        </Physics>
      </Canvas>
      
    </div>
  );
}