'use client'

import React, { useEffect, useRef, useState } from 'react'
import { useFastLapStore } from '../hooks/useFastLapStore'
import { useGameStore } from '../hooks/useGameStore'

const formatTime = (ms: number) => {
  if (ms === Infinity || ms === 0) return '00:00:000'
  const minutes = Math.floor(ms / 60000)
  const seconds = Math.floor((ms % 60000) / 1000)
  const milliseconds = Math.floor(ms % 1000)
  return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}:${milliseconds.toString().padStart(3, '0')}`
}

export function FastLapUI() {
  const { status, startTime, split1Time, split2Time, lastLapTime, bestLapTime, setStatus } = useFastLapStore()
  const timerRef = useRef<HTMLDivElement>(null)
  const requestRef = useRef<number>(0)

  const [sectorLabel, setSectorLabel] = useState('Sector 1')
  const [showingSplitResult, setShowingSplitResult] = useState(false)
  const sectorTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const prevSplit1 = useRef(0)
  const prevSplit2 = useRef(0)

  // TAMBAHAN: akumulasi elapsed berbasis DELTA PER-FRAME (bukan selisih timestamp global),
  // supaya timer benar-benar berhenti bertambah selama pause, terlepas berapa lama pause berlangsung.
  const elapsedRef = useRef(0)
  const lastFrameTimeRef = useRef<number | null>(null)

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Enter' && (status === 'EXPLORATION' || status === 'FINISHED')) {
        setStatus('ARMED')
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [status, setStatus])

  // TAMBAHAN: reset akumulasi elapsed tiap kali lap baru mulai (status masuk ARMED)
  useEffect(() => {
    if (status === 'ARMED') {
      elapsedRef.current = 0
      lastFrameTimeRef.current = null
    }
  }, [status])

  useEffect(() => {
    const updateTimer = (frameTime: number) => {
      if (status === 'HOT_LAP' && timerRef.current) {
        // TAMBAHAN: rAF timestamp dipakai sebagai basis delta per-frame,
        // bukan performance.now() manual — ini "waktu game", nambah cuma kalau frame ini benar2 diproses
        if (lastFrameTimeRef.current === null) {
          lastFrameTimeRef.current = frameTime
        }
        const delta = frameTime - lastFrameTimeRef.current
        lastFrameTimeRef.current = frameTime

        const isPaused = useGameStore.getState().isPaused
        if (!isPaused) {
          // GANTI: elapsed cuma bertambah kalau TIDAK pause. Selama pause, delta diabaikan sepenuhnya.
          elapsedRef.current += delta
          timerRef.current.innerText = formatTime(elapsedRef.current)
        }
        // kalau isPaused true: tidak menambah elapsedRef, tidak update innerText -> timer beku di angka terakhir
      } else {
        lastFrameTimeRef.current = null
      }
      requestRef.current = requestAnimationFrame(updateTimer)
    }

    if (status === 'HOT_LAP') {
      requestRef.current = requestAnimationFrame(updateTimer)
    } else if (timerRef.current) {
      if (status === 'ARMED') timerRef.current.innerText = '00:00:000'
      if (status === 'FINISHED') timerRef.current.innerText = formatTime(lastLapTime)
    }

    return () => cancelAnimationFrame(requestRef.current)
  }, [status, lastLapTime])

  useEffect(() => {
    if (status === 'ARMED') {
    if (sectorTimeoutRef.current) clearTimeout(sectorTimeoutRef.current)
    setSectorLabel('Sector 1')
    setShowingSplitResult(false)
    // GANTI: reset ke nilai split saat ini di store, bukan 0,
    // supaya efek split1Time/split2Time nggak salah kira "ada split baru" dari sisa lap sebelumnya
    prevSplit1.current = split1Time
    prevSplit2.current = split2Time
  }
}, [status, split1Time, split2Time])

  useEffect(() => {
    if (status !== 'HOT_LAP') return
    if (split1Time > 0 && split1Time !== prevSplit1.current) {
      prevSplit1.current = split1Time
      setSectorLabel(`Sector 1: ${formatTime(split1Time - startTime)}`)
      setShowingSplitResult(true) // TAMBAHAN: aktifkan style ijo
      if (sectorTimeoutRef.current) clearTimeout(sectorTimeoutRef.current)
      sectorTimeoutRef.current = setTimeout(() => {
        setSectorLabel('Sector 2')
        setShowingSplitResult(false) // TAMBAHAN: balik ke style normal
      }, 5000)
    }
  }, [split1Time, status, startTime])
 
  useEffect(() => {
  if (status !== 'HOT_LAP') return
  if (split2Time > 0 && split2Time !== prevSplit2.current) {
    prevSplit2.current = split2Time
    setSectorLabel(`Sector 2: ${formatTime(split2Time - startTime)}`) // GANTI: dari split1Time jadi startTime
    setShowingSplitResult(true)
    if (sectorTimeoutRef.current) clearTimeout(sectorTimeoutRef.current)
    sectorTimeoutRef.current = setTimeout(() => {
      setSectorLabel('Sector 3')
      setShowingSplitResult(false)
    }, 5000)
  }
}, [split2Time, status, startTime])

  useEffect(() => {
    if (status === 'FINISHED') {
      if (sectorTimeoutRef.current) clearTimeout(sectorTimeoutRef.current)
      setSectorLabel(`Your Time: ${formatTime(lastLapTime)}`)
      setShowingSplitResult(true) // TAMBAHAN: "Your Time" juga tampil dengan style ijo, permanen
    }
  }, [status, lastLapTime])

  useEffect(() => {
    return () => {
      if (sectorTimeoutRef.current) clearTimeout(sectorTimeoutRef.current)
    }
  }, [])

  return (
    <div className="absolute inset-0 pointer-events-none z-40">
      
      {(status === 'EXPLORATION' || status === 'FINISHED') && (
        <div className="absolute top-1/2 -translate-y-1/2 flex items-center gap-3 right-10 bg-white px-4 py-3">
            <div className="flex gap-2">
              <span className="bg-black text-white px-2 py-1 text-xs font-bold">F</span>
              <span className="text-black text-xs py-1">atau</span>
              <span className="bg-red-600 text-white px-2 py-1 text-xs font-bold rounded-full">B</span>
            </div>
            <span className="text-black text-xs tracking-wider">Tekan untuk bersiaga</span>
          </div>
      )}

      {(status === 'ARMED' || status === 'HOT_LAP') && (
        <div className="absolute top-8 left-1/2 -translate-x-1/2 flex flex-col items-center">
          <span className="text-white text-[10px] tracking-[0.3em] uppercase mb-1">
            {status === 'ARMED' ? 'Menunggu Garis Start' : 'Putaran Berjalan'}
          </span>
          <div 
            ref={timerRef}
            className={`font-mono text-4xl font-bold bg-black/50 backdrop-blur-sm px-6 py-2 border border-white/20 shadow-[0_0_15px_rgba(255,255,255,0.1)] ${status === 'HOT_LAP' ? 'text-white' : 'text-gray-500'}`}
          >
            00:00:000
          </div>
          {/* GANTI: style sekarang sama seperti timer utama (font-mono text-4xl dst), 
              plus transisi warna: ijo+teks putih saat menampilkan hasil split, 
              hitam transparan+teks putih saat menampilkan "Sector X" biasa */}
          <div 
            className={`mt-2 font-mono text-xs font-bold px-6 py-2 border shadow-[0_0_15px_rgba(255,255,255,0.1)] transition-colors duration-300 ${
              showingSplitResult 
                ? 'bg-green-500 text-white border-green-400' 
                : 'bg-white text-black border-white/20'
            }`}
          >
            {sectorLabel}
          </div>
        </div>
      )}

      {status === 'FINISHED' && (
        <div className="absolute top-16 left-1/2 -translate-x-1/2 bg-black/80 backdrop-blur-md border border-white/30 p-8 flex flex-col items-center">
          <h2 className="text-white text-sm font-bold tracking-[0.2em] uppercase mb-4 text-center">Putaran Selesai</h2>
          <div className="font-mono text-5xl font-bold text-white mb-6">
            {formatTime(lastLapTime)}
          </div>
          <div className="w-full h-px bg-white/20 mb-4" />
          <p className="text-gray-400 text-xs tracking-widest uppercase">Mempersiapkan sensor untuk putaran berikutnya...</p>
        </div>
      )}
      
    </div>
  )
}