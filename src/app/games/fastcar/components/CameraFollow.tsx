"use client";
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { RapierRigidBody } from '@react-three/rapier';
import { useMemo } from 'react';

export function CameraFollow({ target }: { target: React.MutableRefObject<RapierRigidBody | null> }) {
  const offset = useMemo(() => new THREE.Vector3(10, 4, 0), []); 
  const idealCameraPos = useMemo(() => new THREE.Vector3(), []);
  const currentLookAt = useMemo(() => new THREE.Vector3(), []);
  const carPosition = useMemo(() => new THREE.Vector3(), []);
  const smoothedVel = useMemo(() => new THREE.Vector3(), []);
  const rawVel = useMemo(() => new THREE.Vector3(), []);
  const smoothedCarPosition = useMemo(() => new THREE.Vector3(), []);
  const isFirstFrame = useMemo(() => ({ value: true }), []);
  const backwardDir = useMemo(() => new THREE.Vector3(), []);

  useFrame((state) => {
    if (!target.current) return;
    const pos = target.current.translation();
    const rot = target.current.rotation();
    carPosition.set(pos.x, pos.y, pos.z);
    if (carPosition.y < -10) return; 

    if (isFirstFrame.value) {
      smoothedCarPosition.copy(carPosition);
      isFirstFrame.value = false;
    }
    smoothedCarPosition.lerp(carPosition, 0.3);

    const worldQuaternion = new THREE.Quaternion(rot.x, rot.y, rot.z, rot.w);

    idealCameraPos.copy(offset).applyQuaternion(worldQuaternion).add(smoothedCarPosition);
    idealCameraPos.y = smoothedCarPosition.y + 4; 

    const vel = target.current.linvel();
    rawVel.set(vel.x, 0, vel.z);
    smoothedVel.lerp(rawVel, 0.1);

    backwardDir.copy(offset).setY(0).applyQuaternion(worldQuaternion).normalize();
    const speed = smoothedVel.length();
    const maxPullback = 0.5;
    const pullbackAmount = Math.min(speed * 0.0005, maxPullback);
    idealCameraPos.addScaledVector(backwardDir, pullbackAmount);

    state.camera.position.lerp(idealCameraPos, 0.1);

    currentLookAt.lerp(smoothedCarPosition, 0.4); 
    state.camera.lookAt(currentLookAt); 
  });

  return null;
}