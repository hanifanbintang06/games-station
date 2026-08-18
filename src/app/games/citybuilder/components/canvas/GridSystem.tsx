import { useState, useEffect, useRef, useMemo } from 'react';
import { ThreeEvent, useFrame } from '@react-three/fiber';
import { GRID_SIZE, TILE_SIZE, COLORS } from '../../core/constants';
import HighlightBox from './HighlightBox';
import { RoadStraightInstances, RoadCornerInstances, RoadTeeInstances, RoadCrossroadInstances } from './RoadInstances';
import { House1Instances, House2Instances, House3Instances } from './HouseInstances';
import { InstanceTransform } from './InstancedGLTFGroup';
import { BuildTool, DeleteBounds, DeleteRequest } from '../../page';
import GhostModel from './GhostModel';
import { WartegInstances, MarketInstances } from './CommercialInstances';
import { Factory1Instances, Factory2Instances } from './IndustrialInstances';
import { WaterInstances, ElectricInstances, GarbageInstances } from './ResourceInstances';
import { Maps } from '../models/maps';
import GrassInstances, { GrassTileTransform } from '../models/GrassInstances';
import { buildSpatialIndex, hasAdjacentRoad, queryRadiusSome, queryRadiusCount, findAffectedItems, SpatialIndex } from '../../core/spatialIndex';
import { buildLaneCache, Side } from '../../core/laneSystem';
import CarInstances from './CarInstances';
import { Tree1Instances, Tree2Instances, FountainInstances } from './NatureInstances';
import { FireFighterInstances, HospitalInstances, PoliceInstances } from './ServiceInstances';
import { buildDispatchRoute, RouteSegment } from '../../core/dispatchPath';
import IncidentCar from './IncidentCar';
import { CarPolice } from '../models/carpolice';
import { CarFireFighter } from '../models/carfirefighter';
import * as THREE from 'three';
import { Siren } from '@phosphor-icons/react';
import { Html } from '@react-three/drei';
import { CITY_LEVELS } from '../../core/cityLevels';
import { SchoolElementaryInstances, SchoolHighInstances, SchoolJuniorInstances } from './EducationInstances';
import { BUILD_COSTS, FIXED_2X2_TOOLS } from '../../core/buildCosts';
import { Apart1Instances, Apart2Instances, Apart3Instances, Apart4Instances } from './ApartInstances';
import { ShopInstances, SuperMarketInstances } from './CommercialL2Instances';

interface GridSystemProps {
  isGridMode: boolean;
  setIsGridMode: (val: boolean) => void;
  activeTool: BuildTool;
  isBuildMode: boolean;
  isDeleteMode: boolean;
  deleteRequest: DeleteRequest | null;
  onDeleteBoundsSelected: (bounds: DeleteBounds) => void;
  onDeleteHandled: () => void;
  onInspectItem?: (item: PlacedItem | null) => void;
  inspectedItem?: PlacedItem | null;
  onUpdateStats?: (stats: { population: number; capacity: number; demand: { r: number; c: number; i: number } }) => void;
  money?: number;
  onBuildCost?: (cost: number) => boolean;
  onFinancialTick?: (netIncome: number) => void;
  onSelectionCostChange?: (cost: number) => void;
  triggerFireSignal?: number;
  triggerRobberySignal?: number;
  dispatchRequest?: { x: number; z: number; type: 'POLICE' | 'FIREFIGHTER' } | null;
  onDispatchHandled?: () => void;
  onIncidentUpdate?: (state: { fire: { x: number; z: number } | null; robbery: { x: number; z: number } | null }) => void;
}

type HouseVariant = 'HOUSE1' | 'HOUSE2' | 'HOUSE3';
const ALL_HOUSE_VARIANTS: HouseVariant[] = ['HOUSE1', 'HOUSE2', 'HOUSE3'];

// BARU: Variant untuk Rumah Lv.2 (Apartemen)
type ApartVariant = 'APART1' | 'APART2' | 'APART3' | 'APART4';
const ALL_APART_VARIANTS: ApartVariant[] = ['APART1', 'APART2', 'APART3', 'APART4'];

// BARU: Helper generik — sepanjang file, cek "apakah ini rumah" (L1 atau L2) pakai ini,
// bukan literal 'ZONE_HOUSE_L1' doang, supaya rumah Lv.2 otomatis ikut semua logic rumah.
const isHouseZone = (type: BuildTool) => type === 'ZONE_HOUSE_L1' || type === 'ZONE_HOUSE_L2';

const isCommercialZone = (type: BuildTool) => type === 'ZONE_COMMERCIAL_L1' || type === 'ZONE_COMMERCIAL_L2';

// BARU: Variant Komersial Lv.2 (2x2, jangkauan lebih luas, kapasitas kerja lebih besar)
type CommercialL2Variant = 'SUPERMARKET' | 'SHOP';
const ALL_COMMERCIAL_L2_VARIANTS: CommercialL2Variant[] = ['SUPERMARKET', 'SHOP'];
const COMMERCIAL_L2_JOB_CAPACITY = 12; // "bisa mempekerjakan 12 orang"
const COMMERCIAL_L2_RADIUS = 8; // "jangkauan 10 ubin" — radius RUMAH mendeteksi toko ini

type CommercialVariant = 'MARKET' | 'WARTEG';
const ALL_COMMERCIAL_VARIANTS: CommercialVariant[] = ['MARKET', 'WARTEG'];

type IndustrialVariant = 'FACTORY1' | 'FACTORY2';

// BARU: Konstanta untuk Garbage (TPS)
const GARBAGE_CAPACITY_PER_BUILDING = 100; // 1 bangunan nampung 100 orang
const GARBAGE_SMELL_RADIUS = 12; // radius bau, sama pola dengan industri
const GARBAGE_WARNING_MSG = "Sampah kota menumpuk, butuh TPS tambahan";

const HOSPITAL_RADIUS = 12;
const HOSPITAL_WARNING_MSG = "Di luar jangkauan rumah sakit";

export interface PlacedItem {
  x: number;
  z: number;
  type: BuildTool;
  rotation: number;
  roadShape?: 'STRAIGHT' | 'CORNER' | 'TEE' | 'CROSSROAD';
  houseVariant?: HouseVariant | ApartVariant;
  commercialVariant?: CommercialVariant | CommercialL2Variant;
  industrialVariant?: IndustrialVariant;
  isSecondary?: boolean;
  footprintDirection?: 'X' | 'Z';
  warning?: string[]; // DIUBAH: Sekarang menjadi Array of string
  currentOccupants?: number; // BARU: Jumlah penduduk saat ini
  maxOccupants?: number;     // BARU: Kapasitas maksimal (4 untuk rumah)
  employedOccupants?: number;
  currentWorkers?: number; // BARU: Jumlah pekerja yang terserap saat ini
  maxWorkers?: number;     // BARU: Kebutuhan maksimal pekerja
  outageTicks?: number;
  openSides?: Side[];
  footprintOrigin?: { x: number; z: number }; // BARU: ubin sekunder bangunan multi-ubin (2x2, dst) nunjuk balik ke ubin utama
}

// Fungsi untuk mengecek ketersediaan jalan dan fasilitas di sekitar bangunan
// DIUBAH: Tambahkan parameter isLevel2Unlocked
const getBuildingWarning = (item: PlacedItem, index: SpatialIndex, isLevel2Unlocked: boolean): string[] | undefined => {
  const warnings: string[] = [];

  // 1. Cek akses infrastruktur jalan (Tetap sama)
  if (isHouseZone(item.type) || isCommercialZone(item.type) || item.type === 'ZONE_INDUSTRIAL_L1' || item.type === 'RESOURCE_GARBAGE' || item.type === 'SERVICE_HOSPITAL' || item.type === 'SERVICE_POLICE' || item.type === 'SERVICE_FIREFIGHTER' || item.type === 'EDUCATION_ELEMENTARY' || item.type === 'EDUCATION_JUNIOR' || item.type === 'EDUCATION_HIGH') {
  let hasRoad = false;
    if (item.industrialVariant === 'FACTORY2') {
      const x2 = item.footprintDirection === 'X' ? item.x + 1 : item.x;
      const z2 = item.footprintDirection === 'Z' ? item.z + 1 : item.z;
      hasRoad = hasAdjacentRoad(index, item.x, item.z) || hasAdjacentRoad(index, x2, z2);
    } else {
      hasRoad = hasAdjacentRoad(index, item.x, item.z);
    }
    if (!hasRoad) warnings.push("Tidak ada akses jalan");
  }

  // 2. Cek Polusi/Kebisingan Industri (Tetap sama)
  if (isHouseZone(item.type) || isCommercialZone(item.type)) {
    const isNearIndustry = queryRadiusSome(index, item.x, item.z, 12, (i) => i.type === 'ZONE_INDUSTRIAL_L1');
    if (isNearIndustry) warnings.push("Terganggu kebisingan industri");
  }

  // 2b. Cek Bau Sampah dari Garbage (Tetap sama)
  if (isHouseZone(item.type) || isCommercialZone(item.type)) {
    const isNearGarbage = queryRadiusSome(index, item.x, item.z, GARBAGE_SMELL_RADIUS, (i) => i.type === 'RESOURCE_GARBAGE');
    if (isNearGarbage) warnings.push("Terganggu bau sampah");
  }

    // 3. Cek jangkauan fasilitas komersial — DIUBAH: L1 tetap radius 6, L2 pakai radius sendiri (10 ubin)
  if (isHouseZone(item.type)) {
    const l1Count = queryRadiusCount(
      index, item.x, item.z, 6,
      (i) => i.type === 'ZONE_COMMERCIAL_L1' && !i.isSecondary,
      2
    );
    const l2Count = queryRadiusCount(
      index, item.x, item.z, COMMERCIAL_L2_RADIUS,
      (i) => i.type === 'ZONE_COMMERCIAL_L2' && !i.isSecondary,
      2
    );
    const commercialCount = l1Count + l2Count;
    if (commercialCount === 0) {
      warnings.push("Di luar jangkauan area komersial");
    } else if (commercialCount === 1) {
      warnings.push("Fasilitas komersial kurang (Ideal: 2)");
    }
  }

  // 4. Cek Utilitas Listrik & Air (Tetap sama)
  if (isHouseZone(item.type)|| isCommercialZone(item.type) || item.type === 'ZONE_INDUSTRIAL_L1' || item.type === 'SERVICE_HOSPITAL' || item.type === 'SERVICE_POLICE' || item.type === 'SERVICE_FIREFIGHTER' || item.type === 'EDUCATION_ELEMENTARY' || item.type === 'EDUCATION_JUNIOR' || item.type === 'EDUCATION_HIGH') {
    const hasElectric = queryRadiusSome(index, item.x, item.z, 10, (i) => i.type === 'RESOURCE_ELECTRIC' && !i.isSecondary);
    if (!hasElectric) warnings.push("Tidak ada akses listrik");

    const hasWater = queryRadiusSome(index, item.x, item.z, 10, (i) => i.type === 'RESOURCE_WATER' && !i.isSecondary);
    if (!hasWater) warnings.push("Tidak ada akses air");
  }

  // 5. BARU: Cek jangkauan Rumah Sakit HANYA JIKA LEVEL 2 SUDAH TERBUKA
  if (isLevel2Unlocked && isHouseZone(item.type)) {
    const hasHospital = queryRadiusSome(index, item.x, item.z, HOSPITAL_RADIUS, (i) => {
      if (i.type !== 'SERVICE_HOSPITAL' || i.isSecondary) return false;
      const hospitalWarnings = i.warning || [];
      const isOperational = !hospitalWarnings.includes("Tidak ada akses listrik") && !hospitalWarnings.includes("Tidak ada akses air");
      return isOperational;
    });
    if (!hasHospital) warnings.push(HOSPITAL_WARNING_MSG);
  }

  return warnings.length > 0 ? warnings : undefined;
};

// BARU: Hitung kapasitas TPS global, lalu distribusikan kuotanya ke tiap rumah.
// Rumah yang tidak kebagian kuota akan mendapat peringatan.
const applyGarbageCapacityWarning = (items: PlacedItem[]): { items: PlacedItem[]; changed: boolean } => {
  let capacity = 0;

  // 1. Hitung total kapasitas TPS yang aktif
  items.forEach((item) => {
    if (item.type === 'RESOURCE_GARBAGE' && !item.isSecondary) {
      const noRoad = item.warning?.includes("Tidak ada akses jalan");
      if (!noRoad) capacity += GARBAGE_CAPACITY_PER_BUILDING;
    }
  });

  let changed = false;
  let remainingCapacity = capacity;

  // 2. Distribusikan kapasitas ke rumah-rumah secara berurutan
  const result = items.map((item) => {
  if (!isHouseZone(item.type) || item.isSecondary) return item;

    const pop = item.currentOccupants || 0;
    let isOverCapacity = false;

    if (pop > 0) {
      if (remainingCapacity >= pop) {
        remainingCapacity -= pop; // Kuota cukup, kurangi sisa kapasitas
      } else {
        remainingCapacity -= pop; // Kuota habis
        isOverCapacity = true;    // Rumah ini tidak kebagian TPS!
      }
    } else {
      // Jika rumah kosong tapi kapasitas global sudah habis, beri peringatan agar warga baru tidak masuk
      if (remainingCapacity <= 0) {
        isOverCapacity = true;
      }
    }

    const hasMsg = item.warning?.includes(GARBAGE_WARNING_MSG) ?? false;

    // Pasang atau lepas peringatan berdasarkan hasil kuota
    if (isOverCapacity && !hasMsg) {
      changed = true;
      return { ...item, warning: [...(item.warning || []), GARBAGE_WARNING_MSG] };
    }
    if (!isOverCapacity && hasMsg) {
      changed = true;
      const filtered = (item.warning || []).filter((w) => w !== GARBAGE_WARNING_MSG);
      return { ...item, warning: filtered.length > 0 ? filtered : undefined };
    }
    return item;
  });

  return { items: result, changed };
};

const pickNextHouseVariant = (history: HouseVariant[]): HouseVariant => {
  const remaining = ALL_HOUSE_VARIANTS.filter((v) => !history.includes(v));
  const pool = remaining.length > 0 ? remaining : ALL_HOUSE_VARIANTS;
  return pool[Math.floor(Math.random() * pool.length)];
};

const pickNextApartVariant = (history: ApartVariant[]): ApartVariant => {
  const remaining = ALL_APART_VARIANTS.filter((v) => !history.includes(v));
  const pool = remaining.length > 0 ? remaining : ALL_APART_VARIANTS;
  return pool[Math.floor(Math.random() * pool.length)];
};

const pickNextCommercialVariant = (history: CommercialVariant[]): CommercialVariant => {
  const remaining = ALL_COMMERCIAL_VARIANTS.filter((v) => !history.includes(v));
  const pool = remaining.length > 0 ? remaining : ALL_COMMERCIAL_VARIANTS;
  return pool[Math.floor(Math.random() * pool.length)];
};

const pickNextCommercialL2Variant = (history: CommercialL2Variant[]): CommercialL2Variant => {
  const remaining = ALL_COMMERCIAL_L2_VARIANTS.filter((v) => !history.includes(v));
  const pool = remaining.length > 0 ? remaining : ALL_COMMERCIAL_L2_VARIANTS;
  return pool[Math.floor(Math.random() * pool.length)];
};

// BARU: Fungsi untuk mendeteksi apakah suatu koordinat ubin adalah air
export const isWaterTile = (x: number, z: number) => {
  // 1. AREA LAUT UTAMA (Semua ubin dari batas atas sampai baris ke-15)
  if (x < 16) return true;

  // laut tambahan: Kanal memanjang ke kanan (Di depan laut)
  if (x >= 16 && x <= 17 && z >= 55 && z <= 112) return true;

  // Sungai: Sungai vertikal membelah kota ke bawah
  if (x >= 100 && x <= 111 && z >= 113 && z <= 127) return true;
  if (x >= 96 && x <= 107 && z >= 55 && z <= 112) return true;
  if (x >= 100 && x <= 127 && z >= 43 && z <= 54) return true;

  // Jika ubin tidak masuk area di atas, berarti daratan biasa
  return false; 
};

const generateInitialCity = (): PlacedItem[] => {
  const initialItems: PlacedItem[] = [];
  
  const midX = Math.floor(GRID_SIZE / 2);
  const midZ = Math.floor(GRID_SIZE / 2);

  // 1. Bangun jalan membentang sepanjang sumbu Z (serong kanan di kamera isometrik)
  for (let z = 0; z < GRID_SIZE; z++) {
    initialItems.push({
      x: midX,
      z: z,
      type: 'ROAD',
      rotation: Math.PI / 2, // Rotasi untuk jalan vertikal
      roadShape: 'STRAIGHT'
    });
  }

  // 2. Bangun satu rumah di sebelah jalan (karena jalan di midX, rumah ditaruh di midX - 1)
  initialItems.push({
    x: midX - 1,
    z: midZ, 
    type: 'ZONE_HOUSE_L1',
    rotation: 0, // Hadap kanan (ke arah jalan)
    houseVariant: 'HOUSE1',
    currentOccupants: 0, // BARU
    maxOccupants: 4      // BARU
  });

  return initialItems;
};

interface GrassTile {
  x: number;
  z: number;
  rotationY: number;
  scale: number;
}

// Generate posisi grass acak, hindari tile yang udah dipakai kota awal (jalan & rumah starter)
const generateGrassPositions = (excludeItems: PlacedItem[], count: number): GrassTile[] => {
  const occupied = new Set(excludeItems.map((i) => `${i.x},${i.z}`));
  const positions: GrassTile[] = [];
  let attempts = 0;
  const maxAttempts = count * 20; // batas percobaan biar nggak infinite loop kalau map penuh

  while (positions.length < count && attempts < maxAttempts) {
    attempts++;
    const x = Math.floor(Math.random() * GRID_SIZE);
    const z = Math.floor(Math.random() * GRID_SIZE);
    const key = `${x},${z}`;

    if (occupied.has(key)) continue;
    if (positions.some((p) => p.x === x && p.z === z)) continue;
    if (isWaterTile(x, z)) continue; // BARU: Jangan tumbuhkan rumput di atas air!

    positions.push({
      x,
      z,
      rotationY: Math.random() * Math.PI * 2, // rotasi acak biar nggak seragam
      scale: 0.8 + Math.random() * 0.4,        // variasi ukuran kecil, kesan lebih natural
    });
  }

  return positions;
};

const getRoadProperties = (roadX: number, roadZ: number, allItems: PlacedItem[], currentRotation: number) => {
    const hasUp = allItems.some(i => i.type === 'ROAD' && i.x === roadX && i.z === roadZ - 1);
    const hasDown = allItems.some(i => i.type === 'ROAD' && i.x === roadX && i.z === roadZ + 1);
    const hasLeft = allItems.some(i => i.type === 'ROAD' && i.x === roadX - 1 && i.z === roadZ);
    const hasRight = allItems.some(i => i.type === 'ROAD' && i.x === roadX + 1 && i.z === roadZ);

    let shape: 'STRAIGHT' | 'CORNER' | 'TEE' | 'CROSSROAD' = 'STRAIGHT';
    let rotation = currentRotation;

    const neighborCount = [hasUp, hasDown, hasLeft, hasRight].filter(Boolean).length;

    if (neighborCount === 4) {
      shape = 'CROSSROAD';
      rotation = 0;
    }
    if (neighborCount === 3) {
      shape = 'TEE';
      if (hasLeft && hasRight && hasDown && !hasUp) {
        rotation = -Math.PI / 2;
      } else if (hasUp && hasDown && hasLeft && !hasRight) {
        rotation = Math.PI;
      } else if (hasLeft && hasRight && hasUp && !hasDown) {
        rotation = Math.PI / 2;
      } else if (hasUp && hasDown && hasRight && !hasLeft) {
        rotation = 0;
      }
    } else if (neighborCount === 2) {
      if (hasUp && hasRight) {
        shape = 'CORNER';
        rotation = 0;
      } else if (hasRight && hasDown) {
        shape = 'CORNER';
        rotation = -Math.PI / 2;
      } else if (hasDown && hasLeft) {
        shape = 'CORNER';
        rotation = Math.PI;
      } else if (hasLeft && hasUp) {
        shape = 'CORNER';
        rotation = Math.PI / 2;
      } else if (hasUp && hasDown) {
        shape = 'STRAIGHT';
        rotation = Math.PI / 2;
      } else if (hasLeft && hasRight) {
        shape = 'STRAIGHT';
        rotation = 0;
      }
    } else if (neighborCount === 1) {
      if (hasUp || hasDown) {
        shape = 'STRAIGHT';
        rotation = Math.PI / 2;
      } else if (hasLeft || hasRight) {
        shape = 'STRAIGHT';
        rotation = 0;
      }
    }

    const openSides: Side[] = [];
    if (hasUp) openSides.push('N');
    if (hasDown) openSides.push('S');
    if (hasLeft) openSides.push('W');
    if (hasRight) openSides.push('E');


    return { shape, rotation, openSides };
  };

  // BARU: Cari semua ubin yang tergabung dalam satu bangunan multi-ubin — dipakai delete
  // supaya kena 1 ubin aja udah cukup buat hapus semuanya. Generik: menangani footprintOrigin
  // (school 2x2, dan bangunan multi-ubin baru lainnya ke depannya) MAUPUN Factory2 lama
  // (footprintDirection, tanpa footprintOrigin).
  const getFootprintGroupTiles = (item: PlacedItem, allItems: PlacedItem[]): { x: number; z: number }[] => {
    const originX = item.footprintOrigin ? item.footprintOrigin.x : item.x;
    const originZ = item.footprintOrigin ? item.footprintOrigin.z : item.z;
    const isPrimaryWithChildren = !item.footprintOrigin && allItems.some(
      (i) => i.footprintOrigin && i.footprintOrigin.x === item.x && i.footprintOrigin.z === item.z
    );

    if (item.footprintOrigin || isPrimaryWithChildren) {
      const group = allItems.filter(
        (i) =>
          (i.x === originX && i.z === originZ) ||
          (i.footprintOrigin && i.footprintOrigin.x === originX && i.footprintOrigin.z === originZ)
      );
      return group.map((i) => ({ x: i.x, z: i.z }));
    }

    // Factory2 lama: pasangan 1x2 lewat footprintDirection
    if (item.type === 'ZONE_INDUSTRIAL_L1' && item.industrialVariant === 'FACTORY2' && item.footprintDirection) {
      const dx = item.footprintDirection === 'X' ? 1 : 0;
      const dz = item.footprintDirection === 'Z' ? 1 : 0;
      const partnerX = item.isSecondary ? item.x - dx : item.x + dx;
      const partnerZ = item.isSecondary ? item.z - dz : item.z + dz;
      return [{ x: item.x, z: item.z }, { x: partnerX, z: partnerZ }];
    }

    return [{ x: item.x, z: item.z }];
  };

  // BARU: Komponen Efek Asap Kebakaran (Taruh di luar GridSystem)
const SMOKE_COUNT = 25;

function FireSmokeEffect({ position }: { position: [number, number, number] }) {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const dummy = useMemo(() => new THREE.Object3D(), []);

  // Inisialisasi posisi dan kecepatan acak untuk setiap gumpalan asap
  const particles = useMemo(() => {
    return Array.from({ length: SMOKE_COUNT }).map(() => ({
      x: (Math.random() - 0.5) * 8, // Sebar di sekitar area bangunan
      y: Math.random() * 40,        // Tinggi awal acak biar tidak muncul bersamaan
      z: (Math.random() - 0.5) * 8,
      speed: 15 + Math.random() * 10, // Kecepatan melayang naik
      scale: 1.5 + Math.random() * 2, // Ukuran gumpalan (buket) asap
      rotSpeed: (Math.random() - 0.5) * 2, // Kecepatan rotasi asap
    }));
  }, []);

  useFrame((_, delta) => {
    if (!meshRef.current) return;
    
    particles.forEach((p, i) => {
      p.y += p.speed * delta; // Asap bergerak naik
      
      // Jika asap sudah setinggi 40 meter, kembalikan ke lantai (siklus tiada henti)
      if (p.y > 40) {
        p.y = 0;
        p.x = (Math.random() - 0.5) * 8;
        p.z = (Math.random() - 0.5) * 8;
      }

      // Efek mengecil seiring naiknya asap agar terlihat memudar/hilang natural
      const currentScale = p.scale * (1 - (p.y / 40));

      dummy.position.set(p.x, p.y, p.z);
      dummy.rotation.x += p.rotSpeed * delta;
      dummy.rotation.y += p.rotSpeed * delta;
      dummy.rotation.z += p.rotSpeed * delta;
      dummy.scale.setScalar(Math.max(0.01, currentScale));
      dummy.updateMatrix();
      
      meshRef.current!.setMatrixAt(i, dummy.matrix);
    });
    
    meshRef.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <group position={position}>
      {/* Inti Api Low-Poly di dasar bangunan */}
      <mesh position={[0, 2, 0]}>
        <octahedronGeometry args={[3, 0]} />
        <meshStandardMaterial color="#ef4444" emissive="#f97316" emissiveIntensity={2} />
      </mesh>

      {/* Partikel Asap Instanced (Sangat ringan untuk performa) */}
      <instancedMesh ref={meshRef} args={[undefined, undefined, SMOKE_COUNT]}>
        <dodecahedronGeometry args={[1.5, 0]} />
        <meshStandardMaterial color="#374151" transparent opacity={0.8} />
      </instancedMesh>
    </group>
  );
}

// Komponen penunda visual peringatan
function DelayedWarning({ position }: { position: [number, number, number] }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Menghasilkan waktu acak antara 1.000 ms (1 detik) hingga 60.000 ms (60 detik)
    const delay = Math.floor(Math.random() * 59000) + 1000;
    
    const timer = setTimeout(() => {
      setVisible(true);
    }, delay);

    // Membersihkan timer jika masalah sudah diselesaikan sebelum bola muncul
    return () => clearTimeout(timer);
  }, []);

  if (!visible) return null;

  return (
    <mesh position={position}>
      <sphereGeometry args={[1.5, 16, 16]} />
      <meshStandardMaterial color="#ef4444" emissive="#ef4444" emissiveIntensity={0.6} />
    </mesh>
  );
}

export default function GridSystem({
  isGridMode,
  setIsGridMode,
  activeTool,
  isBuildMode,
  isDeleteMode,
  deleteRequest,
  onDeleteBoundsSelected,
  onDeleteHandled,
  onInspectItem,
  inspectedItem,
  onUpdateStats,
  onBuildCost,
  onFinancialTick,
  money,
  onSelectionCostChange,
  triggerFireSignal,
  triggerRobberySignal,
  dispatchRequest,
  onDispatchHandled,
  onIncidentUpdate,
}: GridSystemProps) {
  const [startTile, setStartTile] = useState<{ x: number; z: number } | null>(null);

  const [hoverTile, setHoverTile] = useState<{ x: number; z: number } | null>(null);

  const [currentTile, setCurrentTile] = useState<{ x: number; z: number } | null>(null);
  const [houseBagHistory, setHouseBagHistory] = useState<HouseVariant[]>([]);
  const [apartBagHistory, setApartBagHistory] = useState<ApartVariant[]>([]);
  const [commercialBagHistory, setCommercialBagHistory] = useState<CommercialVariant[]>([]);
  const [commercialL2BagHistory, setCommercialL2BagHistory] = useState<CommercialL2Variant[]>([]);

  const [fireIncident, setFireIncident] = useState<{ x: number; z: number } | null>(null);
  const [robberyIncident, setRobberyIncident] = useState<{ x: number; z: number } | null>(null);
  const [policeRoute, setPoliceRoute] = useState<RouteSegment[] | null>(null);
  const [firefighterRoute, setFirefighterRoute] = useState<RouteSegment[] | null>(null);

  // Kandidat bangunan yang bisa kena insiden: rumah, komersial, industri, rumah sakit
const INCIDENT_CANDIDATE_TYPES: BuildTool[] = ['ZONE_HOUSE_L1', 'ZONE_HOUSE_L2', 'ZONE_COMMERCIAL_L1', 'ZONE_COMMERCIAL_L2', 'ZONE_INDUSTRIAL_L1', 'SERVICE_HOSPITAL'];

const MIN_SPAWN_DELAY = 60 * 1000;       // 1 menit
const MAX_SPAWN_DELAY = 15 * 60 * 1000;  // 15 menit
const COOLDOWN_DELAY = 2 * 60 * 1000;    // 2 menit

const randomDelay = () => MIN_SPAWN_DELAY + Math.random() * (MAX_SPAWN_DELAY - MIN_SPAWN_DELAY);

const fireIncidentRef = useRef<{ x: number; z: number } | null>(null);
const robberyIncidentRef = useRef<{ x: number; z: number } | null>(null);

  useEffect(() => {
    fireIncidentRef.current = fireIncident;
  }, [fireIncident]);

  useEffect(() => {
    robberyIncidentRef.current = robberyIncident;
  }, [robberyIncident]);

  const handlePoliceArrive = () => {
    setRobberyIncident(null);
    setPoliceRoute(null);

    // Cooldown 2 menit dulu sebelum kerampokan berikutnya bisa mulai dijadwalkan
    if (robberyTimerRef.current) clearTimeout(robberyTimerRef.current);
    robberyTimerRef.current = setTimeout(() => {
      scheduleNextRobbery();
    }, COOLDOWN_DELAY);
  };

  const handleFirefighterArrive = () => {
    setFireIncident(null);
    setFirefighterRoute(null);

    // Cooldown 2 menit dulu sebelum kebakaran berikutnya bisa mulai dijadwalkan
    if (fireTimerRef.current) clearTimeout(fireTimerRef.current);
    fireTimerRef.current = setTimeout(() => {
      scheduleNextFire();
    }, COOLDOWN_DELAY);
  };

  const [placedItems, setPlacedItems] = useState<PlacedItem[]>(() => {
    const rawItems = generateInitialCity();
    
    // Konfigurasi rotasi awal
    const configuredItems = rawItems.map(item => {
      if (item.type === 'ZONE_HOUSE_L1') {
        return {
           ...item,
           rotation: 0 
        };
      }
      return item;
    });

    const initialIndex = buildSpatialIndex(configuredItems);
    const withRoadProps = configuredItems.map(item => {
      if (item.type === 'ROAD') {
        const { shape, rotation, openSides } = getRoadProperties(item.x, item.z, configuredItems, item.rotation);
        return { ...item, roadShape: shape, rotation, openSides };
      }
      return item;
    });
    const withWarnings = withRoadProps.map(item => ({
      ...item,
      // Saat kota baru dibuat (0 penduduk), Level 2 pasti false
      warning: getBuildingWarning(item, buildSpatialIndex(withRoadProps), false) 
    }));
    return applyGarbageCapacityWarning(withWarnings).items;
  });

  const occupiedTiles = useMemo(
    () => new Set(placedItems.map((item) => `${item.x},${item.z}`)),
    [placedItems]
  );

  const [grassTiles] = useState<GrassTile[]>(() => {
    const initialCity = generateInitialCity();
    return generateGrassPositions(initialCity, 400);
  });

  const visibleGrassTransforms: GrassTileTransform[] = useMemo(() => {
    return grassTiles
      .filter((g) => !occupiedTiles.has(`${g.x},${g.z}`))
      .map((g) => ({
        x: g.x * TILE_SIZE + TILE_SIZE / 2,
        z: g.z * TILE_SIZE + TILE_SIZE / 2,
        rotationY: g.rotationY,
        scale: g.scale,
      }));
  }, [grassTiles, occupiedTiles]);

  const groupedRenderData = useMemo(() => {
    const occupied = new Set<string>();
    const houses: Record<HouseVariant, InstanceTransform[]> = { HOUSE1: [], HOUSE2: [], HOUSE3: [] };
    const apartments: Record<ApartVariant, InstanceTransform[]> = {
      APART1: [], APART2: [], APART3: [], APART4: [],
    };
    const commercial: Record<CommercialVariant, InstanceTransform[]> = { MARKET: [], WARTEG: [] };
    const commercialL2: Record<CommercialL2Variant, InstanceTransform[]> = { SUPERMARKET: [], SHOP: [] };
    const industrial: Record<IndustrialVariant, InstanceTransform[]> = { FACTORY1: [], FACTORY2: [] };
    const roads: Record<'STRAIGHT' | 'CORNER' | 'TEE' | 'CROSSROAD', InstanceTransform[]> = {
      STRAIGHT: [], CORNER: [], TEE: [], CROSSROAD: [],
    };
    const nature: Record<'TREE1' | 'TREE2' | 'FOUNTAIN', InstanceTransform[]> = {
      TREE1: [], TREE2: [], FOUNTAIN: [],
    };
    const resources: { ELECTRIC: InstanceTransform[]; WATER: InstanceTransform[]; GARBAGE: InstanceTransform[] } = { ELECTRIC: [], WATER: [], GARBAGE: [] };
    const service: Record<'HOSPITAL' | 'POLICE' | 'FIREFIGHTER', InstanceTransform[]> = {
      HOSPITAL: [], POLICE: [], FIREFIGHTER: [],
    };

    const education: { SCHOOL_ELEMENTARY: InstanceTransform[]; SCHOOL_JUNIOR: InstanceTransform[]; SCHOOL_HIGH: InstanceTransform[] } = {
      SCHOOL_ELEMENTARY: [], SCHOOL_JUNIOR: [], SCHOOL_HIGH: [],
    };

    placedItems.forEach((item) => {
      occupied.add(`${item.x},${item.z}`);

      if (item.isSecondary) return;

      let posX = item.x * TILE_SIZE + TILE_SIZE / 2;
      let posZ = item.z * TILE_SIZE + TILE_SIZE / 2;

      if (item.type === 'ZONE_HOUSE_L1' && item.houseVariant) {
        houses[item.houseVariant as HouseVariant].push({ position: [posX, 0.05, posZ], rotationY: item.rotation });
      } else if (item.type === 'ZONE_HOUSE_L2' && item.houseVariant) {
        apartments[item.houseVariant as ApartVariant].push({ position: [posX, 0.05, posZ], rotationY: item.rotation });
      } else if (item.type === 'ZONE_COMMERCIAL_L1' && item.commercialVariant) {
        commercial[item.commercialVariant as CommercialVariant].push({ position: [posX, 0.05, posZ], rotationY: item.rotation });
      } else if (item.type === 'ZONE_COMMERCIAL_L2' && item.commercialVariant) {
        const centerX = item.x * TILE_SIZE + TILE_SIZE;
        const centerZ = item.z * TILE_SIZE + TILE_SIZE;
        const transform = { position: [centerX, 0.05, centerZ] as [number, number, number], rotationY: item.rotation };
        if (item.commercialVariant === 'SUPERMARKET') commercialL2.SUPERMARKET.push(transform);
        else commercialL2.SHOP.push(transform);
      } else if (item.type === 'ZONE_INDUSTRIAL_L1' && item.industrialVariant) {
        if (item.industrialVariant === 'FACTORY2') {
          const isPrimaryFacing = item.rotation === Math.PI / 2 || item.rotation === 0;
          const offset = isPrimaryFacing ? TILE_SIZE : 0;
          if (item.footprintDirection === 'X') posX += offset;
          else if (item.footprintDirection === 'Z') posZ += offset;
        }
        industrial[item.industrialVariant].push({ position: [posX, 0.05, posZ], rotationY: item.rotation });
      } else if (item.type === 'ROAD' && item.roadShape) {
        roads[item.roadShape].push({ position: [posX, 0.05, posZ], rotationY: item.rotation });
      } else if (item.type === 'RESOURCE_ELECTRIC') {
        resources.ELECTRIC.push({ position: [posX, 0.05, posZ], rotationY: item.rotation });
      } else if (item.type === 'RESOURCE_WATER') {
        resources.WATER.push({ position: [posX, 0.05, posZ], rotationY: item.rotation });
      } else if (item.type === 'RESOURCE_GARBAGE') {
        resources.GARBAGE.push({ position: [posX, 0.05, posZ], rotationY: item.rotation });
      } else if (item.type === 'EDUCATION_ELEMENTARY' || item.type === 'EDUCATION_JUNIOR' || item.type === 'EDUCATION_HIGH') {
        const centerX = item.x * TILE_SIZE + TILE_SIZE;
        const centerZ = item.z * TILE_SIZE + TILE_SIZE;
        const transform = { position: [centerX, 0.05, centerZ] as [number, number, number], rotationY: item.rotation };
        if (item.type === 'EDUCATION_ELEMENTARY') education.SCHOOL_ELEMENTARY.push(transform);
        else if (item.type === 'EDUCATION_JUNIOR') education.SCHOOL_JUNIOR.push(transform);
        else education.SCHOOL_HIGH.push(transform);
      } else if (item.type === 'NATURE_TREE1') {
        nature.TREE1.push({ position: [posX, 0.05, posZ], rotationY: 0 });
      } else if (item.type === 'NATURE_TREE2') {
        nature.TREE2.push({ position: [posX, 0.05, posZ], rotationY: 0 });
      } else if (item.type === 'NATURE_FOUNTAIN') {
        nature.FOUNTAIN.push({ position: [posX, 0.05, posZ], rotationY: 0 });
      } else if (item.type === 'SERVICE_HOSPITAL') {
        service.HOSPITAL.push({ position: [posX, 0.05, posZ], rotationY: item.rotation });
      } else if (item.type === 'SERVICE_POLICE') {
        service.POLICE.push({ position: [posX, 0.05, posZ], rotationY: item.rotation });
      } else if (item.type === 'SERVICE_FIREFIGHTER') {
        service.FIREFIGHTER.push({ position: [posX, 0.05, posZ], rotationY: item.rotation });
      }
    });

    return { occupied, houses, apartments, commercial, industrial, roads, resources, nature, service, education, commercialL2 };
  }, [placedItems]);

  const laneCache = useMemo(() => {
    const roadItems = placedItems
      .filter((i) => i.type === 'ROAD')
      .map((i) => ({ x: i.x, z: i.z, openSides: i.openSides }));
    return buildLaneCache(roadItems, TILE_SIZE);
  }, [placedItems]);

  const pointerDownRef = useRef<{ x: number; y: number } | null>(null);

  const mapSize = GRID_SIZE * TILE_SIZE;
  const centerOffset = mapSize / 2;

  // KALKULATOR RCI (Permintaan)
  const calculateDemand = (items: PlacedItem[]) => {
    let pop = 0;
    let cJobs = 0;
    let iJobs = 0;
    
    let hCount = 0;
    let cCount = 0;
    let cDeficit = 0; // Akumulasi total kebutuhan komersial dari seluruh rumah

    items.forEach(item => {
      if (!item.isSecondary) {
        if (isHouseZone(item.type)) {
          pop += item.currentOccupants || 0;
          hCount++;
          
          // BARU: Menghitung akumulasi kebutuhan komersial tiap rumah
          if (item.warning?.includes("Di luar jangkauan area komersial")) {
            cDeficit += 2; // Butuh mendesak (Krisis)
          } else if (item.warning?.includes("Fasilitas komersial kurang (Ideal: 2)")) {
            cDeficit += 1; // Butuh tambahan 1 toko lagi
          }
        }
        
        if (isCommercialZone(item.type)) {
          const defaultMax = item.type === 'ZONE_COMMERCIAL_L2' ? COMMERCIAL_L2_JOB_CAPACITY : 4;
          cJobs += item.maxWorkers || defaultMax;
          cCount++;
        }
        
        if (item.type === 'ZONE_INDUSTRIAL_L1') {
          iJobs += item.maxWorkers || (item.industrialVariant === 'FACTORY2' ? 16 : 8);
        }
      }
    });

    const totalJobs = cJobs + iJobs;
    const laborShortage = totalJobs - pop; 

    // Permintaan R dan I tetap berdasarkan rasio pengangguran vs lowongan global
    const rDemand = Math.max(0, Math.min(100, 50 + (laborShortage * 3))); 
    const iDemand = Math.max(0, Math.min(100, 50 + (-laborShortage * 3)));

    // BARU: Permintaan C (Komersial) dihitung dari akumulasi defisit fasilitas lokal
    let baseCDemand = 50;
    if (hCount > 0 || cCount > 0) {
      // Idealnya 1 toko cukup melayani 2 rumah
      const idealC = Math.ceil(hCount / 2); 
      // Hitung toko yang berlebih (tidak efisien) di dalam kota
      const oversupply = Math.max(0, cCount - idealC);
      
      // Rumus: Base(50) + (Tiap poin kebutuhan menaikkan 5%) - (Tiap toko berlebih menurunkan 10%)
      baseCDemand = 50 + (cDeficit * 5) - (oversupply * 10);
    }
    const cDemand = Math.max(0, Math.min(100, baseCDemand));

    return { r: rDemand, c: cDemand, i: iDemand };
  };

  useEffect(() => {
    if (!dispatchRequest) return;

    const target = dispatchRequest.type === 'POLICE' ? robberyIncident : fireIncident;
    if (!target) { onDispatchHandled?.(); return; }

    const roadTiles = placedItems.filter((i) => i.type === 'ROAD');
    const route = buildDispatchRoute(
      { x: dispatchRequest.x, z: dispatchRequest.z },
      target,
      roadTiles,
      laneCache,
      TILE_SIZE
    );

    if (route) {
      if (dispatchRequest.type === 'POLICE') setPoliceRoute(route);
      else setFirefighterRoute(route);
    }

    onDispatchHandled?.();
  }, [dispatchRequest]);

  useEffect(() => {
    onIncidentUpdate?.({ fire: fireIncident, robbery: robberyIncident });
  }, [fireIncident, robberyIncident]);

  // MESIN WAKTU (GAME LOOP): Pertumbuhan Penduduk & Distribusi Pekerja Lintas Zona (Tiap 3 Detik)
  useEffect(() => {
    const tickInterval = setInterval(() => {
      setPlacedItems((prev) => {
        let hasChanges = false;
        let totalPop = 0; 
        
        // Array untuk melacak sisa tenaga kerja per rumah beserta koordinatnya
        const housesWithWorkers: { x: number, z: number, available: number, employed: number }[] = [];

        // BARU: Hitung Permintaan Saat Ini
        // BARU: Hitung Permintaan Saat Ini
        const { r } = calculateDemand(prev);

        // BARU: Kuota migrasi per siklus (mencegah lonjakan serentak / yo-yo effect)
        let growthLimit = r >= 80 ? 10 : (r >= 60 ? 5 : (r >= 40 ? 2 : 0));
        let exodusLimit = r === 0 ? 10 : (r <= 10 ? 3 : 0);

        // FASE 1: Pertumbuhan Penduduk, Eksodus, & Pendataan Tenaga Kerja
        const afterGrowth = prev.map(item => {
        if (isHouseZone(item.type) && !item.isSecondary) {
          const warnings = Array.isArray(item.warning) ? item.warning : [];
          const isIsolated = warnings.includes("Tidak ada akses jalan");
          const isPolluted = warnings.includes("Terganggu kebisingan industri") || warnings.includes("Terganggu bau sampah");

          const noElectric = warnings.includes("Tidak ada akses listrik");
          const noWater = warnings.includes("Tidak ada akses air");

          const noCommercial = warnings.includes("Di luar jangkauan area komersial");
          const lackingCommercial = warnings.includes("Fasilitas komersial kurang (Ideal: 2)");

          const noGarbage = warnings.includes(GARBAGE_WARNING_MSG);
          const noHospital = warnings.includes(HOSPITAL_WARNING_MSG);

          // BARU: cek apakah rumah ini SEDANG kena insiden aktif
          const fire = fireIncidentRef.current;
          const robbery = robberyIncidentRef.current;
          const isUnderIncident =
            (fire && fire.x === item.x && fire.z === item.z) ||
            (robbery && robbery.x === item.x && robbery.z === item.z);

          let current = item.currentOccupants || 0;
          const max = lackingCommercial ? 2 : (item.maxOccupants || 4);
          let outage = item.outageTicks || 0;

          const hasUtilityIssue = noElectric || noWater || noCommercial || noGarbage || noHospital;

          if (isUnderIncident) {
            // Selama insiden aktif: rumah ini dibekukan total dari sistem pertumbuhan/eksodus normal.
            // Pengurangan populasinya murni ditangani oleh efek insiden (interval 9 detik) di tempat lain.
            totalPop += current;
            if (!isIsolated && current > 0) {
              housesWithWorkers.push({ x: item.x, z: item.z, available: current, employed: 0 });
            }
            return { ...item, currentOccupants: current, outageTicks: outage };
          }

          // Skenario A: Krisis Fatal
            if (hasUtilityIssue && current > 0) {
              outage += 1;
              hasChanges = true;
              if (outage >= 22) { // DIUBAH: Dari 5 menjadi 22 (memberi toleransi 66 detik)
                current -= 1; 
                outage = 0;   
              }
            } 
            // Skenario B: Krisis Minor
            else if (!hasUtilityIssue && current > max) {
              outage += 1;
              hasChanges = true;
              if (outage >= 22) { // DIUBAH: Dari 5 menjadi 22
                current -= 1; 
                outage = 0;
              }
            }
            // Skenario C: Utilitas aman, kota bertumbuh sesuai kapasitas dinamis
            else if (!hasUtilityIssue) {
              if (outage > 0) {
                outage = 0; 
                hasChanges = true; 
              }
              
              if (!isIsolated && !isPolluted) {
                 if (r <= 10 && current > 0 && exodusLimit > 0) {
                    hasChanges = true;
                    current -= 1;
                    exodusLimit -= 1; 
                 } else if (r >= 40 && current < max && growthLimit > 0) {
                    hasChanges = true;
                    current += 1;
                    growthLimit -= 1; 
                 }
              }
            }

            totalPop += current;

            // Jika rumah tidak terisolasi dan masih ada warga, masukkan bursa kerja
            if (!isIsolated && current > 0) {
              housesWithWorkers.push({ x: item.x, z: item.z, available: current, employed: 0 });
            }

            return { ...item, currentOccupants: current, outageTicks: outage };
          }
          return item;
        });

        const allocations = new Map<string, number>();

        // FASE 2: Distribusi Komersial (Prioritas 1, Wajib Radius 10 Ubin)
        afterGrowth.forEach(item => {
          if (isCommercialZone(item.type) && !item.isSecondary) {
            const warnings = Array.isArray(item.warning) ? item.warning : [];
            const noRoad = warnings.includes("Tidak ada akses jalan");
            const noElectric = warnings.includes("Tidak ada akses listrik");
            const noWater = warnings.includes("Tidak ada akses air");
            
            // Toko hanya beroperasi jika punya jalan, listrik, dan air
            const isOperational = !noRoad && !noElectric && !noWater;

            let allocated = 0;
            let needed = item.type === 'ZONE_COMMERCIAL_L2' ? COMMERCIAL_L2_JOB_CAPACITY : 4;

            if (isOperational) {
              for (let i = 0; i < housesWithWorkers.length; i++) {
                if (needed === 0) break;
                
                const house = housesWithWorkers[i];
                if (house.available > 0) {
                  const distance = Math.sqrt(Math.pow(item.x - house.x, 2) + Math.pow(item.z - house.z, 2));
                  if (distance <= 10) {
                    const take = Math.min(needed, house.available);
                    house.available -= take; 
                    house.employed += take; 
                    needed -= take;
                    allocated += take;
                  }
                }
              }
            }
            allocations.set(`${item.x},${item.z}`, allocated);
          }
        });

        // FASE 3: Distribusi Industri (Prioritas 2, Penyerapan Sisa Global)
        afterGrowth.forEach(item => {
          if (item.type === 'ZONE_INDUSTRIAL_L1' && !item.isSecondary) {
            const warnings = Array.isArray(item.warning) ? item.warning : [];
            const noRoad = warnings.includes("Tidak ada akses jalan");
            const noElectric = warnings.includes("Tidak ada akses listrik");
            const noWater = warnings.includes("Tidak ada akses air");
            
            // Pabrik hanya beroperasi jika punya jalan, listrik, dan air
            const isOperational = !noRoad && !noElectric && !noWater;

            let allocated = 0;

            if (isOperational) {
              const maxW = item.industrialVariant === 'FACTORY2' ? 16 : 8;
              let needed = maxW;
              
              for (let i = 0; i < housesWithWorkers.length; i++) {
                if (needed === 0) break;
                
                const house = housesWithWorkers[i];
                if (house.available > 0) {
                  const take = Math.min(needed, house.available);
                  house.available -= take;
                  house.employed += take; 
                  needed -= take;
                  allocated += take;
                }
              }
            }
            allocations.set(`${item.x},${item.z}`, allocated);
          }
        });

        // FASE 4: Terapkan Alokasi Pekerja & Status Rumah ke Data Akhir
        const finalItems = afterGrowth.map(item => {
          if (item.type === 'ZONE_HOUSE_L1' && !item.isSecondary) {
            const houseData = housesWithWorkers.find(h => h.x === item.x && h.z === item.z);
            const emp = houseData ? houseData.employed : 0; // Jika rumah offline, pekerja 0
            if (item.employedOccupants !== emp) {
              hasChanges = true;
              return { ...item, employedOccupants: emp };
            }
            } else if ((isCommercialZone(item.type) || item.type === 'ZONE_INDUSTRIAL_L1') && !item.isSecondary) {
              const allocated = allocations.get(`${item.x},${item.z}`) || 0;
              const maxW = item.type === 'ZONE_COMMERCIAL_L2' ? COMMERCIAL_L2_JOB_CAPACITY : item.type === 'ZONE_COMMERCIAL_L1' ? 4 : (item.industrialVariant === 'FACTORY2' ? 16 : 8);
            
            if (item.currentWorkers !== allocated || item.maxWorkers !== maxW) {
              hasChanges = true;
              return { ...item, currentWorkers: allocated, maxWorkers: maxW };
            }
          }
          return item;
        });

        // FASE 4b: BARU - Sinkronisasi warning kapasitas TPS global (populasi bisa berubah tiap tick,
        // jumlah Garbage tidak berubah di sini, tapi cek tetap dijalankan tiap tick karena populasi dinamis)
        const { items: finalItemsWithGarbage, changed: garbageChanged } = applyGarbageCapacityWarning(finalItems);
        if (garbageChanged) hasChanges = true;

        // FASE 5: Penarikan Pajak & Biaya Pemeliharaan
        // BARU: Pajak & pemeliharaan cuma aktif kalau sudah ada minimal 1 penduduk.
        // Sebelum itu (kota baru dibuka, 0 penduduk), sistem finansial dibekukan total.
        if (totalPop > 0) {
          let tickIncome = 0;
          let tickExpense = 0;

          finalItemsWithGarbage.forEach(item => {
            if (!item.isSecondary) {
              // Pemasukan dari Pajak (Sistem Deflasi Baru)
              if (isHouseZone(item.type)) tickIncome += (item.currentOccupants || 0) * 5;
              if (isCommercialZone(item.type)) tickIncome += (item.currentWorkers || 0) * 15;
              if (item.type === 'ZONE_INDUSTRIAL_L1') tickIncome += (item.currentWorkers || 0) * 40;

              // Pengeluaran dari Pemeliharaan
              if (item.type === 'ROAD') tickExpense += 2;
            }
          });

          if (onFinancialTick) {
            onFinancialTick(tickIncome - tickExpense);
          }
        }

        return hasChanges ? finalItemsWithGarbage : prev;
      });
    }, 3000);

    return () => clearInterval(tickInterval);
  }, []);

  // KALKULATOR STATISTIK & PEMBARUAN INSPEKTUR REAL-TIME
  useEffect(() => {
    let totalPop = 0;
    let totalCap = 0;
    
    placedItems.forEach(item => {
      if (isHouseZone(item.type) && !item.isSecondary) {
        totalPop += (item.currentOccupants || 0);
        totalCap += (item.maxOccupants || 4);
      }
    });

    const demandStats = calculateDemand(placedItems);

    // Kirim data ke panel UI
    if (onUpdateStats) {
      onUpdateStats({ population: totalPop, capacity: totalCap, demand: demandStats });
    }

    if (inspectedItem && onInspectItem) {
      // ... (biarkan logika inspektur di bawahnya sama persis)
      const updatedItem = placedItems.find(i => i.x === inspectedItem.x && i.z === inspectedItem.z);
      if (updatedItem && (
          updatedItem.currentOccupants !== inspectedItem.currentOccupants || 
          updatedItem.employedOccupants !== inspectedItem.employedOccupants || // Pemicu pembaruan UI
          updatedItem.currentWorkers !== inspectedItem.currentWorkers ||
          JSON.stringify(updatedItem.warning) !== JSON.stringify(inspectedItem.warning) // BARU: pantau perubahan warning (termasuk kapasitas TPS)
      )) {
        onInspectItem(updatedItem);
      }
    }
  }, [placedItems]);

  // KALKULATOR BIAYA REAL-TIME SAAT SELEKSI UBIN (DRAG)
  useEffect(() => {
    if (!startTile || !currentTile || isDeleteMode || !isBuildMode) {
      if (onSelectionCostChange) onSelectionCostChange(0);
      return;
    }

    const minX = Math.min(startTile.x, currentTile.x);
    const maxX = Math.max(startTile.x, currentTile.x);
    const minZ = Math.min(startTile.z, currentTile.z);
    const maxZ = Math.max(startTile.z, currentTile.z);

    const diffX = Math.abs(currentTile.x - startTile.x);
    const diffZ = Math.abs(currentTile.z - startTile.z);

    const tempItems: PlacedItem[] = [];
    
    // Simulasikan pembuatan ubin di memori untuk menghitung estimasi
    if (activeTool === 'ZONE_INDUSTRIAL_L1') {
      const isHorizontal = diffX >= diffZ;
      if (isHorizontal) {
        for (let z = minZ; z <= maxZ; z++) {
          let x = minX;
          while (x <= maxX) {
            const remaining = maxX - x + 1;
            if (remaining >= 2) {
              tempItems.push({ x, z, type: activeTool, rotation: Math.PI / 2, industrialVariant: 'FACTORY2', isSecondary: false });
              tempItems.push({ x: x + 1, z, type: activeTool, rotation: Math.PI / 2, industrialVariant: 'FACTORY2', isSecondary: true });
              x += 2;
            } else {
              tempItems.push({ x, z, type: activeTool, rotation: 0, industrialVariant: 'FACTORY1' });
              x += 1;
            }
          }
        }
      } else {
        for (let x = minX; x <= maxX; x++) {
          let z = minZ;
          while (z <= maxZ) {
            const remaining = maxZ - z + 1;
            if (remaining >= 2) {
              tempItems.push({ x, z, type: activeTool, rotation: Math.PI, industrialVariant: 'FACTORY2', isSecondary: false });
              tempItems.push({ x, z: z + 1, type: activeTool, rotation: Math.PI, industrialVariant: 'FACTORY2', isSecondary: true });
              z += 2;
            } else {
              tempItems.push({ x, z, type: activeTool, rotation: 0, industrialVariant: 'FACTORY1' });
              z += 1;
            }
          }
        }
      }
    } else {
      for (let x = minX; x <= maxX; x++) {
        for (let z = minZ; z <= maxZ; z++) {
          tempItems.push({ x, z, type: activeTool, rotation: 0, roadShape: 'STRAIGHT' });
        }
      }
    }

    // Filter ubin yang bertabrakan dengan bangunan yang sudah ada
    const validTempItems = tempItems.filter(
      (newItem) => !placedItems.some((p) => p.x === newItem.x && p.z === newItem.z)
    );

    let totalCost = 0;
    validTempItems.forEach(item => {
      if (!item.isSecondary) {
        totalCost += BUILD_COSTS[item.type] || 0;
      }
    });

    if (onSelectionCostChange) {
      onSelectionCostChange(totalCost);
    }
  }, [startTile, currentTile, activeTool, isBuildMode, isDeleteMode, placedItems]);

  // Keluar dari mode Build maupun Hapus membatalkan seleksi ubin yang sedang berjalan
  useEffect(() => {
    if (!isBuildMode && !isDeleteMode) {
      setStartTile(null);
      setCurrentTile(null);
    }
  }, [isBuildMode, isDeleteMode]);

  // Eksekusi hapus setelah user konfirmasi lewat modal, atau batalkan kalau ditolak
  useEffect(() => {
    if (!deleteRequest) return;

    if (deleteRequest.status === 'confirmed') {
      const { minX, maxX, minZ, maxZ } = deleteRequest.bounds;

      setPlacedItems((prev) => {
        // 1. Cari semua item yang kena kotak seleksi (bisa cuma sebagian dari bangunan multi-ubin)
        const touchedItems = prev.filter(
          (item) => item.x >= minX && item.x <= maxX && item.z >= minZ && item.z <= maxZ
        );

        // 2. BARU: Perluas ke seluruh ubin bangunan multi-ubin (2x2, Factory2, dst) walau
        // cuma 1 ubin yang tersentuh kotak seleksi
        const deleteTileSet = new Set<string>();
        touchedItems.forEach((item) => {
          getFootprintGroupTiles(item, prev).forEach((t) => deleteTileSet.add(`${t.x},${t.z}`));
        });

        const remaining = prev.filter((item) => !deleteTileSet.has(`${item.x},${item.z}`));

        const withRotations = remaining.map((item) => {
        let newItem = { ...item };

        const isStandardMovable = newItem.type === 'ZONE_HOUSE_L1' ||
                  newItem.type === 'ZONE_COMMERCIAL_L1' ||
                  (newItem.type === 'ZONE_INDUSTRIAL_L1' && newItem.industrialVariant === 'FACTORY1') ||
                  newItem.type === 'RESOURCE_ELECTRIC' ||
                  newItem.type === 'RESOURCE_WATER' ||
                  newItem.type === 'RESOURCE_GARBAGE' ||
                  newItem.type === 'SERVICE_HOSPITAL' ||
                  newItem.type === 'SERVICE_POLICE' ||
                  newItem.type === 'SERVICE_FIREFIGHTER' ||
                  ((newItem.type === 'EDUCATION_ELEMENTARY' || newItem.type === 'EDUCATION_JUNIOR' || newItem.type === 'EDUCATION_HIGH' || newItem.type === 'ZONE_COMMERCIAL_L2') && !newItem.isSecondary);

        if (isStandardMovable) {
          newItem.rotation = getHouseRotation(newItem.x, newItem.z, remaining, newItem.rotation);
        } else if (newItem.type === 'ZONE_INDUSTRIAL_L1' && newItem.industrialVariant === 'FACTORY2' && !newItem.isSecondary) {
          newItem.rotation = getFactory2Rotation(newItem, remaining);
        } else if (newItem.type === 'ROAD') {
          const { shape, rotation, openSides } = getRoadProperties(newItem.x, newItem.z, remaining, newItem.rotation);
          newItem.roadShape = shape;
          newItem.rotation = rotation;
          newItem.openSides = openSides;
        }

        return newItem;
      });

      // Dirty-tracking: DIUBAH — pakai deleteTileSet, bukan loop bounds asli,
      // karena ubin yang kehapus bisa lebih luas dari kotak seleksi (kena footprint expansion)
      const spatialIndex = buildSpatialIndex(withRotations);
      const changedCoords = Array.from(deleteTileSet).map((key) => {
        const [x, z] = key.split(',').map(Number);
        return { x, z };
      });
      const affected = findAffectedItems(withRotations, changedCoords);

      const withWarnings = withRotations.map((item) => {
        if (item.isSecondary) return item;
        if (!affected.has(item)) return item;
        // DIUBAH:
        return { ...item, warning: getBuildingWarning(item, spatialIndex, isLevel2UnlockedRef.current) };
      });

      return applyGarbageCapacityWarning(withWarnings).items;
      });

      onDeleteHandled();
    }

    if (deleteRequest.status === 'cancelled') {
      onDeleteHandled();
    }
  }, [deleteRequest]);

  // Efek samping kebakaran — tiap 9 detik, penduduk berkurang 1 DAN kas kota berkurang 500
  useEffect(() => {
    if (!fireIncident) return;

    const interval = setInterval(() => {
      setPlacedItems((prev) =>
        prev.map((item) => {
          if (
            isHouseZone(item.type) &&
            !item.isSecondary &&
            item.x === fireIncident.x &&
            item.z === fireIncident.z
          ) {
            const current = item.currentOccupants || 0;
            if (current <= 0) return item;
            return { ...item, currentOccupants: current - 1 };
          }
          return item;
        })
      );

      onFinancialTick?.(-500); // BARU: kerugian finansial akibat kebakaran
    }, 9000);

    return () => clearInterval(interval);
  }, [fireIncident]);

  // Efek samping kerampokan — tiap 9 detik, penduduk berkurang 1 DAN kas kota berkurang 500
  useEffect(() => {
    if (!robberyIncident) return;

    const interval = setInterval(() => {
      setPlacedItems((prev) =>
        prev.map((item) => {
          if (
            isHouseZone(item.type) &&
            !item.isSecondary &&
            item.x === robberyIncident.x &&
            item.z === robberyIncident.z
          ) {
            const current = item.currentOccupants || 0;
            if (current <= 0) return item;
            return { ...item, currentOccupants: current - 1 };
          }
          return item;
        })
      );

      onFinancialTick?.(-500); // BARU: kerugian finansial akibat kerampokan
    }, 9000);

    return () => clearInterval(interval);
  }, [robberyIncident]);

    useEffect(() => { fireIncidentRef.current = fireIncident; }, [fireIncident]);
  useEffect(() => { robberyIncidentRef.current = robberyIncident; }, [robberyIncident]);

  const placedItemsRef = useRef<PlacedItem[]>(placedItems);
  useEffect(() => { placedItemsRef.current = placedItems; }, [placedItems]);

  const fireTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const robberyTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const pickIncidentCandidate = () => {
    // BARU: Hentikan insiden jika Level 2 belum terbuka
    if (!isLevel2UnlockedRef.current) return null;

    const candidates = placedItemsRef.current.filter(
      (i) => INCIDENT_CANDIDATE_TYPES.includes(i.type) && !i.isSecondary
    );
    if (candidates.length === 0) return null;
    return candidates[Math.floor(Math.random() * candidates.length)];
  };

  // Jadwalkan kemunculan kebakaran berikutnya, delay acak 1-15 menit
  const scheduleNextFire = () => {
    if (fireTimerRef.current) clearTimeout(fireTimerRef.current);
    fireTimerRef.current = setTimeout(() => {
      if (!fireIncidentRef.current) {
        const pick = pickIncidentCandidate();
        if (pick) setFireIncident({ x: pick.x, z: pick.z });
      }
    }, randomDelay());
  };

  // Jadwalkan kemunculan kerampokan berikutnya, delay acak 1-15 menit
  const scheduleNextRobbery = () => {
    if (robberyTimerRef.current) clearTimeout(robberyTimerRef.current);
    robberyTimerRef.current = setTimeout(() => {
      if (!robberyIncidentRef.current) {
        const pick = pickIncidentCandidate();
        if (pick) setRobberyIncident({ x: pick.x, z: pick.z });
      }
    }, randomDelay());
  };

  // Mulai scheduler pertama kali saat kota dibuka, bersihkan timer saat unmount
  useEffect(() => {
    scheduleNextFire();
    scheduleNextRobbery();
    return () => {
      if (fireTimerRef.current) clearTimeout(fireTimerRef.current);
      if (robberyTimerRef.current) clearTimeout(robberyTimerRef.current);
    };
  }, []);

  const getGridCoordinates = (event: ThreeEvent<PointerEvent>) => {
    const x = Math.floor(event.point.x / TILE_SIZE);
    const z = Math.floor(event.point.z / TILE_SIZE);
    return { x, z };
  };

  const getHouseRotation = (houseX: number, houseZ: number, allItems: PlacedItem[], currentRotation: number) => {
    const hasRoadUp = allItems.some(i => i.type === 'ROAD' && i.x === houseX && i.z === houseZ - 1);
    const hasRoadDown = allItems.some(i => i.type === 'ROAD' && i.x === houseX && i.z === houseZ + 1);
    const hasRoadLeft = allItems.some(i => i.type === 'ROAD' && i.x === houseX - 1 && i.z === houseZ);
    const hasRoadRight = allItems.some(i => i.type === 'ROAD' && i.x === houseX + 1 && i.z === houseZ);

    const FACE_LEFT = Math.PI;
    const FACE_RIGHT = 0;
    const FACE_FRONT = -Math.PI / 2;
    const FACE_BACK = Math.PI / 2;

    if (currentRotation === FACE_RIGHT && hasRoadRight) return currentRotation;
    if (currentRotation === FACE_LEFT && hasRoadLeft) return currentRotation;
    if (currentRotation === FACE_FRONT && hasRoadDown) return currentRotation;
    if (currentRotation === FACE_BACK && hasRoadUp) return currentRotation;

    if (hasRoadRight) return FACE_RIGHT;
    if (hasRoadLeft) return FACE_LEFT;
    if (hasRoadDown) return FACE_FRONT;
    if (hasRoadUp) return FACE_BACK;

    return currentRotation;
  };

  const getFactory2Rotation = (item: PlacedItem, allItems: PlacedItem[]) => {
    // Deteksi apakah bangunan saat ini diletakkan secara mendatar atau menurun
    const isHorizontal = item.rotation === Math.PI / 2 || item.rotation === -Math.PI / 2;

    if (isHorizontal) {
      // Wajib ada jalan di atas KEDUA ubin (ubin pertama x, dan ubin kedua x+1)
      const hasRoadUp1 = allItems.some(i => i.type === 'ROAD' && i.x === item.x && i.z === item.z - 1);
      const hasRoadUp2 = allItems.some(i => i.type === 'ROAD' && i.x === item.x + 1 && i.z === item.z - 1);
      const hasRoadUp = hasRoadUp1 && hasRoadUp2;

      // Wajib ada jalan di bawah KEDUA ubin
      const hasRoadDown1 = allItems.some(i => i.type === 'ROAD' && i.x === item.x && i.z === item.z + 1);
      const hasRoadDown2 = allItems.some(i => i.type === 'ROAD' && i.x === item.x + 1 && i.z === item.z + 1);
      const hasRoadDown = hasRoadDown1 && hasRoadDown2;

      if (hasRoadDown) return -Math.PI / 2; // Memutar hadap bawah
      if (hasRoadUp) return Math.PI / 2;    // Memutar hadap atas
    } else {
      // Jika menurun, wajib ada jalan di kiri KEDUA ubin (ubin pertama z, dan ubin kedua z+1)
      const hasRoadLeft1 = allItems.some(i => i.type === 'ROAD' && i.x === item.x - 1 && i.z === item.z);
      const hasRoadLeft2 = allItems.some(i => i.type === 'ROAD' && i.x === item.x - 1 && i.z === item.z + 1);
      const hasRoadLeft = hasRoadLeft1 && hasRoadLeft2;

      // Wajib ada jalan di kanan KEDUA ubin
      const hasRoadRight1 = allItems.some(i => i.type === 'ROAD' && i.x === item.x + 1 && i.z === item.z);
      const hasRoadRight2 = allItems.some(i => i.type === 'ROAD' && i.x === item.x + 1 && i.z === item.z + 1);
      const hasRoadRight = hasRoadRight1 && hasRoadRight2;

      if (hasRoadRight) return 0;           // Memutar hadap kanan
      if (hasRoadLeft) return Math.PI;      // Memutar hadap kiri
    }

    return item.rotation; // Tetap pada rotasi awal jika syarat 2 ubin jalan tidak terpenuhi
  };

  // BARU: Penempatan instan bangunan footprint tetap 2x2 — klik = taruh, tidak lewat drag start/end
  const placeFixed2x2Building = (anchorX: number, anchorZ: number) => {
    const footprintTiles = [
      { x: anchorX, z: anchorZ },
      { x: anchorX + 1, z: anchorZ },
      { x: anchorX, z: anchorZ + 1 },
      { x: anchorX + 1, z: anchorZ + 1 },
    ];

    if (footprintTiles.some((t) => isWaterTile(t.x, t.z))) {
      alert("⚠️ Area Perairan!\nTidak bisa membangun di sini.");
      return;
    }

    if (footprintTiles.some((t) => placedItems.some((p) => p.x === t.x && p.z === t.z))) {
      alert("Ubin sudah terpakai! Pilih lokasi 2x2 yang kosong.");
      return;
    }

    const cost = BUILD_COSTS[activeTool] || 0; // otomatis generik untuk semua tool di FIXED_2X2_TOOLS
    if (onBuildCost) {
      const canAfford = onBuildCost(cost);
      if (!canAfford) {
        alert(`Kas Kota tidak mencukupi! Butuh ${cost.toLocaleString('id-ID')} koin untuk membangun ini.`);
        return;
      }
    }

      // BARU: Kalau ini Komersial Lv.2, tentukan varian 3D-nya duluan (acak, anti-repeat berturut)
      let assignedCommercialVariant: CommercialL2Variant | undefined;
      if (activeTool === 'ZONE_COMMERCIAL_L2') {
        let runningHistory = [...commercialL2BagHistory];
        if (runningHistory.length >= ALL_COMMERCIAL_L2_VARIANTS.length) runningHistory = [];
        assignedCommercialVariant = pickNextCommercialL2Variant(runningHistory);
        setCommercialL2BagHistory([...runningHistory, assignedCommercialVariant]);
      }

      setPlacedItems((prev) => {
        const primary: PlacedItem = {
          x: anchorX, z: anchorZ, type: activeTool, rotation: 0,
          ...(assignedCommercialVariant ? { commercialVariant: assignedCommercialVariant } : {}),
        };
        const secondaries: PlacedItem[] = footprintTiles.slice(1).map((t) => ({
        x: t.x, z: t.z, type: activeTool, rotation: 0, isSecondary: true,
        footprintOrigin: { x: anchorX, z: anchorZ },
      }));

      const combinedItems = [...prev, primary, ...secondaries];

      const withRotations = combinedItems.map((item) => {
        if (item.type === activeTool && !item.isSecondary) {
          return { ...item, rotation: getHouseRotation(item.x, item.z, combinedItems, item.rotation) };
        }
        return item;
      });

      const spatialIndex = buildSpatialIndex(withRotations);
      const affected = findAffectedItems(withRotations, footprintTiles);

      const withWarnings = withRotations.map((item) => {
        if (item.isSecondary) return item;
        if (!affected.has(item)) return item;
        return { ...item, warning: getBuildingWarning(item, spatialIndex, isLevel2UnlockedRef.current) };
      });

      return applyGarbageCapacityWarning(withWarnings).items;
    });
  };

  const handlePointerDown = (e: ThreeEvent<PointerEvent>) => {
    pointerDownRef.current = { x: e.nativeEvent.clientX, y: e.nativeEvent.clientY };
  };

  const handlePointerUp = (e: ThreeEvent<PointerEvent>) => {
    const down = pointerDownRef.current;
    pointerDownRef.current = null;
    if (!down) return;

    const dist = Math.hypot(e.nativeEvent.clientX - down.x, e.nativeEvent.clientY - down.y);
    if (dist > 6) return; // ini drag kamera, bukan klik tile

    e.stopPropagation();
    const coords = getGridCoordinates(e);

    // BARU: LOGIKA INSPEKSI SAAT IDLE
    if (!isBuildMode && !isDeleteMode) {
      let clickedItem = placedItems.find((item) => item.x === coords.x && item.z === coords.z);

      if (clickedItem && clickedItem.isSecondary) {
        clickedItem = placedItems.find(
          (p) =>
            !p.isSecondary &&
            p.type === clickedItem?.type &&
            (
              (clickedItem?.footprintOrigin && p.x === clickedItem.footprintOrigin.x && p.z === clickedItem.footprintOrigin.z) ||
              (clickedItem?.footprintDirection === 'X' && p.x === clickedItem.x - 1 && p.z === clickedItem.z) ||
              (clickedItem?.footprintDirection === 'Z' && p.z === clickedItem.z - 1 && p.x === clickedItem.x)
            )
        ) || clickedItem;
      }

      // Logika Toggle: Jika ubin yang sama diklik lagi, matikan inspeksi
      if (onInspectItem) {
        if (inspectedItem && clickedItem && inspectedItem.x === clickedItem.x && inspectedItem.z === clickedItem.z) {
          onInspectItem(null); // Tutup inspeksi
        } else {
          onInspectItem(clickedItem || null); // Buka/pindah inspeksi
        }
      }
      return; 
    }

    // BARU: Bangunan footprint tetap 2x2 — klik sekali langsung taruh
    if (FIXED_2X2_TOOLS.includes(activeTool)) {
      placeFixed2x2Building(coords.x, coords.z);
      return;
    }

    if (!startTile) {
      setStartTile(coords);
      setCurrentTile(coords);
      return;
    }

    const minX = Math.min(startTile.x, coords.x);
    const maxX = Math.max(startTile.x, coords.x);
    const minZ = Math.min(startTile.z, coords.z);
    const maxZ = Math.max(startTile.z, coords.z);

    if (isDeleteMode) {
      onDeleteBoundsSelected({ minX, maxX, minZ, maxZ });
      setStartTile(null);
      setCurrentTile(null);
      return;
    }

    const diffX = Math.abs(coords.x - startTile.x);
    const diffZ = Math.abs(coords.z - startTile.z);

    let itemRotation = 0;
    if (activeTool === 'ROAD') {
      itemRotation = diffZ > diffX ? Math.PI / 2 : 0;
    }

    const newItems: PlacedItem[] = [];
    const totalTiles = (maxX - minX + 1) * (maxZ - minZ + 1);
    
    if (activeTool === 'ZONE_INDUSTRIAL_L1') {
    const isHorizontal = diffX >= diffZ; // arah drag menentukan orientasi Factory2

    if (isHorizontal) {
      // Loop tiap baris Z, pasangkan ubin sepanjang X 2-2
      for (let z = minZ; z <= maxZ; z++) {
        let x = minX;
        while (x <= maxX) {
          const remaining = maxX - x + 1;

          if (remaining >= 2) {
            const placedRotation = Math.PI / 2;
            newItems.push({
              x, z,
              type: activeTool,
              rotation: placedRotation,
              industrialVariant: 'FACTORY2',
              isSecondary: false,
              footprintDirection: 'X',
            });
            newItems.push({
              x: x + 1, z,
              type: activeTool,
              rotation: placedRotation,
              industrialVariant: 'FACTORY2',
              isSecondary: true,
              footprintDirection: 'X',
            });
            x += 2;
          } else {
            // Sisa ganjil 1 ubin -> Factory1
            newItems.push({ x, z, type: activeTool, rotation: 0, industrialVariant: 'FACTORY1' });
            x += 1;
          }
        }
      }
    } else {
      // Loop tiap kolom X, pasangkan ubin sepanjang Z 2-2
      for (let x = minX; x <= maxX; x++) {
        let z = minZ;
        while (z <= maxZ) {
          const remaining = maxZ - z + 1;

          if (remaining >= 2) {
            const placedRotation = Math.PI;
            newItems.push({
              x, z,
              type: activeTool,
              rotation: placedRotation,
              industrialVariant: 'FACTORY2',
              isSecondary: false,
              footprintDirection: 'Z',
            });
            newItems.push({
              x, z: z + 1,
              type: activeTool,
              rotation: placedRotation,
              industrialVariant: 'FACTORY2',
              isSecondary: true,
              footprintDirection: 'Z',
            });
            z += 2;
          } else {
            newItems.push({ x, z, type: activeTool, rotation: 0, industrialVariant: 'FACTORY1' });
            z += 1;
          }
        }
      }
    }
  } else {
    // Logika standar untuk zona lain dan jalan (tetap sama, tidak berubah)
    for (let x = minX; x <= maxX; x++) {
      for (let z = minZ; z <= maxZ; z++) {
        newItems.push({ x, z, type: activeTool, rotation: itemRotation, roadShape: 'STRAIGHT' });
      }
    }
  }

  // BARU: Cek apakah pemain mencoba menaruh bangunan di atas air
  const hasWaterCollision = newItems.some((item) => isWaterTile(item.x, item.z));
  
  if (hasWaterCollision) {
    setStartTile(null);
    setCurrentTile(null);
    if (onSelectionCostChange) onSelectionCostChange(0);
    alert("⚠️ Area Perairan!\nAnda tidak bisa membangun jalan atau zona biasa di sini. Bangunan khusus air akan segera hadir.");
    return; // Batalkan proses pembangunan!
  }

  const validNewItems = newItems.filter(
      (newItem) => !placedItems.some((p) => p.x === newItem.x && p.z === newItem.z)
    );

    // KALKULASI BIAYA KONSTRUKSI — lookup dari BUILD_COSTS, skip ubin sekunder
    // (skip isSecondary ini juga membetulkan bug lama: Factory2 dulu kena charge 2x)
    let totalCost = 0;
    validNewItems.forEach(item => {
      if (!item.isSecondary) {
        totalCost += BUILD_COSTS[item.type] || 0;
      }
    });

    if (totalCost > 0 && onBuildCost) {
      const canAfford = onBuildCost(totalCost);
      if (!canAfford) {
        setStartTile(null);
        setCurrentTile(null);
        alert(`Kas Kota tidak mencukupi! Butuh ${totalCost.toLocaleString('id-ID')} koin untuk membangun ini.`);
        return; // Batalkan proses pembangunan jika uang tidak cukup
      }
    }

    // Biarkan setPlacedItems di bawahnya berjalan seperti biasa...
    setPlacedItems((prev) => {
      const validNewItems = newItems.filter(
        (newItem) => !prev.some((p) => p.x === newItem.x && p.z === newItem.z)
      );

      let runningHouseHistory = [...houseBagHistory];
      let runningApartHistory = [...apartBagHistory];
      let runningCommercialHistory = [...commercialBagHistory];

      const validNewItemsWithVariant = validNewItems.map((item) => {
        if (item.type === 'ZONE_HOUSE_L1') {
          if (runningHouseHistory.length >= ALL_HOUSE_VARIANTS.length) runningHouseHistory = [];
          const variant = pickNextHouseVariant(runningHouseHistory);
          runningHouseHistory = [...runningHouseHistory, variant];
          return { ...item, houseVariant: variant, currentOccupants: 0, maxOccupants: 4 };
        }
        // BARU: Rumah Lv.2 — kapasitas 12
        if (item.type === 'ZONE_HOUSE_L2') {
          if (runningApartHistory.length >= ALL_APART_VARIANTS.length) runningApartHistory = [];
          const variant = pickNextApartVariant(runningApartHistory);
          runningApartHistory = [...runningApartHistory, variant];
          return { ...item, houseVariant: variant, currentOccupants: 0, maxOccupants: 12 };
        }
        if (item.type === 'ZONE_COMMERCIAL_L1') {
          if (runningCommercialHistory.length >= ALL_COMMERCIAL_VARIANTS.length) runningCommercialHistory = [];
          const variant = pickNextCommercialVariant(runningCommercialHistory);
          runningCommercialHistory = [...runningCommercialHistory, variant];
          return { ...item, commercialVariant: variant };
        }
        return item;
      });

      setHouseBagHistory(runningHouseHistory);
      setCommercialBagHistory(runningCommercialHistory);

      const combinedItems = [...prev, ...validNewItemsWithVariant];

      // Rotasi/shape tetap dihitung untuk semua item (murah, O(1) per item via neighbor check)
      const withRotations = combinedItems.map((item) => {
        let newItem = { ...item };

        const isStandardMovable = newItem.type === 'ZONE_HOUSE_L1' ||
                  newItem.type === 'ZONE_COMMERCIAL_L1' ||
                  (newItem.type === 'ZONE_INDUSTRIAL_L1' && newItem.industrialVariant === 'FACTORY1') ||
                  newItem.type === 'RESOURCE_ELECTRIC' ||
                  newItem.type === 'RESOURCE_WATER' ||
                  newItem.type === 'RESOURCE_GARBAGE' ||
                  newItem.type === 'SERVICE_HOSPITAL' ||
                  newItem.type === 'SERVICE_POLICE' ||
                  newItem.type === 'SERVICE_FIREFIGHTER' ||
                  ((newItem.type === 'EDUCATION_ELEMENTARY' || newItem.type === 'EDUCATION_JUNIOR' || newItem.type === 'EDUCATION_HIGH' || newItem.type === 'ZONE_COMMERCIAL_L2') && !newItem.isSecondary);

        if (isStandardMovable) {
          newItem.rotation = getHouseRotation(newItem.x, newItem.z, combinedItems, newItem.rotation);
        } else if (newItem.type === 'ZONE_INDUSTRIAL_L1' && newItem.industrialVariant === 'FACTORY2' && !newItem.isSecondary) {
          newItem.rotation = getFactory2Rotation(newItem, combinedItems);
        } else if (newItem.type === 'ROAD') {
          const { shape, rotation, openSides } = getRoadProperties(newItem.x, newItem.z, combinedItems, newItem.rotation);
          newItem.roadShape = shape;
          newItem.rotation = rotation;
          newItem.openSides = openSides;
        }

        return newItem;
      });

      // Dirty-tracking: cuma recompute warning untuk bangunan dalam radius pengaruh dari tile yang baru dibangun,
      // bukan seluruh kota. Bangunan lain tetap pakai warning yang sudah tersimpan.
      const spatialIndex = buildSpatialIndex(withRotations);
      const changedCoords = validNewItemsWithVariant.map((i) => ({ x: i.x, z: i.z }));
      const affected = findAffectedItems(withRotations, changedCoords);

      const withWarnings = withRotations.map((item) => {
        if (item.isSecondary) return item;
        if (!affected.has(item)) return item; 
        // DIUBAH:
        return { ...item, warning: getBuildingWarning(item, spatialIndex, isLevel2UnlockedRef.current) };
      });

      // BARU: Sinkronisasi kapasitas TPS global setiap kali ada bangunan baru
      // (relevan kalau yang baru dibangun Garbage, atau rumah baru menambah populasi)
      return applyGarbageCapacityWarning(withWarnings).items;
    });

    setStartTile(null);
    setCurrentTile(null);
  };

  const handlePointerMove = (e: ThreeEvent<PointerEvent>) => {
    if (isBuildMode && FIXED_2X2_TOOLS.includes(activeTool)) {
      // Preview 2x2 ngikutin kursor, nggak butuh pointer down
      setHoverTile(getGridCoordinates(e));
      return;
    }
    if ((isBuildMode || isDeleteMode) && startTile) {
      e.stopPropagation();
      setCurrentTile(getGridCoordinates(e));
    }
  };

  // BARU: Mengecek apakah kotak seleksi (drag) menabrak area perairan manapun
  const isHoveringWater = useMemo(() => {
    if (!startTile || !currentTile) return false;
    const minX = Math.min(startTile.x, currentTile.x);
    const maxX = Math.max(startTile.x, currentTile.x);
    const minZ = Math.min(startTile.z, currentTile.z);
    const maxZ = Math.max(startTile.z, currentTile.z);

    for (let ix = minX; ix <= maxX; ix++) {
      for (let iz = minZ; iz <= maxZ; iz++) {
        if (isWaterTile(ix, iz)) return true;
      }
    }
    return false;
  }, [startTile, currentTile]);

  // BARU: Menghitung jumlah populasi untuk kepadatan lalu lintas
  const totalPopulation = useMemo(() => {
    let pop = 0;
    placedItems.forEach(item => {
      if (isHouseZone(item.type) && !item.isSecondary) {
        pop += (item.currentOccupants || 0);
      }
    });
    return pop;
  }, [placedItems]);

  // BARU: Lacak status Level 2 secara dinamis
  const level2MinPop = useMemo(() => CITY_LEVELS.find((l) => l.level === 2)?.minPopulation || 400, []);
  const isLevel2UnlockedRef = useRef(false);

  // BARU: Pantau transisi level (Satu Arah).
  useEffect(() => {
    const isNowUnlocked = totalPopulation >= level2MinPop;
    
    // Hanya memicu re-kalkulasi JIKA baru saja mencapai level 2 (transisi false -> true)
    // Tidak ada kondisi untuk mengubahnya kembali menjadi false!
    if (isNowUnlocked && !isLevel2UnlockedRef.current) {
      isLevel2UnlockedRef.current = true; // Kunci permanen
      
      // Hitung ulang semua ubin secara otomatis
      setPlacedItems((prev) => {
        const index = buildSpatialIndex(prev);
        const newItems = prev.map((item) => {
          if (item.isSecondary) return item;
          // Paksa passing parameter 'true' karena level 2 sudah permanen terbuka
          return { ...item, warning: getBuildingWarning(item, index, true) }; 
        });
        return applyGarbageCapacityWarning(newItems).items;
      });
    }
  }, [totalPopulation, level2MinPop]);

  // BARU: Kalkulasi batas jumlah mobil (0-100 = 5, 101-200 = 10, dst. Maks 25)
  const dynamicCarCount = useMemo(() => {
    // Math.max(0, totalPopulation - 1) memastikan angka 100 tetap masuk ke level 1 (5 mobil),
    // sedangkan 101 baru akan naik ke level 2 (10 mobil).
    const multiplier = Math.floor(Math.max(0, totalPopulation - 1) / 100) + 1;
    
    return Math.min(25, multiplier * 5); // Batas maksimal 25 mobil
  }, [totalPopulation]);

  return (
    <group>
      <Maps receiveShadow/>

      <GrassInstances tiles={visibleGrassTransforms} maxCount={grassTiles.length} />

      <House1Instances
        transforms={groupedRenderData.houses.HOUSE1}
        maxCount={GRID_SIZE * GRID_SIZE}
        ghost={isGridMode}
      />
      <House2Instances
        transforms={groupedRenderData.houses.HOUSE2}
        maxCount={GRID_SIZE * GRID_SIZE}
        ghost={isGridMode}
      />
      <House3Instances
        transforms={groupedRenderData.houses.HOUSE3}
        maxCount={GRID_SIZE * GRID_SIZE}
        ghost={isGridMode}
      />

      <WartegInstances
        transforms={groupedRenderData.commercial.WARTEG}
        maxCount={GRID_SIZE * GRID_SIZE}
        ghost={isGridMode}
      />
      <MarketInstances
        transforms={groupedRenderData.commercial.MARKET}
        maxCount={GRID_SIZE * GRID_SIZE}
        ghost={isGridMode}
      />

      <Factory1Instances
        transforms={groupedRenderData.industrial.FACTORY1}
        maxCount={GRID_SIZE * GRID_SIZE}
        ghost={isGridMode}
      />
      <Factory2Instances
        transforms={groupedRenderData.industrial.FACTORY2}
        maxCount={GRID_SIZE * GRID_SIZE}
        ghost={isGridMode}
      />

      <RoadStraightInstances
        transforms={groupedRenderData.roads.STRAIGHT}
        maxCount={GRID_SIZE * GRID_SIZE}
        ghost={isGridMode}
      />
      <RoadCornerInstances
        transforms={groupedRenderData.roads.CORNER}
        maxCount={GRID_SIZE * GRID_SIZE}
        ghost={isGridMode}
      />
      <RoadTeeInstances
        transforms={groupedRenderData.roads.TEE}
        maxCount={GRID_SIZE * GRID_SIZE}
        ghost={isGridMode}
      />
      <RoadCrossroadInstances
        transforms={groupedRenderData.roads.CROSSROAD}
        maxCount={GRID_SIZE * GRID_SIZE}
        ghost={isGridMode}
      />

      <CarInstances laneCache={laneCache} count={dynamicCarCount} />

      {policeRoute && (
        <IncidentCar route={policeRoute} onArrive={handlePoliceArrive}>
          <CarPolice />
        </IncidentCar>
      )}
      {firefighterRoute && (
        <IncidentCar route={firefighterRoute} onArrive={handleFirefighterArrive}>
          <CarFireFighter />
        </IncidentCar>
      )}

      {fireIncident && (
        <FireSmokeEffect 
          position={[
            fireIncident.x * TILE_SIZE + TILE_SIZE / 2, 
            0.5, // Mulai dari atas lantai
            fireIncident.z * TILE_SIZE + TILE_SIZE / 2
          ]} 
        />
      )}
      {robberyIncident && (
        <mesh
          position={[
            robberyIncident.x * TILE_SIZE + TILE_SIZE / 2, 
            12, 
            robberyIncident.z * TILE_SIZE + TILE_SIZE / 2
          ]}
        >
          <sphereGeometry args={[1.5, 16, 16]} />
          <meshStandardMaterial color="#ef4444" emissive="#ef4444" emissiveIntensity={0.6} />
          
          {/* 
            BARU:
            - transform: Memasukkan HTML ke dalam koordinat 3D (bisa mengecil saat dizoom out)
            - sprite: Menjamin ikon selalu menghadap ke arah kamera (billboard effect)
            - scale={0.1}: Mengonversi rasio 24px agar muat ke dalam radius bola 1.5 unit
          */}
          <Html center transform sprite scale={2}>
            <div className="text-white flex items-center justify-center pointer-events-none drop-shadow-md">
              <Siren size={24} weight="bold" />
            </div>
          </Html>
        </mesh>
      )}

      <ElectricInstances
        transforms={groupedRenderData.resources.ELECTRIC}
        maxCount={GRID_SIZE * GRID_SIZE}
        ghost={isGridMode}
      />
      <WaterInstances
        transforms={groupedRenderData.resources.WATER}
        maxCount={GRID_SIZE * GRID_SIZE}
        ghost={isGridMode}
      />
      <GarbageInstances
        transforms={groupedRenderData.resources.GARBAGE}
        maxCount={GRID_SIZE * GRID_SIZE}
        ghost={isGridMode}
      />

      <Tree1Instances transforms={groupedRenderData.nature.TREE1} maxCount={GRID_SIZE * GRID_SIZE} ghost={isGridMode} />
      <Tree2Instances transforms={groupedRenderData.nature.TREE2} maxCount={GRID_SIZE * GRID_SIZE} ghost={isGridMode} />
      <FountainInstances transforms={groupedRenderData.nature.FOUNTAIN} maxCount={GRID_SIZE * GRID_SIZE} ghost={isGridMode} />

      <HospitalInstances transforms={groupedRenderData.service.HOSPITAL} maxCount={GRID_SIZE * GRID_SIZE} ghost={isGridMode} />
      <PoliceInstances transforms={groupedRenderData.service.POLICE} maxCount={GRID_SIZE * GRID_SIZE} ghost={isGridMode} />
      <FireFighterInstances transforms={groupedRenderData.service.FIREFIGHTER} maxCount={GRID_SIZE * GRID_SIZE} ghost={isGridMode} />

      <SchoolElementaryInstances
        transforms={groupedRenderData.education.SCHOOL_ELEMENTARY}
        maxCount={GRID_SIZE * GRID_SIZE}
        ghost={isGridMode}
      />

      <SchoolJuniorInstances
        transforms={groupedRenderData.education.SCHOOL_JUNIOR}
        maxCount={GRID_SIZE * GRID_SIZE}
        ghost={isGridMode}
      />
      <SchoolHighInstances
        transforms={groupedRenderData.education.SCHOOL_HIGH}
        maxCount={GRID_SIZE * GRID_SIZE}
        ghost={isGridMode}
      />

      <Apart1Instances transforms={groupedRenderData.apartments.APART1} maxCount={GRID_SIZE * GRID_SIZE} ghost={isGridMode} />
      <Apart2Instances transforms={groupedRenderData.apartments.APART2} maxCount={GRID_SIZE * GRID_SIZE} ghost={isGridMode} />
      <Apart3Instances transforms={groupedRenderData.apartments.APART3} maxCount={GRID_SIZE * GRID_SIZE} ghost={isGridMode} />
      <Apart4Instances transforms={groupedRenderData.apartments.APART4} maxCount={GRID_SIZE * GRID_SIZE} ghost={isGridMode} />

      <SuperMarketInstances
        transforms={groupedRenderData.commercialL2.SUPERMARKET}
        maxCount={GRID_SIZE * GRID_SIZE}
        ghost={isGridMode}
      />
      <ShopInstances
        transforms={groupedRenderData.commercialL2.SHOP}
        maxCount={GRID_SIZE * GRID_SIZE}
        ghost={isGridMode}
      />

      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[centerOffset, 0, centerOffset]}
        onPointerDown={handlePointerDown}
        onPointerUp={handlePointerUp}
        onPointerMove={handlePointerMove}
    >
        <planeGeometry args={[mapSize, mapSize]} />
        <meshBasicMaterial visible={false} />
      </mesh>

      {isGridMode && (
        <gridHelper
          args={[mapSize, GRID_SIZE, COLORS.GRID_LINE, COLORS.GRID_LINE]}
          position={[centerOffset, 0.01, centerOffset]}
        />
      )}

      {isGridMode && startTile && currentTile && (
        <HighlightBox
          start={startTile}
          end={currentTile}
          color={
            isDeleteMode || isHoveringWater // DIUBAH: Menggunakan isHoveringWater
              ? '#ef4444' 
              : COLORS.HOVER_VALID
          }
        />
      )}

      {isGridMode && isBuildMode && FIXED_2X2_TOOLS.includes(activeTool) && hoverTile && (
        <HighlightBox
          start={hoverTile}
          end={{ x: hoverTile.x + 1, z: hoverTile.z + 1 }}
          color={COLORS.HOVER_VALID}
        />
      )}

      {/* Highlight area yang lagi nunggu konfirmasi hapus */}
      {deleteRequest?.status === 'pending' && (
        <HighlightBox
          start={{ x: deleteRequest.bounds.minX, z: deleteRequest.bounds.minZ }}
          end={{ x: deleteRequest.bounds.maxX, z: deleteRequest.bounds.maxZ }}
          color="#ef4444"
        />
      )}

      {/* Visualisasi Radius Melingkar untuk Bangunan Tertentu */}
      {inspectedItem && !isBuildMode && !isDeleteMode && (
        <>
          {/* 1. Radius Biru untuk Komersial (10 Ubin) */}
          {inspectedItem.type === 'ZONE_COMMERCIAL_L1' && (
            <mesh
              position={[
                inspectedItem.x * TILE_SIZE + (TILE_SIZE / 2), 
                0.02, 
                inspectedItem.z * TILE_SIZE + (TILE_SIZE / 2)
              ]}
              rotation={[-Math.PI / 2, 0, 0]}
            >
              <circleGeometry args={[6 * TILE_SIZE, 64]} />
              <meshBasicMaterial color="#3b82f6" transparent opacity={0.15} />
            </mesh>
          )}

          {/* 2. Radius Oranye untuk Industri (12 Ubin) */}
          {inspectedItem.type === 'ZONE_INDUSTRIAL_L1' && (
            <mesh
              position={[
                inspectedItem.x * TILE_SIZE + (TILE_SIZE / 2), 
                0.02,
                inspectedItem.z * TILE_SIZE + (TILE_SIZE / 2)
              ]}
              rotation={[-Math.PI / 2, 0, 0]}
            >
              <circleGeometry args={[12 * TILE_SIZE, 64]} />
              <meshBasicMaterial color="#d97706" transparent opacity={0.15} />
            </mesh>
          )}

          {/* 3. Radius Kuning untuk Listrik (15 Ubin) */}
          {inspectedItem.type === 'RESOURCE_ELECTRIC' && (
            <mesh
              position={[
                inspectedItem.x * TILE_SIZE + (TILE_SIZE / 2), 
                0.02,
                inspectedItem.z * TILE_SIZE + (TILE_SIZE / 2)
              ]}
              rotation={[-Math.PI / 2, 0, 0]}
            >
              <circleGeometry args={[10 * TILE_SIZE, 64]} />
              <meshBasicMaterial color="#eab308" transparent opacity={0.15} />
            </mesh>
          )}

          {/* 4. Radius Biru Muda/Cyan untuk Air (15 Ubin) */}
          {inspectedItem.type === 'RESOURCE_WATER' && (
            <mesh
              position={[
                inspectedItem.x * TILE_SIZE + (TILE_SIZE / 2), 
                0.02,
                inspectedItem.z * TILE_SIZE + (TILE_SIZE / 2)
              ]}
              rotation={[-Math.PI / 2, 0, 0]}
            >
              <circleGeometry args={[10 * TILE_SIZE, 64]} />
              <meshBasicMaterial color="#06b6d4" transparent opacity={0.15} />
            </mesh>
          )}

          {/* 5. BARU: Radius Abu-abu/Gelap untuk Garbage (12 Ubin, bau) */}
          {inspectedItem.type === 'RESOURCE_GARBAGE' && (
            <mesh
              position={[
                inspectedItem.x * TILE_SIZE + (TILE_SIZE / 2), 
                0.02,
                inspectedItem.z * TILE_SIZE + (TILE_SIZE / 2)
              ]}
              rotation={[-Math.PI / 2, 0, 0]}
            >
              <circleGeometry args={[GARBAGE_SMELL_RADIUS * TILE_SIZE, 64]} />
              <meshBasicMaterial color="#eab308" transparent opacity={0.15} />
            </mesh>
          )}

          {/* 6. BARU: Radius Hijau untuk Rumah Sakit (12 Ubin, wajib) */}
          {inspectedItem.type === 'SERVICE_HOSPITAL' && (
            <mesh
              position={[inspectedItem.x * TILE_SIZE + (TILE_SIZE / 2), 0.02, inspectedItem.z * TILE_SIZE + (TILE_SIZE / 2)]}
              rotation={[-Math.PI / 2, 0, 0]}
            >
              <circleGeometry args={[HOSPITAL_RADIUS * TILE_SIZE, 64]} />
              <meshBasicMaterial color="#22c55e" transparent opacity={0.15} />
            </mesh>
          )}

          {/* 7. BARU: Radius Ungu untuk Komersial Lv.2 (10 Ubin) */}
          {inspectedItem.type === 'ZONE_COMMERCIAL_L2' && (
            <mesh
              position={[inspectedItem.x * TILE_SIZE + TILE_SIZE, 0.02, inspectedItem.z * TILE_SIZE + TILE_SIZE]}
              rotation={[-Math.PI / 2, 0, 0]}
            >
              <circleGeometry args={[COMMERCIAL_L2_RADIUS * TILE_SIZE, 64]} />
              <meshBasicMaterial color="#a855f7" transparent opacity={0.15} />
            </mesh>
          )}
        </>
      )}

      {placedItems.map((item, index) => {
        // 1. Abaikan render untuk ubin bayangan (agar tidak ganda)
        if (item.isSecondary) return null;

        // --- ZONA RUMAH ---
        if (isHouseZone(item.type)) {
          const posX = item.x * TILE_SIZE + (TILE_SIZE / 2);
          const posZ = item.z * TILE_SIZE + (TILE_SIZE / 2);
          const criticalWarnings = item.warning?.filter(w => w !== "Fasilitas komersial kurang (Ideal: 2)");

          if (!criticalWarnings || criticalWarnings.length === 0) return null;
          // DIUBAH KE DELAYED WARNING
          return <DelayedWarning key={`warn-house-${index}`} position={[posX, 12, posZ]} />;
        }

        // --- ZONA KOMERSIAL ---
        if (item.type === 'ZONE_COMMERCIAL_L1') {
          const posX = item.x * TILE_SIZE + (TILE_SIZE / 2);
          const posZ = item.z * TILE_SIZE + (TILE_SIZE / 2);
          const criticalWarnings = item.warning?.filter(w => w !== "Fasilitas komersial kurang (Ideal: 2)");

          if (!criticalWarnings || criticalWarnings.length === 0) return null;
          // DIUBAH KE DELAYED WARNING
          return <DelayedWarning key={`warn-commercial-${index}`} position={[posX, 12, posZ]} />;
        }

        // --- ZONA KOMERSIAL LV.2 (footprint 2x2) ---
        if (item.type === 'ZONE_COMMERCIAL_L2') {
          const posX = item.x * TILE_SIZE + TILE_SIZE;
          const posZ = item.z * TILE_SIZE + TILE_SIZE;
          const criticalWarnings = item.warning?.filter(w => w !== "Fasilitas komersial kurang (Ideal: 2)");

          if (!criticalWarnings || criticalWarnings.length === 0) return null;
          return <DelayedWarning key={`warn-commercial-l2-${index}`} position={[posX, 12, posZ]} />;
        }

        // --- ZONA INDUSTRI ---
        if (item.type === 'ZONE_INDUSTRIAL_L1') {
          let posX = item.x * TILE_SIZE + (TILE_SIZE / 2);
          let posZ = item.z * TILE_SIZE + (TILE_SIZE / 2);

          if (item.industrialVariant === 'FACTORY2') {
            const isPrimaryFacing = item.rotation === Math.PI / 2 || item.rotation === 0;
            const offset = isPrimaryFacing ? TILE_SIZE : 0;
            if (item.footprintDirection === 'X') posX += offset;
            else if (item.footprintDirection === 'Z') posZ += offset;
          }

          const criticalWarnings = item.warning?.filter(w => w !== "Fasilitas komersial kurang (Ideal: 2)");

          if (!criticalWarnings || criticalWarnings.length === 0) return null;
          // DIUBAH KE DELAYED WARNING
          return <DelayedWarning key={`warn-industrial-${index}`} position={[posX, 12, posZ]} />;
        }

        // --- RESOURCE GARBAGE ---
        if (item.type === 'RESOURCE_GARBAGE') {
          const posX = item.x * TILE_SIZE + (TILE_SIZE / 2);
          const posZ = item.z * TILE_SIZE + (TILE_SIZE / 2);

          if (!item.warning || item.warning.length === 0) return null;
          // DIUBAH KE DELAYED WARNING
          return <DelayedWarning key={`warn-garbage-${index}`} position={[posX, 12, posZ]} />;
        }

        // --- LAYANAN (HOSPITAL, POLISI, PEMADAM) ---
        if (item.type === 'SERVICE_HOSPITAL' || item.type === 'SERVICE_POLICE' || item.type === 'SERVICE_FIREFIGHTER') {
          const posX = item.x * TILE_SIZE + (TILE_SIZE / 2);
          const posZ = item.z * TILE_SIZE + (TILE_SIZE / 2);

          if (!item.warning || item.warning.length === 0) return null;
          // DIUBAH KE DELAYED WARNING
          return <DelayedWarning key={`warn-service-${index}`} position={[posX, 12, posZ]} />;
        }

        // --- PENDIDIKAN (SEKOLAH, footprint 2x2) ---
        if (item.type === 'EDUCATION_ELEMENTARY' || item.type === 'EDUCATION_JUNIOR' || item.type === 'EDUCATION_HIGH') {
          const posX = item.x * TILE_SIZE + TILE_SIZE; // pusat 2x2
          const posZ = item.z * TILE_SIZE + TILE_SIZE;

          if (!item.warning || item.warning.length === 0) return null;
          return <DelayedWarning key={`warn-education-${index}`} position={[posX, 12, posZ]} />;
        }

        // Jalan sekarang dirender lewat instancing
        if (item.type === 'ROAD') {
          return null;
        }

        // Resource (listrik & air) sekarang dirender lewat instancing
        if (item.type === 'RESOURCE_ELECTRIC' || item.type === 'RESOURCE_WATER') {
          return null;
        }
      })}
    </group>
  );
}