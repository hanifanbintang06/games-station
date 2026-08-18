'use client';

import * as THREE from 'three';
import { useEffect, useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { useGLTF } from '@react-three/drei';
import { GLTF } from 'three-stdlib';
import { Lane, Side, evalQuadraticBezier, evalQuadraticBezierTangent, neighborFromSide, oppositeSide } from '../../core/laneSystem';

// 1. Definisi Tipe untuk Keempat Warna Mobil
type CarRedGLTF = GLTF & {
  nodes: { Cube015: THREE.Mesh; Cube015_1: THREE.Mesh; Cube015_2: THREE.Mesh };
  materials: { ['Material.165']: THREE.MeshStandardMaterial; ['Material.166']: THREE.MeshStandardMaterial; ['Material.167']: THREE.MeshStandardMaterial; };
};

type CarBlueGLTF = GLTF & {
  nodes: { Cube047: THREE.Mesh; Cube047_1: THREE.Mesh; Cube047_2: THREE.Mesh };
  materials: { ['Material.174']: THREE.MeshStandardMaterial; ['Material.175']: THREE.MeshStandardMaterial; ['Material.176']: THREE.MeshStandardMaterial; };
};

type CarGreenGLTF = GLTF & {
  nodes: { Cube050: THREE.Mesh; Cube050_1: THREE.Mesh; Cube050_2: THREE.Mesh };
  materials: { ['Material.180']: THREE.MeshStandardMaterial; ['Material.181']: THREE.MeshStandardMaterial; ['Material.182']: THREE.MeshStandardMaterial; };
};

type CarYellowGLTF = GLTF & {
  nodes: { Cube049: THREE.Mesh; Cube049_1: THREE.Mesh; Cube049_2: THREE.Mesh };
  materials: { ['Material.177']: THREE.MeshStandardMaterial; ['Material.178']: THREE.MeshStandardMaterial; ['Material.179']: THREE.MeshStandardMaterial; };
};

interface CarInstancesProps {
  laneCache: Map<string, Lane[]>;
  count: number;
  speed?: number;
}

// 2. Tambahkan colorIndex pada CarState
interface CarState {
  tileX: number;
  tileZ: number;
  laneIndex: number;
  t: number;
  colorIndex: number; 
}

export default function CarInstances({ laneCache, count, speed = 8 }: CarInstancesProps) {
  // 3. Muat Seluruh Aset GLTF
  const redGltf = useGLTF('/games/citybuilder/models/cars/carred.glb') as unknown as CarRedGLTF;
  const blueGltf = useGLTF('/games/citybuilder/models/cars/carblue.glb') as unknown as CarBlueGLTF;
  const greenGltf = useGLTF('/games/citybuilder/models/cars/cargreen.glb') as unknown as CarGreenGLTF;
  const yellowGltf = useGLTF('/games/citybuilder/models/cars/caryellow.glb') as unknown as CarYellowGLTF;

  // 4. Konfigurasi Koleksi Mobil beserta Offset Lokal Masing-masing
  const carConfigs = useMemo(() => [
    {
      meshes: [
        { geometry: redGltf.nodes.Cube015.geometry, material: redGltf.materials['Material.165'] },
        { geometry: redGltf.nodes.Cube015_1.geometry, material: redGltf.materials['Material.166'] },
        { geometry: redGltf.nodes.Cube015_2.geometry, material: redGltf.materials['Material.167'] },
      ],
      localOffset: new THREE.Matrix4().makeTranslation(0, 0.929, 1.682)
    },
    {
      meshes: [
        { geometry: blueGltf.nodes.Cube047.geometry, material: blueGltf.materials['Material.174'] },
        { geometry: blueGltf.nodes.Cube047_1.geometry, material: blueGltf.materials['Material.175'] },
        { geometry: blueGltf.nodes.Cube047_2.geometry, material: blueGltf.materials['Material.176'] },
      ],
      localOffset: new THREE.Matrix4().makeTranslation(0, 0.929, 1.682)
    },
    {
      meshes: [
        { geometry: greenGltf.nodes.Cube050.geometry, material: greenGltf.materials['Material.180'] },
        { geometry: greenGltf.nodes.Cube050_1.geometry, material: greenGltf.materials['Material.181'] },
        { geometry: greenGltf.nodes.Cube050_2.geometry, material: greenGltf.materials['Material.182'] },
      ],
      localOffset: new THREE.Matrix4().makeTranslation(0, 0.929, 1.682)
    },
    {
      meshes: [
        { geometry: yellowGltf.nodes.Cube049.geometry, material: yellowGltf.materials['Material.177'] },
        { geometry: yellowGltf.nodes.Cube049_1.geometry, material: yellowGltf.materials['Material.178'] },
        { geometry: yellowGltf.nodes.Cube049_2.geometry, material: yellowGltf.materials['Material.179'] },
      ],
      localOffset: new THREE.Matrix4().makeTranslation(0, 0.929, 1.682)
    }
  ], [redGltf, blueGltf, greenGltf, yellowGltf]);

  const meshRefs = useRef<(THREE.InstancedMesh | null)[][]>([[], [], [], []]);
  const dummy = useMemo(() => new THREE.Object3D(), []);
  const posVec = useMemo(() => new THREE.Vector3(), []);
  const tangentVec = useMemo(() => new THREE.Vector3(), []);

  const laneCacheRef = useRef(laneCache);
  useEffect(() => { laneCacheRef.current = laneCache; }, [laneCache]);

  const carsRef = useRef<CarState[]>([]);

  // 5. Alokasi Warna Acak saat Spawn
  const spawnCar = (car: CarState) => {
    const keys = Array.from(laneCacheRef.current.keys());
    if (keys.length === 0) return false;
    const key = keys[Math.floor(Math.random() * keys.length)];
    const lanes = laneCacheRef.current.get(key);
    if (!lanes || lanes.length === 0) return false;

    const [x, z] = key.split(',').map(Number);
    car.tileX = x;
    car.tileZ = z;
    car.laneIndex = Math.floor(Math.random() * lanes.length);
    car.t = Math.random() * 0.3;
    car.colorIndex = Math.floor(Math.random() * carConfigs.length); // Tentukan warna (0-3)
    return true;
  };

  // DIUBAH: Mendukung penambahan dan pengurangan mobil secara dinamis
  useEffect(() => {
    const currentCars = carsRef.current;
    
    // Jika populasi naik (target count lebih besar), tambahkan mobil baru
    if (currentCars.length < count) {
      const carsToAdd = count - currentCars.length;
      for (let i = 0; i < carsToAdd; i++) {
        const car: CarState = { tileX: 0, tileZ: 0, laneIndex: 0, t: 0, colorIndex: 0 };
        spawnCar(car);
        currentCars.push(car);
      }
    }
    // Jika populasi turun (target count lebih kecil), hapus kelebihan mobil
    else if (currentCars.length > count) {
      currentCars.splice(count); // Memotong array sesuai jumlah count terbaru
    }
  }, [count, carConfigs.length]);

  useFrame((_, delta) => {
    const lanes = laneCacheRef.current;
    if (lanes.size === 0) return;

    const cars = carsRef.current;
    
    // Penghitung jumlah mobil per warna pada setiap iterasi frame
    const colorCounters = [0, 0, 0, 0];

    cars.forEach((car) => {
      let tileLanes = lanes.get(`${car.tileX},${car.tileZ}`);
      let lane = tileLanes?.[car.laneIndex];

      if (!lane) {
        if (!spawnCar(car)) return;
        tileLanes = lanes.get(`${car.tileX},${car.tileZ}`);
        lane = tileLanes?.[car.laneIndex];
        if (!lane) return;
      }

      const speedT = (speed * delta) / lane.approxLength;
      car.t += speedT;

      if (car.t >= 1) {
        const next = neighborFromSide(car.tileX, car.tileZ, lane.toSide);
        const nextLanes = lanes.get(`${next.x},${next.z}`);
        const entrySide = oppositeSide(lane.toSide);
        const candidates = nextLanes?.filter((l) => l.fromSide === entrySide) ?? [];

        if (candidates.length === 0) {
          if (!spawnCar(car)) return;
        } else {
          const chosen = candidates[Math.floor(Math.random() * candidates.length)];
          car.tileX = next.x;
          car.tileZ = next.z;
          car.laneIndex = nextLanes!.indexOf(chosen);
          car.t = 0;
        }

        tileLanes = lanes.get(`${car.tileX},${car.tileZ}`);
        lane = tileLanes?.[car.laneIndex];
        if (!lane) return;
      }

      evalQuadraticBezier(lane, car.t, posVec);
      evalQuadraticBezierTangent(lane, car.t, tangentVec);
      const yaw = Math.atan2(tangentVec.x, tangentVec.z) + -Math.PI / 2;

      dummy.position.set(posVec.x, 0.05, posVec.z);
      dummy.rotation.set(0, yaw, 0);
      dummy.scale.setScalar(1);
      dummy.updateMatrix();

      // Kalikan posisi global dengan offset lokal model spesifik
      const finalMatrix = dummy.matrix.clone().multiply(carConfigs[car.colorIndex].localOffset);
      const currentIdx = colorCounters[car.colorIndex];

      meshRefs.current[car.colorIndex].forEach((mesh) => mesh?.setMatrixAt(currentIdx, finalMatrix));
      colorCounters[car.colorIndex]++;
    });

    // 6. Perbarui Buffer InstancedMesh berdasarkan distribusi mobil
    carConfigs.forEach((_, colorIdx) => {
      meshRefs.current[colorIdx].forEach((mesh) => {
        if (mesh) {
          mesh.count = colorCounters[colorIdx];
          mesh.instanceMatrix.needsUpdate = true;
        }
      });
    });
  });

  return (
    <>
      {carConfigs.map((config, colorIdx) => (
        <group key={`car-group-${colorIdx}`}>
          {config.meshes.map((m, meshIdx) => (
            <instancedMesh
              key={`car-mesh-${colorIdx}-${meshIdx}`}
              ref={(el) => {
                if (!meshRefs.current[colorIdx]) meshRefs.current[colorIdx] = [];
                meshRefs.current[colorIdx][meshIdx] = el;
              }}
              // Kapasitas maksimum disediakan untuk setiap warna guna mengantisipasi akumulasi
              args={[m.geometry, m.material, count]}
              castShadow
              receiveShadow
              frustumCulled={false}
            />
          ))}
        </group>
      ))}
    </>
  );
}

useGLTF.preload('/games/citybuilder/models/cars/carred.glb');
useGLTF.preload('/games/citybuilder/models/cars/carblue.glb');
useGLTF.preload('/games/citybuilder/models/cars/cargreen.glb');
useGLTF.preload('/games/citybuilder/models/cars/caryellow.glb');