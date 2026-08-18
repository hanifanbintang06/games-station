import { useEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';
import { useGLTF } from '@react-three/drei';
import { GLTF } from 'three-stdlib';

type GLTFResult = GLTF & {
  nodes: {
    Cube045: THREE.Mesh
    Cube045_1: THREE.Mesh
    Cube045_2: THREE.Mesh
    Cube045_3: THREE.Mesh
    Cube045_4: THREE.Mesh
    Cube045_5: THREE.Mesh
    Cube045_6: THREE.Mesh
    Cube045_7: THREE.Mesh
    Cube045_8: THREE.Mesh
  }
  materials: {
    ['Material.158']: THREE.MeshStandardMaterial
    ['Material.159']: THREE.MeshStandardMaterial
    ['Material.160']: THREE.MeshStandardMaterial
    ['Material.012']: THREE.MeshStandardMaterial
    ['Material.153']: THREE.MeshStandardMaterial
    ['Material.154']: THREE.MeshStandardMaterial
    ['Material.155']: THREE.MeshStandardMaterial
    ['Material.156']: THREE.MeshStandardMaterial
    ['Material.157']: THREE.MeshStandardMaterial
  }
}

export interface GrassTileTransform {
  x: number; // posisi dunia (bukan koordinat grid)
  z: number;
  rotationY: number;
  scale: number;
}

interface GrassInstancesProps {
  tiles: GrassTileTransform[]; // tile yang lagi kelihatan (belum ketiban bangunan)
  maxCount: number;            // kapasitas maksimal instance (total grass yang di-generate awal)
}

// Offset lokal grup asli di dalam file gltfjsx (posisi grup di Grass.tsx: [2.013, 0, -0.751])
const LOCAL_OFFSET = new THREE.Vector3(2.013, 0, -0.751);

const MESH_KEYS = [
  ['Cube045', 'Material.158'],
  ['Cube045_1', 'Material.159'],
  ['Cube045_2', 'Material.160'],
  ['Cube045_3', 'Material.012'],
  ['Cube045_4', 'Material.153'],
  ['Cube045_5', 'Material.154'],
  ['Cube045_6', 'Material.155'],
  ['Cube045_7', 'Material.156'],
  ['Cube045_8', 'Material.157'],
] as const;

export default function GrassInstances({ tiles, maxCount }: GrassInstancesProps) {
  const { nodes, materials } = useGLTF('/games/citybuilder/models/natures/grass.glb') as unknown as GLTFResult;
  const meshRefs = useRef<(THREE.InstancedMesh | null)[]>([]);
  const dummy = useMemo(() => new THREE.Object3D(), []);

  useEffect(() => {
    meshRefs.current.forEach((mesh) => {
      if (!mesh) return;

      tiles.forEach((tile, i) => {
        dummy.position.set(tile.x, 0, tile.z);
        dummy.rotation.set(0, tile.rotationY, 0);
        dummy.scale.setScalar(tile.scale);
        dummy.updateMatrix();

        // Terapkan offset lokal grup asli model biar bentuk rumpun rumputnya tetap utuh
        const offsetMatrix = new THREE.Matrix4().makeTranslation(
          LOCAL_OFFSET.x * tile.scale,
          LOCAL_OFFSET.y * tile.scale,
          LOCAL_OFFSET.z * tile.scale
        );
        const finalMatrix = dummy.matrix.clone().multiply(offsetMatrix);

        mesh.setMatrixAt(i, finalMatrix);
      });

      mesh.count = tiles.length; // cuma render instance yang lagi kelihatan
      mesh.instanceMatrix.needsUpdate = true;
    });
  }, [tiles, dummy]);

  return (
    <>
      {MESH_KEYS.map(([nodeKey, matKey], i) => (
        <instancedMesh
            key={nodeKey}
            ref={(el) => { meshRefs.current[i] = el; }}
            args={[nodes[nodeKey].geometry, materials[matKey], maxCount]}
            castShadow
            receiveShadow
            frustumCulled={false}
        />
      ))}
    </>
  );
}

useGLTF.preload('/games/citybuilder/models/natures/grass.glb');