'use client'

import React, { useEffect, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { CuboidCollider, IntersectionEnterPayload, RigidBody } from '@react-three/rapier'
import { useFastLapStore } from '../hooks/useFastLapStore'
import { useGameStore } from '../hooks/useGameStore'

export function FastLapController() {
  const { status, setStatus } = useFastLapStore()

  // Referensi memori untuk mencatat waktu terakhir sensor valid terpicu
  const lastSensorTime = useRef(0)

  // --- DETEKSI INPUT: KEYBOARD 'F' ---
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (status !== 'EXPLORATION' && status !== 'FINISHED') return;
      
      if (e.key === 'f' || e.key === 'F') {
        setStatus('ARMED')
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [status, setStatus])

  // --- DETEKSI INPUT: GAMEPAD TOMBOL 'B' ---
  const lastBPressed = useRef(false)
  
  const prevPausedRef = useRef(false) // TAMBAHAN

useFrame(() => {
  const isPaused = useGameStore.getState().isPaused
  const pad = navigator.getGamepads()[0]
  const isBPressed = pad ? pad.buttons[1].value > 0.5 : false

  // TAMBAHAN: deteksi transisi paused -> unpaused, terlepas urutan loop lain
  const justUnpaused = prevPausedRef.current && !isPaused
  prevPausedRef.current = isPaused

  if (isPaused) {
    lastBPressed.current = isBPressed
    return;
  }

  if (justUnpaused) {
    // TAMBAHAN: "makan" input tombol B di frame transisi ini,
    // jangan biarkan penekanan yang dipakai buat unpause ikut ke-anggap sebagai ARMED
    lastBPressed.current = isBPressed
    return;
  }

  if (status !== 'EXPLORATION' && status !== 'FINISHED') return;

  if (isBPressed && !lastBPressed.current) {
    setStatus('ARMED')
  }
  lastBPressed.current = isBPressed
})

  // --- FUNGSI VALIDASI KEAMANAN (ANTI-JITTER & ANTI-PARKIR) ---
  const validateTrigger = (payload: IntersectionEnterPayload): boolean => {
    const now = performance.now()

    // 1. Lapis Pertama: Debounce Waktu (Cooldown 2 Detik)
    // Mencegah sensor terpicu berkali-kali dalam waktu singkat
    if (now - lastSensorTime.current < 2000) {
      return false
    }

    // 2. Lapis Kedua: Kecepatan Minimum Mobil
    const rb = payload.other.rigidBody
    if (rb) {
      const vel = rb.linvel()
      const speedKmh = Math.sqrt(vel.x ** 2 + vel.z ** 2) * 3.6
      
      // Jika mobil berhenti atau berjalan pelan di atas garis, abaikan.
      if (speedKmh < 10) {
        console.warn(`[Sensor] Diabaikan: Kecepatan terlalu rendah (${speedKmh.toFixed(1)} km/h)`)
        return false
      }
    }

    // Lolos semua validasi keamanan, izinkan sensor bekerja
    lastSensorTime.current = now
    return true
  }

  // --- LOGIKA SENSOR ---
const handleStartFinishLine = (payload: IntersectionEnterPayload) => {
  // Start/Finish selalu boleh dicek duluan (dia yang menentukan ARMED->HOT_LAP dan HOT_LAP->FINISHED)
  if (!validateTrigger(payload)) return;

  console.log("Sensor Start Tertabrak oleh:", payload.other.rigidBodyObject?.name)
  
  const state = useFastLapStore.getState()
  const now = performance.now()
  
  if (state.status === 'ARMED') {
    state.setStatus('HOT_LAP')
    state.setSector(1)
    state.recordStartTime(now)
  } else if (state.status === 'HOT_LAP' && state.currentSector === 3) {
    state.recordLap(now)
    state.setStatus('FINISHED')
  }
}

const handleSector1 = (payload: IntersectionEnterPayload) => {
  // TAMBAHAN: cek status/sector DULU, sebelum konsumsi cooldown lewat validateTrigger
  const preCheckState = useFastLapStore.getState()
  if (preCheckState.status !== 'HOT_LAP' || preCheckState.currentSector !== 1) return;

  if (!validateTrigger(payload)) return;

  console.log("Sektor 1 Tertabrak oleh:", payload.other.rigidBodyObject?.name)
  const state = useFastLapStore.getState()
  
  if (state.status === 'HOT_LAP' && state.currentSector === 1) {
    state.recordSplit1(performance.now())
    state.setSector(2)
  }
}

const handleSector2 = (payload: IntersectionEnterPayload) => {
  // TAMBAHAN: cek status/sector DULU, sebelum konsumsi cooldown lewat validateTrigger
  const preCheckState = useFastLapStore.getState()
  if (preCheckState.status !== 'HOT_LAP' || preCheckState.currentSector !== 2) return;

  if (!validateTrigger(payload)) return;

  console.log("Sektor 2 Tertabrak oleh:", payload.other.rigidBodyObject?.name)
  const state = useFastLapStore.getState()
  
  if (state.status === 'HOT_LAP' && state.currentSector === 2) {
    state.recordSplit2(performance.now())
    state.setSector(3)
  }
}

  return (
    <group>
      
      {/* 1. SENSOR START */}
      {/* PENTING: Position dan Rotation kini berada di RigidBody */}
      <RigidBody 
        type="fixed"
        position={[-380, 6.973, 1201]} 
        rotation={[0, 0.067, 0]}
      >
        <CuboidCollider 
          sensor 
          args={[10, 6, 30]} 
          onIntersectionEnter={(payload) => handleStartFinishLine(payload)} 
        />
      </RigidBody>
      
      {/* 2. SENSOR SEKTOR 1 */}
      <RigidBody 
        type="fixed"
        position={[-654.772, 6.973, 581.365]} 
        rotation={[0, 0.97, 0]}
      >
        <CuboidCollider 
          sensor 
          args={[10, 6, 40]} 
          onIntersectionEnter={(payload) => handleSector1(payload)} 
        />
      </RigidBody>
      
      {/* 3. SENSOR SEKTOR 2 */}
      <RigidBody 
        type="fixed"
        position={[498.339, 6.973, 250.215]} 
        rotation={[0, -0.117, 0]}   
      >
        <CuboidCollider 
          sensor 
          args={[10, 6, 30]}          
          onIntersectionEnter={(payload) => handleSector2(payload)} 
        />
      </RigidBody>

    </group>
  )
}