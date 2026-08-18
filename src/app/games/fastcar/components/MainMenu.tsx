// src/app/games/fastcar/components/MainMenu.tsx
'use client'

import React, { useEffect, useRef, useState } from 'react'
import { useGameStore } from '../hooks/useGameStore'

export default function MainMenu() {
  const { setGameState, musicVolume, setMusicVolume } = useGameStore()
  
  const [activeTab, setActiveTab] = useState(0)
  
  const [activeSubTab, setActiveSubTab] = useState(0) 
  const [isEditingSetting, setIsEditingSetting] = useState(false) 

  const cardRefs = useRef<(HTMLDivElement | null)[]>([])
  const focusedCardIndex = useRef(0)
  
  const stickNeutral = useRef({ x: true, y: true })
  const lastActionTime = useRef(0)

  const setFocus = (index: number) => {
    const targetCard = cardRefs.current?.[index];
    if (targetCard) {
      targetCard.focus({ preventScroll: true });
      focusedCardIndex.current = index;
    }
  }

  useEffect(() => {
    setTimeout(() => setFocus(0), 100)
  }, [])

  useEffect(() => {
    let requestRef: number

    const loop = () => {
      const pad = navigator.getGamepads()[0]

      if (pad) {
        const now = performance.now()
        const deadzone = 0.4
        const axisX = pad.axes[0]

        // --- KONTROL TAB UTAMA (LB / RB) ---
        if (now - lastActionTime.current > 300 && !isEditingSetting) {
          if (pad.buttons[4].value > 0.5) { 
            setActiveTab((prev) => Math.max(0, prev - 1))
            lastActionTime.current = now
          }
          if (pad.buttons[5].value > 0.5) { 
            setActiveTab((prev) => Math.min(1, prev + 1))
            lastActionTime.current = now
          }
        }

        // --- TOMBOL AKSI [B] dan [A] ---
        if (now - lastActionTime.current > 200) {
          if (pad.buttons[1].value > 0.5) {
            if (activeTab === 0 && !isEditingSetting) {
              const activeEl = document.activeElement as HTMLElement
              if (activeEl && typeof activeEl.click === 'function') activeEl.click()
            } else if (activeTab === 1 && !isEditingSetting) {
              setIsEditingSetting(true)
            }
            lastActionTime.current = now
          }
          
          if (pad.buttons[0].value > 0.5) {
            if (activeTab === 1 && isEditingSetting) {
              setIsEditingSetting(false)
            }
            lastActionTime.current = now
          }
        }

        // --- KONTROL ARAH (ANALOG KIRI) ---
        if (Math.abs(axisX) > deadzone) {
          if (stickNeutral.current.x) {
            if (activeTab === 0) {
              if (axisX > 0 && focusedCardIndex.current < 1) {
                setFocus(focusedCardIndex.current + 1)
              } else if (axisX < 0 && focusedCardIndex.current > 0) {
                setFocus(focusedCardIndex.current - 1)
              }
            } 
            else if (activeTab === 1) {
              if (!isEditingSetting) {
                if (axisX > 0) setActiveSubTab((prev) => Math.min(2, prev + 1))
                if (axisX < 0) setActiveSubTab((prev) => Math.max(0, prev - 1))
              } else {
                if (activeSubTab === 0) {
                  if (axisX > 0) setMusicVolume(Math.min(1, musicVolume + 0.1))
                  if (axisX < 0) setMusicVolume(Math.max(0, musicVolume - 0.1))
                }
              }
            }
            stickNeutral.current.x = false
          }
        } else {
          stickNeutral.current.x = true
        }
      }

      requestRef = requestAnimationFrame(loop)
    }

    requestRef = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(requestRef)
  }, [activeTab, isEditingSetting, activeSubTab, musicVolume, setMusicVolume]) 

  // Fungsi Kalkulasi Volume via Klik Mouse
  const handleVolumeClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isEditingSetting) return; // Hanya berfungsi jika sedang dalam mode edit
    const rect = e.currentTarget.getBoundingClientRect();
    const clickPositionX = e.clientX - rect.left;
    const percentage = Math.max(0, Math.min(1, clickPositionX / rect.width));
    setMusicVolume(percentage);
    e.stopPropagation(); // Mencegah event klik menembus ke kontainer induk (yang akan mematikan mode edit)
  };

  return (
    <div className="absolute inset-0 z-50 flex flex-col text-white font-sans overflow-hidden">
       
       <div className="absolute inset-0 -z-10">
          <div className="absolute inset-0 bg-[url('/games/game-icon/fastcar-banner2.png')] bg-cover bg-center blur-lg scale-110" />
          <div className="absolute inset-0 bg-black/75" />
       </div>

       <nav className="relative z-10 w-full flex items-center px-12 py-8 border-b border-white/10">
          <h1 className="text-2xl font-bold tracking-[0.2em] uppercase">Fast Car</h1>
          
          <div className="absolute left-1/2 -translate-x-1/2 flex gap-8">
             {/* Penambahan onClick dan cursor-pointer pada Tab Utama */}
             <button 
                onClick={() => !isEditingSetting && setActiveTab(0)}
                className={`text-sm font-bold tracking-wider uppercase pb-1 border-b-2 transition-colors cursor-pointer ${activeTab === 0 ? 'text-blue-400 border-blue-400' : 'text-gray-500 border-transparent hover:text-gray-300'}`}
             >
                Mode Balap
             </button>
             <button 
                onClick={() => !isEditingSetting && setActiveTab(1)}
                className={`text-sm font-bold tracking-wider uppercase pb-1 border-b-2 transition-colors cursor-pointer ${activeTab === 1 ? 'text-blue-400 border-blue-400' : 'text-gray-500 border-transparent hover:text-gray-300'}`}
             >
                Pengaturan
             </button>
          </div>
          
          <div className="ml-auto hidden md:flex items-center gap-4 text-xs font-bold text-gray-500 tracking-widest uppercase">
            {isEditingSetting ? (
                <>
                    <span>[KIRI]/[KANAN] Ubah Nilai</span>
                    <span className="ml-2 text-white">[A] Selesai</span>
                </>
            ) : (
                <>
                    <span>[LB]/[RB] Tab</span>
                    <span className="ml-2 text-white">[B] Pilih</span>
                </>
            )}
          </div>
       </nav>

       <div className="relative z-10 flex-1 flex flex-col items-center justify-center p-12 gap-10">
          
          {activeTab === 0 ? (
            <div className="flex flex-row gap-8">
               <div
                  ref={(el) => { if (cardRefs.current) cardRefs.current[0] = el }}
                  onClick={() => setGameState('PLAYING')}
                  className="cursor-pointer group relative w-80 aspect-[3/4] rounded-none overflow-hidden bg-gray-900 border border-white/20 transition-all hover:scale-102 hover:border-blue-500 focus:ring-4 focus:ring-blue-500/50 outline-none"
                  tabIndex={0}
               >
                  <div className="absolute inset-0 bg-[url('/games/game-icon/fastcar-banner2.png')] bg-cover bg-center opacity-40 group-hover:opacity-100 group-focus:opacity-100 transition-opacity duration-500" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
                  <div className="absolute bottom-0 left-0 p-8 w-full">
                     <span className="px-3 py-1 text-[10px] font-bold bg-white text-black uppercase tracking-widest mb-4 inline-block">Solo</span>
                     <h3 className="text-2xl font-bold mb-2 tracking-wide">Time Attack</h3>
                     <p className="text-xs text-gray-400 leading-relaxed">Lawan waktu. Cetak rekor lap tercepatmu melintasi 3 sektor sirkuit utama.</p>
                  </div>
               </div>

               <div 
                  ref={(el) => { if (cardRefs.current) cardRefs.current[1] = el }}
                  className="relative w-80 aspect-[3/4] rounded-none overflow-hidden bg-[#0a0a0a] border border-white/5 opacity-50 cursor-not-allowed flex flex-col focus:ring-4 focus:ring-gray-700 outline-none transition-all"
                  tabIndex={0}
               >
                  <div className="flex-1 bg-neutral-900/50 flex items-center justify-center">
                      <span className="text-gray-600 text-sm tracking-widest uppercase font-bold">Segera Hadir</span>
                  </div>
                  <div className="p-8 border-t border-white/5">
                     <span className="px-3 py-1 text-[10px] font-bold bg-neutral-800 text-gray-500 uppercase tracking-widest mb-4 inline-block">Online</span>
                     <h3 className="text-2xl font-bold mb-2 text-gray-500 tracking-wide">Free Roam</h3>
                     <p className="text-xs text-gray-600 leading-relaxed">Jelajahi sirkuit bersama teman-temanmu secara bebas.</p>
                  </div>
               </div>
            </div>
          ) : (
            
            <div className="w-full max-w-3xl aspect-[3/4] flex flex-col gap-12">
               
               <div className="flex justify-center gap-12 border-b border-white/10 pb-4">
                   {/* Penambahan onClick dan cursor-pointer pada Sub-Menu Pengaturan */}
                   <h2 
                      onClick={() => !isEditingSetting && setActiveSubTab(0)}
                      className={`text-sm font-bold tracking-widest uppercase transition-colors cursor-pointer hover:text-white ${activeSubTab === 0 ? 'text-white' : 'text-gray-600'}`}
                   >
                      Volume
                   </h2>
                   <h2 
                      onClick={() => !isEditingSetting && setActiveSubTab(1)}
                      className={`text-sm font-bold tracking-widest uppercase transition-colors cursor-pointer hover:text-white ${activeSubTab === 1 ? 'text-white' : 'text-gray-600'}`}
                   >
                      Grafis
                   </h2>
                   <h2 
                      onClick={() => !isEditingSetting && setActiveSubTab(2)}
                      className={`text-sm font-bold tracking-widest uppercase transition-colors cursor-pointer hover:text-white ${activeSubTab === 2 ? 'text-white' : 'text-gray-600'}`}
                   >
                      Kontrol
                   </h2>
               </div>

               <div className="w-full flex flex-col items-center min-h-[200px]">
                   
                   {activeSubTab === 0 && (
                       // Penambahan onClick untuk mengaktifkan/menonaktifkan mode edit via Mouse
                       <div 
                          onClick={() => setIsEditingSetting(!isEditingSetting)}
                          className={`w-full p-8 border transition-all cursor-pointer ${isEditingSetting ? 'border-blue-500 bg-blue-900/10' : 'border-white/10 bg-black/50 hover:border-white/30'}`}
                       >
                           <div className="flex justify-between items-end mb-6">
                               <h3 className="text-xl font-bold tracking-wide uppercase">Musik Latar</h3>
                               <span className="text-lg font-mono font-bold text-blue-400">
                                   {Math.round(musicVolume * 100)}%
                               </span>
                           </div>
                           
                           {/* Penambahan handler interaksi klik persentase akurat pada indikator bar */}
                           <div 
                              className={`w-full h-2 flex overflow-hidden ${isEditingSetting ? 'bg-gray-700 cursor-crosshair' : 'bg-gray-800'}`}
                              onClick={handleVolumeClick}
                           >
                               <div 
                                   className="h-full bg-blue-500 transition-all duration-200 pointer-events-none" 
                                   style={{ width: `${musicVolume * 100}%` }}
                               />
                           </div>
                           
                           {isEditingSetting && (
                               <p className="text-xs text-blue-400/70 text-center mt-6 tracking-widest uppercase animate-pulse">
                                   Mengatur Volume... (Klik luar bar untuk selesai)
                               </p>
                           )}
                       </div>
                   )}

                   {activeSubTab !== 0 && (
                       <div className="flex h-full items-center justify-center opacity-50">
                           <p className="text-sm tracking-widest uppercase text-gray-500">Opsi ini belum tersedia</p>
                       </div>
                   )}
               </div>
            </div>
          )}

       </div>
    </div>
  )
}