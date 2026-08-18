'use client'

import * as THREE from 'three'
import React, { forwardRef, useRef } from 'react'
import { useGLTF } from '@react-three/drei'
import { GLTF } from 'three-stdlib'
import { ThreeElements, useFrame } from '@react-three/fiber'; // Import useFrame
import { RigidBody, RapierRigidBody, CuboidCollider, useRevoluteJoint, CapsuleCollider, useRapier } from '@react-three/rapier'
import { useControls } from '../hooks/useControls' // Sesuaikan path ini
import { Wheel } from './Wheel'

type GLTFResult = GLTF & {
nodes: {
Cube001: THREE.Mesh
Cube001_1: THREE.Mesh
Cube001_2: THREE.Mesh
Cube001_3: THREE.Mesh
}
materials: {
LiveryRedBull1: THREE.MeshStandardMaterial
LiveryRedBull2: THREE.MeshStandardMaterial
LiveryRedBull3: THREE.MeshStandardMaterial
LiveryRedBull4: THREE.MeshStandardMaterial
}
}

const WheelJoint = ({ carRef, position }: { carRef: any, position: [number, number, number] }) => {
  const wheelRef = useRef<RapierRigidBody>(null)
  
  // Format array wajib digunakan agar Rapier dapat memprosesnya tanpa error
  useRevoluteJoint(carRef as any, wheelRef as any, [
    position,       // anchorA: Jarak as roda dari titik pusat bodi mobil
    [0, 0, 0],      // anchorB: Titik pusat ban (geometri sudah di-center di Wheel.tsx)
    [0, 0, 1]       // axis: Sumbu putaran roda
  ])
  
  return (
    // Grup ini memposisikan RigidBody ban ke titik as roda saat pertama kali dirender
    <group position={position}>
      <Wheel ref={wheelRef} />
    </group>
  )
}

const GEAR_SPECS: Record<number, { maxSpeedKmH: number; force: number }> = {
  0: { maxSpeedKmH: 40, force: 30 },   // Mundur
  1: { maxSpeedKmH: 100, force: 100 }, // Torsi brutal, jarak napas pendek
  2: { maxSpeedKmH: 140, force: 90 },
  3: { maxSpeedKmH: 175, force: 75 },
  4: { maxSpeedKmH: 220, force: 60 },
  5: { maxSpeedKmH: 260, force: 50 },
  6: { maxSpeedKmH: 290, force: 45 },
  7: { maxSpeedKmH: 325, force: 40 },
  8: { maxSpeedKmH: 360, force: 35 },  // Overdrive
};

export const Car = forwardRef<RapierRigidBody, any>((props, ref) => {
const { nodes, materials } = useGLTF('/games/fast-car/models/cars/redbull-livery.glb') as unknown as GLTFResult
const controls = useControls()
const rb = ref as React.MutableRefObject<RapierRigidBody>

const displaySpeedUI = useRef(0);

// --- REFERENSI TRANSMISI ---
const currentGear = useRef(1); // Mulai dari gigi 1
const lastShiftTime = useRef(0);
const SHIFT_COOLDOWN = 250; // Jeda 250ms (0.25 detik) antar perpindahan gigi

useFrame((state, delta) => {
  if (!rb.current) return;

const posisi = rb.current.translation();
    const rotasiTelemetri = rb.current.rotation();
    const telemetryQuaternion = new THREE.Quaternion(rotasiTelemetri.x, rotasiTelemetri.y, rotasiTelemetri.z, rotasiTelemetri.w);
    const forwardVector = new THREE.Vector3(-1, 0, 0).applyQuaternion(telemetryQuaternion);
    const headingDegree = Math.atan2(forwardVector.z, forwardVector.x) * (180 / Math.PI);

    window.dispatchEvent(
      new CustomEvent('update-telemetry', { 
        detail: { x: posisi.x, z: posisi.z, heading: headingDegree } 
      })
    );

    // 1. PEMBACAAN GAMEPAD & KEYBOARD (FUSI INPUT)
    const gamepads = navigator.getGamepads();
    const pad = gamepads[0]; // Mengambil kontroler pertama yang terdeteksi

    // Inisialisasi nilai awal dari keyboard sebagai fallback
    let gasValue = controls.current.w ? 1 : 0;
    let brakeValue = controls.current.s ? 1 : 0; 
    let steerValue = 0;

    if (controls.current.a) steerValue = 1;
    if (controls.current.d) steerValue = -1;

    // Timpa nilai dengan Gamepad jika kontroler terhubung dan aktif
    if (pad) {
      const deadzone = 0.15; // Mencegah "drift" saat analog/trigger tidak ditekan

      // Gas (RT / Button 7)
      if (pad.buttons[7].value > deadzone) {
        gasValue = pad.buttons[7].value;
      }
      
      // Rem (LT / Button 6)
      if (pad.buttons[6].value > deadzone) {
        brakeValue = pad.buttons[6].value;
      }
      
      // Kemudi (Left Stick X-Axis / Axes 0)
      if (Math.abs(pad.axes[0]) > deadzone) {
        // Dikalikan -1 karena orientasi Y positif di Three.js berlawanan dengan arah sumbu analog
        steerValue = -pad.axes[0]; 
      }
    }

    // --- SISTEM TRANSMISI MANUAL ---
    const now = performance.now();
    const canShift = (now - lastShiftTime.current) > SHIFT_COOLDOWN;

    // Deteksi input dari kontroler (RB/LB) atau keyboard (E/Q)
    // Asumsi: controls.current.e dan controls.current.q sudah terdefinisi di useControls
    const shiftUpPressed = controls.current.e || (pad && pad.buttons[5].value > 0.5);
    const shiftDownPressed = controls.current.q || (pad && pad.buttons[4].value > 0.5);

    if (canShift) {
      if (shiftUpPressed && currentGear.current < 8) {
        currentGear.current += 1;
        lastShiftTime.current = now;
      } else if (shiftDownPressed && currentGear.current > 0) {
        currentGear.current -= 1;
        lastShiftTime.current = now;
      }
    }

    // Tarik profil fisika berdasarkan gigi yang sedang aktif
    const activeGearProfile = GEAR_SPECS[currentGear.current];

    const accelerationForce = activeGearProfile.force; 
    const maxSpeed = activeGearProfile.maxSpeedKmH / 3.6;

    // Kalkulasi Pelemahan Kemudi:
    // Semakin tinggi gigi, semakin berat kemudinya. 
    // Menggunakan batas minimum 0.5 agar mobil tetap bisa berbelok sedikit pada gigi 8.
    const baseTurnSpeed = 1.7;
    const steeringPenalty = currentGear.current > 0 ? (currentGear.current * 0.12) : 0;
    const turnSpeed = Math.max(0.5, baseTurnSpeed - steeringPenalty);
    
    const currentVel = rb.current.linvel();
    const currentAngvel = rb.current.angvel();
    
    // Menghitung kecepatan absolut mobil saat ini (dalam satuan m/s)
    const currentSpeed = Math.sqrt(currentVel.x ** 2 + currentVel.z ** 2);

    // --- LOGIKA SPEEDOMETER (ANTI-GETAR) ---
    
    // 1. Target kecepatan sesungguhnya dalam km/h
    const targetSpeedKmH = currentSpeed * 3.6;
    
    // 2. LERP UNTUK UI: Melembutkan transisi angka (mencegah lompatan ekstrem)
    displaySpeedUI.current = THREE.MathUtils.lerp(displaySpeedUI.current, targetSpeedKmH, 0.2);
    
    // 3. Bulatkan angka untuk ditampilkan
    let finalSpeedText = Math.round(displaySpeedUI.current);
    
    // 4. CEILING SNAP (Kunci Top Speed)
    // Jika tombol gas ditekan DAN kecepatan mobil sudah sangat mendekati maxSpeed (toleransi 1 m/s),
    // paku angkanya secara absolut ke nilai km/h dari maxSpeed agar tidak bergetar.
    if (gasValue > 0 && currentSpeed >= maxSpeed - 1) {
      finalSpeedText = Math.round(maxSpeed * 3.6);
    }
    
    // 5. Injeksi DOM yang Dioptimasi
    const speedTextElement = document.getElementById('speed-text');
    if (speedTextElement) {
      // OPTIMASI: Hanya perbarui DOM (teks HTML) JIKA angkanya benar-benar berubah.
      // Ini mencegah browser melakukan render ulang teks berulang kali di angka yang sama.
      if (speedTextElement.innerText !== finalSpeedText.toString()) {
        speedTextElement.innerText = finalSpeedText.toString();
      }
    }

    // --- UPDATE VISUAL GIGI ---
    const gearTextElement = document.getElementById('gear-text');
    if (gearTextElement) {
      const displayGear = currentGear.current === 0 ? 'R' : currentGear.current.toString();
      if (gearTextElement.innerText !== displayGear) {
        gearTextElement.innerText = displayGear;
      }
    }

    const rotation = rb.current.rotation();
    const quaternion = new THREE.Quaternion(rotation.x, rotation.y, rotation.z, rotation.w);
    const forward = new THREE.Vector3(-1, 0, 0).applyQuaternion(quaternion);

    // --- A. SISTEM GAS & ENGINE BRAKING ---
    
    // Logika Mesin Kekurangan Torsi:
    // Bernilai 'true' jika gigi di atas 1 (2, 3, dst) TETAPI kecepatan di bawah 10 km/h.
    const isEngineStalling = targetSpeedKmH < 10 && currentGear.current > 1;

    if (currentSpeed > maxSpeed + 2) {
      // ENGINE BRAKING AKTIF
      rb.current.setLinvel({
        x: currentVel.x * 0.95,
        y: currentVel.y,
        z: currentVel.z * 0.95
      }, true);
    } else if (gasValue > 0) {
      
      if (isEngineStalling) {
        // MOBIL MENGGELITIK/TIDAK KUAT JALAN
        // Daya dorong (impulse) tidak diberikan. Mobil hanya akan meraung atau tertahan.
        // Anda membiarkan blok ini kosong agar kecepatan jatuh secara alami.
      } else if (currentSpeed < maxSpeed) {
        // Akselerasi normal
        rb.current.applyImpulse({
          x: forward.x * (accelerationForce * gasValue),
          y: 0,
          z: forward.z * (accelerationForce * gasValue)
        }, true);
      }
      
    }

    // --- B. SISTEM REM & DAMPING ALAMI ---
    if (brakeValue > 0) {
      // Pengereman dinamis: Semakin dalam LT ditekan, semakin kuat perlambatannya
      const brakePower = 1 - (0.08 * brakeValue);
      rb.current.setLinvel({
        x: currentVel.x * brakePower,
        y: currentVel.y,
        z: currentVel.z * brakePower
      }, true);
    } else if (gasValue === 0) {
      // Damping alami saat tidak ada input (seperti engine brake)
      rb.current.setLinvel({
        x: currentVel.x * 0.98,
        y: currentVel.y,
        z: currentVel.z * 0.98
      }, true);
    }

    // --- C. DOWNFORCE ---
    rb.current.applyImpulse({ x: 0, y: -15, z: 0 }, true);

    // --- D. SISTEM KEMUDI (Mendukung Radius Putar Analog) ---
    if (steerValue !== 0) {
      // Sudut putar akan menyesuaikan seberapa jauh analog digeser
      rb.current.setAngvel({ x: 0, y: steerValue * turnSpeed, z: 0 }, true);
    } else {
      rb.current.setAngvel({ x: 0, y: currentAngvel.y * 0.9, z: 0 }, true);
    }

    // --- FITUR ANTI-LOMPAT (DYNAMIC DOWNFORCE) ---
    // Berlaku untuk sirkuit yang memiliki tanjakan/turunan
    
    // Jika mobil terlempar ke atas dengan kecepatan lebih dari 3 m/s
    if (currentVel.y > 1.0) {
      // Tembakkan impulse (gaya dorong) ekstrem ke arah bawah (Y negatif)
      // Ini bertindak sebagai gravitasi buatan yang langsung meredam pantulan
      rb.current.applyImpulse({ x: 0, y: -100, z: 0 }, true);
      
      // Matikan kecepatan naiknya agar tidak melawan impulse
      rb.current.setLinvel({ 
        x: currentVel.x, 
        y: 0, 
        z: currentVel.z 
      }, true);
    }
  });
return (
    // 1. Grup utama ini mengatur posisi dunia (world spawn) untuk SELURUH bagian mobil
    <group position={[-300.576, 1.632, 1202.7]}>
      
      {/* 2. RigidBody Mobil (Independen) */}
      <RigidBody
        mass={200} // Pastikan tidak terlalu berat dibandingkan ban (misal ban 50, mobil 100-500)
        ref={ref}
        colliders={false}
        type="dynamic"
        lockRotations={true}
        linearDamping={2}
        angularDamping={2}
        restitution={0}    // Absolut: Mencegah sasis memantul jika menyentuh tanah
        ccd={true}
        {...props}
      >
        <CuboidCollider args={[1.5, 0.4, 0.8]} position={[0, -0.2, 0]} />
        <group rotation={[0, -90 * (Math.PI / 180), 0]} scale={[1.411, 0.539, 0.999]}>
           <mesh geometry={nodes.Cube001.geometry} material={materials.LiveryRedBull1} />
          <mesh geometry={nodes.Cube001_1.geometry} material={materials.LiveryRedBull2} />
          <mesh geometry={nodes.Cube001_2.geometry} material={materials.LiveryRedBull3} />
          <mesh geometry={nodes.Cube001_3.geometry} material={materials.LiveryRedBull4} />
        </group>
      </RigidBody>
      {/* --- BATAS AKHIR RIGIDBODY MOBIL --- */}

      {/* 3. Komponen Ban diletakkan SEJAJAR (Sibling) dengan RigidBody Mobil */}
      <WheelJoint carRef={ref} position={[3.7, -0.1, 1.65]} />
      <WheelJoint carRef={ref} position={[3.7, -0.1, -1.65]} />
      <WheelJoint carRef={ref} position={[-2.9, -0.1, 1.65]} />
      <WheelJoint carRef={ref} position={[-2.9, -0.1, -1.65]} />

    </group>
  )
})

Car.displayName = 'Car'

useGLTF.preload('/games/fast-car/models/cars/redbull-livery.glb') 