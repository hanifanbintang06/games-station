'use client'

import React, { useEffect, useRef } from 'react'

const MAP_BOUNDS = {
  minX: -910,
  maxX: 920,
  minZ: -140,
  maxZ: 1290,
}

const UI_BOUNDS = {
  minX: 0,
  maxX: 100,
  minZ: 0,
  maxZ: 100,
}

export function Minimap() {
  const dotRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleTelemetry = (event: CustomEvent) => {
      if (!dotRef.current) return

      const { x, z, heading } = event.detail

      // Normalisasi posisi dunia (0-1) berdasarkan batas track asli
      const normX = (x - MAP_BOUNDS.minX) / (MAP_BOUNDS.maxX - MAP_BOUNDS.minX)
      const normZ = (z - MAP_BOUNDS.minZ) / (MAP_BOUNDS.maxZ - MAP_BOUNDS.minZ)

      // Petakan ke persentase UI
      let percentX = UI_BOUNDS.minX + normX * (UI_BOUNDS.maxX - UI_BOUNDS.minX)
      let percentZ = UI_BOUNDS.minZ + normZ * (UI_BOUNDS.maxZ - UI_BOUNDS.minZ)

      percentX = Math.max(-10, Math.min(110, percentX))
      percentZ = Math.max(-10, Math.min(110, percentZ))

      dotRef.current.style.left = `${percentX}%`
      dotRef.current.style.top = `${percentZ}%`

      // ROTATION_OFFSET: cara nyari angka yang benar (bukan tebak):
      // 1. Set ROTATION_OFFSET = 0 dulu.
      // 2. Diamkan mobil menghadap SATU arah yang kamu tahu pasti (misal lurus ke arah start/finish).
      // 3. Lihat ke mana panah di minimap mengarah SAAT ITU.
      // 4. Hitung selisih derajat antara arah panah sekarang vs arah yang seharusnya,
      //    itulah angka ROTATION_OFFSET yang benar (boleh negatif).
      const ROTATION_OFFSET = 90
      dotRef.current.style.transform = `translate(-50%, -50%) rotate(${-heading + ROTATION_OFFSET}deg)`
    }

    window.addEventListener('update-telemetry', handleTelemetry as EventListener)
    return () => {
      window.removeEventListener('update-telemetry', handleTelemetry as EventListener)
    }
  }, [])

  return (
    <div className="absolute bottom-8 left-8 w-72 h-56 bg-black/40 z-50">
      <div className="relative w-full h-full p-2">
        <img 
          src="/games/fast-car/models/maps/sirkuit1-landwhite.svg" 
          alt="Track Route" 
          className="w-full h-full object-fill opacity-50 pointer-events-none"
        />
        <div 
          ref={dotRef}
          className="absolute w-3 bg-white h-3 rounded-full border-2 border-black/60"
        />
      </div>
    </div>
  )
}