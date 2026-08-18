'use client'

import { Suspense, useRef } from 'react';
import * as THREE from 'three';
import { RapierRigidBody, RigidBody } from '@react-three/rapier'; 
import { Track } from './Track';
import { Car } from './Car';
import { Map } from './Map';
import { CameraFollow } from './CameraFollow';
import { TrackFence } from './TrackFence';
import { Tribune } from './Tribune';
import { PoleStart } from './PoleStart';
import { Tree } from './Tree';
import { Minimap } from './MiniMap';
import { Pole2 } from './Pole2';
import { Pole3 } from './Pole3';
// FastLapController dihapus dari sini karena sudah dipanggil di Game.tsx

export function GameScene() {
  const carRef = useRef<RapierRigidBody>(null);
  const fenceLength = 8;

  return (
    <Suspense fallback={null}>
      {/* 
        Tag <Physics> dihapus dari sini. 
        Komponen ini sekarang akan mengikuti aturan (termasuk status pause) 
        dari <Physics> induk yang ada di Game.tsx 
      */}
      <RigidBody type="fixed" colliders={false}>
        <TrackFence />
      </RigidBody>
      <Map />
      <Track />
      <Tribune />
      <PoleStart />
      <Pole2 />
      <Pole3 />
      <Tree />
      
      <Suspense fallback={null}>
        <Car ref={carRef} />
        <CameraFollow target={carRef} />
      </Suspense>
    </Suspense>
  );
}