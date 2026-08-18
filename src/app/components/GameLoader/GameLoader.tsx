'use client'

import React from 'react'
import Image from 'next/image'

export default function GameLoader() {
  return (
    <div className="fixed inset-0 z-[9999] bg-[var(--background)] flex items-center justify-center animate-fade-screen">
      
      <style>{`
        /* 1. Animasi Transisi Layar Utama */
        @keyframes fadeScreen {
          0% { opacity: 0; }
          10% { opacity: 1; }
          100% { opacity: 1; } 
        }
        
        /* 2. Animasi Transisi Konten (Logo & Lingkaran) */
        @keyframes fadeContent {
          0% { opacity: 0; transform: scale(0.9); }
          15% { opacity: 1; transform: scale(1); }
          75% { opacity: 1; transform: scale(1); }
          90% { opacity: 0; transform: scale(1.1); }
          100% { opacity: 0; }
        }

        @keyframes drawCircleCCW {
          0% { stroke-dashoffset: 283; }
          100% { stroke-dashoffset: 0; }
        }

        .animate-fade-screen {
          animation: fadeScreen 4s cubic-bezier(0.4, 0, 0.2, 1) forwards;
        }

        .animate-fade-content {
          animation: fadeContent 4s cubic-bezier(0.4, 0, 0.2, 1) forwards;
        }

        .animate-draw-circle {
          animation: drawCircleCCW 1.5s cubic-bezier(0.1, 0.9, 0.2, 1) 0.2s forwards;
        }

        .neon-glow {
          filter: drop-shadow(0 0 8px rgba(34, 197, 94, 0.8)) drop-shadow(0 0 20px rgba(34, 197, 94, 0.4));
        }

        /* 
          PENYESUAIAN BAYANGAN LOGO DINAMIS:
          - Pada mode terang, bayangan menggunakan warna gelap dengan opasitas rendah (soft).
          - Pada mode gelap, bayangan otomatis menjadi pekat dan tegas berbasis hitam.
        */
        .dynamic-logo-shadow {
          box-shadow: 0 10px 40px rgba(0, 0, 0, 0.8);
        }

        @media (prefers-color-scheme: light) {
          .dynamic-logo-shadow {
            box-shadow: 0 10px 30px rgba(23, 23, 23, 0.15);
          }
        }
      `}</style>

      <div className="relative flex items-center justify-center w-64 h-64 animate-fade-content">
        <svg 
          className="absolute inset-0 w-full h-full -rotate-90 scale-y-[-1] neon-glow" 
          viewBox="0 0 100 100"
        >
          <circle cx="50" cy="50" r="45" fill="none" stroke="#22c55e" strokeWidth="3" strokeDasharray="283" strokeDashoffset="283" strokeLinecap="round" className="animate-draw-circle" />
        </svg>
        
        {/* Mengganti kelas shadow statis dengan kelas dinamis .dynamic-logo-shadow */}
        <div className="w-32 h-32 relative rounded-[20px] overflow-hidden dynamic-logo-shadow border border-white/10 bg-[#1A1D23]">
          <Image 
              src="/games/game-icon/fastcar-icon.png" 
              alt="Loading Game" 
              fill 
              className="object-cover" 
          />
        </div>
      </div>
    </div>
  )
}