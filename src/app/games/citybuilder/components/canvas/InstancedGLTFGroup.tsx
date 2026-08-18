import { useEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';

export interface InstanceTransform {
  position: [number, number, number];
  rotationY: number;
  scale?: number;
}

interface MeshData {
  geometry: THREE.BufferGeometry;
  material: THREE.Material;
}

interface InstancedGLTFGroupProps {
  meshes: MeshData[];
  transforms: InstanceTransform[];
  maxCount: number;
  localOffset?: [number, number, number]; // offset grup lokal di file gltfjsx asli, misal [0, 0.5, 0]
  ghost?: boolean; // true = pakai material transparan (dipicu isGridMode)
}

export default function InstancedGLTFGroup({
  meshes,
  transforms,
  maxCount,
  localOffset = [0, 0, 0],
  ghost = false,
}: InstancedGLTFGroupProps) {
  const meshRefs = useRef<(THREE.InstancedMesh | null)[]>([]);
  const dummy = useMemo(() => new THREE.Object3D(), []);

  // Clone material SEKALI per tipe mesh (bukan per instance) — karena semua instance
  // ghost/nggak-ghost bareng-bareng lewat isGridMode, jadi cukup 1 material bersama
  const ghostMaterials = useMemo(
    () =>
      meshes.map(({ material }) => {
        const cloned = material.clone();
        cloned.transparent = true;
        cloned.opacity = 0.5;
        cloned.depthWrite = false;
        return cloned;
      }),
    [meshes]
  );

  useEffect(() => {
    return () => {
      ghostMaterials.forEach((mat) => mat.dispose());
    };
  }, [ghostMaterials]);

  useEffect(() => {
    meshRefs.current.forEach((mesh) => {
      if (!mesh) return;

      transforms.forEach((t, i) => {
        const s = t.scale ?? 1;
        // localOffset di sini cuma aman kalau nilainya nol di sumbu X/Z (rotasi cuma di Y),
        // karena rotasi Y nggak mengubah offset yang murni vertikal (Y saja)
        dummy.position.set(
          t.position[0] + localOffset[0] * s,
          t.position[1] + localOffset[1] * s,
          t.position[2] + localOffset[2] * s
        );
        dummy.rotation.set(0, t.rotationY, 0);
        dummy.scale.setScalar(s);
        dummy.updateMatrix();
        mesh.setMatrixAt(i, dummy.matrix);
      });

      mesh.count = transforms.length;
      mesh.instanceMatrix.needsUpdate = true;
      mesh.computeBoundingSphere();
    });
  }, [transforms, dummy, localOffset]);

  return (
    <>
        {meshes.map((m, i) => (
        <instancedMesh
            key={i}
            ref={(el) => { meshRefs.current[i] = el; }}
            args={[m.geometry, ghost ? ghostMaterials[i] : m.material, maxCount]}
            castShadow={!ghost}
            receiveShadow
            frustumCulled={false}
        />
        ))}
    </>
    );
}