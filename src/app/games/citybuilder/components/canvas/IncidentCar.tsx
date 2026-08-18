'use client';

import { useEffect, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { evalQuadraticBezier, evalQuadraticBezierTangent } from '../../core/laneSystem';
import { RouteSegment } from '../../core/dispatchPath';

interface IncidentCarProps {
  route: RouteSegment[];
  speed?: number;
  waitSeconds?: number;
  onArrive: () => void;
  children: React.ReactNode;
}

export default function IncidentCar({ route, speed = 8, waitSeconds = 3, onArrive, children }: IncidentCarProps) {
  const groupRef = useRef<THREE.Group>(null);
  const segIndexRef = useRef(0);
  const tRef = useRef(0);
  const reachedRef = useRef(false);
  const waitTimerRef = useRef(0);
  const doneRef = useRef(false);
  const posVec = useRef(new THREE.Vector3());
  const tanVec = useRef(new THREE.Vector3());

  useEffect(() => {
    segIndexRef.current = 0;
    tRef.current = 0;
    reachedRef.current = false;
    waitTimerRef.current = 0;
    doneRef.current = false;
  }, [route]);

  useFrame((_, delta) => {
    if (doneRef.current || !groupRef.current || route.length === 0) return;

    if (reachedRef.current) {
      waitTimerRef.current += delta;
      if (waitTimerRef.current >= waitSeconds) {
        doneRef.current = true;
        onArrive();
      }
      return;
    }

    let remaining = speed * delta;

    while (remaining > 0 && segIndexRef.current < route.length) {
      const seg = route[segIndexRef.current];
      const length = seg.type === 'straight'
        ? Math.max(seg.from.distanceTo(seg.to), 0.001)
        : seg.lane.approxLength;

      const remainingInSeg = (1 - tRef.current) * length;

      if (remaining < remainingInSeg) {
        tRef.current += remaining / length;
        remaining = 0;
      } else {
        remaining -= remainingInSeg;
        segIndexRef.current += 1;
        tRef.current = 0;
      }
    }

    if (segIndexRef.current >= route.length) {
      reachedRef.current = true;
      return;
    }

    const seg = route[segIndexRef.current];
    const t = tRef.current;

    if (seg.type === 'straight') {
      posVec.current.lerpVectors(seg.from, seg.to, t);
      tanVec.current.subVectors(seg.to, seg.from);
    } else {
      evalQuadraticBezier(seg.lane, t, posVec.current);
      evalQuadraticBezierTangent(seg.lane, t, tanVec.current);
    }

    groupRef.current.position.set(posVec.current.x, 0.05, posVec.current.z);

    if (tanVec.current.lengthSq() > 0.0001) {
      groupRef.current.rotation.y = Math.atan2(tanVec.current.x, tanVec.current.z) - Math.PI / 2;
    }
  });

  return <group ref={groupRef}>{children}</group>;
}