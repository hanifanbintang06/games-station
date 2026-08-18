import { Sky } from '@react-three/drei';
import GridSystem, { PlacedItem } from './GridSystem';
import CameraRig from './CameraRig';
import { GRID_SIZE, TILE_SIZE } from '../../core/constants';
import { BuildTool, DeleteBounds, DeleteRequest } from '../../page';import { EffectComposer } from '@react-three/postprocessing';
import OutlinePass from './OutlinePass';
import { useEffect, useState } from 'react';

// di dalam komponen GameScene, sebelum return:
// (perlu akses ke normal pass texture)

// Hook untuk mendeteksi apakah layar berukuran seluler (di bawah 768px)
function useIsMobile() {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    // Cek saat komponen pertama kali dimuat
    handleResize();

    // Dengarkan perubahan ukuran layar
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return isMobile;
}

interface GameSceneProps {
  isGridMode: boolean;
  setIsGridMode: (val: boolean) => void;
  activeTool: BuildTool;
  isBuildMode: boolean;
  isDeleteMode: boolean;
  deleteRequest: DeleteRequest | null;
  onDeleteBoundsSelected: (bounds: DeleteBounds) => void;
  onDeleteHandled: () => void;
  yawIndex: number;
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

export default function GameScene({
  isGridMode,
  setIsGridMode,
  activeTool,
  isBuildMode,
  isDeleteMode,
  deleteRequest,
  onDeleteBoundsSelected,
  onDeleteHandled,
  yawIndex,
  onInspectItem,
  inspectedItem,
  onUpdateStats,
  money,
  onBuildCost,
  onFinancialTick,
  onSelectionCostChange,
  triggerFireSignal,
  triggerRobberySignal,
  dispatchRequest,
  onDispatchHandled,
  onIncidentUpdate,
}: GameSceneProps) {
  const isMobile = useIsMobile();

  const mapCenter = (GRID_SIZE * TILE_SIZE) / 2;
  const mapSize = GRID_SIZE * TILE_SIZE;

  return (
    <>
      <color attach="background" args={['#87CEEB']} />
      <ambientLight intensity={1.2} />
      
      <directionalLight
        position={[mapCenter + 800, 1000, mapCenter + 400]}
        intensity={2.5}
        castShadow
        
        // 2. UBAH BAGIAN INI (Resolusi kecil untuk HP, tinggi untuk PC)
        shadow-mapSize={isMobile ? [512, 512] : [4096, 4096]}

        shadow-camera-left={-mapSize / 2}
        shadow-camera-right={mapSize / 2}
        shadow-camera-top={mapSize / 2}
        shadow-camera-bottom={-mapSize / 2}
        shadow-camera-far={3000}
        shadow-bias={-0.0003}
        shadow-normalBias={0.05}
      />

      <GridSystem
        isGridMode={isGridMode}
        setIsGridMode={setIsGridMode}
        activeTool={activeTool}
        isBuildMode={isBuildMode}
        isDeleteMode={isDeleteMode}
        deleteRequest={deleteRequest}
        onDeleteBoundsSelected={onDeleteBoundsSelected}
        onDeleteHandled={onDeleteHandled}
        onInspectItem={onInspectItem}
        inspectedItem={inspectedItem}
        onUpdateStats={onUpdateStats}
        money={money}
        onBuildCost={onBuildCost}
        onFinancialTick={onFinancialTick}
        onSelectionCostChange={onSelectionCostChange}
        triggerFireSignal={triggerFireSignal}
        triggerRobberySignal={triggerRobberySignal}
        dispatchRequest={dispatchRequest}
        onDispatchHandled={onDispatchHandled}
        onIncidentUpdate={onIncidentUpdate}
      />

      <CameraRig
        initialTarget={[mapCenter, 0, mapCenter]}
        yawIndex={yawIndex}
        maxPanDistance={mapSize}
      />

      <EffectComposer>
        <OutlinePass />
      </EffectComposer>

    </>
  );
}