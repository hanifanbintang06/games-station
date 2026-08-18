import { useRef, useEffect } from 'react';
import { useThree, useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface CameraRigProps {
  initialTarget: [number, number, number];
  yawIndex: number;
  maxPanDistance: number; // radius maksimal target boleh geser dari initialTarget
}

const BASE_CAMERA_DISTANCE = 160;
const BASE_CAMERA_HEIGHT = 115;
const PAN_SPEED = 0.15;
const DRAG_THRESHOLD = 6;

const MIN_ZOOM = 0.2;
const MAX_ZOOM = 3; // diturunin dari 2.2, sesuaikan lagi kalau masih kejauhan/kedekatan
const ZOOM_SPEED = 0.001;
const ZOOM_SMOOTHING = 0.1; // makin kecil = makin halus/lambat transisinya

export default function CameraRig({ initialTarget, yawIndex, maxPanDistance }: CameraRigProps) {
  const { camera, gl } = useThree();
  const originRef = useRef(new THREE.Vector3(...initialTarget));
  const targetRef = useRef(new THREE.Vector3(...initialTarget));
  const currentYawRef = useRef((yawIndex * Math.PI) / 2 + Math.PI / 4);
  const desiredYawRef = useRef((yawIndex * Math.PI) / 2 + Math.PI / 4);

  const zoomTargetRef = useRef(1);   // nilai yang diinginkan (berubah instan pas scroll)
  const zoomCurrentRef = useRef(1);  // nilai aktual yang dipakai render (meluncur halus ke target)

  const isDraggingRef = useRef(false);
  const dragStartRef = useRef<{ x: number; y: number } | null>(null);
  const lastPointerRef = useRef<{ x: number; y: number } | null>(null);

  useEffect(() => {
    desiredYawRef.current = (yawIndex * Math.PI) / 2 + Math.PI / 4;
  }, [yawIndex]);

  const clampTarget = () => {
    const offset = new THREE.Vector3().subVectors(targetRef.current, originRef.current);
    offset.y = 0;
    if (offset.length() > maxPanDistance) {
      offset.setLength(maxPanDistance);
      targetRef.current.set(
        originRef.current.x + offset.x,
        targetRef.current.y,
        originRef.current.z + offset.z
      );
    }
  };

  useEffect(() => {
    const domElement = gl.domElement;

    const handlePointerDown = (e: PointerEvent) => {
      dragStartRef.current = { x: e.clientX, y: e.clientY };
      lastPointerRef.current = { x: e.clientX, y: e.clientY };
      isDraggingRef.current = false;
    };

    const handlePointerMove = (e: PointerEvent) => {
      if (!lastPointerRef.current || !dragStartRef.current) return;

      const distFromStart = Math.hypot(
        e.clientX - dragStartRef.current.x,
        e.clientY - dragStartRef.current.y
      );
      if (!isDraggingRef.current && distFromStart > DRAG_THRESHOLD) {
        isDraggingRef.current = true;
      }
      if (!isDraggingRef.current) return;

      const dx = e.clientX - lastPointerRef.current.x;
      const dy = e.clientY - lastPointerRef.current.y;
      lastPointerRef.current = { x: e.clientX, y: e.clientY };

      const forward = new THREE.Vector3();
      camera.getWorldDirection(forward);
      forward.y = 0;
      forward.normalize();

      const right = new THREE.Vector3().crossVectors(forward, camera.up).normalize();

      targetRef.current.addScaledVector(right, -dx * PAN_SPEED * zoomCurrentRef.current);
        targetRef.current.addScaledVector(forward, dy * PAN_SPEED * zoomCurrentRef.current);

      clampTarget();
    };

    const handlePointerUp = () => {
      dragStartRef.current = null;
      lastPointerRef.current = null;
      isDraggingRef.current = false;
    };

    const handleWheel = (e: WheelEvent) => {
        e.preventDefault();
        zoomTargetRef.current += e.deltaY * ZOOM_SPEED;
        zoomTargetRef.current = Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, zoomTargetRef.current));
    };

    domElement.addEventListener('pointerdown', handlePointerDown);
    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp);
    domElement.addEventListener('wheel', handleWheel, { passive: false });

    return () => {
      domElement.removeEventListener('pointerdown', handlePointerDown);
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
      domElement.removeEventListener('wheel', handleWheel);
    };
  }, [camera, gl, maxPanDistance]);

  useFrame(() => {
    let yawDiff = desiredYawRef.current - currentYawRef.current;
    while (yawDiff > Math.PI) yawDiff -= Math.PI * 2;
    while (yawDiff < -Math.PI) yawDiff += Math.PI * 2;
    currentYawRef.current += yawDiff * 0.12;

    zoomCurrentRef.current += (zoomTargetRef.current - zoomCurrentRef.current) * ZOOM_SMOOTHING;

    const yaw = currentYawRef.current;
    const distance = BASE_CAMERA_DISTANCE * zoomCurrentRef.current;
    const height = BASE_CAMERA_HEIGHT * zoomCurrentRef.current;

    camera.position.set(
      targetRef.current.x + Math.sin(yaw) * distance,
      height,
      targetRef.current.z + Math.cos(yaw) * distance
    );
    camera.lookAt(targetRef.current);
  });

  return null;
}