'use client';

import { useEffect, useMemo, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { CameraRotateIcon } from '@phosphor-icons/react';
import GameScene from './components/canvas/GameScene';
import BottomPanel from './components/ui/BottomPanel';
import ConfirmDeleteDialog from './components/ui/ConfirmDeleteDialog';
import * as THREE from 'three';
import { PlacedItem } from './components/canvas/GridSystem';
import { useRef } from 'react';
import { View } from '@react-three/drei';
import { CITY_LEVELS, getUnlockedTools } from './core/cityLevels';
import { BUILD_COSTS } from './core/buildCosts';

export type BuildTool =
  | 'ROAD'
  | 'ZONE_HOUSE_L1'
  | 'ZONE_HOUSE_L2'
  | 'ZONE_COMMERCIAL_L1'
  | 'ZONE_COMMERCIAL_L2'
  | 'ZONE_INDUSTRIAL_L1'
  | 'RESOURCE_ELECTRIC'
  | 'RESOURCE_WATER'
  | 'RESOURCE_GARBAGE'
  | 'NATURE_TREE1'
  | 'NATURE_TREE2'
  | 'NATURE_FOUNTAIN'
  | 'SERVICE_HOSPITAL'
  | 'SERVICE_POLICE'
  | 'SERVICE_FIREFIGHTER'
  | 'EDUCATION_ELEMENTARY'
  | 'EDUCATION_JUNIOR'
  | 'EDUCATION_HIGH';

export interface DeleteBounds {
  minX: number;
  maxX: number;
  minZ: number;
  maxZ: number;
}

export interface DeleteRequest {
  bounds: DeleteBounds;
  status: 'pending' | 'confirmed' | 'cancelled';
}

export default function CityBuilderGame() {
  const [isGridMode, setIsGridMode] = useState<boolean>(false);
  const [isBuildMode, setIsBuildMode] = useState<boolean>(false);
  const [isDeleteMode, setIsDeleteMode] = useState<boolean>(false);
  const [activeTool, setActiveTool] = useState<BuildTool>('ROAD');
  const [deleteRequest, setDeleteRequest] = useState<DeleteRequest | null>(null);
  const [yawIndex, setYawIndex] = useState<number>(0);
  const [inspectedItem, setInspectedItem] = useState<PlacedItem | null>(null);
  // State Statistik Baru
  const [cityStats, setCityStats] = useState({ population: 0, capacity: 0, demand: { r: 50, c: 50, i: 50 } });
  
  // State UI Modal
  const [showDemandModal, setShowDemandModal] = useState(false);
  const [demandModalTab, setDemandModalTab] = useState<'STATS' | 'LEVEL'>('STATS');
  const [money, setMoney] = useState<number>(72000);
  const [netIncome, setNetIncome] = useState<number>(0);
  const [selectionCost, setSelectionCost] = useState<number>(0);

  const [dispatchRequest, setDispatchRequest] = useState<{ x: number; z: number; type: 'POLICE' | 'FIREFIGHTER' } | null>(null);
  const [incidentState, setIncidentState] = useState<{ fire: { x: number; z: number } | null; robbery: { x: number; z: number } | null }>({ fire: null, robbery: null });

  const containerRef = useRef<HTMLElement>(null!);
  
  // BARU: Lacak rekor penduduk tertinggi untuk patokan level
  const [maxPopulation, setMaxPopulation] = useState(0); 

  const handleInspectItem = (item: PlacedItem | null) => {
    setInspectedItem(item);
    if (item) {
      setIsGridMode(true);
    } else {
      if (!isBuildMode && !isDeleteMode) {
        setIsGridMode(false);
      }
    }
  };

  const handleSetIsBuildMode = (val: boolean) => {
    setIsBuildMode(val);
    setIsGridMode(val);
    if (val) {
      setIsDeleteMode(false);
      setInspectedItem(null); // Tutup inspeksi saat masuk mode bangun
    }
  };

  const handleSetIsDeleteMode = (val: boolean) => {
    setIsDeleteMode(val);
    setIsGridMode(val);
    if (val) {
      setIsBuildMode(false);
      setInspectedItem(null); // Tutup inspeksi saat masuk mode hapus
    }
    if (!val) setDeleteRequest(null);
  };

  const handleConfirmDelete = () => {
    setDeleteRequest((prev) => (prev ? { ...prev, status: 'confirmed' } : null));
  };

  const handleCancelDelete = () => {
    setDeleteRequest((prev) => (prev ? { ...prev, status: 'cancelled' } : null));
  };

  // DIUBAH: Gunakan rekor tertinggi, bukan penduduk saat ini
  const unlockedTools = useMemo(() => getUnlockedTools(maxPopulation), [maxPopulation]);

  const tileCount = deleteRequest
    ? (deleteRequest.bounds.maxX - deleteRequest.bounds.minX + 1) *
      (deleteRequest.bounds.maxZ - deleteRequest.bounds.minZ + 1)
    : 0;

    useEffect(() => {
      if (cityStats.population > maxPopulation) {
        setMaxPopulation(cityStats.population);
      }
    }, [cityStats.population, maxPopulation]);

  return (
   <main ref={containerRef} className="relative w-full h-screen bg-sky-100 overflow-hidden">
      <Canvas camera={{ position: [-50, 150, -50], fov: 60, far: 3000 }}
        shadows gl={{ toneMapping: THREE.ACESFilmicToneMapping, toneMappingExposure: 1.3 }} >
        <GameScene
          isGridMode={isGridMode}
          setIsGridMode={setIsGridMode}
          activeTool={activeTool}
          isBuildMode={isBuildMode}
          isDeleteMode={isDeleteMode}
          deleteRequest={deleteRequest}
          onDeleteBoundsSelected={(bounds) => setDeleteRequest({ bounds, status: 'pending' })}
          onDeleteHandled={() => setDeleteRequest(null)}
          yawIndex={yawIndex}
          onInspectItem={handleInspectItem} // BARU
          inspectedItem={inspectedItem}     // Kirim data item ke bawah
          onUpdateStats={setCityStats}
          money={money}
          onBuildCost={(cost) => {
            if (money >= cost) {
              setMoney(prev => prev - cost);
              return true;
            }
            return false;
          }}
          onFinancialTick={(net) => {
            // Mencegah uang menjadi minus (maksimal mentok di 0)
            setMoney(prev => {
              const newBalance = prev + net;
              return newBalance < 0 ? 0 : newBalance;
            });
            setNetIncome(net); // Indikator netIncome tetap menampilkan angka minus (merah) jika defisit
          }}
          onSelectionCostChange={setSelectionCost}
          dispatchRequest={dispatchRequest}
          onDispatchHandled={() => setDispatchRequest(null)}
          onIncidentUpdate={setIncidentState}
        />
      </Canvas>

      {/* Tombol putar arah pandang, kayak di TheoTown */}
      <button
        onClick={() => setYawIndex((prev) => (prev + 1) % 4)}
        className="absolute top-4 left-4 z-40 flex items-center justify-center w-12 h-12 bg-white/90 backdrop-blur-md shadow-sm border border-gray-300 text-neutral-700 hover:bg-neutral-100 transition-colors duration-200"
      >
        <CameraRotateIcon size={24} />
      </button>

      {/* PANEL HARGA KONSTRUKSI (Di Atas Menu Bawah) */}
      {isBuildMode && activeTool && (
        <div className={`absolute bottom-52 left-1/2 transform -translate-x-1/2 z-40 backdrop-blur-md px-4 py-3 shadow-sm border min-w-[250px] transition-colors duration-200 ${selectionCost > 0 ? 'bg-sky-50/95 border-sky-300' : 'bg-white/90 border-gray-300'}`}>
          <div className="flex justify-between items-center gap-6">
            <span className={`text-sm font-bold tracking-widest uppercase ${selectionCost > 0 ? 'text-sky-700' : 'text-neutral-700'}`}>
              {activeTool.replace('ZONE_', '').replace('RESOURCE_', '').replace('NATURE_', '').replace('_L1', '')}
            </span>
            <span className={`text-lg font-bold ${selectionCost > 0 && selectionCost > money ? 'text-red-500' : 'text-neutral-900'}`}>
              🪙 {(selectionCost > 0 ? selectionCost : BUILD_COSTS[activeTool]).toLocaleString('id-ID')}
              <span className="text-xs font-normal text-neutral-500 ml-1">
                / {selectionCost > 0 ? Math.floor(selectionCost / BUILD_COSTS[activeTool]) : 1} ubin
              </span>
            </span>
          </div>
        </div>
      )}

      {/* DASBOR STATISTIK KOTA (Kanan Atas) */}
      <div className="absolute top-4 right-4 z-40 flex flex-col gap-2">
        <div className="bg-white/90 backdrop-blur-md p-3 shadow-sm border border-gray-300 min-w-[200px] flex flex-col gap-3">
          {/* Kas Kota */}
          <div>
            <div className="text-xs text-neutral-500 uppercase tracking-widest mb-1 font-semibold">Kas Kota</div>
            <div className="text-2xl font-bold text-emerald-600 flex items-baseline gap-2">
              <span className="text-sm">🪙</span> {money.toLocaleString('id-ID')}
              <span className={`text-sm font-medium ${netIncome >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                {netIncome >= 0 ? `+${netIncome.toLocaleString('id-ID')}` : netIncome.toLocaleString('id-ID')}
              </span>
            </div>
          </div>

          <div className="border-t border-gray-200 pt-2">
            <div className="text-xs text-neutral-500 uppercase tracking-widest mb-1 font-semibold">Penduduk</div>
            <div className="text-xl font-bold text-neutral-800 flex items-baseline gap-1">
              {cityStats.population}
              <span className="text-sm text-neutral-400 font-medium">/ {cityStats.capacity}</span>
            </div>
          </div>
        </div>

        {/* Tombol Pemanggil Modal Permintaan */}
        <button 
          onClick={() => setShowDemandModal(true)}
          className="w-full bg-neutral-900 hover:bg-neutral-800 text-white text-xs font-bold uppercase tracking-widest py-3 px-4 shadow-md transition-colors"
        >
          Lihat Kebutuhan Kota
        </button>
      </div>

      {inspectedItem && !isBuildMode && !isDeleteMode && (
        <div className="absolute top-20 left-4 z-40 bg-white/90 backdrop-blur-md p-4 shadow-sm border border-gray-300 min-w-[220px]">
          <div className="flex justify-between items-start mb-4">
            <h3 className="font-semibold text-neutral-900 uppercase tracking-widest text-xs">Informasi Objek</h3>
            <button onClick={() => handleInspectItem(null)} className="text-neutral-400 hover:text-red-500 transition-colors">
              ✕
            </button>
          </div>
          <div className="text-sm text-neutral-700 flex flex-col gap-2">
            <div className="flex justify-between border-b border-gray-200 pb-1">
              <span className="text-neutral-500">Tipe</span>
              <span className="font-medium text-right ml-4">
                {inspectedItem.type.replace('ZONE_', '').replace('RESOURCE_', '').replace('_L1', '')}
              </span>
            </div>
            
            {(inspectedItem.houseVariant || inspectedItem.commercialVariant || inspectedItem.industrialVariant || inspectedItem.roadShape) && (
              <div className="flex justify-between border-b border-gray-200 pb-1">
                <span className="text-neutral-500">Varian</span>
                <span className="font-medium">
                  {inspectedItem.houseVariant || inspectedItem.commercialVariant || inspectedItem.industrialVariant || inspectedItem.roadShape}
                </span>
              </div>
            )}

            {/* Blok Data untuk RUMAH */}
            {(inspectedItem.type === 'ZONE_HOUSE_L1' || inspectedItem.type === 'ZONE_HOUSE_L2') && (
              <>
                <div className="flex justify-between border-b border-gray-200 pb-1">
                  <span className="text-neutral-500">Keluarga</span>
                  <span className="font-medium">
                    {inspectedItem.currentOccupants || 0} / {inspectedItem.maxOccupants || 4}
                  </span>
                </div>
                <div className="flex justify-between border-b border-gray-200 pb-1">
                  <span className="text-neutral-500">Bekerja</span>
                  <span className="font-medium text-sky-600">
                    {inspectedItem.employedOccupants || 0} / {inspectedItem.currentOccupants || 0}
                  </span>
                </div>
              </>
            )}

            {/* Blok Data untuk KOMERSIAL / INDUSTRI */}
            {(inspectedItem.type === 'ZONE_COMMERCIAL_L1' || inspectedItem.type === 'ZONE_COMMERCIAL_L2' || inspectedItem.type === 'ZONE_INDUSTRIAL_L1') && (
              <div className="flex justify-between border-b border-gray-200 pb-1">
                <span className="text-neutral-500">Pekerja</span>
                <span className="font-medium">
                  {inspectedItem.currentWorkers || 0} / {inspectedItem.maxWorkers || 0}
                </span>
              </div>
            )}

            <div className="flex justify-between">
              <span className="text-neutral-500">Koordinat</span>
              <span className="font-medium">X: {inspectedItem.x}, Z: {inspectedItem.z}</span>
            </div>

            {/* BLOK NOTIFIKASI YANG DIUBAH MENJADI COLUMN / LIST */}
            {inspectedItem.warning && inspectedItem.warning.length > 0 && (
              <div className="mt-2 flex flex-col gap-1.5">
                {inspectedItem.warning.map((pesan, index) => (
                  <div key={index} className="p-2 bg-red-50 border border-red-200 rounded-sm text-red-600 text-xs font-medium flex items-center gap-2">
                    <div className="w-4 h-4 rounded-full bg-red-500 text-white flex items-center justify-center font-bold shrink-0">!</div>
                    {pesan}
                  </div>
                ))}
              </div>
            )}

            {inspectedItem.type === 'SERVICE_POLICE' && incidentState.robbery && (() => {
            const isUnpowered = inspectedItem.warning?.includes("Tidak ada akses listrik") || inspectedItem.warning?.includes("Tidak ada akses air");
            return (
              <button
                onClick={() => !isUnpowered && setDispatchRequest({ x: inspectedItem.x, z: inspectedItem.z, type: 'POLICE' })}
                disabled={isUnpowered}
                className={`mt-2 w-full text-white text-xs font-bold uppercase tracking-widest py-2 px-3 ${
                  isUnpowered
                    ? 'bg-neutral-300 cursor-not-allowed'
                    : 'bg-blue-700 hover:bg-blue-800'
                }`}
              >
                {isUnpowered ? 'Butuh Listrik & Air' : 'Kirim Mobil Polisi'}
              </button>
            );
          })()}

          {inspectedItem.type === 'SERVICE_FIREFIGHTER' && incidentState.fire && (() => {
            const isUnpowered = inspectedItem.warning?.includes("Tidak ada akses listrik") || inspectedItem.warning?.includes("Tidak ada akses air");
            return (
              <button
                onClick={() => !isUnpowered && setDispatchRequest({ x: inspectedItem.x, z: inspectedItem.z, type: 'FIREFIGHTER' })}
                disabled={isUnpowered}
                className={`mt-2 w-full text-white text-xs font-bold uppercase tracking-widest py-2 px-3 ${
                  isUnpowered
                    ? 'bg-neutral-300 cursor-not-allowed'
                    : 'bg-red-700 hover:bg-red-800'
                }`}
              >
                {isUnpowered ? 'Butuh Listrik & Air' : 'Kirim Mobil Pemadam'}
              </button>
            );
          })()}

          </div>
        </div>
      )}

      <BottomPanel
        activeTool={activeTool}
        setActiveTool={setActiveTool}
        isBuildMode={isBuildMode}
        setIsBuildMode={handleSetIsBuildMode}
        isDeleteMode={isDeleteMode}
        setIsDeleteMode={handleSetIsDeleteMode}
        unlockedTools={unlockedTools}
      />

      {deleteRequest?.status === 'pending' && (
        <ConfirmDeleteDialog
          tileCount={tileCount}
          onConfirm={handleConfirmDelete}
          onCancel={handleCancelDelete}
        />
      )}

      {/* MODAL PERMINTAAN KOTA (VERTICAL BAR CHART) */}
      {showDemandModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xl transition-all duration-300">
          <div className="bg-white p-8 w-[820px] shadow-2xl border border-gray-100 relative">
            <button 
              onClick={() => setShowDemandModal(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-black transition-colors font-bold text-xl leading-none"
            >
              ✕
            </button>
            
            <h2 className="text-2xl font-bold text-neutral-900 mb-4 tracking-tight">Info Kota</h2>
            
            {/* TAB BUTTON */}
            <div className="flex gap-2 mb-6">
              <button
                onClick={() => setDemandModalTab('STATS')}
                className={`px-5 py-2 text-xs font-bold uppercase tracking-widest transition-colors ${
                  demandModalTab === 'STATS' ? 'bg-neutral-900 text-white' : 'bg-neutral-100 text-neutral-500 hover:bg-neutral-200'
                }`}
              >
                Statistik
              </button>
              <button
                onClick={() => setDemandModalTab('LEVEL')}
                className={`px-5 py-2 text-xs font-bold uppercase tracking-widest transition-colors ${
                  demandModalTab === 'LEVEL' ? 'bg-neutral-900 text-white' : 'bg-neutral-100 text-neutral-500 hover:bg-neutral-200'
                }`}
              >
                Level
              </button>
            </div>

            {demandModalTab === 'STATS' && (
              <>
                <p className="text-xs text-neutral-500 mb-8">Indikator tren pertumbuhan zonasi berdasarkan kapasitas dan kondisi lokal warga.</p>

                {/* CONTAINER CHART BATANG VERTIKAL */}
                <div className="flex justify-around items-end h-48 border-b border-gray-200 pb-2 mb-6 gap-6 px-4">
                  
                  {/* BATANG 1: RESIDENTIAL (R) */}
                  <div className="flex flex-col items-center h-full justify-end flex-1">
                    <span className="text-xs font-bold text-emerald-700 mb-2">{Math.round(cityStats.demand.r)}%</span>
                    <div className="w-full bg-emerald-100 h-full flex items-end overflow-hidden max-w-[48px]">
                      <div 
                        className="w-full bg-emerald-500 transition-all duration-500" 
                        style={{ height: `${cityStats.demand.r}%` }} 
                      />
                    </div>
                    <span className="text-xs font-bold text-neutral-700 mt-3 tracking-widest">R</span>
                  </div>

                  {/* BATANG 2: COMMERCIAL (C) */}
                  <div className="flex flex-col items-center h-full justify-end flex-1">
                    <span className="text-xs font-bold text-sky-700 mb-2">{Math.round(cityStats.demand.c)}%</span>
                    <div className="w-full bg-sky-100 h-full flex items-end overflow-hidden max-w-[48px]">
                      <div 
                        className="w-full bg-sky-500 transition-all duration-500" 
                        style={{ height: `${cityStats.demand.c}%` }} 
                      />
                    </div>
                    <span className="text-xs font-bold text-neutral-700 mt-3 tracking-widest">C</span>
                  </div>

                  {/* BATANG 3: INDUSTRIAL (I) */}
                  <div className="flex flex-col items-center h-full justify-end flex-1">
                    <span className="text-xs font-bold text-amber-700 mb-2">{Math.round(cityStats.demand.i)}%</span>
                    <div className="w-full bg-amber-100 h-full flex items-end overflow-hidden max-w-[48px]">
                      <div 
                        className="w-full bg-amber-500 transition-all duration-500" 
                        style={{ height: `${cityStats.demand.i}%` }} 
                      />
                    </div>
                    <span className="text-xs font-bold text-neutral-700 mt-3 tracking-widest">I</span>
                  </div>

                </div>

                <p className="text-[11px] text-neutral-500 leading-relaxed bg-neutral-50 p-3 border border-neutral-100">
                  * Grafik batang menunjukkan skala urgensi pembangunan. Batang yang meninggi menandakan sektor tersebut sedang sangat dibutuhkan oleh kota Anda.
                </p>
              </>
            )}

            {demandModalTab === 'LEVEL' && (
              <div className="flex flex-col gap-3">
                {CITY_LEVELS.map((lvl) => {
                  // DIUBAH: Cek pencapaian berdasarkan rekor penduduk tertinggi
                  const achieved = lvl.implemented && maxPopulation >= lvl.minPopulation;
                  
                  return (
                    <div
                      key={lvl.level}
                      className={`p-4 border ${achieved ? 'border-emerald-300 bg-emerald-50' : 'border-gray-200 bg-neutral-50'}`}
                    >
                      <div className="flex justify-between items-center mb-1">
                        <span className="font-bold text-neutral-900">{lvl.label}</span>
                        <span className={`text-xs font-bold uppercase tracking-widest ${achieved ? 'text-emerald-600' : 'text-neutral-400'}`}>
                          {!lvl.implemented ? 'Segera Hadir' : achieved ? 'Tercapai' : `Butuh ${lvl.minPopulation.toLocaleString('id-ID')} penduduk`}
                        </span>
                      </div>
                      <p className="text-xs text-neutral-500">{lvl.unlockLabel}</p>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {isBuildMode && (
        <Canvas
          eventSource={containerRef}
          className="pointer-events-none"
          style={{ position: 'absolute', top: 0, left: 0, zIndex: 999 }}
          dpr={[1, 1.5]}
          frameloop="demand"
          gl={{ antialias: true, powerPreference: 'low-power' }}
        >
          <View.Port />
        </Canvas>
      )}
    </main>
  );
}