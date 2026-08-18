'use client';

import { useRef, useState } from 'react';
import { CaretLeftIcon, LockIcon } from '@phosphor-icons/react';
import { BuildTool } from '../../page';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { PerspectiveCamera, View } from '@react-three/drei';
import { House1 } from '../models/house1';
import { Factory1 } from '../models/factory1';
import { Market } from '../models/market';
import { Tree1 } from '../models/tree1';
import { Tree2 } from '../models/tree2';
import { Water } from '../models/water';
import { Electric } from '../models/electric';
import { RoadStraight } from '../models/road-straight';
import { House2 } from '../models/house2';
import { Fauntain } from '../models/fauntain';
import { Garbage } from '../models/garbage';
import { Hospital } from '../models/hospital';
import { Police } from '../models/police';
import { FireFighter } from '../models/firefighter';
import { SchoolElementary } from '../models/schoolelementary';
import { SchoolJunior } from '../models/schooljunior';
import { SchoolHigh } from '../models/schoolhigh';
import { Apart1 } from '../models/apart1';
import { SuperMarket } from '../models/supermarket';

interface BottomPanelProps {
  activeTool: BuildTool;
  setActiveTool: (tool: BuildTool) => void;
  isBuildMode: boolean;
  setIsBuildMode: (val: boolean) => void;
  isDeleteMode: boolean;
  setIsDeleteMode: (val: boolean) => void;
  unlockedTools: BuildTool[]; // BARU
}

// BARU: Pembungkus Model 3D UI dengan Kendali Kamera Penuh
interface SpinningPreviewProps {
  children: React.ReactNode;
  isActive: boolean;
  kameraMundur?: number;  
  kameraNaik?: number;    
  zoomFOV?: number;       
  skalaModel?: number;    
  posisiYModel?: number;  
  kameraNunduk?: number;  
  rotasiAwalY?: number;   // BARU: Kendali arah hadap awal model
}

function SpinningPreview({ 
  children, 
  isActive, 
  kameraMundur = 8,
  kameraNaik = 4,
  zoomFOV = 40,
  skalaModel = 1,
  posisiYModel = -0.5,
  kameraNunduk = -0.2,
  rotasiAwalY = -Math.PI / 4
}: SpinningPreviewProps) {
  const groupRef = useRef<THREE.Group>(null);
  const invalidate = useThree((state) => state.invalidate);
  const wasActiveRef = useRef(false); // lacak transisi true -> false

  useFrame((state, delta) => {
    if (!groupRef.current) return;

    if (isActive) {
      groupRef.current.rotation.y += delta * 1.5;
      wasActiveRef.current = true;
      invalidate();
      return;
    }

    // Baru saja berhenti aktif -> langsung snap balik, sekali aja
    if (wasActiveRef.current) {
      groupRef.current.rotation.y = rotasiAwalY;
      wasActiveRef.current = false;
      invalidate(); // 1 frame terakhir buat nampilin posisi resetnya
    }
  });

  return (
    <>
      <PerspectiveCamera 
        makeDefault 
        position={[0, kameraNaik, kameraMundur]} 
        rotation={[kameraNunduk, 0, 0]} 
        fov={zoomFOV} 
      />
      <ambientLight intensity={1.5} />
      <directionalLight position={[10, 10, 10]} intensity={1.5} />
      <group 
        ref={groupRef} 
        position={[0, posisiYModel, 0]} 
        scale={skalaModel}
        rotation={[0, rotasiAwalY, 0]} 
      >
        {children}
      </group>
    </>
  );
}

export default function BottomPanel({
  activeTool,
  setActiveTool,
  isBuildMode,
  setIsBuildMode,
  isDeleteMode,
  setIsDeleteMode,
  unlockedTools,
}: BottomPanelProps) {
  const [isHouseMenu, setIsHouseMenu] = useState(false);

  const isHouseL1Active = activeTool === 'ZONE_HOUSE_L1';
  const isHouseL2Active = activeTool === 'ZONE_HOUSE_L2';
  const isHouseActive = isHouseL1Active || isHouseL2Active; // pengganti isZoneActive lama, khusus rumah

  const [isZoneMenu, setIsZoneMenu] = useState(false);
  const [isResourceMenu, setIsResourceMenu] = useState(false); // State baru untuk menu Resource
  const [isNatureMenu, setIsNatureMenu] = useState(false); // tambah di deklarasi state atas

  const isTree1Active = activeTool === 'NATURE_TREE1';
  const isTree2Active = activeTool === 'NATURE_TREE2';
  const isFountainActive = activeTool === 'NATURE_FOUNTAIN';
  const isNatureActive = isTree1Active || isTree2Active || isFountainActive;

  const [isCommercialMenu, setIsCommercialMenu] = useState(false);
  const isCommercialL1Active = activeTool === 'ZONE_COMMERCIAL_L1';
  const isCommercialL2Active = activeTool === 'ZONE_COMMERCIAL_L2';
  const isCommercialActive = isCommercialL1Active || isCommercialL2Active;

  const isIndustrialActive = activeTool === 'ZONE_INDUSTRIAL_L1';

  const isZoneCategoryActive = isHouseActive || isCommercialActive || isIndustrialActive;
  
  const isElectricActive = activeTool === 'RESOURCE_ELECTRIC';
  const isWaterActive = activeTool === 'RESOURCE_WATER';
  const isGarbageActive = activeTool === 'RESOURCE_GARBAGE'; // BARU
  const isResourceActive = isElectricActive || isWaterActive || isGarbageActive;

  const [isServiceMenu, setIsServiceMenu] = useState(false);

  const isHospitalActive = activeTool === 'SERVICE_HOSPITAL';
  const isPoliceActive = activeTool === 'SERVICE_POLICE';
  const isFirefighterActive = activeTool === 'SERVICE_FIREFIGHTER';
  const isServiceActive = isHospitalActive || isPoliceActive || isFirefighterActive;

  const isUnlocked = (tool: BuildTool) => unlockedTools.includes(tool);
  const isServiceUnlocked = isUnlocked('SERVICE_HOSPITAL'); // representatif, ketiganya kebuka bareng di Level 2

  const [isEducationMenu, setIsEducationMenu] = useState(false);
  const isSchoolElementaryActive = activeTool === 'EDUCATION_ELEMENTARY';
  const isSchoolJuniorActive = activeTool === 'EDUCATION_JUNIOR';
  const isSchoolHighActive = activeTool === 'EDUCATION_HIGH';
  const isEducationActive = isSchoolElementaryActive || isSchoolJuniorActive || isSchoolHighActive;

  const handleExitBuildMode = () => {
    setIsBuildMode(false);
    setIsZoneMenu(false);
    setIsResourceMenu(false);
    setIsNatureMenu(false);
    setIsServiceMenu(false);
    setIsEducationMenu(false);
    setIsHouseMenu(false);
    setIsCommercialMenu(false);
  };

  // Referensi kamera sama persis dengan preview Tree1 di Level 2 (tombol "Alam")
  const kameraAlam = {
    kameraMundur: 18,
    kameraNaik: 7,
    kameraNunduk: -0.25,
    zoomFOV: 35,
  };

  return (
    <div className="w-full lg:w-fit absolute bottom-12 left-1/2 transform -translate-x-1/2 flex bg-white/90 backdrop-blur-md p-2 shadow-sm border border-gray-300">
      {/* Level 1: Idle, kategori sejajar */}
      {!isBuildMode && !isDeleteMode && (
        <>
          <button
            onClick={() => setIsBuildMode(true)}
            className="px-8 py-3 text-sm font-semibold tracking-widest uppercase transition-colors duration-200 bg-transparent text-neutral-500 hover:bg-neutral-100 hover:text-neutral-900"
          >
            Build
          </button>
          <div className="w-px bg-gray-300 mx-2"></div>
          <button
            onClick={() => setIsDeleteMode(true)}
            className="px-8 py-3 text-sm font-semibold tracking-widest uppercase transition-colors duration-200 bg-transparent text-red-600 hover:bg-red-50"
          >
            Hapus
          </button>
        </>
      )}

      {/* Level 2: Mode Build, menu utama */}
      {isBuildMode && !isZoneMenu && !isResourceMenu && !isNatureMenu && !isServiceMenu && !isEducationMenu && (
        <>
          <button
            onClick={handleExitBuildMode}
            className="flex items-center justify-center px-4 text-neutral-500 hover:bg-neutral-100 hover:text-neutral-900 transition-colors duration-200"
          >
            <CaretLeftIcon size={32} />
          </button>
          <div className="w-px bg-gray-300 mx-2"></div>

          {/* TOMBOL JALAN */}
          <button
            onClick={() => setActiveTool('ROAD')}
            className={`relative flex flex-col items-center justify-center p-2 w-28 h-28 mx-2 transition-all duration-200 ${
              activeTool === 'ROAD' ? 'text-neutral-900' : 'text-neutral-500 hover:text-neutral-900'
            }`}
          >
            <div className="w-full h-16 relative pointer-events-none">
              <View className="absolute inset-0">
                <SpinningPreview
                  isActive={activeTool === 'ROAD'}
                  kameraMundur={16}
                  kameraNaik={5}
                  kameraNunduk={-0.25}
                  zoomFOV={35}
                >
                  <RoadStraight />
                </SpinningPreview>
              </View>
            </div>
            <span className="text-[10px] font-bold tracking-widest uppercase mt-2">
              Jalan
            </span>
          </button>
          <div className="w-px bg-gray-300 mx-2"></div>

          {/* TOMBOL ZONA (preview Rumah Lv.3) */}
          <button
            onClick={() => setIsZoneMenu(true)}
            className={`relative flex flex-col items-center justify-center p-2 w-28 h-28 mx-2 transition-all duration-200 ${
              isZoneCategoryActive
                ? 'text-neutral-900'
                : 'text-neutral-500 hover:text-neutral-900'
            }`}
          >
            <div className="w-full h-16 relative pointer-events-none">
              <View className="absolute inset-0">
                <SpinningPreview
                  isActive={isZoneCategoryActive}
                  kameraMundur={16}
                  kameraNaik={5}
                  kameraNunduk={-0.25}
                  zoomFOV={35}
                >
                  <House2 />
                </SpinningPreview>
              </View>
            </div>
            <span className="text-[10px] font-bold tracking-widest uppercase mt-2">
              Zona
            </span>
          </button>
          <div className="w-px bg-gray-300 mx-2"></div>

          {/* TOMBOL SUMBER DAYA (preview Pompa Air) */}
          <button
            onClick={() => setIsResourceMenu(true)}
            className={`relative flex flex-col items-center justify-center p-2 w-28 h-28 mx-2 transition-all duration-200 ${
              isResourceActive ? 'text-neutral-900' : 'text-neutral-500 hover:text-neutral-900'
            }`}
          >
            <div className="w-full h-16 relative pointer-events-none">
              <View className="absolute inset-0">
                <SpinningPreview
                  isActive={isResourceActive}
                  kameraMundur={16}
                  kameraNaik={5}
                  kameraNunduk={-0.25}
                  zoomFOV={35}
                >
                  <Water />
                </SpinningPreview>
              </View>
            </div>
            <span className="text-[10px] font-bold tracking-widest uppercase mt-2">
              Sumber Daya
            </span>
          </button>
          <div className="w-px bg-gray-300 mx-2"></div>

          {/* TOMBOL ALAM (preview Pohon 1) */}
          <button
            onClick={() => setIsNatureMenu(true)}
            className={`relative flex flex-col items-center justify-center p-2 w-28 h-28 mx-2 transition-all duration-200 ${
              isNatureActive ? 'text-neutral-900' : 'text-neutral-500 hover:text-neutral-900'
            }`}
          >
            <div className="w-full h-16 relative pointer-events-none">
              <View className="absolute inset-0">
                <SpinningPreview
                  isActive={isNatureActive}
                  {...kameraAlam}
                >
                  <Tree1 />
                </SpinningPreview>
              </View>
            </div>
            <span className="text-[10px] font-bold tracking-widest uppercase mt-2">
              Alam
            </span>
          </button>
          <div className="w-px bg-gray-300 mx-2"></div>
          <button
            onClick={() => isServiceUnlocked && setIsServiceMenu(true)}
            disabled={!isServiceUnlocked}
            className={`relative flex flex-col items-center justify-center p-2 w-28 h-28 mx-2 transition-all duration-200 ${
              !isServiceUnlocked
                ? 'opacity-40 cursor-not-allowed text-neutral-400'
                : isServiceActive ? 'text-neutral-900' : 'text-neutral-500 hover:text-neutral-900'
            }`}
          >
            <div className="w-full h-16 relative pointer-events-none">
              <View className="absolute inset-0">
                <SpinningPreview
                  isActive={isServiceActive}
                  kameraMundur={18}
                  kameraNaik={6}
                  kameraNunduk={-0.25}
                  zoomFOV={35}
                >
                  <Hospital />
                </SpinningPreview>
              </View>
              {!isServiceUnlocked && (
                <div className="absolute inset-0 flex items-center justify-center bg-white/50">
                  <LockIcon size={22} weight="fill" className="text-neutral-500" />
                </div>
              )}
            </div>
            <span className="text-[10px] font-bold tracking-widest uppercase mt-2">
              {isServiceUnlocked ? 'Layanan' : 'Lv.2'}
            </span>
          </button>
          <div className="w-px bg-gray-300 mx-2"></div>
          <button
            onClick={() => setIsEducationMenu(true)}
            className={`relative flex flex-col items-center justify-center p-2 w-28 h-28 mx-2 transition-all duration-200 ${
              isEducationActive ? 'text-neutral-900' : 'text-neutral-500 hover:text-neutral-900'
            }`}
          >
            <div className="w-full h-16 relative pointer-events-none">
              <View className="absolute inset-0">
                <SpinningPreview
                  isActive={isEducationActive}
                  kameraMundur={30}
                  kameraNaik={8}
                  kameraNunduk={-0.25}
                  zoomFOV={35}
                >
                  <SchoolElementary />
                </SpinningPreview>
              </View>
            </div>
            <span className="text-[10px] font-bold tracking-widest uppercase mt-2">
              Pendidikan
            </span>
          </button>
        </>
      )}

      {/* Level 3: Submenu Zona */}
      {isBuildMode && isZoneMenu && !isHouseMenu && !isCommercialMenu && (
        <>
          <button
            onClick={() => setIsZoneMenu(false)}
            className="flex items-center justify-center px-4 text-neutral-500 hover:bg-neutral-100 hover:text-neutral-900 transition-colors duration-200"
          >
            <CaretLeftIcon size={32} />
          </button>
          <div className="w-px bg-gray-300 mx-2"></div>

          {/* TOMBOL ZONA RUMAH (kategori, buka submenu Lv.1/Lv.2) */}
          <button
            onClick={() => setIsHouseMenu(true)}
            className={`relative flex flex-col items-center justify-center p-2 w-28 h-28 mx-2 transition-all duration-200 ${
              isHouseActive ? 'text-neutral-900' : 'text-neutral-500 hover:text-neutral-900'
            }`}
          >
            <div className="w-full h-16 relative pointer-events-none">
              <View className="absolute inset-0">
                <SpinningPreview
                  isActive={isHouseActive}
                  kameraMundur={16}
                  kameraNaik={5}
                  kameraNunduk={-0.25}
                  zoomFOV={35}
                >
                  <House1 />
                </SpinningPreview>
              </View>
            </div>
            <span className="text-[10px] font-bold tracking-widest uppercase mt-2">
              Zona Rumah
            </span>
          </button>
          <div className="w-px bg-gray-300 mx-2"></div>

          {/* TOMBOL ZONA KOMERSIAL (kategori, buka submenu Lv.1/Lv.2) */}
          <button
            onClick={() => setIsCommercialMenu(true)}
            className={`relative flex flex-col items-center justify-center p-2 w-28 h-28 mx-2 transition-all duration-200 ${
              isCommercialActive ? 'text-neutral-900' : 'text-neutral-500 hover:text-neutral-900'
            }`}
          >
            <div className="w-full h-16 relative pointer-events-none">
              <View className="absolute inset-0">
                <SpinningPreview
                  isActive={isCommercialActive}
                  kameraMundur={16}
                  kameraNaik={5}
                  kameraNunduk={-0.25}
                  zoomFOV={35}
                >
                  <Market />
                </SpinningPreview>
              </View>
            </div>
            <span className="text-[10px] font-bold tracking-widest uppercase mt-2">
              Zona Komersial
            </span>
          </button>
          <div className="w-px bg-gray-300 mx-2"></div>

          {/* TOMBOL INDUSTRI LV.1 (Factory1) */}
          <button
            onClick={() => setActiveTool('ZONE_INDUSTRIAL_L1')}
            className={`relative flex flex-col items-center justify-center p-2 w-28 h-28 mx-2 transition-all duration-200 ${
              isIndustrialActive ? 'text-neutral-900' : 'text-neutral-500 hover:text-neutral-900'
            }`}
          >
            <div className="w-full h-16 relative pointer-events-none">
              <View className="absolute inset-0">
                <SpinningPreview
                  isActive={isIndustrialActive}
                  kameraMundur={18}
                  kameraNaik={6}
                  kameraNunduk={-0.25}
                  zoomFOV={35}
                >
                  <Factory1 />
                </SpinningPreview>
              </View>
            </div>
            <span className="text-[10px] font-bold tracking-widest uppercase mt-2">
              Industri Lv.1
            </span>
          </button>
        </>
      )}

      {/* Level 3: Submenu Sumber Daya (preview 3D, sama pola dengan Zona) */}
      {isBuildMode && isResourceMenu && (
        <>
          <button
            onClick={() => setIsResourceMenu(false)}
            className="flex items-center justify-center px-4 text-neutral-500 hover:bg-neutral-100 hover:text-neutral-900 transition-colors duration-200"
          >
            <CaretLeftIcon size={32} />
          </button>
          <div className="w-px bg-gray-300 mx-2"></div>

          {/* TOMBOL TIANG LISTRIK */}
          <button
            onClick={() => setActiveTool('RESOURCE_ELECTRIC')}
            className={`relative flex flex-col items-center justify-center p-2 w-28 h-28 mx-2 transition-all duration-200 ${
              isElectricActive ? 'text-neutral-900' : 'text-neutral-500 hover:text-neutral-900'
            }`}
          >
            <div className="w-full h-16 relative pointer-events-none">
              <View className="absolute inset-0">
                <SpinningPreview
                  isActive={isElectricActive}
                  kameraMundur={56}
                  kameraNaik={30}
                  kameraNunduk={-0.25}
                  zoomFOV={35}
                >
                  <Electric />
                </SpinningPreview>
              </View>
            </div>
            <span className="text-[10px] font-bold tracking-widest uppercase mt-2">
              Tiang Listrik
            </span>
          </button>
          <div className="w-px bg-gray-300 mx-2"></div>

          {/* TOMBOL POMPA AIR */}
          <button
            onClick={() => setActiveTool('RESOURCE_WATER')}
            className={`relative flex flex-col items-center justify-center p-2 w-28 h-28 mx-2 transition-all duration-200 ${
              isWaterActive ? 'text-neutral-900' : 'text-neutral-500 hover:text-neutral-900'
            }`}
          >
            <div className="w-full h-16 relative pointer-events-none">
              <View className="absolute inset-0">
                <SpinningPreview
                  isActive={isWaterActive}
                  kameraMundur={16}
                  kameraNaik={5}
                  kameraNunduk={-0.25}
                  zoomFOV={35}
                >
                  <Water />
                </SpinningPreview>
              </View>
            </div>
            <span className="text-[10px] font-bold tracking-widest uppercase mt-2">
              Pompa Air
            </span>
          </button>
          <div className="w-px bg-gray-300 mx-2"></div>

          {/* TOMBOL TPS / GARBAGE (BARU) */}
          <button
            onClick={() => setActiveTool('RESOURCE_GARBAGE')}
            className={`relative flex flex-col items-center justify-center p-2 w-28 h-28 mx-2 transition-all duration-200 ${
              isGarbageActive ? 'text-neutral-900' : 'text-neutral-500 hover:text-neutral-900'
            }`}
          >
            <div className="w-full h-16 relative pointer-events-none">
              <View className="absolute inset-0">
                <SpinningPreview
                  isActive={isGarbageActive}
                  // ASUMSI: parameter kamera belum tentu pas, model garbage.glb belum pernah dipreview.
                  // Sesuaikan kameraMundur/kameraNaik kalau modelnya kepotong atau kekecilan.
                  kameraMundur={20}
                  kameraNaik={8}
                  kameraNunduk={-0.25}
                  zoomFOV={35}
                >
                  <Garbage />
                </SpinningPreview>
              </View>
            </div>
            <span className="text-[10px] font-bold tracking-widest uppercase mt-2">
              TPS Sampah
            </span>
          </button>
        </>
      )}

      {/* Level 3: Submenu Alam (preview 3D, tinggi kamera sama dengan tombol "Alam" di Level 2) */}
      {isBuildMode && isNatureMenu && (
        <>
          <button
            onClick={() => setIsNatureMenu(false)}
            className="flex items-center justify-center px-4 text-neutral-500 hover:bg-neutral-100 hover:text-neutral-900 transition-colors duration-200"
          >
            <CaretLeftIcon size={32} />
          </button>
          <div className="w-px bg-gray-300 mx-2"></div>

          {/* TOMBOL POHON 1 */}
          <button
            onClick={() => setActiveTool('NATURE_TREE1')}
            className={`relative flex flex-col items-center justify-center p-2 w-28 h-28 mx-2 transition-all duration-200 ${
              isTree1Active ? 'text-neutral-900' : 'text-neutral-500 hover:text-neutral-900'
            }`}
          >
            <div className="w-full h-16 relative pointer-events-none">
              <View className="absolute inset-0">
                <SpinningPreview
                  isActive={isTree1Active}
                  {...kameraAlam}
                >
                  <Tree1 />
                </SpinningPreview>
              </View>
            </div>
            <span className="text-[10px] font-bold tracking-widest uppercase mt-2">
              Pohon 1
            </span>
          </button>
          <div className="w-px bg-gray-300 mx-2"></div>

          {/* TOMBOL POHON 2 */}
          <button
            onClick={() => setActiveTool('NATURE_TREE2')}
            className={`relative flex flex-col items-center justify-center p-2 w-28 h-28 mx-2 transition-all duration-200 ${
              isTree2Active ? 'text-neutral-900' : 'text-neutral-500 hover:text-neutral-900'
            }`}
          >
            <div className="w-full h-16 relative pointer-events-none">
              <View className="absolute inset-0">
                <SpinningPreview
                  isActive={isTree2Active}
                  {...kameraAlam}
                >
                  <Tree2 />
                </SpinningPreview>
              </View>
            </div>
            <span className="text-[10px] font-bold tracking-widest uppercase mt-2">
              Pohon 2
            </span>
          </button>
          <div className="w-px bg-gray-300 mx-2"></div>

          {/* TOMBOL AIR MANCUR */}
          <button
            onClick={() => setActiveTool('NATURE_FOUNTAIN')}
            className={`relative flex flex-col items-center justify-center p-2 w-28 h-28 mx-2 transition-all duration-200 ${
              isFountainActive ? 'text-neutral-900' : 'text-neutral-500 hover:text-neutral-900'
            }`}
          >
            <div className="w-full h-16 relative pointer-events-none">
              <View className="absolute inset-0">
                <SpinningPreview
                  isActive={isFountainActive}
                  {...kameraAlam}
                >
                  <Fauntain />
                </SpinningPreview>
              </View>
            </div>
            <span className="text-[10px] font-bold tracking-widest uppercase mt-2">
              Air Mancur
            </span>
          </button>
        </>
      )}

      {/* Level 3: Submenu Layanan */}
      {isBuildMode && isServiceMenu && (
        <>
          <button
            onClick={() => setIsServiceMenu(false)}
            className="flex items-center justify-center px-4 text-neutral-500 hover:bg-neutral-100 hover:text-neutral-900 transition-colors duration-200"
          >
            <CaretLeftIcon size={32} />
          </button>
          <div className="w-px bg-gray-300 mx-2"></div>

          <button
            onClick={() => setActiveTool('SERVICE_HOSPITAL')}
            className={`relative flex flex-col items-center justify-center p-2 w-28 h-28 mx-2 transition-all duration-200 ${
              isHospitalActive ? 'text-neutral-900' : 'text-neutral-500 hover:text-neutral-900'
            }`}
          >
            <div className="w-full h-16 relative pointer-events-none">
              <View className="absolute inset-0">
                <SpinningPreview
                  isActive={isHospitalActive}
                  kameraMundur={18}
                  kameraNaik={6}
                  kameraNunduk={-0.25}
                  zoomFOV={35}
                >
                  <Hospital />
                </SpinningPreview>
              </View>
            </div>
            <span className="text-[10px] font-bold tracking-widest uppercase mt-2">
              Rumah Sakit
            </span>
          </button>
          <div className="w-px bg-gray-300 mx-2"></div>

          <button
            onClick={() => setActiveTool('SERVICE_POLICE')}
            className={`relative flex flex-col items-center justify-center p-2 w-28 h-28 mx-2 transition-all duration-200 ${
              isPoliceActive ? 'text-neutral-900' : 'text-neutral-500 hover:text-neutral-900'
            }`}
          >
            <div className="w-full h-16 relative pointer-events-none">
              <View className="absolute inset-0">
                <SpinningPreview
                  isActive={isPoliceActive}
                  kameraMundur={16}
                  kameraNaik={5}
                  kameraNunduk={-0.25}
                  zoomFOV={35}
                >
                  <Police />
                </SpinningPreview>
              </View>
            </div>
            <span className="text-[10px] font-bold tracking-widest uppercase mt-2">
              Polisi
            </span>
          </button>
          <div className="w-px bg-gray-300 mx-2"></div>

          <button
            onClick={() => setActiveTool('SERVICE_FIREFIGHTER')}
            className={`relative flex flex-col items-center justify-center p-2 w-28 h-28 mx-2 transition-all duration-200 ${
              isFirefighterActive ? 'text-neutral-900' : 'text-neutral-500 hover:text-neutral-900'
            }`}
          >
            <div className="w-full h-16 relative pointer-events-none">
              <View className="absolute inset-0">
                <SpinningPreview
                  isActive={isFirefighterActive}
                  kameraMundur={16}
                  kameraNaik={5}
                  kameraNunduk={-0.25}
                  zoomFOV={35}
                >
                  <FireFighter />
                </SpinningPreview>
              </View>
            </div>
            <span className="text-[10px] font-bold tracking-widest uppercase mt-2">
              Pemadam
            </span>
          </button>
        </>
      )}

      {/* Level 3: Submenu Pendidikan */}
      {isBuildMode && isEducationMenu && (
        <>
          <button
            onClick={() => setIsEducationMenu(false)}
            className="flex items-center justify-center px-4 text-neutral-500 hover:bg-neutral-100 hover:text-neutral-900 transition-colors duration-200"
          >
            <CaretLeftIcon size={32} />
          </button>
          <div className="w-px bg-gray-300 mx-2"></div>

          <button
            onClick={() => setActiveTool('EDUCATION_ELEMENTARY')}
            className={`relative flex flex-col items-center justify-center p-2 w-28 h-28 mx-2 transition-all duration-200 ${
              isSchoolElementaryActive ? 'text-neutral-900' : 'text-neutral-500 hover:text-neutral-900'
            }`}
          >
            <div className="w-full h-16 relative pointer-events-none">
              <View className="absolute inset-0">
                <SpinningPreview
                  isActive={isSchoolElementaryActive}
                  kameraMundur={30}
                  kameraNaik={8}
                  kameraNunduk={-0.25}
                  zoomFOV={35}
                >
                  <SchoolElementary />
                </SpinningPreview>
              </View>
            </div>
            <span className="text-[10px] font-bold tracking-widest uppercase mt-2">
              SD
            </span>
          </button>
          <div className="w-px bg-gray-300 mx-2"></div>
          <button
            onClick={() => setActiveTool('EDUCATION_JUNIOR')}
            className={`relative flex flex-col items-center justify-center p-2 w-28 h-28 mx-2 transition-all duration-200 ${
              isSchoolJuniorActive ? 'text-neutral-900' : 'text-neutral-500 hover:text-neutral-900'
            }`}
          >
            <div className="w-full h-16 relative pointer-events-none">
              <View className="absolute inset-0">
                <SpinningPreview
                  isActive={isSchoolJuniorActive}
                  kameraMundur={30}
                  kameraNaik={8}
                  kameraNunduk={-0.25}
                  zoomFOV={35}
                >
                  <SchoolJunior />
                </SpinningPreview>
              </View>
            </div>
            <span className="text-[10px] font-bold tracking-widest uppercase mt-2">
              SMP
            </span>
          </button>
          <div className="w-px bg-gray-300 mx-2"></div>

          <button
            onClick={() => setActiveTool('EDUCATION_HIGH')}
            className={`relative flex flex-col items-center justify-center p-2 w-28 h-28 mx-2 transition-all duration-200 ${
              isSchoolHighActive ? 'text-neutral-900' : 'text-neutral-500 hover:text-neutral-900'
            }`}
          >
            <div className="w-full h-16 relative pointer-events-none">
              <View className="absolute inset-0">
                <SpinningPreview
                  isActive={isSchoolHighActive}
                  kameraMundur={30}
                  kameraNaik={8}
                  kameraNunduk={-0.25}
                  zoomFOV={35}
                >
                  <SchoolHigh />
                </SpinningPreview>
              </View>
            </div>
            <span className="text-[10px] font-bold tracking-widest uppercase mt-2">
              SMA
            </span>
          </button>
        </>
      )}

      {/* Level 4: Submenu Zona Rumah (Lv.1 / Lv.2) */}
      {isBuildMode && isHouseMenu && (
        <>
          <button
            onClick={() => setIsHouseMenu(false)}
            className="flex items-center justify-center px-4 text-neutral-500 hover:bg-neutral-100 hover:text-neutral-900 transition-colors duration-200"
          >
            <CaretLeftIcon size={32} />
          </button>
          <div className="w-px bg-gray-300 mx-2"></div>

          <button
            onClick={() => setActiveTool('ZONE_HOUSE_L1')}
            className={`relative flex flex-col items-center justify-center p-2 w-28 h-28 mx-2 transition-all duration-200 ${
              isHouseL1Active ? 'text-neutral-900' : 'text-neutral-500 hover:text-neutral-900'
            }`}
          >
            <div className="w-full h-16 relative pointer-events-none">
              <View className="absolute inset-0">
                <SpinningPreview
                  isActive={isHouseL1Active}
                  kameraMundur={16}
                  kameraNaik={5}
                  kameraNunduk={-0.25}
                  zoomFOV={35}
                >
                  <House1 />
                </SpinningPreview>
              </View>
            </div>
            <span className="text-[10px] font-bold tracking-widest uppercase mt-2">
              Rumah Lv.1
            </span>
          </button>
          <div className="w-px bg-gray-300 mx-2"></div>

          <button
            onClick={() => setActiveTool('ZONE_HOUSE_L2')}
            className={`relative flex flex-col items-center justify-center p-2 w-28 h-28 mx-2 transition-all duration-200 ${
              isHouseL2Active ? 'text-neutral-900' : 'text-neutral-500 hover:text-neutral-900'
            }`}
          >
            <div className="w-full h-16 relative pointer-events-none">
              <View className="absolute inset-0">
                <SpinningPreview
                  isActive={isHouseL2Active}
                  // ASUMSI: parameter kamera belum divalidasi visual, model Apart1 belum pernah dipreview
                  kameraMundur={22}
                  kameraNaik={8}
                  kameraNunduk={-0.25}
                  zoomFOV={35}
                >
                  <Apart1 />
                </SpinningPreview>
              </View>
            </div>
            <span className="text-[10px] font-bold tracking-widest uppercase mt-2">
              Rumah Lv.2
            </span>
          </button>
        </>
      )}

            {/* Level 4: Submenu Zona Komersial (Lv.1 / Lv.2) */}
      {isBuildMode && isCommercialMenu && (
        <>
          <button
            onClick={() => setIsCommercialMenu(false)}
            className="flex items-center justify-center px-4 text-neutral-500 hover:bg-neutral-100 hover:text-neutral-900 transition-colors duration-200"
          >
            <CaretLeftIcon size={32} />
          </button>
          <div className="w-px bg-gray-300 mx-2"></div>

          <button
            onClick={() => setActiveTool('ZONE_COMMERCIAL_L1')}
            className={`relative flex flex-col items-center justify-center p-2 w-28 h-28 mx-2 transition-all duration-200 ${
              isCommercialL1Active ? 'text-neutral-900' : 'text-neutral-500 hover:text-neutral-900'
            }`}
          >
            <div className="w-full h-16 relative pointer-events-none">
              <View className="absolute inset-0">
                <SpinningPreview
                  isActive={isCommercialL1Active}
                  kameraMundur={16}
                  kameraNaik={5}
                  kameraNunduk={-0.25}
                  zoomFOV={35}
                >
                  <Market />
                </SpinningPreview>
              </View>
            </div>
            <span className="text-[10px] font-bold tracking-widest uppercase mt-2">
              Komersial Lv.1
            </span>
          </button>
          <div className="w-px bg-gray-300 mx-2"></div>

          <button
            onClick={() => setActiveTool('ZONE_COMMERCIAL_L2')}
            className={`relative flex flex-col items-center justify-center p-2 w-28 h-28 mx-2 transition-all duration-200 ${
              isCommercialL2Active ? 'text-neutral-900' : 'text-neutral-500 hover:text-neutral-900'
            }`}
          >
            <div className="w-full h-16 relative pointer-events-none">
              <View className="absolute inset-0">
                <SpinningPreview
                  isActive={isCommercialL2Active}
                  // ASUMSI: parameter kamera belum divalidasi visual, model 2x2 belum pernah dipreview
                  kameraMundur={30}
                  kameraNaik={9}
                  kameraNunduk={-0.25}
                  zoomFOV={35}
                >
                  <SuperMarket />
                </SpinningPreview>
              </View>
            </div>
            <span className="text-[10px] font-bold tracking-widest uppercase mt-2">
              Komersial Lv.2
            </span>
          </button>
        </>
      )}

      {/* Mode Hapus */}
      {isDeleteMode && (
        <>
          <button
            onClick={() => setIsDeleteMode(false)}
            className="flex items-center justify-center px-4 text-neutral-500 hover:bg-neutral-100 hover:text-neutral-900 transition-colors duration-200"
          >
            <CaretLeftIcon size={32} />
          </button>
          <div className="w-px bg-gray-300 mx-2"></div>
          <div className="px-8 py-3 text-sm font-semibold tracking-widest uppercase text-red-600">
            Pilih Area Hapus
          </div>
        </>
      )}
    </div>
  );
}